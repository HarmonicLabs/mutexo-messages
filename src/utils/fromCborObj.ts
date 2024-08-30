import { CborArray, CborBytes, CborObj, CborUInt } from "@harmoniclabs/cbor";
import { Hash32, HashIndex, UTxORef } from "./types";

export function UTxORefFromCborObj( cbor: CborObj ): UTxORef
{
    if(!(
        cbor instanceof CborArray &&
        Array.isArray( cbor.array ) &&
        cbor.array.length === 2
    )) throw new Error( "invalid `UTxORef` data provided" );

    const [
        cborHash,
        cborIndex
    ] = cbor.array;

    if(!( 
        cborHash instanceof CborBytes &&
        cborIndex instanceof CborUInt
    )) throw new Error( "invalid cbor for `UTxORef`" );

    return {
        hash: cborHash.bytes as Hash32,
        index: Number( cborIndex.num ) as HashIndex
    } as UTxORef;
}