import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { FailureTypeCodes } from "../utils/constants";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_FAILURE_EVENT_TYPE = 5;

type FailureData = { 
    failureType: number, 
    utxoRefs: TxOutRef[] 
};

function isFailureData( stuff: any ): stuff is FailureData
{
    return(
        isObject( stuff ) &&
        typeof FailureTypeCodes[ stuff.failureType ] === "string" &&
        Array.isArray( stuff.utxoRefs ) &&
        stuff.utxoRefs.every(( thing: any ) => ( thing instanceof TxOutRef ))
    );
}

function failureDataToCborObj( stuff: FailureData ): CborArray
{
    return new CborArray([
        new CborUInt( stuff.failureType ),
        new CborArray( stuff.utxoRefs.map(( ref ) => ( ref.toCborObj() )) )
    ]);
}

function failureDataFromCborObj( cbor: CborObj ): FailureData
{
    if(!(
        cbor instanceof CborArray &&
        Array.isArray( cbor.array ) &&
        cbor.array.length >= 2
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
        failureType: Number( cborFailureType.num ) as number,
        utxoRefs: cborPayload.array.map( ( cborUtxo ) => TxOutRef.fromCborObj( cborUtxo ) )
    } as FailureData;
}

export interface IMessageFailure
{
    failureData: FailureData
}

function isIMessageFailure( stuff: any ): stuff is IMessageFailure
{
    return(
        isObject( stuff ) &&
        isFailureData( stuff.failureData )
    );
}

export class MessageFailure
    implements ToCbor, ToCborObj, IMessageFailure 
{
    readonly failureData: FailureData;

    constructor( stuff : IMessageFailure )
    {
        if(!( isIMessageFailure( stuff ) )) throw new Error( "invalid `MessageFailure` data provided" );

        this.failureData = stuff.failureData;
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray
    {
        if(!( isIMessageFailure( this ) )) throw new Error( "invalid `MessageFailure` data provided" );

        return new CborArray([
            new CborUInt( MSG_FAILURE_EVENT_TYPE ),
            failureDataToCborObj( this.failureData )
        ]);
    }

    toCborBytes(): Uint8Array
    {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageFailure
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageFailure.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageFailure
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for `MessageFailure`" );

        const [
            cborEventType,
            cborFailureData
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_FAILURE_EVENT_TYPE &&
            cborFailureData instanceof CborArray
        )) throw new Error( "invalid cbor for `MessageFailure`" );

        return new MessageFailure({ 
            failureData: failureDataFromCborObj( cborFailureData ) as FailureData
        });
    }

}