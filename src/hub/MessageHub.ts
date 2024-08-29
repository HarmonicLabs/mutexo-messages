import { maxBufferSize, maxCode, minCode } from '../utils/constants';
import { CanBeCborString, Cbor, CborArray, CborBytes, CborObj, CborString, forceCborString } from '@harmoniclabs/cbor';
import { areBytes, isByte } from '../utils/isThatType';
import { roDescr } from '../utils/roDescr';
import { getCborBytesDescriptor } from '../utils/getCborBytesDescriptor';

export class MessageHub {
    readonly bufferSize: number;
    private buffer: CborObj[];

    readonly cborBytes?: Uint8Array;

    constructor( size?: number ) {
        Object.defineProperties(
            this, {
                maxSize: ( typeof size === "number" )? 
                    { value: size, ...roDescr } : 
                    { value: maxBufferSize, ...roDescr },
                bufferSize: { value: [], ...roDescr },
                cborBytes: getCborBytesDescriptor()
            }
        );
    }

    // message must have stuff = [ type, [ content, addr ] ] structure (?????)
    isValidMessage( stuff: any ): boolean {
        return(
            Array.isArray( stuff ) && 
            stuff.length === 2 &&
            isByte( stuff[0] ) &&
            ( 
                stuff[0] >= minCode && 
                stuff[0] <= maxCode 
            ) &&
            Array.isArray( stuff[1] ) &&
            stuff[1].length === 2 &&
            areBytes( stuff[1][0] ) &&
            areBytes( stuff[1][1] )
        );
    }

    private addToMsgBuffer( message: CborObj ): void {
        if( this.buffer.length < this.bufferSize ) {
            this.buffer.push( message );
        } else {
            this.buffer.shift();
            this.buffer.push( message );
        }
    }

    toCbor(): CborString
    {
        return new CborString( this.toCborBytes() );
    }

    toCborObj( message: any ): CborArray {
        if( this.isValidMessage( message ) ) {
            var newMessage = new CborArray([
                new CborBytes( message[0] ),
                new CborArray([
                    new CborBytes( message[1][0] ),
                    new CborBytes( message[1][1] )
                ])
            ]);

            this.addToMsgBuffer( newMessage );

            return newMessage;
        } else {
            return new CborArray([]);
        }
    }

    toCborBytes(): Uint8Array
    {
        if(!( this.cborBytes instanceof Uint8Array ))
        {
            // @ts-ignore Cannot assign to 'cborBytes' because it is a read-only property.
            this.cborBytes = Cbor.encode( this.toCborObj() ).toBuffer();
        }

        return Uint8Array.prototype.slice.call( this.cborBytes );
    }

    static fromCbor( cbor: CanBeCborString ): Array<any>
    {
        const bytes = cbor instanceof Uint8Array ? cbor : forceCborString( cbor ).toBuffer();
        return MessageHub.fromCborObj( Cbor.parse( bytes ), bytes );
    }

    static fromCborObj( cbor: CborObj, _originalBytes?: Uint8Array ): Array<any> {
        if(!(
            cbor instanceof CborArray &&
            cbor.array.length === 2
        )) throw new Error("invalid message cbor");
    
        const [
            cborTypeCode,
            cborData
        ] = cbor.array;
    
        if(!(
            cborTypeCode instanceof CborBytes &&
            cborData instanceof CborArray
        )) throw new Error("invalid message cbor");

        const [
            cborContent,
            cborAddr
        ] = cborData.array;

        if(!(
            cborContent instanceof CborBytes &&
            cborAddr instanceof CborBytes
        )) throw new Error("invalid message cbor");
        
        return [
            cborTypeCode.bytes as Uint8Array,
            [ 
                cborContent.bytes as Uint8Array, 
                cborAddr.bytes as Uint8Array
            ]
        ];
    }
}