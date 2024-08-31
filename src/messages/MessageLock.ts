import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

const MSG_LOCK_EVENT_TYPE = 1;

export interface IMessageLock {
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
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageLock) {
        if (!(isIMessageLock(stuff))) throw new Error("invalid `MessageLock` data provided");

        this.utxoRef = new TxOutRef( stuff.utxoRef );
        this.addr = stuff.addr;
    }

    toCbor(): CborString {
        return new CborString(this.toCborBytes());
    }

    toCborObj(): CborArray {
        if (!(isIMessageLock(this))) throw new Error("invalid `MessageLock` data provided");

        return new CborArray([
            new CborUInt( MSG_LOCK_EVENT_TYPE),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): MessageLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageLock.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj( cbor: CborObj ): MessageLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length === 3 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === 1
        )) throw new Error("invalid cbor for `MessageLock`");

        const [
            _,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        return new MessageLock({
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr)
        });
    }
}