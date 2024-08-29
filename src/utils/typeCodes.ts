export enum MutexoServerEventsCodes {
    Free,
    Lock,
    Input,
    Output,
    Success,
    Failure,
    Close,
    Error
}

export function isMutexoServerEventsCodes( type: string ): boolean {
    return type in MutexoServerEventsCodes;
}