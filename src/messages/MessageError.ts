import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { maxErrorCode, minErrorCode } from "../utils/constants";
import { ErrorCode, EventCode } from "../utils/types";
import { isObject } from "@harmoniclabs/obj-utils";
import { isByte } from "../utils/isThatType";
import { roDescr } from "../utils/roDescr";

export interface IMessageError
{
    eventType: EventCode
    errorType: ErrorCode
}

function isIMessageError( stuff: any ): stuff is IMessageError
{
    return(
        isObject( stuff ) &&
        isByte( stuff.eventType ) &&
        stuff.eventType === 7 &&
        isByte( stuff.errorType ) &&
        (
            stuff.errorType >= minErrorCode &&
            stuff.errorType <= maxErrorCode
        )
    );
}

export class MessageError
    implements ToCbor, ToCborObj, IMessageError 
{
    readonly eventType: EventCode;
    readonly errorType: ErrorCode;

    readonly cborBytes?: Uint8Array | undefined;
    
    constructor( stuff : IMessageError )
    {
        if(!( isIMessageError( stuff ) )) throw new Error( "invalid `MessageError` data provided" );

        Object.defineProperties(
            this, {
                eventType: { value: 7, ...roDescr },
                errorType: { value: stuff.errorType, ...roDescr },
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
        if(!( isIMessageError( this ) )) throw new Error( "invalid `MessageError` data provided" );

        return new CborArray([
            new CborUInt( this.eventType ),
            new CborUInt( this.errorType )
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

    static fromCbor( cbor: CanBeCborString ): MessageError
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageError.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array | undefined ): MessageError
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length === 2
        )) throw new Error( "invalid cbor for `MessageError`" );

        const [
            cborEventType,
            cborErrorType
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            cborErrorType instanceof CborUInt
        )) throw new Error( "invalid cbor for `MessageError`" );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new MessageError({ 
            eventType: Number( cborEventType.num ) as EventCode,
            errorType: Number( cborErrorType.num ) as ErrorCode
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }

}