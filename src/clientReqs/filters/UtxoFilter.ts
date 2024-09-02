import { CanBeTxOutRef, forceTxOutRef, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IUtxoFilter {
    utxoRef: CanBeTxOutRef;
}

export class UtxoFilter implements ToCbor, ToCborObj, IUtxoFilter
{
    readonly utxoRef: TxOutRef;

    constructor({ utxoRef }: IUtxoFilter)
    {
        this.utxoRef = forceTxOutRef( utxoRef );
    }

    toCbor(): CborString
    {
        return Cbor.encode(this.toCborObj());
    }
    // [ 1, utxoRef ]
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt(1),
            this.utxoRef.toCborObj()
        ]);
    }

    static fromCbor(cbor: CanBeCborString): UtxoFilter
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return UtxoFilter.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): UtxoFilter {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(1)
        )) throw new Error("Invalid CBOR for UtxoFilter");

        const [ _1, utxoRef ] = cbor.array;
        return new UtxoFilter({ utxoRef: TxOutRef.fromCborObj( utxoRef ) });
    }
}