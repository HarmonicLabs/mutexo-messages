import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { ErrorCodes } from "../utils/constants";

const MSG_ERROR_EVENT_TYPE = 7; 

export interface IMessageError
{
    errorType: ErrorCodes
}

function isIMessageError( stuff: any ): stuff is IMessageError
{
    return(
        isObject( stuff ) &&
        Number.isSafeInteger( stuff.errorType ) &&
        typeof ErrorCodes[ stuff.errorType ] === "string"
    );
}

export class MessageError
    implements ToCbor, ToCborObj, IMessageError 
{
    readonly errorType: ErrorCodes;

    constructor( stuff : IMessageError )
    {
        if(!( isIMessageError( stuff ) )) throw new Error( "invalid `MessageError` data provided" );

        this.errorType = stuff.errorType;
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray
    {
        if(!( isIMessageError( this ) )) throw new Error( "invalid `MessageError` data provided" );

        return new CborArray([
            new CborUInt( MSG_ERROR_EVENT_TYPE ),
            new CborUInt( this.errorType )
        ]);
    }
    
    toCborBytes(): Uint8Array
    {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageError
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageError.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageError
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for `MessageError`" );

        const [
            cborEventType,
            cborErrorType
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_ERROR_EVENT_TYPE &&
            cborErrorType instanceof CborUInt
        )) throw new Error( "invalid cbor for `MessageError`" );

        const hdr = new MessageError({ 
            errorType: Number( cborErrorType.num ) as ErrorCodes
        });

        return hdr;
    }

}