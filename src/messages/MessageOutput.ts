import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Address, isITxOutRef, TxOut, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

export interface IMessageOutput {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageOutput(stuff: any): stuff is IMessageOutput {
    return (
        isObject(stuff) &&
        stuff.eventType === 3 && 
        isITxOutRef(stuff.utxoRef) &&
        stuff.addr instanceof Address
    );
}

export class MessageOutput
    implements ToCbor, ToCborObj, IMessageOutput
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageOutput) {
        if (!(isIMessageOutput(stuff))) throw new Error("invalid `MessageOutput` data provided");

        this.utxoRef = new TxOutRef( stuff.utxoRef );
        this.addr = stuff.addr;
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj());
    }

    toCborObj(): CborArray {
        if (!(isIMessageOutput(this))) throw new Error("invalid `MessageOutput` data provided");

        return new CborArray([
            new CborUInt( 3 ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): MessageOutput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageOutput.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): MessageOutput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length === 3 &&
            cbor.array[0] instanceof CborUInt &&
            Number(cbor.array[0].num) === 3
        )) throw new Error("invalid cbor for `MessageOutput`");

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        return new MessageOutput({
            utxoRef: TxOutRef.fromCborObj(cborUTxORef),
            addr: Address.fromCborObj(cborAddr)
        });
    }
}