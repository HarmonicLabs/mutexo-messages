export function isByte( stuff: any ): boolean {
    if( typeof stuff === "bigint" ) {
        return( stuff >= 0 && stuff <= 255 );
    }
    
    return( Number.isSafeInteger( stuff ) && ( stuff >= 0 && stuff <= 255 ) );
}

export function areBytes( stuff: Uint8Array ) {
    return( stuff instanceof Uint8Array );
}