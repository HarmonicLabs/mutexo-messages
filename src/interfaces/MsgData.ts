import { Address } from "@harmoniclabs/cardano-ledger-ts";

export interface MsgData {
    readonly content: string;
    readonly addr: Address;
}