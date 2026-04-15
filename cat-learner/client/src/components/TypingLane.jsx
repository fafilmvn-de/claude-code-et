// cat-learner/client/src/components/TypingLane.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { splitGraphemes } from '../engine/TypingEngine.js';
import { useTypingEngine } from '../hooks/useTypingEngine.js';

/**
 * TypingLane — renders grapheme slots for a target word/sentence and
 * accepts keyboard input to fill them one at a time.
 *
 * Props:
 *   target       {string}              — the Vietnamese text to type
 *   mode         {string}              — 'telex' | 'vni' | 'direct'
 *   variant      {'boxes'|'line'}      — 'boxes' (default) for words/phrases;
 *                                        'line' for full-sentence inline display
 *   onComplete   {fn}                  — called when all graphemes typed correctly
 *   onKeyResult  {fn(correct:boolean)} — called on each key resolution for metrics
 */
export function TypingLane({ target, mode = 'direct', variant = 'boxes', onComplete, onKeyResult }) {
  const graphemes   = useMemo(() => splitGraphemes(target.normalize('NFC')), [target]);
  const [cursor, setCursor]       = useState(0);
  const [slotStates, setSlotStates] = useState(graphemes.map(() => 'idle'));
  const [shake, setShake]         = useState(false);

  const cursorRef      = useRef(cursor);
  const onCompleteRef  = useRef(onComplete);
  const onKeyResultRef = useRef(onKeyResult);
  cursorRef.current      = cursor;
  onCompleteRef.current  = onComplete;
  onKeyResultRef.current = onKeyResult;

  const hiddenInputRef = useRef(null);
  const timeoutRefs    = useRef([]);

  const currentTarget = graphemes[cursor] ?? '';
  const { display, matched, processKey, reset } = useTypingEngine({
    mode,
    targetGrapheme: currentTarget,
  });

  useEffect(() => {
    setCursor(0);
    setSlotStates(splitGraphemes(target.normalize('NFC')).map(() => 'idle'));
    reset();
    hiddenInputRef.current?.focus();
  }, [target, reset]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (matched === null) return;
    const c = cursorRef.current;

    // Report to metrics
    onKeyResultRef.current?.(matched);

    if (matched) {
      setSlotStates(prev => {
        const next = [...prev];
        next[c] = 'correct';
        return next;
      });
      const nextCursor = c + 1;
      if (nextCursor >= graphemes.length) {
        const tid = setTimeout(() => onCompleteRef.current(), 400);
        timeoutRefs.current.push(tid);
      } else {
        setCursor(nextCursor);
        reset();
      }
    } else {
      setSlotStates(prev => {
        const next = [...prev];
        next[c] = 'error';
        return next;
      });
      setShake(true);
      const tid = setTimeout(() => {
        setSlotStates(prev => {
          const next = [...prev];
          next[c] = 'idle';
          return next;
        });
        setShake(false);
        reset();
      }, 500);
      timeoutRefs.current.push(tid);
    }
  }, [matched, graphemes.length, reset]);

  const handleKeyDown = useCallback((e) => {
    if (e.key.length !== 1) return;
    e.preventDefault();
    processKey(e.key);
  }, [processKey]);

  const handleMobileInput = useCallback((e) => {
    const val = e.target.value;
    if (val.length > 0) {
      processKey(val[val.length - 1]);
      e.target.value = '';
    }
  }, [processKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── 'line' variant: inline colored characters ──────────────────────────
  if (variant === 'line') {
    return (
      <div
        className={`mt-6 ${shake ? 'motion-safe:animate-shake' : ''}`}
        role="group"
        aria-label="Type each character of the sentence"
      >
        <input
          ref={hiddenInputRef}
          className="sr-only"
          aria-label="Type Vietnamese characters here"
          autoFocus
          onInput={handleMobileInput}
          inputMode="text"
          tabIndex={-1}
        />
        <div className="text-2xl font-vi leading-relaxed text-center p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-inner tracking-wide">
          {graphemes.map((g, i) => {
            const state = slotStates[i];
            const isCurrent = i === cursor;
            const colorClass =
              state === 'correct' ? 'text-green-600' :
              state === 'error'   ? 'text-red-500' :
              isCurrent           ? 'text-orange-500 underline underline-offset-4 decoration-2' :
                                    'text-gray-300';
            return (
              <span
                key={i}
                className={`${colorClass} transition-colors duration-100`}
                aria-hidden="true"
              >
                {g}
              </span>
            );
          })}
        </div>
        <p className="sr-only">Character {cursor + 1} of {graphemes.length}</p>
      </div>
    );
  }

  // ── 'boxes' variant (default): individual character boxes ──────────────
  return (
    <div
      className={`flex flex-wrap justify-center gap-1 mt-4 ${shake ? 'motion-safe:animate-shake' : ''}`}
      role="group"
      aria-label="Typing lane — type each character"
    >
      <input
        ref={hiddenInputRef}
        className="sr-only"
        aria-label="Type Vietnamese characters here"
        autoFocus
        onInput={handleMobileInput}
        inputMode="text"
        tabIndex={-1}
      />
      {graphemes.map((g, i) => {
        const state     = slotStates[i];
        const isCurrent = i === cursor;

        const baseClass  = 'relative w-12 h-14 flex items-center justify-center rounded-xl text-2xl font-bold font-vi border-2 transition-all select-none';
        const stateClass =
          state === 'correct' ? 'bg-green-100 border-green-400 text-green-700' :
          state === 'error'   ? 'bg-red-100   border-red-400   text-red-700'   :
          isCurrent           ? 'bg-orange-100 border-orange-400 text-orange-700 scale-110' :
                                'bg-white border-gray-200 text-gray-400';

        return (
          <div
            key={i}
            className={`${baseClass} ${stateClass}`}
            aria-label={`Character ${i + 1}: ${state === 'correct' ? 'correct' : state === 'error' ? 'incorrect' : isCurrent ? 'current' : 'upcoming'}`}
          >
            {g === ' ' ? (
              <span className="text-gray-300">_</span>
            ) : (
              <>
                {isCurrent && display ? display : g}
                {state === 'correct' && <span className="absolute -top-1 -right-1 text-xs">✓</span>}
                {state === 'error'   && <span className="absolute -top-1 -right-1 text-xs">✗</span>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
