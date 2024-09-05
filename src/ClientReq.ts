import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { ClientReqFree } from "./clientReqs/ClientReqFree";
import { ClientReqLock } from "./clientReqs/ClientReqLock";
import { ClientSub } from "./clientReqs/ClientSub";
import { ClientUnsub } from "./clientReqs/ClientUnsub";

export type ClientReq
    = ClientReqFree
    | ClientReqLock
    | ClientSub
    | ClientUnsub;

export function isClientReq( stuff: any ): stuff is ClientReq
{
    return(
        isObject( stuff ) && 
        (
            stuff instanceof ClientReqFree    ||
            stuff instanceof ClientReqLock    ||
            stuff instanceof ClientSub   ||
            stuff instanceof ClientUnsub
        )
    );
}

export function clientReqFromCbor( cbor: CanBeCborString ): ClientReq
{
    const buff = cbor instanceof Uint8Array ? 
        cbor : 
        forceCborString( cbor ).toBuffer();
    
    const msg = clientReqFromCborObj( Cbor.parse( buff ) );

    return msg;
}
export function clientReqFromCborObj( cbor: CborObj ): ClientReq
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 1 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `MutexoMessage`");

    const index = Number( cbor.array[0].num );

    if( index === 0 ) return ClientReqFree.fromCborObj( cbor );
    if( index === 1 ) return ClientReqLock.fromCborObj( cbor );
    if( index === 2 ) return ClientSub.fromCborObj( cbor );
    if( index === 3 ) return ClientUnsub.fromCborObj( cbor );

    throw new Error( "invalid cbor for `MutexoMessage`; unknown index: " + index );
}
