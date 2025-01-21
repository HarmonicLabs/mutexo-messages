import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter, forceFilter, IFilter } from "../clientReqs/filters/Filter";
import { AddrFilter } from "../clientReqs/filters/AddrFilter";
import { UtxoFilter } from "../clientReqs/filters/UtxoFilter";
import { ISatisfiesFilter } from "./utils/ISatisfiesFilter";

const MSG_LOCK_EVENT_TYPE = 1;

export interface IMutexoLock {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageMutexoLock( stuff: any ): stuff is IMutexoLock {
    return (
        isObject( stuff ) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MutexoLock
    implements ToCbor, ToCborObj, IMutexoLock, ISatisfiesFilter
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor(stuff: IMutexoLock) {
        if (!( isIMessageMutexoLock(stuff) )) throw new Error( "invalid `MessageMutexoLock` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
    }

    satisfiesFilters( filters: IFilter[] ): boolean
    {
        return filters.every( this.satisfiesFilter );
    }
    satisfiesFilter( filter: IFilter ): boolean
    {
        filter = forceFilter( filter );

        if( filter instanceof AddrFilter )
            return filter.addr.toString() === this.addr.toString();

        if( filter instanceof UtxoFilter )
            return filter.utxoRef.toString() === this.utxoRef.toString();

        return false;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if (!( isIMessageMutexoLock( this ) )) throw new Error( "invalid `MessageMutexoLock` data provided" );

        return new CborArray([
            new CborUInt( MSG_LOCK_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexoLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexoLock.fromCborObj( Cbor.parse(bytes) );
    }

    static fromCborObj( cbor: CborObj ): MutexoLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageMutexoLock`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_LOCK_EVENT_TYPE
        )) throw new Error( "invalid cbor for `MessageMutexoLock`" );

        return new MutexoLock({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr )
        });
    }
}