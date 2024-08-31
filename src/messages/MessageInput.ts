import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { roDescr } from "../utils/roDescr";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

const MSG_INPUT_EVENT_TYPE = 2;

export interface IMessageInput {
    utxoRef: TxOutRef,
    addr: Address,
    txHash: Uint8Array
}

function isIMessageInput(stuff: any): stuff is IMessageInput {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address &&
        stuff.txHash instanceof Uint8Array && stuff.txHash.length === 32
    );
}

export class MessageInput
    implements ToCbor, ToCborObj, IMessageInput
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;
    readonly txHash: Uint8Array;

    constructor(stuff: IMessageInput) {
        if (!(isIMessageInput(stuff))) throw new Error("invalid `MessageInput` data provided");

        this.utxoRef = new TxOutRef( stuff.utxoRef );
        this.addr = stuff.addr;
        this.txHash = stuff.txHash;
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj());
    }

    toCborObj(): CborArray {
        if (!(isIMessageInput(this))) throw new Error("invalid `MessageInput` data provided");

        return new CborArray([
            new CborUInt( MSG_INPUT_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj(),
            new CborBytes(this.txHash)
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): MessageInput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageInput.fromCborObj(Cbor.parse(bytes), bytes);
    }

    static fromCborObj(cbor: CborObj, _originalBytes?: Uint8Array | undefined): MessageInput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length === 4 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === MSG_INPUT_EVENT_TYPE
        )) throw new Error("invalid cbor for `MessageInput`");

        const [
            _,
            cborUTxORef,
            cborAddr,
            cborTxHash
        ] = cbor.array;

        if (!(cborTxHash instanceof CborBytes && cborTxHash.bytes.length === 32)) {
            throw new Error("invalid cbor for `MessageInput`");
        }

        return new MessageInput({
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr),
            txHash: cborTxHash.bytes
        });
    }
}