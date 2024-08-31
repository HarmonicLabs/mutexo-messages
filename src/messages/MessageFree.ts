import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

const MSG_FREE_EVENT_TYPE = 0;

export interface IMessageFree {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageFree(stuff: any): stuff is IMessageFree {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MessageFree
    implements ToCbor, ToCborObj, IMessageFree
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageFree) {
        if (!(isIMessageFree(stuff))) throw new Error("invalid `MessageFree` data provided");

    }

    toCbor(): CborString {
        return new CborString(this.toCborBytes());
    }

    toCborObj(): CborArray {
        return new CborArray([
            new CborUInt( MSG_FREE_EVENT_TYPE),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): MessageFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageFree.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): MessageFree {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === 0
        )) throw new Error("invalid cbor for `MessageFree`");

        const [
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        return new MessageFree({
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr)
        });
    }
}