import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_LOCK_EVENT_TYPE = 1;

export interface IMessageLock {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageLock( stuff: any ): stuff is IMessageLock {
    return (
        isObject( stuff ) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MessageLock
    implements ToCbor, ToCborObj, IMessageLock
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor(stuff: IMessageLock) {
        if (!( isIMessageLock(stuff) )) throw new Error( "invalid `MessageLock` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if (!( isIMessageLock( this ) )) throw new Error( "invalid `MessageLock` data provided" );

        return new CborArray([
            new CborUInt( MSG_LOCK_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageLock {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageLock.fromCborObj( Cbor.parse(bytes) );
    }

    static fromCborObj( cbor: CborObj ): MessageLock {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageLock`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_LOCK_EVENT_TYPE &&
            cborUTxORef instanceof CborArray &&
            cborAddr instanceof CborArray
        )) throw new Error( "invalid cbor for `MessageLock`" );

        return new MessageLock({
            utxoRef: TxOutRef.fromCborObj(cborUTxORef) as TxOutRef,
            addr: Address.fromCborObj(cborAddr) as Address
        });
    }
}