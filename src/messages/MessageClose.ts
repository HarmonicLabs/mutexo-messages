import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";

export interface IMessageClose {}

function isIMessageClose( stuff: any ): stuff is IMessageClose
{
    return(
        isObject( stuff )
    );
}

export class MessageClose
    implements ToCbor, ToCborObj, IMessageClose 
{
    constructor( stuff?: IMessageClose ) {}

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }

    toCborObj(): CborArray
    {
        if(!( isIMessageClose( this ) )) throw new Error( "invalid `MessageClose` data provided" );

        return new CborArray([
            new CborUInt( 6 ),
        ]);
    }

    toCborBytes(): Uint8Array
    {
        return this.toCbor().toBuffer();
    }
    static fromCbor( cbor: CanBeCborString ): MessageClose
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageClose.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageClose
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 1
        )) throw new Error( "invalid cbor for `MessageClose`" );

        const [
            cborEventType
        ] = cbor.array;

        if(!(
            cborEventType instanceof CborUInt &&
            cborEventType.num === BigInt( 6 )
        )) throw new Error( "invalid cbor for `MessageClose`" );

        const hdr = new MessageClose();

        return hdr;
    }

}