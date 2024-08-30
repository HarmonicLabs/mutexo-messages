import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { MessageFailure, IMessageFailure } from "./messages/MessageFailure";
import { MessageSuccess, IMessageSuccess } from "./messages/MessageSuccess";
import { MessageOutput, IMessageOutput } from "./messages/MessageOutput";
import { MessageInput, IMessageInput } from "./messages/MessageInput";
import { MessageClose, IMessageClose } from "./messages/MessageClose";
import { MessageError, IMessageError } from "./messages/MessageError";
import { MessageFree, IMessageFree } from "./messages/MessageFree";
import { MessageLock, IMessageLock } from "./messages/MessageLock";
import { MessageTypeCodes } from "./utils/constants";
import { isObject } from "@harmoniclabs/obj-utils";
import { isByte } from "./utils/isThatType";

export type MutexoMessage
    = MessageFree
    | MessageLock
    | MessageInput
    | MessageOutput
    | MessageSuccess
    | MessageFailure
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
            stuff instanceof MessageSuccess ||
            stuff instanceof MessageFailure ||
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
    | IMessageSuccess
    | IMessageFailure
    | IMessageClose
    | IMessageError;

export function isIMutexoMessage( stuff: any ): stuff is IMutexoMessage
{
    return(
        isObject( stuff ) &&
        isByte( stuff.eventType ) &&
        Object.values( MessageTypeCodes ).includes( stuff.eventType )
    );
}

export function mutexoMessageFromCbor( cbor: CanBeCborString ): MutexoMessage
{
    const buff = cbor instanceof Uint8Array ? 
        cbor : 
        forceCborString( cbor ).toBuffer();
    
    const msg = mutexoMessageFromCborObj( Cbor.parse( buff ) );

    // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.ts(2540)
    msg.cborBytes = buff;

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
    if( index === 4 ) return MessageSuccess.fromCborObj( cbor );
    if( index === 5 ) return MessageFailure.fromCborObj( cbor );
    if( index === 6 ) return MessageClose.fromCborObj( cbor );
    if( index === 7 ) return MessageError.fromCborObj( cbor );

    throw new Error( "invalid cbor for `MutexoMessage`; unknown index: " + index );
}
