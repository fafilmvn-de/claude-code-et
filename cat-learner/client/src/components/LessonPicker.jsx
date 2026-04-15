// cat-learner/client/src/components/LessonPicker.jsx
import { useState } from 'react';
import { LEVELS } from '../data/lessonData.js';

const LEVEL_COLORS = {
  beginner:     { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  btn: 'bg-green-100 hover:bg-green-200'  },
  intermediate: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   btn: 'bg-blue-100 hover:bg-blue-200'    },
  advanced:     { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', btn: 'bg-purple-100 hover:bg-purple-200' },
  expert:       { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', btn: 'bg-yellow-100 hover:bg-yellow-200' },
};

/**
 * Props:
 *   onSelect {fn(level, lesson)} — called with the selected level and lesson objects
 */
export function LessonPicker({ onSelect }) {
  const [openLevelId, setOpenLevelId] = useState(null);

  function toggleLevel(levelId) {
    setOpenLevelId(prev => prev === levelId ? null : levelId);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-orange-500 font-vi mb-1">⌨️ Luyện gõ phím</h2>
        <p className="text-gray-500 font-vi text-sm">Chọn cấp độ và bài học để bắt đầu</p>
      </div>

      {LEVELS.map(level => {
        const colors = LEVEL_COLORS[level.id];
        const isOpen = openLevelId === level.id;

        return (
          <div
            key={level.id}
            className={`rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}
          >
            <button
              onClick={() => toggleLevel(level.id)}
              aria-expanded={isOpen}
              className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${isOpen ? '' : 'hover:opacity-80'}`}
            >
              <span className="text-4xl">{level.emoji}</span>
              <div className="flex-1">
                <p className={`font-bold text-lg font-vi ${colors.text}`}>{level.name}</p>
                <p className="text-gray-500 text-sm font-vi">{level.description}</p>
              </div>
              <span className={`text-gray-400 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 grid gap-2">
                {level.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelect(level, lesson)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-vi font-semibold text-sm transition-colors ${colors.btn} ${colors.text}`}
                  >
                    {lesson.title}
                    <span className="text-gray-400 font-normal ml-2">
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
