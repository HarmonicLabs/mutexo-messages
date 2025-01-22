import { isMutexoChainEventName, MutexoChainEventListeners } from "./MutexoChainEventListeners";
import { MutexoEventListener } from "./MutexoEventListener";

/** events triggered by the server (following the chain) AND events related to client-server comunicaiton */
export interface MutexoEventListeners extends MutexoChainEventListeners {
    mutexSuccess:   MutexoEventListener[],
    mutexFailure:   MutexoEventListener[],
    close:          MutexoEventListener[],
    error:          MutexoEventListener[],
    subSuccess:     MutexoEventListener[],
    subFailure:     MutexoEventListener[]
};

export type MutexoEventName = keyof MutexoEventListeners;

export function isMutexoEventName( stuff: any ): stuff is MutexoEventName
{
    return(
        isMutexoChainEventName( stuff ) ||
        stuff === "mutexSuccess" ||
        stuff === "mutexFailure" ||
        stuff === "close"        ||
        stuff === "error"        ||
        stuff === "subSuccess"   ||
        stuff === "subFailure"
    );
}