import { renderHook, act } from '@testing-library/react';
import { useTypingEngine } from '../useTypingEngine.js';
import { describe, test, expect } from 'vitest';

describe('useTypingEngine', () => {
  test('starts with empty display and idle status', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'telex', targetGrapheme: 'a' })
    );
    expect(result.current.display).toBe('');
    expect(result.current.status).toBe('idle');
  });

  test('processKey updates display', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'direct', targetGrapheme: 'a' })
    );
    act(() => { result.current.processKey('a'); });
    expect(result.current.display).toBe('a');
  });

  test('correct character gives matched:true', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'direct', targetGrapheme: 'a' })
    );
    act(() => { result.current.processKey('a'); });
    expect(result.current.matched).toBe(true);
  });

  test('wrong character gives matched:false', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'direct', targetGrapheme: 'a' })
    );
    act(() => { result.current.processKey('b'); });
    expect(result.current.matched).toBe(false);
  });

  test('Telex: typing plain u when target is u auto-commits (not stuck pending)', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'telex', targetGrapheme: 'u' })
    );
    act(() => { result.current.processKey('u'); });
    expect(result.current.matched).toBe(true);
    expect(result.current.status).toBe('ready');
  });

  test('Telex: typing u when target is ư stays pending (no false commit)', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'telex', targetGrapheme: 'ư' })
    );
    act(() => { result.current.processKey('u'); });
    expect(result.current.matched).toBe(null);
    expect(result.current.status).toBe('pending');
  });

  test('reset clears display and status back to idle', () => {
    const { result } = renderHook(() =>
      useTypingEngine({ mode: 'direct', targetGrapheme: 'a' })
    );
    act(() => { result.current.processKey('a'); });
    act(() => { result.current.reset(); });
    expect(result.current.display).toBe('');
    expect(result.current.status).toBe('idle');
  });
});
