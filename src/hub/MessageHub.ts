import { maxBufferSize, maxCode, minCode } from '../utils/constants';
import { CborArray, CborBytes, CborObj } from '@harmoniclabs/cbor';
import { isByte } from '../utils/isThatType';
import { roDescr } from '../utils/roDescr';

export class MessageHub {
    readonly bufferSize: number;
    private buffer: CborObj[];

    constructor( size?: number ) {
        Object.defineProperties(
            this, {
                maxSize: ( typeof size === "number" )? 
                    { value: size, ...roDescr } : 
                    { value: maxBufferSize, ...roDescr },
                bufferSize: { value: [], ...roDescr }   
            }
        );
    }

    // message must have stuff = [ type, [ content, addr ] ] structure (?????)
    isValidMessage( stuff: any ): boolean {
        return(
            Array.isArray( stuff ) && 
            stuff.length === 2 &&
            isByte( stuff[0] ) &&
            ( stuff[0] >= minCode && stuff[0] <= maxCode ) &&
            Array.isArray( stuff[1] ) &&
            stuff[1].length === 2 &&
            isByte( stuff[1][0] ) &&
            isByte( stuff[1][1] )
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

    toCbor( message: any ): CborObj {
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

    fromCbor( cbor: CborObj ): Array<any> {
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
        ] = cbor.array;

        if(!(
            cborContent instanceof CborBytes &&
            cborAddr instanceof CborBytes
        )) throw new Error("invalid message cbor");
        
        return [
            cborTypeCode.bytes,
            [ 
                cborContent.bytes, 
                cborAddr.bytes 
            ]
        ];
    }
}