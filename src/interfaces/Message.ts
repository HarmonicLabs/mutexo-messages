import { MsgData } from "./MsgData";

export interface Message {
    readonly type: number;
    readonly data: MsgData;
}