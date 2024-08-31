import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { CanBeTxOutRef, forceTxOutRef, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IClientReqFree {
    utxoRefs: CanBeTxOutRef[];
}

export class ClientReqFree implements ToCbor, ToCborObj, IClientReqFree
{
    readonly utxoRefs: TxOutRef[];

    constructor({ utxoRefs }: IClientReqFree)
    {
        this.utxoRefs = utxoRefs
        .map( ref => 
            ref instanceof TxOutRef ? ref : forceTxOutRef(ref)
        );
    }

    toCborObj(): CborObj {
        return new CborArray([
            new CborUInt(0),
            new CborArray(this.utxoRefs.map( ref => ref.toCborObj() ))
        ]);
    }
    toCbor(): CborString
    {
        return Cbor.encode(this.toCborObj());
    }

    static fromCbor(cbor: CanBeCborString): ClientReqFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return ClientReqFree.fromCborObj(Cbor.parse(bytes));
    }

    // [ 0, [ + utxoRef ] ];
    static fromCborObj(cbor: CborObj): ClientReqFree {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(0) &&
            cbor.array[1] instanceof CborArray
        )) throw new Error("Invalid CBOR for ClientReqFree");

        return new ClientReqFree({ utxoRefs: cbor.array[1].array.map(TxOutRef.fromCborObj) });
    }
}