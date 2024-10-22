import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { ClientReqFree, IClientReqFree } from "./clientReqs/ClientReqFree";
import { ClientReqLock, IClientReqLock } from "./clientReqs/ClientReqLock";
import { ClientUnsub, IClientUnsub } from "./clientReqs/ClientUnsub";
import { ClientSub, IClientSub } from "./clientReqs/ClientSub";
import { isObject } from "@harmoniclabs/obj-utils";
import { IMessageClose, MessageClose } from "./messages";

export type ClientReq
    = ClientReqFree
    | ClientReqLock
    | ClientSub
    | ClientUnsub
    | MessageClose;

export function isClientReq( stuff: any ): stuff is ClientReq
{
    return(
        isObject( stuff ) && 
        (
            stuff instanceof ClientReqFree  ||
            stuff instanceof ClientReqLock  ||
            stuff instanceof ClientSub      ||
            stuff instanceof ClientUnsub    ||
            stuff instanceof MessageClose
        )
    );
}

export type IClientReq
    = IClientReqFree
    | IClientReqLock
    | IClientSub
    | IClientUnsub
    | IMessageClose

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
    )) throw new Error( "invalid cbor for `ClientReq`" );

    const index = Number( cbor.array[0].num );

    if( index === 0 ) return ClientReqFree.fromCborObj( cbor );
    if( index === 1 ) return ClientReqLock.fromCborObj( cbor );
    if( index === 2 ) return ClientSub.fromCborObj( cbor );
    if( index === 3 ) return ClientUnsub.fromCborObj( cbor );
    if( index === 6 ) return MessageClose.fromCborObj( cbor );

    throw new Error( "invalid cbor for `ClientReq`; unknown index: " + index );
}