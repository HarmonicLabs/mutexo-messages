import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { UTxORefFromCborObj } from "../utils/fromCborObj";
import { isByte, isUTxORef } from "../utils/isThatType";
import { FailureTypeCodes } from "../utils/constants";
import { UTxORefToCborObj } from "../utils/toCborObj";
import { isObject } from "@harmoniclabs/obj-utils";
import { Code, UTxORef } from "../utils/types";
import { roDescr } from "../utils/roDescr";

type FailureData = { failureType: Code, payload: UTxORef[] }

function isFailureData( stuff: any ): stuff is FailureData
{
    return(
        isObject( stuff ) &&
        isByte( stuff.failureType ) &&
        Object.values( FailureTypeCodes ).includes( stuff.failureType ) &&
        Array.isArray( stuff.payload ) &&
        stuff.payload.every( isUTxORef )
    );
}

function failureDataToCborObj( stuff: FailureData ): CborArray
{
    return new CborArray([
        new CborUInt( stuff.failureType ),
        new CborArray( stuff.payload.map( ( utxo ) => ( UTxORefToCborObj( utxo ) )) )
    ]);
}

function failureDataFromCborObj( cbor: CborObj ): FailureData
{
    if(!(
        cbor instanceof CborArray &&
        Array.isArray( cbor.array ) &&
        cbor.array.length === 2
    )) throw new Error( "invalid `FailureData` data provided" );

    const [
        cborFailureType,
        cborPayload
    ] = cbor.array;

    if(!( 
        cborFailureType instanceof CborUInt &&
        cborPayload instanceof CborArray
    )) throw new Error( "invalid cbor for `FailureData`" );

    return {
        failureType: Number( cborFailureType.num ) as Code,
        payload: cborPayload.array.map( ( cborUtxo ) => UTxORefFromCborObj( cborUtxo ) )
    } as FailureData;
}

export interface IMessageFailure
{
    eventType: Code
    failureData: FailureData
}

function isIMessageFailure( stuff: any ): stuff is IMessageFailure
{
    return(
        isObject( stuff ) &&
        isByte( stuff.eventType ) &&
        stuff.eventType === 5 &&
        isFailureData( stuff.failureData )
    );
}

export class MessageFailure
    implements ToCbor, ToCborObj, IMessageFailure 
{
    readonly eventType: Code;
    readonly failureData: FailureData;

    readonly cborBytes?: Uint8Array | undefined;

    constructor( stuff : IMessageFailure )
    {
        if(!( isIMessageFailure( stuff ) )) throw new Error( "invalid `MessageFailure` data provided" );

        Object.defineProperties(
            this, {
                eventType: { value: 5, ...roDescr },
                failureData: { value: stuff.failureData, ...roDescr },
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
        if(!( isIMessageFailure( this ) )) throw new Error( "invalid `MessageFailure` data provided" );

        return new CborArray([
            new CborUInt( this.eventType ),
            failureDataToCborObj( this.failureData )
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

    static fromCbor( cbor: CanBeCborString ): MessageFailure
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageFailure.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array | undefined ): MessageFailure
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length === 2
        )) throw new Error( "invalid cbor for `MessageFailure`" );

        const [
            cborEventType,
            cborFailureData
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            cborFailureData instanceof CborArray
        )) throw new Error( "invalid cbor for `MessageFailure`" );

        const originalWerePresent = _originalBytes instanceof Uint8Array; 
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode( cbor ).toBuffer();

        const hdr = new MessageFailure({ 
            eventType: Number( cborEventType.num ) as Code,
            failureData: failureDataFromCborObj( cborFailureData ) as FailureData
        });

        if( originalWerePresent )
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}