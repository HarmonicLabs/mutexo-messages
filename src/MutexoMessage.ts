import { CanBeCborString, Cbor, CborArray, CborObj, CborUInt, forceCborString } from "@harmoniclabs/cbor";
import { MutexFailure, IMutexFailure } from "./messages/MessageMutexFailure";
import { MutexSuccess, IMutexSuccess } from "./messages/MessageMutexSuccess";
import { ISubFailure, SubFailure } from "./messages/MessageSubFailure";
import { ISubSuccess, SubSuccess } from "./messages/MessageSubSuccess";
import { MutexoOutput, IMutexoOutput } from "./messages/MessageOutput";
import { MutexoInput, IMutexoInput } from "./messages/MessageInput";
import { Close, IClose } from "./messages/MessageClose";
import { MutexoError, IMutexoError } from "./messages/MessageError";
import { Free, IFree } from "./messages/MessageFree";
import { Lock, ILock } from "./messages/MessageLock";
import { isObject } from "@harmoniclabs/obj-utils";

export type MutexoMessage
    = Free
    | Lock
    | MutexoInput
    | MutexoOutput
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
            stuff instanceof Free           ||
            stuff instanceof Lock           ||
            stuff instanceof MutexoInput    ||
            stuff instanceof MutexoOutput   ||
            stuff instanceof MutexSuccess   ||
            stuff instanceof MutexFailure   ||
            stuff instanceof Close          ||
            stuff instanceof MutexoError    ||
            stuff instanceof SubSuccess     ||
            stuff instanceof SubFailure
        )
    );
}

export type IMutexoMessage
    = IFree
    | ILock
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

    if( index === 0 ) return Free.fromCborObj( cbor );
    if( index === 1 ) return Lock.fromCborObj( cbor );
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
