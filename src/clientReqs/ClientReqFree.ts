import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { CanBeTxOutRef, forceTxOutRef, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const CLIENT_REQ_FREE_TYPE = 0;

export interface IClientReqFree {
    id: number;
    utxoRefs: CanBeTxOutRef[];
}

function isIClientReqFree( stuff: any ): stuff is IClientReqFree
{
    return(
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        Array.isArray( stuff.utxoRefs )
    );
}

export class ClientReqFree implements ToCbor, ToCborObj, IClientReqFree
{
    readonly id: number;
    readonly utxoRefs: TxOutRef[];

    constructor( stuff: IClientReqFree )
    {
        if(!( isIClientReqFree( stuff ) )) throw new Error( "invalid `ClientReqFree` data provided" );
                
        this.id = stuff.id;
        this.utxoRefs = stuff.utxoRefs.map(( ref ) => (
            ref instanceof TxOutRef ? ref : forceTxOutRef( ref )
        ));
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj {
        if(!( isIClientReqFree( this ) )) throw new Error( "invalid `ClientReqFree` data provided" );

        return new CborArray([
            new CborUInt( CLIENT_REQ_FREE_TYPE ),
            new CborUInt( this.id ),
            new CborArray(this.utxoRefs.map(( ref ) => ( ref.toCborObj() )))
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): ClientReqFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return ClientReqFree.fromCborObj( Cbor.parse(bytes) );
    }
    static fromCborObj( cbor: CborObj ): ClientReqFree {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error("invalid cbor for `ClientReqFree`");

        const [ 
            _, 
            cborId, 
            cborUtxoRefs 
        ] = cbor.array;

        if (!(
            _ instanceof CborUInt &&
            Number( _.num ) === CLIENT_REQ_FREE_TYPE &&
            cborId instanceof CborUInt &&
            cborUtxoRefs instanceof CborArray
        )) throw new Error("invalid cbor for `ClientReqFree`");

        return new ClientReqFree({ 
            id: Number( cborId.num ) as number,
            utxoRefs: cborUtxoRefs.array.map(TxOutRef.fromCborObj) as TxOutRef[] 
        });
    }

}