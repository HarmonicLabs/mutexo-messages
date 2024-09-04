export const hexChars = Object.freeze( Array.from( "0123456789abcdef" ) );

export enum MutexoEventIndex {
    Free                    = 0, 
    Lock                    = 1, 
    Input                   = 2, 
    Output                  = 3, 
    Success                 = 4, 
    Failure                 = 5, 
    Close                   = 6,     
    Error                   = 7
}

Object.freeze( MutexoEventIndex );

export enum ErrorCode {
    NotAuth                 = 0, 
    MissingIP               = 1, 
    InvalidAuthToken        = 2, 
    TooManyRequests         = 3, 
    NotFollowedAddr         = 4, 
    UTxONotFound            = 5, 
    UnknownEvtAddrSub       = 6,     
    UnknownEvtUTxOSub       = 7,     
    UnknownEvtAddrUnsub     = 8,     
    UnknownEvtUTxOUnsub     = 9,     
    UnsubMessage            = 10
}

Object.freeze( ErrorCode );

export enum FailureCodes {
    NoUTxOFreed             = 0, 
    NoUTxOLocked            = 1, 
}

Object.freeze( FailureCodes );

export enum SuccessCodes {
    UTxOFreed             = 0, 
    UTxOLocked            = 1, 
}

Object.freeze( SuccessCodes );