import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Filter, filterFromCborObj } from "./filters/Filter";

export interface IClientSub {
    eventType: number;
    filters: Filter[];
}

export class ClientSub implements ToCbor, ToCborObj, IClientSub {
    readonly eventType: number;
    readonly filters: Filter[];

    constructor({ eventType, filters }: IClientSub) {
        this.eventType = eventType;
        this.filters = filters;
    }

    toCborObj(): CborObj {
        return new CborArray([
            new CborUInt( 2 ),
            new CborUInt(this.eventType),
            new CborArray(this.filters.map(filter => filter.toCborObj()))
        ]);
    }

    toCbor(): CborString {
        return Cbor.encode(this.toCborObj());
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor(cbor: CanBeCborString): ClientSub {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return ClientSub.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): ClientSub {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(2) &&
            cbor.array[1] instanceof CborUInt &&
            cbor.array[2] instanceof CborArray
        )) throw new Error("Invalid CBOR for ClientSub");
        
        const [ _, eventType, filters] = cbor.array;
        return new ClientSub({ eventType: Number(eventType.num), filters: filters.array.map( filterFromCborObj ) });
    }
}