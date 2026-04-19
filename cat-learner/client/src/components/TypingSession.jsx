// cat-learner/client/src/components/TypingSession.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { TypingLane } from './TypingLane.jsx';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const FETCH_TIMEOUT_MS = 10_000;

export function TypingSession({ lesson, levelId, variant, mode, onComplete, onBack }) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [aiScreens, setAiScreens]     = useState(null);
  const [aiLoading, setAiLoading]     = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch(`${API_BASE}/api/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, theme: lesson.theme, screenCount: lesson.screenCount, variant }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.screens) && data.screens.length > 0) {
          setAiScreens(data.screens);
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timeoutId); setAiLoading(false); });

    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, [lesson.id]);

  const screens = aiScreens ?? lesson.screens;

  const startTimeRef         = useRef(null);
  const correctKeystrokesRef = useRef(0);
  const totalKeystrokesRef   = useRef(0);

  const [elapsedSec, setElapsedSec]     = useState(0);
  const [liveWpm, setLiveWpm]           = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  const intervalRef = useRef(null);

  const ensureTimerRunning = useCallback(() => {
    if (startTimeRef.current !== null) return;
    startTimeRef.current = Date.now();
    intervalRef.current  = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsed   = Math.max(elapsedMs, 1000);
      const correct   = correctKeystrokesRef.current;
      const total     = totalKeystrokesRef.current;
      setElapsedSec(Math.floor(elapsedMs / 1000));
      setLiveWpm(Math.round((correct / 5) / (elapsed / 60000)));
      setLiveAccuracy(total === 0 ? 100 : Math.round((correct / total) * 100));
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleKeyResult = useCallback((correct) => {
    ensureTimerRunning();
    totalKeystrokesRef.current += 1;
    if (correct) correctKeystrokesRef.current += 1;
  }, [ensureTimerRunning]);

  const handleScreenComplete = useCallback(() => {
    const nextIndex = screenIndex + 1;
    if (nextIndex >= screens.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const elapsedMs = startTimeRef.current ? Date.now() - startTimeRef.current : 1000;
      const elapsed   = Math.max(elapsedMs, 1000);
      const correct   = correctKeystrokesRef.current;
      const total     = totalKeystrokesRef.current;
      onComplete({
        wpm:              Math.round((correct / 5) / (elapsed / 60000)),
        accuracy:         total === 0 ? 100 : Math.round((correct / total) * 100),
        elapsedMs,
        correctKeystrokes: correct,
        totalKeystrokes:   total,
        lessonTitle:       lesson.title,
      });
    } else {
      setScreenIndex(nextIndex);
    }
  }, [screenIndex, screens.length, lesson.title, onComplete]);

  if (aiLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="text-sm text-ds-text-muted hover:text-ds-text transition-colors font-vi"
            aria-label="Quay lại chọn bài"
          >
            ← Quay lại
          </button>
          <h2 className="text-lg font-bold text-ds-text font-vi truncate">{lesson.title}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-ds-accent-sub border-t-ds-accent rounded-full animate-spin" />
          <p className="text-ds-text-muted font-vi text-sm">Miu đang chuẩn bị bài mới…</p>
        </div>
      </div>
    );
  }

  const screen = screens[screenIndex];
  const total  = screens.length;
  const mm     = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss     = String(elapsedSec % 60).padStart(2, '0');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sm text-ds-text-muted hover:text-ds-text transition-colors font-vi"
          aria-label="Quay lại chọn bài"
        >
          ← Quay lại
        </button>
        <h2 className="text-lg font-bold text-ds-text font-vi truncate">{lesson.title}</h2>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-[3px] bg-ds-accent rounded-full transition-all duration-300 shadow-[0_0_6px_var(--ds-accent)]"
            style={{ width: `${(screenIndex / total) * 100}%` }}
          />
        </div>
        <span className="font-mono text-ds-text-ghost text-[10px] whitespace-nowrap">
          {screenIndex + 1} / {total}
        </span>
      </div>

      {/* Live stats */}
      <div className="flex justify-center gap-3 mb-6 text-center">
        <div className="bg-ds-surface border border-ds-border rounded-xl px-5 py-2.5">
          <p className="font-mono text-ds-accent-lt text-xl font-bold">{mm}:{ss}</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-widest uppercase mt-0.5">Time</p>
        </div>
        <div className="bg-ds-surface border border-ds-border rounded-xl px-5 py-2.5">
          <p className="font-mono text-ds-accent-lt text-xl font-bold">{liveWpm}</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-widest uppercase mt-0.5">WPM</p>
        </div>
        <div className="bg-ds-surface border border-ds-border rounded-xl px-5 py-2.5">
          <p className="font-mono text-ds-correct text-xl font-bold">{liveAccuracy}%</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-widest uppercase mt-0.5">ACC</p>
        </div>
      </div>

      {/* Word card for boxes variant */}
      {variant === 'boxes' && screen.emoji && (
        <div className="text-center mb-4">
          <p className="text-6xl mb-1">{screen.emoji}</p>
          <p className="text-3xl font-bold font-vi text-ds-text">{screen.text}</p>
          {screen.hint && (
            <p className="text-sm text-ds-text-muted mt-1 font-vi">({screen.hint})</p>
          )}
        </div>
      )}

      {/* Typing lane */}
      <TypingLane
        key={`${lesson.id}-${screenIndex}`}
        target={screen.text}
        mode={mode}
        variant={variant}
        onComplete={handleScreenComplete}
        onKeyResult={handleKeyResult}
      />

      {variant === 'boxes' && (
        <p className="text-center text-ds-text-ghost text-sm mt-3 font-vi">Gõ từ bên trên ↑</p>
      )}
      {variant === 'line' && (
        <p className="text-center text-ds-text-ghost text-sm mt-3 font-vi">Gõ từng ký tự của câu trên ↑</p>
      )}
    </div>
  );
}
