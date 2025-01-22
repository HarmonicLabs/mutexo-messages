import { ToCbor, ToCborObj, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { ErrorCode, isErrorCode, mutexoErrorCodeToErrorMessage } from "../utils/errorCodes";
import { IFilter } from "../clientReqs/filters/Filter";
import { ISatisfiesFilter } from "./utils/ISatisfiesFilter";

const MSG_SUB_FAILURE_EVENT_TYPE = 9;

export interface ISubFailure 
{
    id: number;
    errorCode: number;
}

function isIMessageSubFailure( stuff: any ): stuff is ISubFailure 
{
    return (
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        isErrorCode( stuff.errorCode )
    );
}

export class SubFailure implements ToCbor, ToCborObj, ISubFailure, ISatisfiesFilter
{
    readonly id: number;
    readonly errorCode: ErrorCode;

    get message(): string
    {
        return mutexoErrorCodeToErrorMessage( this.errorCode );
    }

    constructor( stuff: ISubFailure ) 
    {
        if (!( isIMessageSubFailure( stuff ) )) throw new Error( "invalid `MessageSubFailure` data provided" );

        this.id = stuff.id;
        this.errorCode = stuff.errorCode;
    }

    satisfiesFilters( filters: IFilter[] ): boolean { return true; }
    satisfiesFilter( filter: IFilter ): boolean { return true; }

    toCborBytes(): Uint8Array 
    {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString 
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray 
    {
        if (!( isIMessageSubFailure( this ) )) throw new Error( "invalid `MessageSubFailure` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUB_FAILURE_EVENT_TYPE ),
            new CborUInt( this.id ),
            new CborUInt( this.errorCode )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): SubFailure 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return SubFailure.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): SubFailure 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid `MessageSubFailure` data provided" );

        const [
            _,
            cborId,
            cborErrorCode
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number( _.num ) === MSG_SUB_FAILURE_EVENT_TYPE &&
            cborId instanceof CborUInt &&
            cborErrorCode instanceof CborUInt &&
            isErrorCode( Number( cborErrorCode.num ) )
        )) throw new Error( "invalid `MessageSubFailure` data provided" );

        return new SubFailure({
            id: Number( cborId.num ),
            errorCode: Number( cborErrorCode.num )
        });
    }

}
