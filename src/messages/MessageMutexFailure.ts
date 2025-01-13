import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { FailureCodes, ErrorCode } from "../utils/constants";
import { Filter } from "../clientReqs/filters/Filter";

const MSG_FAILURE_EVENT_TYPE = 5;

export interface IMutexFailure
{
    id: number,
    utxoRefs: TxOutRef[],
}

function isIMessageMutexFailure( stuff: any ): stuff is IMutexFailure
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        Array.isArray( stuff.utxoRefs ) &&
        stuff.utxoRefs.every((ref: any) => ref instanceof TxOutRef)
    );
}

export class MutexFailure
    implements ToCbor, ToCborObj, IMutexFailure 
{
    readonly id: ErrorCode;
    readonly utxoRefs: TxOutRef[];

    constructor( stuff : IMutexFailure )
    {
        if(!( isIMessageMutexFailure( stuff ) )) throw new Error( "invalid `MessageMutexFailure` data provided" );

        this.id = stuff.id;
        this.utxoRefs = stuff.utxoRefs.slice();
    }

    satisfiesFilters( filters: Filter[] ): boolean { return true; }
    satisfiesFilter( filter: Filter ): boolean { return true; }

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
            new CborArray( this.utxoRefs.map( ref => ref.toCborObj() ))
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
            cborUtxoRefs
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_FAILURE_EVENT_TYPE &&
            cborId instanceof CborUInt &&
            cborUtxoRefs instanceof CborArray
        )) throw new Error( "invalid cbor for `MessageMutexFailure`" );

        return new MutexFailure({ 
            id: Number( cborId.num ),
            utxoRefs: cborUtxoRefs.array.map( TxOutRef.fromCborObj )
        });
    }

}