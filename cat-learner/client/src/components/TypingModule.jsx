import { useState } from 'react';
import { SIGHT_WORDS } from '../data/vietnameseData.js';
import { WordCard } from './WordCard.jsx';
import { TypingLane } from './TypingLane.jsx';

// Shuffle a copy of the word list
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TypingModule() {
  const [mode, setMode]         = useState('telex');
  const [words, setWords]       = useState(() => shuffle(SIGHT_WORDS));
  const [index, setIndex]       = useState(0);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  const current = words[index];

  function handleComplete() {
    setScore(s => s + 1);
    if (index + 1 >= words.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  }

  if (done) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🎉</p>
        <p className="text-3xl font-bold text-orange-600 font-vi">Tuyệt vời!</p>
        <p className="text-xl text-gray-600 mt-2">Bạn đã gõ đúng {score}/{words.length} từ!</p>
        <button
          onClick={() => { setWords(shuffle(SIGHT_WORDS)); setIndex(0); setScore(0); setDone(false); }}
          className="mt-8 bg-orange-400 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-orange-500 transition-colors"
        >
          Chơi lại 🐱
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Score + progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 font-vi">
          Từ {index + 1} / {words.length}
        </span>
        <span className="text-sm font-bold text-orange-500">✅ {score} đúng</span>
        {/* Mode selector */}
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1"
          aria-label="Chọn kiểu gõ (Telex, VNI, hoặc Trực tiếp)"
        >
          <option value="direct">Trực tiếp (IME)</option>
          <option value="telex">Telex</option>
          <option value="vni">VNI</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div
          className="h-2 bg-orange-400 rounded-full transition-all"
          style={{ width: `${(index / words.length) * 100}%` }}
        />
      </div>

      <WordCard word={current.word} meaning={current.meaning} emoji={current.emoji} />
      <p className="text-center text-gray-400 text-sm mt-2 font-vi">
        Gõ từ bên trên ↑
      </p>

      <TypingLane
        key={current.word}   // remount on word change to fully reset internal state
        target={current.word}
        mode={mode}
        onComplete={handleComplete}
      />
    </div>
  );
}
