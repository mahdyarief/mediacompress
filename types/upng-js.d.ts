declare module "upng-js" {
  interface DecodedPNG {
    width: number;
    height: number;
    data: Uint8Array;
    depth: number;
    ctype: number;
    frames: Array<{
      rect: { x: number; y: number; width: number; height: number };
      delay: number;
      dispose: number;
      blend: number;
    }>;
  }

  const UPNG: {
    encode(
      imgs: Uint8Array[],
      w: number,
      h: number,
      cnum?: number,
      dels?: number[] | number,
      quality?: number
    ): ArrayBuffer;
    decode(buffer: ArrayBuffer): DecodedPNG | null;
    toRGBA8(out: DecodedPNG): Uint8Array[];
  };

  export default UPNG;
}
