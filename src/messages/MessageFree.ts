import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter, forceFilter, IFilter } from "../clientReqs/filters/Filter";
import { AddrFilter, UtxoFilter } from "../clientReqs";
import { ISatisfiesFilter } from "./utils/ISatisfiesFilter";

const MSG_FREE_EVENT_TYPE = 0;

export interface IMutexoFree {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageFree( stuff: any ): stuff is IMutexoFree {
    return (
        isObject( stuff ) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MutexoFree
    implements ToCbor, ToCborObj, IMutexoFree, ISatisfiesFilter
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor( stuff: IMutexoFree ) {
        if(!( isIMessageFree( stuff ) )) throw new Error( "invalid `MessageFree` data provided" );

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
        if(!( isIMessageFree( this ) )) throw new Error( "invalid `MessageFree` data provided" );

        return new CborArray([
            new CborUInt( MSG_FREE_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexoFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexoFree.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MutexoFree {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error("invalid cbor for `MessageFree`");

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_FREE_EVENT_TYPE
        )) throw new Error( "invalid cbor for `MessageFree`" );

        return new MutexoFree({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr )
        });
    }

}