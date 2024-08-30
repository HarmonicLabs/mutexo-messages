import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageError
{
    eventType: number
}

export class MessageError
    implements ToCbor, ToCborObj, IMessageError 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}