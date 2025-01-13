import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter } from "../clientReqs/filters/Filter";
import { AddrFilter } from "../clientReqs/filters/AddrFilter";
import { UtxoFilter } from "../clientReqs/filters/UtxoFilter";

const MSG_LOCK_EVENT_TYPE = 1;

export interface ILock {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageLock( stuff: any ): stuff is ILock {
    return (
        isObject( stuff ) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class Lock
    implements ToCbor, ToCborObj, ILock
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor(stuff: ILock) {
        if (!( isIMessageLock(stuff) )) throw new Error( "invalid `MessageLock` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
    }

    satisfiesFilters( filters: Filter[] ): boolean
    {
        return filters.every( this.satisfiesFilter );
    }
    satisfiesFilter( filter: Filter ): boolean
    {
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
        if (!( isIMessageLock( this ) )) throw new Error( "invalid `MessageLock` data provided" );

        return new CborArray([
            new CborUInt( MSG_LOCK_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): Lock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return Lock.fromCborObj( Cbor.parse(bytes) );
    }

    static fromCborObj( cbor: CborObj ): Lock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageLock`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_LOCK_EVENT_TYPE
        )) throw new Error( "invalid cbor for `MessageLock`" );

        return new Lock({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr )
        });
    }
}