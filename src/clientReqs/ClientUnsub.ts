import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Filter, filterFromCborObj, forceFilter, IFilter } from "./filters/Filter";
import { isObject } from "@harmoniclabs/obj-utils";

const CLIENT_UNSUB_TYPE = 3;
export interface IClientUnsub {
    id: number;
    eventType: number;
    filters: IFilter[];
}

function isIClientUnsub( stuff: any ): stuff is IClientUnsub
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        typeof stuff.eventType === "number" &&
        Array.isArray( stuff.filters )
    );
}

export class ClientUnsub implements ToCbor, ToCborObj, IClientUnsub 
{
    readonly id: number;
    readonly eventType: number;
    readonly filters: Filter[];

    constructor( stuff: IClientUnsub ) {
        if(!( isIClientUnsub( stuff ) )) throw new Error( "invalid `ClientUnsub` data provided" );

        this.id = stuff.id;
        this.eventType = stuff.eventType;
        this.filters = stuff.filters.map( forceFilter );
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj {
        if(!( isIClientUnsub( this ) )) throw new Error( "invalid `ClientUnsub` data provided" );

        return new CborArray([
            new CborUInt( CLIENT_UNSUB_TYPE ),
            new CborUInt( this.id ),
            new CborUInt( this.eventType ),
            new CborArray( this.filters.map(( filter ) => ( filter.toCborObj() )) )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ClientUnsub {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ClientUnsub.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ClientUnsub {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4
        )) throw new Error( "invalid cbor for `ClientUnsub`" );
        
        const [ 
            _, 
            cborId, 
            cborEventType, 
            cborFilters 
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number( _.num ) === CLIENT_UNSUB_TYPE &&
            cborId instanceof CborUInt &&
            cborEventType instanceof CborUInt &&
            cborFilters instanceof CborArray
        )) throw new Error( "invalid cbor for `ClientUnsub`" );

        return new ClientUnsub({ 
            id: Number( cborId.num ),
            eventType: Number( cborEventType.num ), 
            filters: cborFilters.array.map( filterFromCborObj )
        });
    }

}