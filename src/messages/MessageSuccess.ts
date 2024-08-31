import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { getCborBytesDescriptor } from "../utils/getCborBytesDescriptor";
import { isByte, isUTxORef } from "../utils/isThatType";
import { isObject } from "@harmoniclabs/obj-utils";
import { Code, UTxORef } from "../utils/types";
import { roDescr } from "../utils/roDescr";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";

type SuccessData = { successType: Code, utxoRefs: UTxORef[] }

function isSuccessData(stuff: any): stuff is SuccessData {
    return (
        isObject(stuff) &&
        isByte(stuff.successType) &&
        Array.isArray(stuff.utxoRefs) &&
        stuff.utxoRefs.every(isUTxORef)
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
        successType: Number(cborSuccessType.num) as Code,
        utxoRefs: cborutxoRefs.array.map((cborUtxo) => TxOutRef.fromCborObj(cborUtxo))
    } as SuccessData;
}

export interface IMessageSuccess {
    eventType: Code
    successData: SuccessData
}

function isIMessageSuccess(stuff: any): stuff is IMessageSuccess {
    return (
        isObject(stuff) &&
        isByte(stuff.eventType) &&
        stuff.eventType === 4 &&
        isSuccessData(stuff.successData)
    );
}

export class MessageSuccess
    implements ToCbor, ToCborObj, IMessageSuccess
{
    readonly eventType: Code;
    readonly successData: SuccessData;

    readonly cborBytes?: Uint8Array | undefined;

    constructor(stuff: IMessageSuccess) {
        if (!(isIMessageSuccess(stuff))) throw new Error("invalid `MessageSuccess` data provided");

        Object.defineProperties(
            this, {
                eventType: { value: 4, ...roDescr },
                successData: { value: stuff.successData, ...roDescr },
                cborBytes: getCborBytesDescriptor(),
            }
        );
    }

    toCbor(): CborString {
        return new CborString(this.toCborBytes());
    }

    toCborObj(): CborArray {
        if (!(isIMessageSuccess(this))) throw new Error("invalid `MessageSuccess` data provided");

        return new CborArray([
            new CborUInt(this.eventType),
            successDataToCborObj(this.successData)
        ]);
    }

    toCborBytes(): Uint8Array {
        if (!(this.cborBytes instanceof Uint8Array)) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode(this.toCborObj()).toBuffer();
        }

        return Uint8Array.prototype.slice.call(this.cborBytes);
    }

    static fromCbor(cbor: CanBeCborString): MessageSuccess {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return MessageSuccess.fromCborObj(Cbor.parse(bytes), bytes);
    }

    static fromCborObj(cbor: CborObj, _originalBytes?: Uint8Array | undefined): MessageSuccess {
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
            Number(cborEventType.num) === 4
        )) throw new Error("invalid cbor for `MessageSuccess`");

        const originalWerePresent = _originalBytes instanceof Uint8Array;
        _originalBytes = _originalBytes instanceof Uint8Array ? _originalBytes : Cbor.encode(cbor).toBuffer();

        const hdr = new MessageSuccess({
            eventType: Number(cborEventType.num) as Code,
            successData: successDataFromCborObj(cborSuccessData)
        });

        if (originalWerePresent) {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            hdr.cborBytes = _originalBytes;
        }

        return hdr;
    }
}