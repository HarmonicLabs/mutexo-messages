import { Close } from "../messages/MessageClose";
import { MutexoError } from "../messages/MessageError";
import { MutexoFree } from "../messages/MessageFree";
import { MutexoInput } from "../messages/MessageInput";
import { MutexoLock } from "../messages/MessageLock";
import { MutexFailure } from "../messages/MessageMutexFailure";
import { MutexSuccess } from "../messages/MessageMutexSuccess";
import { MutexoOutput } from "../messages/MessageOutput";
import { SubFailure } from "../messages/MessageSubFailure";
import { SubSuccess } from "../messages/MessageSubSuccess";
import { MutexoEventName } from "./MutexoEventListeners";

export type DataOf<EventName extends MutexoEventName> =
    EventName extends "free"          ? MutexoFree      :
    EventName extends "lock"          ? MutexoLock      :
    EventName extends "input"         ? MutexoInput     :
    EventName extends "output"        ? MutexoOutput    :
    EventName extends "mutexSuccess"  ? MutexSuccess    :
    EventName extends "mutexFailure"  ? MutexFailure    :
    EventName extends "close"         ? Close           :
    EventName extends "error"         ? MutexoError     :
    EventName extends "subSuccess"    ? SubSuccess      :
    EventName extends "subFailure"    ? SubFailure      :
    never;