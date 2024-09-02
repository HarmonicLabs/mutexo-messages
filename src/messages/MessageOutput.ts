import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { Address, TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_OUTPUT_EVENT_TYPE = 3;

export interface IMessageOutput {
    utxoRef: TxOutRef,
    addr: Address
}

function isIMessageOutput( stuff: any ): stuff is IMessageOutput {
    return (
        isObject(stuff) &&
        stuff.utxoRef instanceof TxOutRef &&
        stuff.addr instanceof Address
    );
}

export class MessageOutput
    implements ToCbor, ToCborObj, IMessageOutput
{
    readonly utxoRef: TxOutRef;
    readonly addr: Address;

    constructor(stuff: IMessageOutput) {
        if (!( isIMessageOutput( stuff ) )) throw new Error( "invalid `MessageOutput` data provided" );

        this.utxoRef = stuff.utxoRef;
        this.addr = stuff.addr;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborArray {
        if (!( isIMessageOutput( this ) )) throw new Error( "invalid `MessageOutput` data provided" );

        return new CborArray([
            new CborUInt( MSG_OUTPUT_EVENT_TYPE ),
            this.utxoRef.toCborObj(),
            this.addr.toCborObj()
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageOutput {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageOutput.fromCborObj(Cbor.parse( bytes ));
    }

    static fromCborObj( cbor: CborObj ): MessageOutput {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageOutput`" );

        const [
            cborEventType,
            cborUTxORef,
            cborAddr
        ] = cbor.array;

        if(!( 
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_OUTPUT_EVENT_TYPE &&
            cborUTxORef instanceof CborArray &&
            cborAddr instanceof CborArray
        )) throw new Error( "invalid cbor for `MessageOutput`" );

        return new MessageOutput({
            utxoRef: TxOutRef.fromCborObj( cborUTxORef ) as TxOutRef,
            addr: Address.fromCborObj( cborAddr ) as Address
        });
    }
    
}