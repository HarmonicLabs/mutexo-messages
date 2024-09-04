import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { CanBeTxOutRef, forceTxOutRef, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const CLIENT_REQ_LOCK_TYPE = 1;

export interface IClientReqLock {
    id: number;
    utxoRefs: CanBeTxOutRef[];
    required?: number;
}

function isIClientReqLock( stuff: any ): stuff is IClientReqLock
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        Array.isArray( stuff.utxoRefs )
    );
}

export class ClientReqLock implements ToCbor, ToCborObj, IClientReqLock
{
    readonly id: number;
    readonly utxoRefs: TxOutRef[];
    readonly required: number;

    constructor( stuff: IClientReqLock )
    {
        if(!( isIClientReqLock( stuff ) )) throw new Error( "invalid `ClientReqLock` data provided" );

        this.id = stuff.id;
        this.utxoRefs = stuff.utxoRefs.map(( ref ) => (
            ref instanceof TxOutRef ? ref : forceTxOutRef( ref )
        ));
        this.required = (
            typeof stuff.required === "number" &&
            Number.isSafeInteger( stuff.required ) &&
            stuff.required >= 1
        ) ? stuff.required : 1;
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj {
        if(!( isIClientReqLock( this ) )) throw new Error( "invalid `ClientReqLock` data provided" );

        return new CborArray([
            new CborUInt( CLIENT_REQ_LOCK_TYPE ),
            new CborUInt( this.id ),
            new CborArray( this.utxoRefs.map(( ref ) => ( ref.toCborObj() ))),
            this.required === 1 ? undefined : new CborUInt( this.required )
        ].filter(( x ) => ( x !== undefined )));
    }

    static fromCbor( cbor: CanBeCborString ): ClientReqLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ClientReqLock.fromCborObj( Cbor.parse( bytes ) );
    }
    static fromCborObj( cbor: CborObj ): ClientReqLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error("Invalid cbor for ClientReqLock");

        let required = undefined;

        if (!(
            cbor.array[0] instanceof CborUInt &&
            Number( cbor.array[0].num ) === CLIENT_REQ_LOCK_TYPE &&
            cbor.array[1] instanceof CborUInt &&
            cbor.array[2] instanceof CborArray
        )) throw new Error( "invalid cbor for `ClientReqLock`" );

        if( cbor.array.length >= 4 )
        {
            if(!( cbor.array[3] instanceof CborUInt )) throw new Error( "invalid cbor for `ClientReqLock`" );

            required = Number(cbor.array[3].num);
        }

        return new ClientReqLock({ 
            id: Number( cbor.array[1].num ) as number,
            utxoRefs: cbor.array[2].array.map( TxOutRef.fromCborObj ) as TxOutRef[], 
            required 
        });
    }

}