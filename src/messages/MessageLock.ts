import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageLock
{
    eventType: number
}

export class MessageLock
    implements ToCbor, ToCborObj, IMessageLock 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}