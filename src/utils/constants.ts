export const hexChars = Object.freeze( Array.from( "0123456789abcdef" ) );

export enum MessageTypeCodes {
    Free                    = 0, 
    Lock                    = 1, 
    Input                   = 2, 
    Output                  = 3, 
    Success                 = 4, 
    Failure                 = 5, 
    Close                   = 6,     
    Error                   = 7
}

Object.freeze( MessageTypeCodes );

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

export enum FailureTypeCodes {
    NoUTxOFreed             = 0, 
    NoUTxOLocked            = 1, 
}

Object.freeze( FailureTypeCodes );