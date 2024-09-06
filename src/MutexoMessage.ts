import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { MessageMutexFailure, IMessageMutexFailure } from "./messages/MessageMutexFailure";
import { MessageMutexSuccess, IMessageMutexSuccess } from "./messages/MessageMutexSuccess";
import { MessageOutput, IMessageOutput } from "./messages/MessageOutput";
import { MessageInput, IMessageInput } from "./messages/MessageInput";
import { MessageClose, IMessageClose } from "./messages/MessageClose";
import { MessageError, IMessageError } from "./messages/MessageError";
import { MessageFree, IMessageFree } from "./messages/MessageFree";
import { MessageLock, IMessageLock } from "./messages/MessageLock";
import { MutexoEventIndex } from "./utils/constants";
import { isObject } from "@harmoniclabs/obj-utils";

export type MutexoMessage
    = MessageFree
    | MessageLock
    | MessageInput
    | MessageOutput
    | MessageMutexSuccess
    | MessageMutexFailure
    | MessageClose
    | MessageError;

export function isMutexoMessage( stuff: any ): stuff is MutexoMessage
{
    return(
        isObject( stuff ) && 
        (
            stuff instanceof MessageFree    ||
            stuff instanceof MessageLock    ||
            stuff instanceof MessageInput   ||
            stuff instanceof MessageOutput  ||
            stuff instanceof MessageMutexSuccess ||
            stuff instanceof MessageMutexFailure ||
            stuff instanceof MessageClose   ||
            stuff instanceof MessageError
        )
    );
}

export type IMutexoMessage
    = IMessageFree
    | IMessageLock
    | IMessageInput
    | IMessageOutput
    | IMessageMutexSuccess
    | IMessageMutexFailure
    | IMessageClose
    | IMessageError;

export function isIMutexoMessage( stuff: any ): stuff is IMutexoMessage
{
    return(
        isObject( stuff ) &&
        typeof MutexoEventIndex[ stuff.eventType ] === "string"
    );
}

export function mutexoMessageFromCbor( cbor: CanBeCborString ): MutexoMessage
{
    const buff = cbor instanceof Uint8Array ? 
        cbor : 
        forceCborString( cbor ).toBuffer();
    
    const msg = mutexoMessageFromCborObj( Cbor.parse( buff ) );

    return msg;
}
export function mutexoMessageFromCborObj( cbor: CborObj ): MutexoMessage
{
    if(!(
        cbor instanceof CborArray &&
        cbor.array.length >= 1 &&
        cbor.array[0] instanceof CborUInt
    )) throw new Error("invalid cbor for `MutexoMessage`");

    const index = Number( cbor.array[0].num );

    if( index === 0 ) return MessageFree.fromCborObj( cbor );
    if( index === 1 ) return MessageLock.fromCborObj( cbor );
    if( index === 2 ) return MessageInput.fromCborObj( cbor );
    if( index === 3 ) return MessageOutput.fromCborObj( cbor );
    if( index === 4 ) return MessageMutexSuccess.fromCborObj( cbor );
    if( index === 5 ) return MessageMutexFailure.fromCborObj( cbor );
    if( index === 6 ) return MessageClose.fromCborObj( cbor );
    if( index === 7 ) return MessageError.fromCborObj( cbor );

    throw new Error( "invalid cbor for `MutexoMessage`; unknown index: " + index );
}
