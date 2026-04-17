/**
 * TypingEngine.js
 *
 * How character matching works
 * ─────────────────────────────
 * Vietnamese is written with precomposed Unicode (NFC). A character like "ấ"
 * is a single grapheme cluster composed of: base 'a' + circumflex (U+0302) +
 * acute (U+0301), but in NFC it is stored as the single codepoint U+1EA5.
 *
 * In Telex mode the user types 'a', 'a' (→ 'â'), 's' (applies sắc) producing
 * 'ấ'. We reconstruct this by:
 *   1. Tracking the base vowel/consonant in #buffer.base
 *   2. Applying the vowel modifier (circumflex, breve, horn) to #buffer.vowelMod
 *   3. Applying the tone diacritic to #buffer.tone
 *   4. Joining base + vowelMod → apply NFC → apply tone → NFC again.
 *
 * compare() normalises both sides to NFC and lowercases before comparing,
 * so decomposed and precomposed forms always match correctly, and Caps Lock
 * doesn't punish kids.
 *
 * In 'direct' mode (system IME handles composition) every key is emitted
 * immediately as status:'ready' — no buffering needed.
 */

import { TELEX_TONE_CHARS as TELEX_TONE, VNI_TONE_CHARS as VNI_TONE } from './toneUtils.js';

// Telex: modifier key → combining diacritic (Unicode combining character)
const TELEX_VOWEL = {
  aa: '\u0302', // circumflex  â
  aw: '\u0306', // breve       ă
  ee: '\u0302', // circumflex  ê
  oo: '\u0302', // circumflex  ô
  ow: '\u031B', // horn        ơ
  uw: '\u031B', // horn        ư
  dd: null,     // special-cased: just replaces 'd' with 'đ'
};

// VNI: digit modifier → combining diacritic
const VNI_VOWEL = {
  a6: '\u0302', a8: '\u0306',
  e6: '\u0302',
  o6: '\u0302', o7: '\u031B',
  u7: '\u031B',
  d9: null, // 'đ' replacement
};

const TELEX_VOWEL_BASES = new Set(['a','e','o','u','d']);
const VNI_VOWEL_DIGITS  = new Set(['6','7','8','9']);
const VNI_TONE_DIGITS   = new Set(['1','2','3','4','5']);

export class TypingEngine {
  #mode;
  #buf = { base: '', vowelMod: '', tone: '' };

  constructor(mode = 'telex') {
    this.#mode = mode;
  }

  setMode(mode) {
    this.#mode = mode;
    this.#clearBuf();
  }

  reset() { this.#clearBuf(); }

  /**
   * Process one raw keystroke.
   * @param {string} key — single character from keydown/input event
   * @returns {{ display: string, status: 'pending'|'ready' }}
   */
  processKey(key) {
    if (this.#mode === 'direct') {
      return { display: key.normalize('NFC'), status: 'ready' };
    }
    return this.#mode === 'vni'
      ? this.#processVNI(key)
      : this.#processTelex(key);
  }

  /**
   * NFC-normalised, case-insensitive equality.
   * 'ề' decomposed === 'ề' precomposed; 'A' matches 'a'.
   * Case-insensitive so Caps Lock doesn't punish kids.
   */
  compare(composed, target) {
    return composed.normalize('NFC').toLowerCase() === target.normalize('NFC').toLowerCase();
  }

  // ── Telex ──────────────────────────────────────────────────────────────

  #processTelex(key) {
    const k = key.toLowerCase();

    // 'dd' special case → đ
    if (k === 'd' && this.#buf.base === 'd' && !this.#buf.vowelMod) {
      this.#buf.base = 'đ';
      return { display: 'đ', status: 'ready' };
    }

    // Vowel modifier on known base (aa, aw, ee, oo, ow, uw)
    // Returns 'pending' — a tone mark (s/f/r/x/j) can still follow.
    if (this.#buf.base && !this.#buf.vowelMod) {
      const pair = this.#buf.base + k;
      if (pair in TELEX_VOWEL) {
        const mod = TELEX_VOWEL[pair];
        if (mod === null) {
          // shouldn't happen here (dd handled above)
          this.#buf.base = 'đ';
          return { display: 'đ', status: 'ready' };
        }
        this.#buf.vowelMod = mod;
        const display = this.#compose();
        return { display, status: 'pending' };
      }
    }

    // Tone modifier on existing base
    if (this.#buf.base && k in TELEX_TONE) {
      this.#buf.tone = TELEX_TONE[k];
      const display = this.#compose();
      return { display, status: 'ready' };
    }

    // New base character — start fresh
    this.#clearBuf();
    this.#buf.base = k;

    // If this key can NEVER be extended (not a telex base), mark ready now
    const couldExtend = TELEX_VOWEL_BASES.has(k);
    return {
      display: k.normalize('NFC'),
      status: couldExtend ? 'pending' : 'ready',
    };
  }

  // ── VNI ────────────────────────────────────────────────────────────────

  #processVNI(key) {
    const k = key.toLowerCase();

    // 'd9' → đ
    if (k === '9' && this.#buf.base === 'd') {
      this.#buf.base = 'đ';
      return { display: 'đ', status: 'ready' };
    }

    // Vowel digit modifier (6,7,8,9)
    // Returns 'pending' — a tone digit (1-5) can still follow.
    if (this.#buf.base && !this.#buf.vowelMod && VNI_VOWEL_DIGITS.has(k)) {
      const pair = this.#buf.base + k;
      if (pair in VNI_VOWEL) {
        this.#buf.vowelMod = VNI_VOWEL[pair];
        const display = this.#compose();
        return { display, status: 'pending' };
      }
      // Non-matching digit on base — emit base as-is, don't swallow it
      const prev = this.#buf.base;
      this.#clearBuf();
      return { display: prev.normalize('NFC'), status: 'ready' };
    }

    // Tone digit (1-5)
    if (this.#buf.base && VNI_TONE_DIGITS.has(k)) {
      this.#buf.tone = VNI_TONE[k];
      const display = this.#compose();
      return { display, status: 'ready' };
    }

    // New base character
    this.#clearBuf();
    this.#buf.base = k;
    // Letters (non-digits) can be extended with a modifier — digits never start a base
    const couldExtend = isNaN(parseInt(k));
    return {
      display: k.normalize('NFC'),
      status: couldExtend ? 'pending' : 'ready',
    };
  }

  // ── Compose ────────────────────────────────────────────────────────────

  #compose() {
    let s = this.#buf.base;
    if (this.#buf.vowelMod) s = (s + this.#buf.vowelMod).normalize('NFC');
    if (this.#buf.tone)     s = (s + this.#buf.tone).normalize('NFC');
    return s.normalize('NFC');
  }

  #clearBuf() {
    this.#buf = { base: '', vowelMod: '', tone: '' };
  }
}

/**
 * Split a Vietnamese string into grapheme clusters using Intl.Segmenter.
 * 'con mèo' → ['c','o','n',' ','m','è','o']
 * Falls back to Array.from() if Intl.Segmenter is unavailable.
 */
export function splitGraphemes(str) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('vi', { granularity: 'grapheme' });
    return [...seg.segment(str)].map(s => s.segment);
  }
  return Array.from(str.normalize('NFC'));
}
