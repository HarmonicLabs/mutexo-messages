import { Address, AddressStr } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IAddrFilter {
    addr: Address | AddressStr;
}

export function isIAddrFilter(stuff: any): stuff is IAddrFilter {
    return (
        stuff instanceof Object &&
        (stuff.addr instanceof Address || typeof stuff.addr === "string")
    );
}

export class AddrFilter implements ToCbor, ToCborObj, IAddrFilter
{
    readonly addr: Address;

    constructor({ addr }: IAddrFilter)
    {
        this.addr = addr instanceof Address ? addr.clone() : Address.fromString( addr );
    }

    toCbor(): CborString
    {
        return Cbor.encode(this.toCborObj());
    }
    // [ 0, addr ]
    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt(0),
            this.addr.toCborObj()
        ]);
    }

    static fromCbor(cbor: CanBeCborString): AddrFilter {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString(cbor).toBuffer();
        return AddrFilter.fromCborObj(Cbor.parse(bytes));
    }

    static fromCborObj(cbor: CborObj): AddrFilter {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2 &&
            cbor.array[0] instanceof CborUInt &&
            cbor.array[0].num === BigInt(0)
        )) throw new Error("Invalid CBOR for AddrFilter");

        const [ _0, addr ] = cbor.array;
        return new AddrFilter({ addr: Address.fromCborObj( addr ) });
    }
}