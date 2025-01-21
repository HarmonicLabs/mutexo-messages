import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter, AddrFilter, UtxoFilter, forceFilter, IFilter } from "../clientReqs/filters";
import { ISatisfiesFilter } from "./utils/ISatisfiesFilter";

const MSG_OUTPUT_EVENT_TYPE = 3;

export interface IMutexoOutput {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMutexoOutput( stuff: any ): stuff is IMutexoOutput {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MutexoOutput
    implements ToCbor, ToCborObj, IMutexoOutput, ISatisfiesFilter
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor( stuff: IMutexoOutput ) {
        if (!( isIMutexoOutput( stuff ) )) throw new Error( "invalid `MessageOutput` data provided" );

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
        if (!( isIMutexoOutput( this ) )) throw new Error( "invalid `MessageOutput` data provided" );

        return new CborArray([
            new CborUInt( MSG_OUTPUT_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexoOutput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexoOutput.fromCborObj(Cbor.parse( bytes ));
    }

    static fromCborObj( cbor: CborObj ): MutexoOutput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageOutput`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_OUTPUT_EVENT_TYPE
        )) throw new Error( "invalid cbor for `MessageOutput`" );

        return new MutexoOutput({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr )
        });
    }
    
}