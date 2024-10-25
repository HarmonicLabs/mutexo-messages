import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_FREE_EVENT_TYPE = 0;

export interface IMessageFree {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageFree( stuff: any ): stuff is IMessageFree {
    return (
        isObject( stuff ) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MessageFree
    implements ToCbor, ToCborObj, IMessageFree
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor( stuff: IMessageFree ) {
        if(!( isIMessageFree( stuff ) )) throw new Error( "invalid `MessageFree` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if(!( isIMessageFree( this ) )) throw new Error( "invalid `MessageFree` data provided" );

        return new CborArray([
            new CborUInt( MSG_FREE_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageFree {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageFree.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageFree {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error("invalid cbor for `MessageFree`");

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_FREE_EVENT_TYPE
        )) throw new Error( "invalid cbor for `MessageFree`" );

        return new MessageFree({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ),
            addr: Address.fromCborObj( cborAddr )
        });
    }

}