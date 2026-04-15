import { useState, useRef, useCallback, useEffect } from 'react';
import { TypingEngine } from '../engine/TypingEngine.js';

/**
 * @param {{ mode: 'telex'|'vni'|'direct', targetGrapheme: string }} opts
 * @returns {{
 *   display: string,
 *   status: 'idle'|'pending'|'ready',
 *   matched: boolean|null,
 *   processKey: (key: string) => void,
 *   reset: () => void,
 * }}
 */
export function useTypingEngine({ mode, targetGrapheme }) {
  const engineRef = useRef(new TypingEngine(mode));
  const [display, setDisplay]   = useState('');
  const [status, setStatus]     = useState('idle');
  const [matched, setMatched]   = useState(null);

  // C2 fix: sync engine mode when mode prop changes (e.g. Telex → VNI)
  useEffect(() => {
    engineRef.current.setMode(mode);
  }, [mode]);

  const processKey = useCallback((key) => {
    setMatched(null); // reset matched before each keystroke
    const engine = engineRef.current;
    const result = engine.processKey(key);
    setDisplay(result.display);

    if (result.status === 'ready') {
      setStatus('ready');
      setMatched(engine.compare(result.display, targetGrapheme));
    } else if (engine.compare(result.display, targetGrapheme)) {
      // Pending but display already matches target — auto-commit.
      // e.g. typing plain 'u' in Telex when target is 'u' (not 'ư'),
      // or plain 'a' when target is 'a' (not 'â'/'á'/etc.)
      setStatus('ready');
      setMatched(true);
    } else {
      setStatus(result.status);
    }
  }, [targetGrapheme]);

  const reset = useCallback(() => {
    engineRef.current.reset();
    setDisplay('');
    setStatus('idle');
    setMatched(null);
  }, []);

  return { display, status, matched, processKey, reset };
}
