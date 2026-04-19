import { useState } from 'react';
import { LEVELS } from '../data/lessonData.js';

export function LessonPicker({ onSelect }) {
  const [openLevelId, setOpenLevelId] = useState(null);

  function toggleLevel(levelId) {
    setOpenLevelId(prev => prev === levelId ? null : levelId);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-ds-accent-lt font-vi mb-1">⌨️ Luyện gõ phím</h2>
        <p className="text-ds-text-muted font-vi text-sm">Chọn cấp độ và bài học để bắt đầu</p>
      </div>

      {LEVELS.map(level => {
        const isOpen = openLevelId === level.id;

        return (
          <div
            key={level.id}
            className={`rounded-2xl border overflow-hidden transition-all duration-200
              ${isOpen
                ? 'border-ds-accent bg-ds-accent-sub shadow-[0_0_18px_rgba(108,99,255,0.15)]'
                : 'border-ds-border bg-ds-surface'}`}
          >
            <button
              onClick={() => toggleLevel(level.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-ds-surface-hi transition-colors"
            >
              <span className="text-4xl">{level.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-lg font-vi text-ds-text">{level.name}</p>
                <p className="text-ds-text-muted text-sm font-vi">{level.description}</p>
              </div>
              <span className={`text-ds-text-muted text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 grid gap-2">
                {level.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelect(level, lesson)}
                    className="w-full text-left px-4 py-3 rounded-xl font-vi font-semibold text-sm transition-colors bg-ds-surface-hi hover:bg-ds-accent-sub hover:border-ds-accent border border-ds-border text-ds-text"
                  >
                    {lesson.title}
                    <span className="text-ds-text-muted font-normal ml-2">
                      {lesson.screens.length} màn hình
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
