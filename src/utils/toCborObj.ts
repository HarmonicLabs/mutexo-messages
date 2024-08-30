import { CborArray, CborBytes, CborUInt } from "@harmoniclabs/cbor";
import { UTxORef } from "./types";

export function UTxORefToCborObj( stuff: UTxORef ): CborArray
{
    return new CborArray([
        new CborBytes( stuff.hash ),
        new CborUInt( stuff.index )
    ]);
}