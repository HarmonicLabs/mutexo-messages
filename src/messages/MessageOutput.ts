import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageOutput
{
    eventType: number
}

export class MessageOutput
    implements ToCbor, ToCborObj, IMessageOutput 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}