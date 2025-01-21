import { AddrFilter, IAddrFilter, isIAddrFilter } from "./AddrFilter";
import { IUtxoFilter, UtxoFilter } from "./UtxoFilter";
import { CborArray, CborObj, CborUInt } from "@harmoniclabs/cbor";

export type IFilter = IAddrFilter | IUtxoFilter;
export type Filter = AddrFilter | UtxoFilter;

export function filterFromCborObj(cbor: CborObj): Filter
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 1 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("Invalid CBOR for Filter");

    const idx = Number(cbor.array[0].num);

    switch(idx) {
        case 0: return AddrFilter.fromCborObj(cbor);
        case 1: return UtxoFilter.fromCborObj(cbor);
        default: break;
    }
    
    throw new Error("Invalid CBOR for Filter");
}

export function forceFilter( filter: IFilter ): Filter
{
    if( filter instanceof AddrFilter || filter instanceof UtxoFilter ) return filter;

    return isIAddrFilter( filter ) ? new AddrFilter( filter ) : new UtxoFilter( filter );
}