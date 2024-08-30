import { CborObj, CborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";

export interface IMessageInput
{
    eventType: number
}

export class MessageInput
    implements ToCbor, ToCborObj, IMessageInput 
{
    toCborObj: () => CborObj;
    toCbor: () => CborString;
    eventType: number;
}