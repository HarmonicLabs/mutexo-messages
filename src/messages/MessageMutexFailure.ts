import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { FailureCodes, ErrorCode } from "../utils/constants";

const MSG_FAILURE_EVENT_TYPE = 5;

type FailureData = { 
    failureType: number, 
    utxoRefs: TxOutRef[] 
};

function isFailureData( stuff: any ): stuff is FailureData
{
    return(
        isObject( stuff ) &&
        typeof FailureCodes[ stuff.failureType ] === "string" &&
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
        // Array.isArray( cbor.array ) &&
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
        failureType: Number( cborFailureType.num ),
        utxoRefs: cborPayload.array.map( ( cborUtxo ) => TxOutRef.fromCborObj( cborUtxo ) )
    };
}

export interface IMutexFailure
{
    id: number,
    failureData: FailureData
}

function isIMessageMutexFailure( stuff: any ): stuff is IMutexFailure
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        isFailureData( stuff.failureData )
    );
}

export class MutexFailure
    implements ToCbor, ToCborObj, IMutexFailure 
{
    readonly id: ErrorCode;
    readonly failureData: FailureData;

    constructor( stuff : IMutexFailure )
    {
        if(!( isIMessageMutexFailure( stuff ) )) throw new Error( "invalid `MessageMutexFailure` data provided" );

        this.id = stuff.id;
        this.failureData = stuff.failureData;
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray
    {
        if(!( isIMessageMutexFailure( this ) )) throw new Error( "invalid `MessageMutexFailure` data provided" );

        return new CborArray([
            new CborUInt( MSG_FAILURE_EVENT_TYPE ),
            new CborUInt( this.id ),
            failureDataToCborObj( this.failureData )
        ]);
    }

    toCborBytes(): Uint8Array
    {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexFailure
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexFailure.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MutexFailure
    {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageMutexFailure`" );

        const [
            cborEventType,
            cborId,
            cborFailureData
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_FAILURE_EVENT_TYPE &&
            cborId instanceof CborUInt
        )) throw new Error( "invalid cbor for `MessageMutexFailure`" );

        return new MutexFailure({ 
            id: Number( cborId.num ),
            failureData: failureDataFromCborObj( cborFailureData )
        });
    }

}