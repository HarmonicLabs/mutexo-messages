import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { isByte, isUTxORef } from "../utils/isThatType";
import { UTxORefToCborObj } from "../utils/toCborObj";
import { isObject } from "@harmoniclabs/obj-utils";
import { Code, UTxORef } from "../utils/types";
import { roDescr } from "../utils/roDescr";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IMessageFree {
    eventType: 0,
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageFree(stuff: any): stuff is IMessageFree {
    return (
        isObject(stuff) &&
        stuff.eventType === 0 && 
        isITxOutRef(stuff.utxoRef) &&
        stuff.addr instanceof Address
    );
}

export class MessageFree
    implements ToCbor, ToCborObj, IMessageFree
{
    readonly eventType: 0;
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageFree) {
        if (!(isIMessageFree(stuff))) throw new Error("invalid `MessageFree` data provided");

        Object.defineProperties(
            this, {
                eventType: { value: 0, ...roDescr },
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

    static fromCbor(cbor: CanBeCborString): MessageFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageFree.fromCborObj(Cbor.parse(bytes), bytes);
    }

    static fromCborObj(cbor: CborObj, _originalBytes?: Uint8Array | undefined): MessageFree {
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

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode(cbor).toBuffer();

        const hdr = new MessageFree({
            eventType: 0,
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