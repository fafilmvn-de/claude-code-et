import { ALPHABET, SIGHT_WORDS } from '../vietnameseData.js';

describe('ALPHABET', () => {
  test('has 29 Vietnamese letters', () => {
    expect(ALPHABET).toHaveLength(29);
  });

  test('each entry has letter and label fields', () => {
    ALPHABET.forEach(entry => {
      expect(entry).toHaveProperty('letter');
      expect(entry).toHaveProperty('label');
    });
  });

  test('first letter is A', () => {
    expect(ALPHABET[0].letter).toBe('A');
  });

  test('contains Đ', () => {
    expect(ALPHABET.map(e => e.letter)).toContain('Đ');
  });
});

describe('SIGHT_WORDS', () => {
  test('has exactly 50 entries', () => {
    expect(SIGHT_WORDS).toHaveLength(50);
  });

  test('each entry has word, meaning, emoji fields', () => {
    SIGHT_WORDS.forEach(entry => {
      expect(entry).toHaveProperty('word');
      expect(entry).toHaveProperty('meaning');
      expect(entry).toHaveProperty('emoji');
    });
  });

  test('words are NFC normalized', () => {
    SIGHT_WORDS.forEach(({ word }) => {
      expect(word).toBe(word.normalize('NFC'));
    });
  });
});
