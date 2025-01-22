import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { MutexFailure, IMutexFailure } from "./messages/MessageMutexFailure";
import { MutexSuccess, IMutexSuccess } from "./messages/MessageMutexSuccess";
import { ISubFailure, SubFailure } from "./messages/MessageSubFailure";
import { ISubSuccess, SubSuccess } from "./messages/MessageSubSuccess";
import { MutexoOutput, IMutexoOutput } from "./messages/MessageOutput";
import { MutexoInput, IMutexoInput } from "./messages/MessageInput";
import { Close, IClose } from "./messages/MessageClose";
import { MutexoError, IMutexoError } from "./messages/MessageError";
import { MutexoFree, IMutexoFree } from "./messages/MessageFree";
import { isObject } from "@harmoniclabs/obj-utils";
import { IMutexoLock, MutexoLock } from "./messages/MessageLock";
import { MutexoChainEventName, MutexoEventName } from "./events";

/** events that are triggered by the server following the chain */
export type MutexoChainEventMessage
    = MutexoFree
    | MutexoLock
    | MutexoInput
    | MutexoOutput;

export function isMutexoChainEventMessage( stuff: any ): stuff is MutexoChainEventMessage
{
    return(
        stuff instanceof MutexoFree  ||
        stuff instanceof MutexoLock  ||
        stuff instanceof MutexoInput ||
        stuff instanceof MutexoOutput
    );
}

export function chainEventMessageToName( msg: MutexoChainEventMessage ): MutexoChainEventName
{
    if( msg instanceof MutexoFree ) return "free";
    if( msg instanceof MutexoLock ) return "lock";
    if( msg instanceof MutexoInput ) return "input";
    if( msg instanceof MutexoOutput ) return "output";

    throw new Error( "invalid `MutexoChainEventMessage`" );
}

export type MutexoMessage
    = MutexoChainEventMessage
    | MutexSuccess
    | MutexFailure
    | Close
    | MutexoError
    | SubSuccess
    | SubFailure;

export function isMutexoMessage( stuff: any ): stuff is MutexoMessage
{
    return(
        isObject( stuff ) && 
        (
            isMutexoChainEventMessage( stuff )     ||
            stuff instanceof MutexSuccess   ||
            stuff instanceof MutexFailure   ||
            stuff instanceof Close          ||
            stuff instanceof MutexoError    ||
            stuff instanceof SubSuccess     ||
            stuff instanceof SubFailure
        )
    );
}

export function mutexoMessageToName( msg: MutexoMessage ): MutexoEventName
{
    if( isMutexoChainEventMessage( msg ) ) return chainEventMessageToName( msg );
    if( msg instanceof MutexSuccess ) return "mutexSuccess";
    if( msg instanceof MutexFailure ) return "mutexFailure";
    if( msg instanceof Close ) return "close";
    if( msg instanceof MutexoError ) return "error";
    if( msg instanceof SubSuccess ) return "subSuccess";
    if( msg instanceof SubFailure ) return "subFailure";

    throw new Error( "invalid `MutexoMessage`" );
}

export type IMutexoMessage
    = IMutexoFree
    | IMutexoLock
    | IMutexoInput
    | IMutexoOutput
    | IMutexSuccess
    | IMutexFailure
    | IClose
    | IMutexoError
    | ISubSuccess
    | ISubFailure;

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

    if( index === 0 ) return MutexoFree.fromCborObj( cbor );
    if( index === 1 ) return MutexoLock.fromCborObj( cbor );
    if( index === 2 ) return MutexoInput.fromCborObj( cbor );
    if( index === 3 ) return MutexoOutput.fromCborObj( cbor );
    if( index === 4 ) return MutexSuccess.fromCborObj( cbor );
    if( index === 5 ) return MutexFailure.fromCborObj( cbor );
    if( index === 6 ) return Close.fromCborObj( cbor );
    if( index === 7 ) return MutexoError.fromCborObj( cbor );
    if( index === 8 ) return SubSuccess.fromCborObj( cbor );
    if( index === 9 ) return SubFailure.fromCborObj( cbor );

    throw new Error( "invalid cbor for `MutexoMessage`; unknown index: " + index );
}
