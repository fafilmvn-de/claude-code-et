// cat-learner/client/src/components/TypingModule.jsx
import { useState } from 'react';
import { LessonPicker }   from './LessonPicker.jsx';
import { TypingSession }  from './TypingSession.jsx';
import { SessionResults } from './SessionResults.jsx';

export function TypingModule() {
  const [mode, setMode]   = useState('telex');
  const [phase, setPhase] = useState('picking'); // 'picking' | 'session' | 'results'
  const [selectedLevel, setSelectedLevel]   = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lastStats, setLastStats]           = useState(null);

  function handleSelect(level, lesson) {
    setSelectedLevel(level);
    setSelectedLesson(lesson);
    setPhase('session');
  }

  function handleSessionComplete(stats) {
    setLastStats(stats);
    setPhase('results');
  }

  function handleRedo() {
    setPhase('session');
  }

  function handleContinue() {
    setSelectedLevel(null);
    setSelectedLesson(null);
    setLastStats(null);
    setPhase('picking');
  }

  return (
    <div>
      {/* Mode selector — always visible */}
      <div className="flex justify-end mb-4">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1 font-vi"
          aria-label="Chọn kiểu gõ"
        >
          <option value="direct">Trực tiếp (IME)</option>
          <option value="telex">Telex</option>
          <option value="vni">VNI</option>
        </select>
      </div>

      {phase === 'picking' && (
        <LessonPicker onSelect={handleSelect} />
      )}

      {phase === 'session' && selectedLesson && (
        <TypingSession
          key={`${selectedLesson.id}-${Date.now()}`}
          lesson={selectedLesson}
          levelId={selectedLevel.id}
          variant={selectedLevel.variant}
          mode={mode}
          onComplete={handleSessionComplete}
          onBack={handleContinue}
        />
      )}

      {phase === 'results' && lastStats && (
        <SessionResults
          stats={lastStats}
          onRedo={handleRedo}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
