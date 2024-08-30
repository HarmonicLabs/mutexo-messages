export type U8Arr<Length extends number> = Uint8Array & { length: Length };
export type Hash32 = U8Arr<32>;

export type Code = number;
export type HashIndex = number;

export type UTxORef = { hash: Hash32, index: HashIndex };
