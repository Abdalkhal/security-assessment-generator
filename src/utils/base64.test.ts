import { base64ToBytes, bytesToBase64 } from './base64';

describe('bytesToBase64', () => {
  it('matches the classic "Man" -> "TWFu" test vector', () => {
    expect(bytesToBase64(new Uint8Array([77, 97, 110]))).toBe('TWFu');
  });

  it('pads correctly for 1 and 2 trailing bytes', () => {
    expect(bytesToBase64(new Uint8Array([77]))).toBe('TQ==');
    expect(bytesToBase64(new Uint8Array([77, 97]))).toBe('TWE=');
  });

  it('returns an empty string for no bytes', () => {
    expect(bytesToBase64(new Uint8Array([]))).toBe('');
  });
});

describe('base64ToBytes', () => {
  it('matches the classic "TWFu" -> "Man" test vector', () => {
    expect(Array.from(base64ToBytes('TWFu'))).toEqual([77, 97, 110]);
  });

  it('handles padded input', () => {
    expect(Array.from(base64ToBytes('TQ=='))).toEqual([77]);
    expect(Array.from(base64ToBytes('TWE='))).toEqual([77, 97]);
  });
});

describe('bytesToBase64 / base64ToBytes round-trip', () => {
  it('recovers the original bytes for a range of lengths', () => {
    for (const length of [0, 1, 2, 3, 4, 5, 10, 100, 1000]) {
      const original = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        original[i] = (i * 37 + 11) % 256;
      }
      const roundTripped = base64ToBytes(bytesToBase64(original));
      expect(Array.from(roundTripped)).toEqual(Array.from(original));
    }
  });

  it('recovers a JPEG-like byte sequence (starts with the FF D8 FF magic bytes)', () => {
    const original = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const roundTripped = base64ToBytes(bytesToBase64(original));
    expect(Array.from(roundTripped)).toEqual(Array.from(original));
  });
});
