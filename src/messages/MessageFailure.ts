import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageFailure
{
    eventType: number
}

export class MessageFailure
    implements ToCbor, ToCborObj, IMessageFailure 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}