import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { SuccessCodes } from "../utils/constants";
import { Filter } from "../clientReqs/filters/Filter";

const MSG_SUCCESS_EVENT_TYPE = 4;

export interface IMutexSuccess {
    id: number,
    utxoRefs: TxOutRef[],
}

function isIMessageMutexSuccess( stuff: any ): stuff is IMutexSuccess {
    return (
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        Array.isArray( stuff.successData ) &&
        stuff.successData.every((ref: any) => ref instanceof TxOutRef)
    );
}

export class MutexSuccess
    implements ToCbor, ToCborObj, IMutexSuccess
{
    readonly id: number;
    readonly utxoRefs: TxOutRef[];

    constructor(stuff: IMutexSuccess) {
        if (!( isIMessageMutexSuccess( stuff ) )) throw new Error( "invalid `MessageMutexSuccess` data provided" );

        this.id = stuff.id;
        this.utxoRefs = stuff.utxoRefs.slice();
    }

    satisfiesFilters( filters: Filter[] ): boolean { return true; }
    satisfiesFilter( filter: Filter ): boolean { return true; }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() )
    }

    toCborObj(): CborArray {
        if (!(isIMessageMutexSuccess(this))) throw new Error( "invalid `MessageMutexSuccess` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUCCESS_EVENT_TYPE ),
            new CborUInt( this.id ),
            new CborArray( this.utxoRefs.map( ref => ref.toCborObj() ))
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexSuccess {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexSuccess.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MutexSuccess {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageMutexSuccess`" );

        const [
            cborEventType,
            cborId,
            cborUtxoRefs
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_SUCCESS_EVENT_TYPE &&
            cborId instanceof CborUInt &&
            cborUtxoRefs instanceof CborArray
        )) throw new Error("invalid cbor for `MessageMutexSuccess`");

        return new MutexSuccess({
            id: Number( cborId.num ),
            utxoRefs: cborUtxoRefs.array.map( TxOutRef.fromCborObj )
        });
    }
    
}