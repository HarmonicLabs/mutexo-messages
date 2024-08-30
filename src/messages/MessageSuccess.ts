import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageSuccess
{
    eventType: number
}

export class MessageSuccess
    implements ToCbor, ToCborObj, IMessageSuccess 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}