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
    UnknowUnsubMessage     	= 10,
	UnknownSubFilter		= 11
}
Object.freeze( ErrorCode );

export function isErrorCode( code: any ): code is ErrorCode
{
    return (
        Number.isSafeInteger( code ) &&
        typeof ErrorCode[ code ] === "string"
    );
}

export function messageErrorCodeToString( errorCode: ErrorCode ): string
{
    if( typeof errorCode === "number" )
    return ErrorCode[ errorCode ];

    return String( errorCode );
}

export function mutexoErrorCodeToErrorMessage( code: ErrorCode ): string
{
    switch( code )
    {
        case ErrorCode.NotAuth:             return "Not authenticated";
        case ErrorCode.MissingIP:           return "Missing IP address";
        case ErrorCode.InvalidAuthToken:    return "Invalid auth token";
        case ErrorCode.TooManyRequests:     return "Too many requests; rate limit exceeded";
        case ErrorCode.NotFollowedAddr:     return "Address not followed";
        case ErrorCode.UTxONotFound:        return "UTxO not found";
        case ErrorCode.UnknownEvtAddrSub:   return "unkown event to subscribe by address";
        case ErrorCode.UnknownEvtUTxOSub:   return "unkown event to subscribe by utxoRef";
        case ErrorCode.UnknownEvtAddrUnsub: return "unkown event to un-subscribe by address";
        case ErrorCode.UnknownEvtUTxOUnsub: return "unkown event to un-subscribe by utxoRef";
        case ErrorCode.UnknowUnsubMessage:  return "unsub message sent; but no event specified";
        case ErrorCode.UnknownSubFilter:    return "Unknown filter";

        default:
            // code;
            return "Unknown error";
    }
}

export enum FailureCodes {
    NoUTxOFreed             = 0, 
    NoUTxOMutexoLocked      = 1, 
}

Object.freeze( FailureCodes );

export enum SuccessCodes {
    UTxOFreed           = 0, 
    UTxOMutexoLocked    = 1, 
}

Object.freeze( SuccessCodes );