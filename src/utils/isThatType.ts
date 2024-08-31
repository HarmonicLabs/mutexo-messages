import { isObject } from "@harmoniclabs/obj-utils";
import { hexChars } from "./constants";

export function isHex( stuff: string ): boolean 
{
    if(!( typeof stuff === "string" ))  return false;

    return Array.from( stuff.toLowerCase() ).every( ( char ) => hexChars.includes( char ) );
}

export function isBoolean( stuff: any ): boolean 
{
    return( typeof stuff === "boolean" );
}

export function isHash( stuff: any ): boolean 
{
    return( stuff instanceof Uint8Array );
}

export function isHash32( stuff: any ): boolean 
{
    return( 
        isHash( stuff ) &&
        stuff.length === 32
    );
}

function isThatSize( stuff: any, pow: number ): boolean 
{
    if( typeof stuff === "bigint" ) {
        return( 
            stuff >= 0 && 
            stuff < Math.pow( 2, pow ) 
        );
    }
    
    return( 
        Number.isSafeInteger( stuff ) && 
        ( stuff >= 0 && stuff < Math.pow( 2, pow ) ) 
    );
}

export function isByte( stuff: any ): boolean 
{
    return isThatSize( stuff, 8 );
}

export function isWord16( stuff: any ): boolean
{
    return isThatSize( stuff, 16 );
}

export function isWord32( stuff: any ): boolean 
{
    return isThatSize( stuff, 32 );
}

export function isWord64( stuff: any ): boolean 
{
    return isThatSize( stuff, 64 );
}