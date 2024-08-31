import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Filter, filterFromCborObj } from "./filters/Filter";

export interface IClientUnsub {
    eventType: number;
    filters: Filter[];
}

export class ClientUnsub implements ToCbor, ToCborObj, IClientUnsub {
    readonly eventType: number;
    readonly filters: Filter[];

    constructor({ eventType, filters }: IClientUnsub) {
        this.eventType = eventType;
        this.filters = filters;
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj());
    }
    toCborObj(): CborObj {
        return new CborArray([
            new CborUInt( 3 ),
            new CborUInt(this.eventType),
            new CborArray(this.filters.map(filter => filter.toCborObj()))
        ]);
    }
    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): ClientUnsub {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return ClientUnsub.fromCborObj(Cbor.parse(bytes));
    }
    static fromCborObj(cbor: CborObj): ClientUnsub {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(3) &&
            cbor.array[1] instanceof CborUInt &&
            cbor.array[2] instanceof CborArray
        )) throw new Error("Invalid CBOR for ClientUnsub");
        
        const [ _, eventType, filters] = cbor.array;
        return new ClientUnsub({ eventType: Number(eventType.num), filters: filters.array.map( filterFromCborObj ) });
    }
}