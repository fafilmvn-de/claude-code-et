import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { splitGraphemes } from '../engine/TypingEngine.js';
import { useTypingEngine } from '../hooks/useTypingEngine.js';

/**
 * TypingLane — renders the grapheme slots for a target word and
 * accepts keyboard input to fill them one at a time.
 *
 * Props:
 *   target   {string}  — the Vietnamese word to type
 *   mode     {string}  — 'telex' | 'vni' | 'direct'
 *   onComplete {fn}    — called when all graphemes are typed correctly
 *
 * Implementation notes (audit fixes):
 * - Uses refs (cursorRef, onCompleteRef) to avoid stale closures in useEffect [C3]
 * - Hidden <input> captures mobile virtual keyboard focus [M1]
 * - Respects prefers-reduced-motion for shake animation [M3]
 */
export function TypingLane({ target, mode = 'direct', onComplete }) {
  // C2 + I6: Memoize graphemes to avoid recomputing on every render
  const graphemes   = useMemo(() => splitGraphemes(target.normalize('NFC')), [target]);
  const [cursor, setCursor]   = useState(0);
  const [slotStates, setSlotStates] = useState(graphemes.map(() => 'idle')); // 'idle'|'correct'|'error'
  const [shake, setShake]     = useState(false);

  // C3 fix: use refs to avoid stale closures in the matched useEffect
  const cursorRef     = useRef(cursor);
  const onCompleteRef = useRef(onComplete);
  cursorRef.current     = cursor;
  onCompleteRef.current = onComplete;

  // M1 fix: hidden input ref to capture mobile keyboard
  const hiddenInputRef = useRef(null);

  // C3: Track timeout IDs for cleanup on unmount
  const timeoutRefs = useRef([]);

  const currentTarget = graphemes[cursor] ?? '';
  const { display, matched, processKey, reset } = useTypingEngine({
    mode,
    targetGrapheme: currentTarget,
  });

  // Reset when target word changes
  useEffect(() => {
    setCursor(0);
    setSlotStates(splitGraphemes(target.normalize('NFC')).map(() => 'idle'));
    reset();
    // Focus the hidden input for mobile keyboard
    hiddenInputRef.current?.focus();
  }, [target, reset]);

  // C3: Cleanup all pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  // Handle match resolution — reads cursor via ref to avoid stale closure [C3]
  useEffect(() => {
    if (matched === null) return;
    const c = cursorRef.current;
    if (matched) {
      setSlotStates(prev => {
        const next = [...prev];
        next[c] = 'correct';
        return next;
      });
      const nextCursor = c + 1;
      if (nextCursor >= graphemes.length) {
        // C3: Track timeout for cleanup
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
      // C3: Track timeout for cleanup
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

  // Capture keyboard input (desktop: keydown, mobile: hidden input onChange)
  const handleKeyDown = useCallback((e) => {
    if (e.key.length !== 1) return; // ignore Enter, Backspace, etc.
    e.preventDefault();
    processKey(e.key);
  }, [processKey]);

  // M1: Handle mobile input via hidden <input>
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

  return (
    <div
      className={`flex flex-wrap justify-center gap-1 mt-4 ${shake ? 'motion-safe:animate-shake' : ''}`}
      role="group"
      aria-label="Typing lane — type each character"
    >
      {/* M1: Hidden input to trigger mobile virtual keyboard */}
      {/* I10: Removed aria-hidden on focusable input; added descriptive aria-label */}
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
        const state   = slotStates[i];
        const isCurrent = i === cursor;

        // M4: Use icons alongside color for color-blind accessibility
        const baseClass = 'relative w-12 h-14 flex items-center justify-center rounded-xl text-2xl font-bold font-vi border-2 transition-all select-none';
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
