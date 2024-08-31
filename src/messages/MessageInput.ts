import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Code, UTxORef } from "../utils/types";
import { roDescr } from "../utils/roDescr";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IMessageInput {
    eventType: Code,
    utxoRef: TxOutRef,
    addr: Address,
    txHash: Uint8Array
}

function isIMessageInput(stuff: any): stuff is IMessageInput {
    return (
        isObject(stuff) &&
        stuff.eventType === 2 && 
        isITxOutRef(stuff.utxoRef) &&
        stuff.addr instanceof Address &&
        stuff.txHash instanceof Uint8Array && stuff.txHash.length === 32
    );
}

export class MessageInput
    implements ToCbor, ToCborObj, IMessageInput
{
    readonly eventType: Code;
    readonly utxoRef: TxOutRef;
    readonly addr: Address;
    readonly txHash: Uint8Array;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageInput) {
        if (!(isIMessageInput(stuff))) throw new Error("invalid `MessageInput` data provided");

        Object.defineProperties(
            this, {
                eventType: { value: 2, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
                utxoRef: { value: new TxOutRef( stuff.utxoRef ), ...roDescr }, 
                addr: { value: stuff.addr, ...roDescr },
                txHash: { value: stuff.txHash, ...roDescr }
            }
        );
    }

    toCbor(): CborString {
        return new CborString(this.toCborBytes());
    }

    toCborObj(): CborArray {
        if (!(isIMessageInput(this))) throw new Error("invalid `MessageInput` data provided");

        return new CborArray([
            new CborUInt(this.eventType),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj(),
            new CborBytes(this.txHash)
        ]);
    }

    toCborBytes(): Uint8Array {
        if (!(this.cborBytes instanceof Uint8Array)) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode(this.toCborObj()).toBuffer();
        }

        return Uint8Array.prototype.slice.call(this.cborBytes);
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
            Number(cbor.array[0].num) === 2
        )) throw new Error("invalid cbor for `MessageInput`");

        const [
            cborEventType,
            cborUTxORef,
            cborAddr,
            cborTxHash
        ] = cbor.array;

        if (!(cborTxHash instanceof CborBytes && cborTxHash.bytes.length === 32)) {
            throw new Error("invalid cbor for `MessageInput`");
        }

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode(cbor).toBuffer();

        const hdr = new MessageInput({
            eventType: Number(cborEventType.num) as Code,
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr),
            txHash: cborTxHash.bytes
        });

        if (originalWerePresent) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}