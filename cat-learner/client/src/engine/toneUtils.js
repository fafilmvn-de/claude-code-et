// cat-learner/client/src/engine/toneUtils.js
// Pure helpers for tone-mark detection and composition.
// No React dependency — safe to import from tests and components.

export const TELEX_TONE_CHARS = {
  s: '\u0301', // sắc
  f: '\u0300', // huyền
  r: '\u0309', // hỏi
  x: '\u0303', // ngã
  j: '\u0323', // nặng
};

export const VNI_TONE_CHARS = {
  '1': '\u0301',
  '2': '\u0300',
  '3': '\u0309',
  '4': '\u0303',
  '5': '\u0323',
};

/**
 * Strip the five Vietnamese tone combining characters from a string.
 * 'ờ' (ơ + grave U+0300) → 'ơ'
 * 'ấ' (â + acute U+0301) → 'â'
 * Input and output are NFC-normalised.
 */
export function strippedOfTone(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0301\u0300\u0309\u0303\u0323]/g, '')
    .normalize('NFC');
}

/**
 * Return true if key is a tone modifier for the given input mode.
 * Case-insensitive for Telex (so 'F' === 'f').
 */
export function isToneKey(key, mode) {
  if (mode === 'telex') return key.toLowerCase() in TELEX_TONE_CHARS;
  if (mode === 'vni')   return key in VNI_TONE_CHARS;
  return false;
}
