import { MutexoMessage, mutexoMessageFromCborObj } from "../MutexoMessage";
import { ClientReq, clientReqFromCborObj } from "../ClientReq";
import { isObject } from "@harmoniclabs/obj-utils";
import { Cbor, CborArray } from "@harmoniclabs/cbor";

export function parseMutexoMessage( bytes: Uint8Array ): MutexoMessage
{
    return mutexoMessageFromCborObj( Cbor.parse( bytes ) );
}

export function parseClientReq( bytes: Uint8Array ): ClientReq
{
    return clientReqFromCborObj( Cbor.parse( bytes ) );
}