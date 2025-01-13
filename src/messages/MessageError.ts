import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { ErrorCode, isErrorCode, messageErrorCodeToString, mutexoErrorCodeToErrorMessage } from "../utils/constants";

const MSG_ERROR_EVENT_TYPE = 7; 

export interface IMutexoError
{
    errorCode: ErrorCode;
}

function isIMutexoError( stuff: any ): stuff is IMutexoError
{
    return(
        isObject( stuff ) &&
        isErrorCode( stuff.errorCode )
    );
}

export class MutexoError
    implements ToCbor, ToCborObj, IMutexoError 
{
    readonly errorCode: ErrorCode;

    get message(): string
    {
        return mutexoErrorCodeToErrorMessage( this.errorCode );
    }

    constructor( stuff : IMutexoError )
    {
        if(!( isIMutexoError( stuff ) )) throw new Error( "invalid `MessageError` data provided" );

        this.errorCode = stuff.errorCode;
    }

    toCborBytes(): Uint8Array
    {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        if(!( isIMutexoError( this ) )) throw new Error( "invalid `MessageError` data provided" );

        return new CborArray([
            new CborUInt( MSG_ERROR_EVENT_TYPE ),
            new CborUInt( this.errorCode )
        ]);
    }
    
    static fromCbor( cbor: CanBeCborString ): MutexoError
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexoError.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): MutexoError
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for `MessageError`" );

        const [
            cborEventType,
            cborErrorCode
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_ERROR_EVENT_TYPE &&
            cborErrorCode instanceof CborUInt &&
            isErrorCode( Number( cborErrorCode.num ) )
        )) throw new Error( "invalid cbor for `MessageError`" );

        const hdr = new MutexoError({ 
            errorCode: Number( cborErrorCode.num )
        });

        return hdr;
    }

}
