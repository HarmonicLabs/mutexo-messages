import { MutexoMessage, mutexoMessageFromCborObj } from "../MutexoMessage";
import { ClientReq, clientReqFromCborObj } from "../ClientReq";
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

export function parseClientReq( stuff: any ): ClientReq
{
    if(!( 
        isObject( stuff ) &&
        stuff instanceof CborArray 
    )) throw new Error( "Invalid message" );

    return clientReqFromCborObj( stuff );
}
