
export enum MutexOp {
    MutexoFree = 0,
    MutexoLock = 1,
};
Object.freeze(MutexOp);

export function isMutexOp(value: any): value is MutexOp {
    return typeof value === 'number' && typeof MutexOp[value] === "string";
}