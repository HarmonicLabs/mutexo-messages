import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { isObject } from "@harmoniclabs/obj-utils";
import { SuccessCodes } from "../utils/constants";

const MSG_SUCCESS_EVENT_TYPE = 4;

type SuccessData = { 
    successType: number, 
    utxoRefs: TxOutRef[] 
}

function isSuccessData( stuff: any ): stuff is SuccessData {
    return (
        isObject(stuff) &&
        typeof SuccessCodes[ stuff.successType ] === "string" &&
        Array.isArray( stuff.utxoRefs ) &&
        stuff.utxoRefs.every(( thing: any ) => ( thing instanceof TxOutRef ))
    );
}

function successDataToCborObj( stuff: SuccessData ): CborArray {
    return new CborArray([
        new CborUInt(stuff.successType),
        new CborArray( stuff.utxoRefs.map(( ref ) => ( ref.toCborObj() )) )
    ]);
}

function successDataFromCborObj( cbor: CborObj ): SuccessData {
    if (!(
        cbor instanceof CborArray &&
        // Array.isArray(cbor.array) &&
        cbor.array.length >= 2
    )) throw new Error( "invalid `SuccessData` data provided" );

    const [
        cborSuccessType,
        cborPayload
    ] = cbor.array;

    if (!(
        cborSuccessType instanceof CborUInt &&
        cborPayload instanceof CborArray
    )) throw new Error("invalid cbor for `SuccessData`");

    return {
        successType: Number(cborSuccessType.num),
        utxoRefs: cborPayload.array.map(( cborUtxo ) => ( TxOutRef.fromCborObj( cborUtxo ) ))
    };
}

export interface IMutexSuccess {
    id: number,
    successData: SuccessData
}

function isIMessageMutexSuccess( stuff: any ): stuff is IMutexSuccess {
    return (
        isObject( stuff ) &&
        typeof stuff.id === "number" &&
        isSuccessData( stuff.successData )
    );
}

export class MutexSuccess
    implements ToCbor, ToCborObj, IMutexSuccess
{
    readonly id: number;
    readonly successData: SuccessData;

    constructor(stuff: IMutexSuccess) {
        if (!( isIMessageMutexSuccess( stuff ) )) throw new Error( "invalid `MessageMutexSuccess` data provided" );

        this.id = stuff.id;
        this.successData = stuff.successData;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() )
    }

    toCborObj(): CborArray {
        if (!(isIMessageMutexSuccess(this))) throw new Error( "invalid `MessageMutexSuccess` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUCCESS_EVENT_TYPE ),
            new CborUInt( this.id ),
            successDataToCborObj( this.successData )
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MutexSuccess {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MutexSuccess.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MutexSuccess {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 3
        )) throw new Error( "invalid cbor for `MessageMutexSuccess`" );

        const [
            cborEventType,
            cborId,
            cborSuccessData
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_SUCCESS_EVENT_TYPE &&
            cborId instanceof CborUInt
        )) throw new Error("invalid cbor for `MessageMutexSuccess`");

        return new MutexSuccess({
            id: Number( cborId.num ),
            successData: successDataFromCborObj(cborSuccessData)
        });
    }
    
}