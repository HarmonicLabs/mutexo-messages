import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Filter, filterFromCborObj, forceFilter, IFilter } from "./filters/Filter";
import { isObject } from "@harmoniclabs/obj-utils";
import { isMutexoChainEventIndex, MutexoChainEventIndex } from "../events";

const CLIENT_SUB_TYPE = 2;

export interface IClientSub {
    id: number;
    chainEventIndex: MutexoChainEventIndex;
    filters: IFilter[];
}

function isIClientSub( stuff: any ): stuff is IClientSub
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        isMutexoChainEventIndex( stuff.chainEventIndex ) &&
        Array.isArray( stuff.filters )
    );
}

export class ClientSub implements ToCbor, ToCborObj, IClientSub 
{
    readonly id: number;
    readonly chainEventIndex: MutexoChainEventIndex;
    readonly filters: Filter[];

    constructor( stuff: IClientSub ) {
        if(!( isIClientSub( stuff ) )) throw new Error( "invalid `ClientSub` data provided" );

        this.id = stuff.id;
        this.chainEventIndex = stuff.chainEventIndex;
        this.filters = stuff.filters.map( forceFilter ); 
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj {
        if(!( isIClientSub( this ) )) throw new Error( "invalid `ClientSub` data provided" );

        return new CborArray([
            new CborUInt( CLIENT_SUB_TYPE ),
            new CborUInt( this.id ),
            new CborUInt( this.chainEventIndex ),
            new CborArray( this.filters.map(( filter ) => ( filter.toCborObj() )) )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ClientSub {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ClientSub.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ClientSub {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4 
        )) throw new Error( "invalid cbor for `ClientSub`" );

        const [ 
            _,
            cborId,
            cborEventType, 
            cborFilters
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number( _.num ) === CLIENT_SUB_TYPE &&
            cborId instanceof CborUInt &&
            cborEventType instanceof CborUInt &&
            cborFilters instanceof CborArray
        )) throw new Error( "invalid cbor for `ClientSub`" );
        
        return new ClientSub({ 
            id: Number( cborId.num ),
            chainEventIndex: Number( cborEventType.num ), 
            filters: cborFilters.array.map( filterFromCborObj )
        });
    }
}