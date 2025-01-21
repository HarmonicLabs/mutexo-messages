import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter, forceFilter, IFilter } from "../clientReqs/filters/Filter";
import { AddrFilter } from "../clientReqs/filters/AddrFilter";
import { UtxoFilter } from "../clientReqs/filters/UtxoFilter";
import { ISatisfiesFilter } from "./utils/ISatisfiesFilter";

const MSG_INPUT_EVENT_TYPE = 2;

export interface IMutexoInput {
    utxoRef: TxOutRef,
    addr: Address,
    txHash: Uint8Array
}

function isIMutexoInput(stuff: any): stuff is IMutexoInput {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address &&
        stuff.txHash instanceof Uint8Array && stuff.txHash.length === 32
    );
}

export class MutexoInput
    implements ToCbor, ToCborObj, IMutexoInput, ISatisfiesFilter
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;
    readonly txHash: Uint8Array;

    constructor( stuff: IMutexoInput ) {
        if (!( isIMutexoInput(stuff) )) throw new Error( "invalid `MessageInput` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
        this.txHash = stuff.txHash;
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
        if (!( isIMutexoInput( this ) )) throw new Error( "invalid `MessageInput` data provided" );

        return new CborArray([
            new CborUInt( MSG_INPUT_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj(),
            new CborBytes( this.txHash )
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexoInput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexoInput.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MutexoInput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4
        )) throw new Error( "invalid cbor for `MessageInput`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr,
            cborTxHash
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_INPUT_EVENT_TYPE &&
            ( 
                cborTxHash instanceof CborBytes && 
                cborTxHash.bytes.length === 32
            )
        )) {
            throw new Error( "invalid cbor for `MessageInput`" );
        }

        return new MutexoInput({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr ),
            txHash: cborTxHash.bytes
        });
    }

}