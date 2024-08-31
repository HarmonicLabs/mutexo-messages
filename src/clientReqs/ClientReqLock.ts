import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { CanBeTxOutRef, forceTxOutRef, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IClientReqLock {
    utxoRefs: CanBeTxOutRef[];
    required?: number;
}

export class ClientReqLock implements ToCbor, ToCborObj, IClientReqLock
{
    readonly utxoRefs: TxOutRef[];
    readonly required: number;

    constructor({ utxoRefs, required }: IClientReqLock)
    {
        this.utxoRefs = utxoRefs
        .map( ref => 
            ref instanceof TxOutRef ? ref : forceTxOutRef(ref)
        );
        this.required = (
            typeof required === "number" &&
            Number.isSafeInteger(required) &&
            required >= 1
        ) ? required : 1;
    }

    toCborObj(): CborObj {
        return new CborArray([
            new CborUInt(1),
            new CborArray(this.utxoRefs.map( ref => ref.toCborObj() )),
            this.required === 1 ? undefined : new CborUInt(this.required)
        ].filter( x => x !== undefined ));
    }
    toCbor(): CborString
    {
        return Cbor.encode(this.toCborObj());
    }

    static fromCbor(cbor: CanBeCborString): ClientReqLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return ClientReqLock.fromCborObj(Cbor.parse(bytes));
    }

    // [ 1, [ + utxoRef ], ? uint ];
    static fromCborObj(cbor: CborObj): ClientReqLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(1) &&
            cbor.array[1] instanceof CborArray
        )) throw new Error("Invalid CBOR for ClientReqLock");

        let required = undefined;

        if( cbor.array.length >= 3 )
        {
            if(!(
                cbor.array[2] instanceof CborUInt
            )) throw new Error("Invalid CBOR for ClientReqLock");

            required = Number(cbor.array[2].num);
        }

        return new ClientReqLock({ utxoRefs: cbor.array[1].array.map(TxOutRef.fromCborObj), required });
    }
}