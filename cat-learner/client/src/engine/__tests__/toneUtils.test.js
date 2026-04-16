import { describe, test, expect } from 'vitest';
import { strippedOfTone, isToneKey, TELEX_TONE_CHARS, VNI_TONE_CHARS } from '../toneUtils.js';

describe('strippedOfTone', () => {
  test('ờ (ơ + grave) → ơ', () => {
    expect(strippedOfTone('ờ')).toBe('ơ');
  });

  test('ấ (â + acute) → â', () => {
    expect(strippedOfTone('ấ')).toBe('â');
  });

  test('ừ (ư + grave) → ư', () => {
    expect(strippedOfTone('ừ')).toBe('ư');
  });

  test('plain ơ (no tone) stays ơ', () => {
    expect(strippedOfTone('ơ')).toBe('ơ');
  });

  test('plain a stays a', () => {
    expect(strippedOfTone('a')).toBe('a');
  });

  test('à (a + grave) → a', () => {
    expect(strippedOfTone('à')).toBe('a');
  });
});

describe('isToneKey', () => {
  test('Telex: f is a tone key', () => {
    expect(isToneKey('f', 'telex')).toBe(true);
  });

  test('Telex: s is a tone key', () => {
    expect(isToneKey('s', 'telex')).toBe(true);
  });

  test('Telex: r x j are tone keys', () => {
    expect(isToneKey('r', 'telex')).toBe(true);
    expect(isToneKey('x', 'telex')).toBe(true);
    expect(isToneKey('j', 'telex')).toBe(true);
  });

  test('Telex: n is NOT a tone key', () => {
    expect(isToneKey('n', 'telex')).toBe(false);
  });

  test('Telex: uppercase F is a tone key (case-insensitive)', () => {
    expect(isToneKey('F', 'telex')).toBe(true);
  });

  test('VNI: 1-5 are tone keys', () => {
    ['1','2','3','4','5'].forEach(k => expect(isToneKey(k, 'vni')).toBe(true));
  });

  test('VNI: 6-9 are NOT tone keys', () => {
    ['6','7','8','9'].forEach(k => expect(isToneKey(k, 'vni')).toBe(false));
  });

  test('direct mode: no tone keys', () => {
    expect(isToneKey('f', 'direct')).toBe(false);
    expect(isToneKey('1', 'direct')).toBe(false);
  });
});

describe('TELEX_TONE_CHARS / VNI_TONE_CHARS', () => {
  test('TELEX_TONE_CHARS.f is U+0300 (grave)', () => {
    expect(TELEX_TONE_CHARS['f']).toBe('\u0300');
  });

  test('VNI_TONE_CHARS["2"] is U+0300 (grave)', () => {
    expect(VNI_TONE_CHARS['2']).toBe('\u0300');
  });
});
