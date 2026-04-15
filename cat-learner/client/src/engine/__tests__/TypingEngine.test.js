import { TypingEngine, splitGraphemes } from '../TypingEngine.js';

// ── Helpers ────────────────────────────────────────────────────────────────
function compose(engine, keys) {
  let result;
  for (const k of keys) result = engine.processKey(k);
  return result;
}

// ── Direct mode ───────────────────────────────────────────────────────────
describe('direct mode', () => {
  test('passes raw key through immediately as ready', () => {
    const e = new TypingEngine('direct');
    expect(e.processKey('m')).toEqual({ display: 'm', status: 'ready' });
  });

  test('handles multi-byte Vietnamese character from IME', () => {
    const e = new TypingEngine('direct');
    const char = 'ề'; // U+1EC1 precomposed
    expect(e.processKey(char)).toEqual({ display: char, status: 'ready' });
  });
});

// ── Telex mode ───────────────────────────────────────────────────────────
describe('Telex mode — vowel transformation', () => {
  test('aa → â', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('a')).toEqual({ display: 'â', status: 'ready' });
  });

  test('aw → ă', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('w')).toEqual({ display: 'ă', status: 'ready' });
  });

  test('ee → ê', () => {
    const e = new TypingEngine('telex');
    e.processKey('e');
    expect(e.processKey('e')).toEqual({ display: 'ê', status: 'ready' });
  });

  test('oo → ô', () => {
    const e = new TypingEngine('telex');
    e.processKey('o');
    expect(e.processKey('o')).toEqual({ display: 'ô', status: 'ready' });
  });

  test('ow → ơ', () => {
    const e = new TypingEngine('telex');
    e.processKey('o');
    expect(e.processKey('w')).toEqual({ display: 'ơ', status: 'ready' });
  });

  test('uw → ư', () => {
    const e = new TypingEngine('telex');
    e.processKey('u');
    expect(e.processKey('w')).toEqual({ display: 'ư', status: 'ready' });
  });

  test('dd → đ', () => {
    const e = new TypingEngine('telex');
    e.processKey('d');
    expect(e.processKey('d')).toEqual({ display: 'đ', status: 'ready' });
  });
});

describe('Telex mode — tones', () => {
  test('as → á (sắc)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('s')).toEqual({ display: 'á', status: 'ready' });
  });

  test('af → à (huyền)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('f')).toEqual({ display: 'à', status: 'ready' });
  });

  test('ar → ả (hỏi)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('r')).toEqual({ display: 'ả', status: 'ready' });
  });

  test('ax → ã (ngã)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('x')).toEqual({ display: 'ã', status: 'ready' });
  });

  test('aj → ạ (nặng)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    expect(e.processKey('j')).toEqual({ display: 'ạ', status: 'ready' });
  });

  test('aas → ấ (â + sắc)', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    e.processKey('a');
    expect(e.processKey('s')).toEqual({ display: 'ấ', status: 'ready' });
  });

  test('single a is pending (could be aa, as, etc.)', () => {
    const e = new TypingEngine('telex');
    expect(e.processKey('a')).toEqual({ display: 'a', status: 'pending' });
  });
});

// ── VNI mode ─────────────────────────────────────────────────────────────
describe('VNI mode — vowel transformation', () => {
  test('a6 → â', () => {
    const e = new TypingEngine('vni');
    e.processKey('a');
    expect(e.processKey('6')).toEqual({ display: 'â', status: 'ready' });
  });

  test('a8 → ă', () => {
    const e = new TypingEngine('vni');
    e.processKey('a');
    expect(e.processKey('8')).toEqual({ display: 'ă', status: 'ready' });
  });

  test('o7 → ơ', () => {
    const e = new TypingEngine('vni');
    e.processKey('o');
    expect(e.processKey('7')).toEqual({ display: 'ơ', status: 'ready' });
  });

  test('d9 → đ', () => {
    const e = new TypingEngine('vni');
    e.processKey('d');
    expect(e.processKey('9')).toEqual({ display: 'đ', status: 'ready' });
  });
});

describe('VNI mode — tones', () => {
  test('a1 → á', () => {
    const e = new TypingEngine('vni');
    e.processKey('a');
    expect(e.processKey('1')).toEqual({ display: 'á', status: 'ready' });
  });

  test('a2 → à', () => {
    const e = new TypingEngine('vni');
    e.processKey('a');
    expect(e.processKey('2')).toEqual({ display: 'à', status: 'ready' });
  });

  test('a61 → ấ (â + sắc)', () => {
    const e = new TypingEngine('vni');
    e.processKey('a');
    e.processKey('6');
    expect(e.processKey('1')).toEqual({ display: 'ấ', status: 'ready' });
  });
});

// ── compare ───────────────────────────────────────────────────────────────
describe('compare()', () => {
  test('NFC-equal strings match', () => {
    const e = new TypingEngine('direct');
    // 'ề' as precomposed vs decomposed should both match
    const precomposed = '\u1EC1';
    const decomposed  = 'e\u0302\u0300';
    expect(e.compare(precomposed, decomposed)).toBe(true);
  });

  test('different characters do not match', () => {
    const e = new TypingEngine('direct');
    expect(e.compare('a', 'b')).toBe(false);
  });

  test('case-insensitive: A matches a', () => {
    const e = new TypingEngine('direct');
    expect(e.compare('A', 'a')).toBe(true);
  });

  test('case-insensitive: Ấ matches ấ', () => {
    const e = new TypingEngine('direct');
    expect(e.compare('Ấ', 'ấ')).toBe(true);
  });
});

// ── uppercase input ─────────────────────────────────────────────────────
describe('uppercase input in Telex', () => {
  test('AA → â (lowercased internally)', () => {
    const e = new TypingEngine('telex');
    e.processKey('A');
    expect(e.processKey('A')).toEqual({ display: 'â', status: 'ready' });
  });

  test('AS → á (uppercase tone key)', () => {
    const e = new TypingEngine('telex');
    e.processKey('A');
    expect(e.processKey('S')).toEqual({ display: 'á', status: 'ready' });
  });
});

// ── reset ─────────────────────────────────────────────────────────────────
describe('reset()', () => {
  test('clears buffer so next key starts fresh', () => {
    const e = new TypingEngine('telex');
    e.processKey('a');
    e.reset();
    // 'a' is in TELEX_VOWEL_BASES so it correctly returns 'pending'
    expect(e.processKey('a')).toEqual({ display: 'a', status: 'pending' });
  });
});

// ── splitGraphemes ────────────────────────────────────────────────────────
describe('splitGraphemes', () => {
  test('splits ASCII correctly', () => {
    expect(splitGraphemes('cat')).toEqual(['c','a','t']);
  });

  test('treats Vietnamese precomposed char as one grapheme', () => {
    expect(splitGraphemes('mèo')).toEqual(['m','è','o']);
  });

  test('handles space in multi-word sight word', () => {
    expect(splitGraphemes('con mèo')).toEqual(['c','o','n',' ','m','è','o']);
  });
});
