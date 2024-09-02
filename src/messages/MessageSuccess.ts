import { CanBeCborString, Cbor, CborArray, CborObj, CborString, CborUInt, forceCborString, ToCbor, ToCborObj } from "@harmoniclabs/cbor";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { SuccessTypeCodes } from "../utils/constants";
import { isObject } from "@harmoniclabs/obj-utils";

const MSG_SUCCESS_EVENT_TYPE = 4;

type SuccessData = { 
    successType: number, 
    payload: TxOutRef[] 
}

function isSuccessData( stuff: any ): stuff is SuccessData {
    return (
        isObject(stuff) &&
        typeof SuccessTypeCodes[ stuff.successType ] === "string" &&
        Array.isArray( stuff.payload ) &&
        stuff.payload.every(( thing: any ) => ( thing instanceof TxOutRef ))
    );
}

function successDataToCborObj( stuff: SuccessData ): CborArray {
    return new CborArray([
        new CborUInt(stuff.successType),
        new CborArray( stuff.payload.map(( ref ) => ( ref.toCborObj() )) )
    ]);
}

function successDataFromCborObj( cbor: CborObj ): SuccessData {
    if (!(
        cbor instanceof CborArray &&
        Array.isArray(cbor.array) &&
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
        successType: Number(cborSuccessType.num) as number,
        payload: cborPayload.array.map(( cborUtxo ) => ( TxOutRef.fromCborObj( cborUtxo ) ))
    } as SuccessData;
}

export interface IMessageSuccess {
    successData: SuccessData
}

function isIMessageSuccess( stuff: any ): stuff is IMessageSuccess {
    return (
        isObject( stuff ) &&
        isSuccessData( stuff.successData )
    );
}

export class MessageSuccess
    implements ToCbor, ToCborObj, IMessageSuccess
{
    readonly eventType: number;
    readonly successData: SuccessData;

    constructor(stuff: IMessageSuccess) {
        if (!( isIMessageSuccess( stuff ) )) throw new Error( "invalid `MessageSuccess` data provided" );

        this.successData = stuff.successData;
    }

    toCbor(): CborString {
        return Cbor.encode( this.toCborObj() )
    }

    toCborObj(): CborArray {
        if (!(isIMessageSuccess(this))) throw new Error( "invalid `MessageSuccess` data provided" );

        return new CborArray([
            new CborUInt( MSG_SUCCESS_EVENT_TYPE ),
            successDataToCborObj( this.successData )
        ]);
    }

    toCborBytes(): Uint8Array {
        return this.toCbor().toBuffer();
    }

    static fromCbor( cbor: CanBeCborString ): MessageSuccess {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageSuccess.fromCborObj( Cbor.parse( bytes ) );
    }

    static fromCborObj( cbor: CborObj ): MessageSuccess {
        if (!(
            cbor instanceof CborArray &&
            cbor.array.length >= 2
        )) throw new Error( "invalid cbor for `MessageSuccess`" );

        const [
            cborEventType,
            cborSuccessData
        ] = cbor.array;

        if (!(
            cborEventType instanceof CborUInt &&
            Number( cborEventType.num ) === MSG_SUCCESS_EVENT_TYPE &&
            cborSuccessData instanceof CborArray
        )) throw new Error("invalid cbor for `MessageSuccess`");

        return new MessageSuccess({
            successData: successDataFromCborObj(cborSuccessData) as SuccessData
        });
    }
    
}