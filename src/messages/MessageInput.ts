import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_INPUT_EVENT_TYPE = 2;

export interface IMessageInput {
    utxoRef: TxOutRef,
    addr: Address,
    txHash: Uint8Array
}

function isIMessageInput(stuff: any): stuff is IMessageInput {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address &&
        stuff.txHash instanceof Uint8Array && stuff.txHash.length === 32
    );
}

export class MessageInput
    implements ToCbor, ToCborObj, IMessageInput
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;
    readonly txHash: Uint8Array;

    constructor(stuff: IMessageInput) {
        if (!( isIMessageInput(stuff) )) throw new Error( "invalid `MessageInput` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
        this.txHash = stuff.txHash;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if (!( isIMessageInput( this ) )) throw new Error( "invalid `MessageInput` data provided" );

        return new CborArray([
            new CborUInt( MSG_INPUT_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj(),
            new CborBytes( this.txHash )
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageInput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageInput.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageInput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 4
        )) throw new Error( "invalid cbor for `MessageInput`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr,
            cborTxHash
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_INPUT_EVENT_TYPE &&
            cborUTxORef instanceof CborArray &&
            cborAddr instanceof CborArray &&
            ( 
                cborTxHash instanceof CborBytes && 
                cborTxHash.bytes.length === 32
            )
        )) {
            throw new Error( "invalid cbor for `MessageInput`" );
        }

        return new MessageInput({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ) as TxOutRef,
            addr: Address.fromCborObj( cborAddr ) as Address,
            txHash: cborTxHash.bytes as Uint8Array
        });
    }

}