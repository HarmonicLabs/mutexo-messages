import { ToCbor, ToCborObj, CborString, Cbor, CborArray, CborUInt, CanBeCborString, forceCborString, CborObj } from "@harmoniclabs/cbor";
import { isObject } from "@harmoniclabs/obj-utils";
import { Filter } from "../clientReqs/filters/Filter";

const MSG_SUB_SUCCESS_EVENT_TYPE = 8;

export interface ISubSuccess 
{
    id: number;
}

function isIMessageSubSuccess( stuff: any ): stuff is ISubSuccess 
{
    return (
        isObject( stuff ) &&
        typeof stuff.id === "number"
    );
}

export class SubSuccess implements ToCbor, ToCborObj, ISubSuccess 
{
    readonly id: number;

    constructor( stuff: ISubSuccess ) 
    {
        if (!( isIMessageSubSuccess( stuff ) )) throw new Error( "invalid `MessageSubSuccess` data provided" );

        this.id = stuff.id;
    }

    satisfiesFilters( filters: Filter[] ): boolean { return true; }
    satisfiesFilter( filter: Filter ): boolean { return true; }

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
        if (!( isIMessageSubSuccess( this ) )) throw new Error( "invalid `MessageSubSuccess` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUB_SUCCESS_EVENT_TYPE ),
            new CborUInt( this.id )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): SubSuccess 
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return SubSuccess.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): SubSuccess 
    {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for `MessageSubSuccess`" );

        const [
            _,
            cborId
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number(_.num) === MSG_SUB_SUCCESS_EVENT_TYPE &&
            cborId instanceof CborUInt
        )) throw new Error( "invalid cbor for `MessageSubSuccess`" );

        return new SubSuccess({
            id: Number( cborId.num )
        });
    }

}
