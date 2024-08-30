import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageFree
{
    eventType: number
}

export class MessageFree
    implements ToCbor, ToCborObj, IMessageFree 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}