import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { isObject } from "@harmoniclabs/obj-utils";
import { isByte } from "../utils/isThatType";
import { roDescr } from "../utils/roDescr";
import { Code } from "../utils/types";

export interface IMessageClose
{
    eventType: Code
}

function isIMessageClose( stuff: any ): stuff is IMessageClose
{
    return(
        isObject( stuff ) &&
        isByte( stuff.eventType ) &&
        stuff.eventType === 6
    );
}

export class MessageClose
    implements ToCbor, ToCborObj, IMessageClose 
{
    readonly eventType: Code;

    readonly cborBytes?: Uint8Array | undefined;

    constructor( stuff : IMessageClose )
    {
        if(!( isIMessageClose( stuff ) )) throw new Error( "invalid `MessageClose` data provided" );

        Object.defineProperties(
            this, {
                eventType: { value: 6, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
            }
        );
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }

    toCborObj(): CborArray
    {
        if(!( isIMessageClose( this ) )) throw new Error( "invalid `MessageClose` data provided" );

        return new CborArray([
            new CborUInt( this.eventType ),
        ]);
    }

    toCborBytes(): Uint8Array
    {
        if(!( this.cborBytes instanceof Uint8Array ))
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode( this.toCborObj() ).toBuffer();
        }

        return Uint8Array.prototype.slice.call( this.cborBytes );
    }

    static fromCbor( cbor: CanBeCborString ): MessageClose
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageClose.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array | undefined ): MessageClose
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length === 1
        )) throw new Error( "invalid cbor for `MessageClose`" );

        const [
            cborEventType
        ] = cbor.array;

        if(!( cborEventType instanceof CborUInt )) throw new Error( "invalid cbor for `MessageClose`" );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new MessageClose({ eventType: Number( cborEventType.num ) as Code });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }

}