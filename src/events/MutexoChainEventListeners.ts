import { MutexoEventListener } from "./MutexoEventListener";

/** only events triggered by the server */
export interface MutexoChainEventListeners {
    free:           MutexoEventListener[],
    lock:           MutexoEventListener[],
    input:          MutexoEventListener[],
    output:         MutexoEventListener[],
}

/** only events triggered by the server */
export type MutexoChainEventName = keyof MutexoChainEventListeners;

export function isMutexoChainEventName( stuff: any ): stuff is MutexoChainEventName
{
    return (
        stuff === "input"  ||
        stuff === "output" ||
        stuff === "free"   ||
        stuff === "lock"
    );
}