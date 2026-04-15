import { describe, test, expect } from 'vitest';
import { LEVELS } from '../lessonData.js';

describe('lessonData', () => {
  test('exports exactly 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  test('each level has id, name, emoji, description, and at least 1 lesson', () => {
    for (const level of LEVELS) {
      expect(level.id).toBeTruthy();
      expect(level.name).toBeTruthy();
      expect(level.emoji).toBeTruthy();
      expect(level.lessons.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('each lesson has id, title, and at least 4 non-empty screens', () => {
    for (const level of LEVELS) {
      for (const lesson of level.lessons) {
        expect(lesson.id).toBeTruthy();
        expect(lesson.title).toBeTruthy();
        expect(lesson.screens.length).toBeGreaterThanOrEqual(4);
        for (const screen of lesson.screens) {
          expect(typeof screen.text).toBe('string');
          expect(screen.text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('level ids are beginner, intermediate, advanced, expert', () => {
    expect(LEVELS.map(l => l.id)).toEqual(['beginner', 'intermediate', 'advanced', 'expert']);
  });
});
