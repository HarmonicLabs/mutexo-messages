import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { roDescr } from "../utils/roDescr";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

type SuccessData = { successType: number, utxoRefs: TxOutRef[] }

function isSuccessData(stuff: any): stuff is SuccessData {
    return (
        isObject(stuff) &&
        Array.isArray(stuff.utxoRefs) &&
        stuff.utxoRefs.every((ref: any) => ref instanceof TxOutRef ) &&
        typeof stuff.successType === "number" &&
        Number.isSafeInteger(stuff.successType)
    );
}

function successDataToCborObj(stuff: SuccessData): CborArray {
    return new CborArray([
        new CborUInt(stuff.successType),
        new CborArray(stuff.utxoRefs.map( u => u.toCborObj() ))
    ]);
}

function successDataFromCborObj(cbor: CborObj): SuccessData {
    if (!(
        cbor instanceof CborArray &&
        Array.isArray(cbor.array) &&
        cbor.array.length === 2
    )) throw new Error("invalid `SuccessData` data provided");

    const [
        cborSuccessType,
        cborutxoRefs
    ] = cbor.array;

    if (!(
        cborSuccessType instanceof CborUInt &&
        cborutxoRefs instanceof CborArray
    )) throw new Error("invalid cbor for `SuccessData`");

    return {
        successType: Number(cborSuccessType.num) as number,
        utxoRefs: cborutxoRefs.array.map((cborUtxo) => TxOutRef.fromCborObj(cborUtxo))
    } as SuccessData;
}


const MSG_SUCCESS_EVENT_TYPE = 4;

export interface IMessageSuccess {
    successData: SuccessData
}

function isIMessageSuccess(stuff: any): stuff is IMessageSuccess {
    return (
        isObject(stuff) &&
        isSuccessData(stuff.successData)
    );
}

export class MessageSuccess
    implements ToCbor, ToCborObj, IMessageSuccess
{
    readonly eventType: number;
    readonly successData: SuccessData;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageSuccess) {
        if (!(isIMessageSuccess(stuff))) throw new Error("invalid `MessageSuccess` data provided");

        this.successData = stuff.successData;
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj())
    }

    toCborObj(): CborArray {
        if (!(isIMessageSuccess(this))) throw new Error("invalid `MessageSuccess` data provided");

        return new CborArray([
            new CborUInt(this.eventType),
            successDataToCborObj(this.successData)
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): MessageSuccess {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageSuccess.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): MessageSuccess {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length === 2
        )) throw new Error("invalid cbor for `MessageSuccess`");

        const [
            cborEventType,
            cborSuccessData
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number(cborEventType.num) === MSG_SUCCESS_EVENT_TYPE
        )) throw new Error("invalid cbor for `MessageSuccess`");

        return new MessageSuccess({
            successData: successDataFromCborObj(cborSuccessData)
        });
    }
}