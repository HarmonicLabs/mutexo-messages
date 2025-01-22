import { isMutexoEventName, MutexoEventName } from "./MutexoEventListeners";

/** index used in the cbor encoding indicating the event kind */
export enum MutexoEventIndex {
    free = 0,
    lock = 1,
    input = 2,
    output = 3,
    mutexSuccess = 4,
    mutexFailure = 5,
    close = 6,
    error = 7,
    subSuccess = 8,
    subFailure = 9
}
Object.freeze( MutexoEventIndex );

const minEvtIdx = (
    Object.keys( MutexoEventIndex )
    .filter( key => /^\d+$/.test( key ) )
    .map( key => parseInt( key ) )
    .reduce( ( a, b ) => Math.min( a, b ) )
);
const maxEvtIdx = (
    Object.keys( MutexoEventIndex )
    .filter( key => /^\d+$/.test( key ) )
    .map( key => parseInt( key ) )
    .reduce( ( a, b ) => Math.max( a, b ) )
);

export function isMutexoEventIndex( n: any ): n is MutexoEventIndex
{
    return (
        typeof n === "number" &&
        // is u32 (not float)
        n === (n >>> 0) &&
        // is in range
        n >= minEvtIdx &&
        n <= maxEvtIdx
    )
}

export type MutexoChainEventIndex
    = MutexoEventIndex.free
    | MutexoEventIndex.lock
    | MutexoEventIndex.input
    | MutexoEventIndex.output;

export function isMutexoChainEventIndex( n: any ): n is MutexoChainEventIndex
{
    return (
        n === MutexoEventIndex.free ||
        n === MutexoEventIndex.lock ||
        n === MutexoEventIndex.input ||
        n === MutexoEventIndex.output
    );
}

export function mutexoEventNameToIndex( evtName: MutexoEventName ): MutexoEventIndex
{
    if( !isMutexoEventName( evtName ) ) throw new Error( "invalid event name" );

    const idx = MutexoEventIndex[evtName];
    if( typeof idx !== "number" ) throw new Error( "invalid event name" );

    return idx;
}

export function mutexoEventIndexToName( idx: MutexoEventIndex | number ): MutexoEventName
{
    if( !isMutexoEventIndex( idx ) ) throw new Error( "invalid event index" );

    const name = MutexoEventIndex[ idx ] as MutexoEventName;
    if( typeof name !== "string" ) throw new Error( "invalid event index" );

    return name;
}