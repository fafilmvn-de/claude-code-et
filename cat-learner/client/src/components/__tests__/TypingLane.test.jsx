import { render, act, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TypingLane } from '../TypingLane.jsx';

const pressKey = (key) => fireEvent.keyDown(window, { key });

describe('TypingLane — deferred tone (Telex)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  test('vuwownf completes vườn (tone at end of word)', async () => {
    const onComplete = vi.fn();
    render(
      <TypingLane
        target="vườn"
        mode="telex"
        variant="boxes"
        onComplete={onComplete}
      />
    );

    // v → matches 'v'
    pressKey('v');
    // u+w → ư auto-commits (display='ư' matches target 'ư')
    pressKey('u'); pressKey('w');
    // o+w → display='ơ', pending on 'ờ'
    pressKey('o'); pressKey('w');
    // n → deferred: 'ờ' slot goes tentative, cursor advances, 'n' replayed
    pressKey('n');

    // Flush React effects (pendingReplayKey → processKey)
    await act(async () => {});

    // Should NOT be complete yet (waiting for deferred tone)
    expect(onComplete).not.toHaveBeenCalled();

    // f → correct huyền tone resolves deferred slot
    pressKey('f');

    // Advance past the 400ms completion delay
    act(() => vi.advanceTimersByTime(500));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('wrong tone key flashes error; correct tone still completes', async () => {
    const onComplete = vi.fn();
    render(
      <TypingLane
        target="vườn"
        mode="telex"
        variant="boxes"
        onComplete={onComplete}
      />
    );

    pressKey('v');
    pressKey('u'); pressKey('w');
    pressKey('o'); pressKey('w');
    pressKey('n');
    await act(async () => {});

    expect(onComplete).not.toHaveBeenCalled();

    // s = sắc (acute), not huyền — wrong tone
    pressKey('s');
    expect(onComplete).not.toHaveBeenCalled();

    // After shake timeout (500ms), slot returns to tentative for retry
    act(() => vi.advanceTimersByTime(600));

    // f = huyền — correct tone
    pressKey('f');
    act(() => vi.advanceTimersByTime(500));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('vuwowfn (tone before n) still works — no regression', async () => {
    const onComplete = vi.fn();
    render(
      <TypingLane
        target="vườn"
        mode="telex"
        variant="boxes"
        onComplete={onComplete}
      />
    );

    pressKey('v');
    pressKey('u'); pressKey('w');
    pressKey('o'); pressKey('w'); pressKey('f'); // 'ờ' typed inline
    pressKey('n');
    await act(async () => {});

    act(() => vi.advanceTimersByTime(500));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('TypingLane — deferred tone (VNI)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  test('v+u7+o7+n+2 completes vườn', async () => {
    const onComplete = vi.fn();
    render(
      <TypingLane
        target="vườn"
        mode="vni"
        variant="boxes"
        onComplete={onComplete}
      />
    );

    // VNI: v → 'v'; u+7 → 'ư'; o+7 → 'ơ' (pending on 'ờ'); n → defer; 2 → huyền
    pressKey('v');
    pressKey('u'); pressKey('7'); // ư auto-commits
    pressKey('o'); pressKey('7'); // display='ơ', pending on 'ờ'
    pressKey('n');               // defer
    await act(async () => {});

    expect(onComplete).not.toHaveBeenCalled();

    pressKey('2'); // VNI huyền
    act(() => vi.advanceTimersByTime(500));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
