import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Code } from "../utils/types";
import { roDescr } from "../utils/roDescr";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IMessageLock {
    eventType: Code,
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageLock(stuff: any): stuff is IMessageLock {
    return (
        isObject(stuff) &&
        stuff.eventType === 1 && 
        isITxOutRef(stuff.utxoRef) &&
        stuff.addr instanceof Address
    );
}

export class MessageLock
    implements ToCbor, ToCborObj, IMessageLock
{
    readonly eventType: Code;
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageLock) {
        if (!(isIMessageLock(stuff))) throw new Error("invalid `MessageLock` data provided");

        Object.defineProperties(
            this, {
                eventType: { value: 1, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
                utxoRef: { value: new TxOutRef( stuff.utxoRef ), ...roDescr }, 
                addr: { value: stuff.addr, ...roDescr }
            }
        );
    }

    toCbor(): CborString {
        return new CborString(this.toCborBytes());
    }

    toCborObj(): CborArray {
        if (!(isIMessageLock(this))) throw new Error("invalid `MessageLock` data provided");

        return new CborArray([
            new CborUInt(this.eventType),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        if (!(this.cborBytes instanceof Uint8Array)) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode(this.toCborObj()).toBuffer();
        }

        return Uint8Array.prototype.slice.call(this.cborBytes);
    }

    static fromCbor(cbor: CanBeCborString): MessageLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageLock.fromCborObj(Cbor.parse(bytes), bytes);
    }

    static fromCborObj(cbor: CborObj, _originalBytes?: Uint8Array | undefined): MessageLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length === 3 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === 1
        )) throw new Error("invalid cbor for `MessageLock`");

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode(cbor).toBuffer();

        const hdr = new MessageLock({
            eventType: Number(cborEventType.num) as Code,
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr)
        });

        if (originalWerePresent) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}