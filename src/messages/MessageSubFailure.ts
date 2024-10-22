import { ToCbor, ToCborObj, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { MessageErrorType } from "../utils/constants";

const MSG_SUB_FAILURE_EVENT_TYPE = 9;

export interface IMessageSubFailure 
{
    id: number;
    errorType: number;
}

function isIMessageSubFailure( stuff: any ): stuff is IMessageSubFailure 
{
    return (
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        Number.isSafeInteger( stuff.errorType ) &&
        typeof MessageErrorType[ stuff.errorType ] === "string"
    );
}

export class MessageSubFailure implements ToCbor, ToCborObj, IMessageSubFailure 
{
    readonly id: number;
    readonly errorType: number;

    constructor( stuff: IMessageSubFailure ) 
    {
        if (!( isIMessageSubFailure( stuff ) )) throw new Error( "invalid `MessageSubFailure` data provided" );

        this.id = stuff.id;
        this.errorType = stuff.errorType;
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
        if (!( isIMessageSubFailure( this ) )) throw new Error( "invalid `MessageSubFailure` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUB_FAILURE_EVENT_TYPE ),
            new CborUInt( this.id ),
            new CborUInt( this.errorType )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): MessageSubFailure 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageSubFailure.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): MessageSubFailure 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid `MessageSubFailure` data provided" );

        const [
            _,
            cborId,
            cborErrorType
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number( _.num ) === MSG_SUB_FAILURE_EVENT_TYPE &&
            cborId instanceof CborUInt &&
            cborErrorType instanceof CborUInt &&
            Number( cborErrorType.num ) in MessageErrorType 
        )) throw new Error( "invalid `MessageSubFailure` data provided" );

        return new MessageSubFailure({
            id: Number( cborId.num ) as number,
            errorType: Number( cborErrorType.num ) as number
        });
    }

}
