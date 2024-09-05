import { MutexoMessage, mutexoMessageFromCborObj } from "../MutexoMessage";
import { isObject } from "@harmoniclabs/obj-utils";
import { CborArray } from "@harmoniclabs/cbor";

export function parseMutexoMessage( stuff: any ): MutexoMessage
{
    if(!( 
        isObject( stuff ) &&
        stuff instanceof CborArray 
    )) throw new Error( "Invalid message" );

    return mutexoMessageFromCborObj( stuff );
}
