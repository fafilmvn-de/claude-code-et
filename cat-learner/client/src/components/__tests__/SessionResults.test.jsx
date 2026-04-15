import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { SessionResults } from '../SessionResults.jsx';

const baseStats = {
  wpm: 40,
  accuracy: 95,
  elapsedMs: 60000,
  correctKeystrokes: 190,
  totalKeystrokes: 200,
  lessonTitle: 'Bài 1 – Đồ ăn',
};

describe('SessionResults', () => {
  test('shows lesson title', () => {
    render(<SessionResults stats={baseStats} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByText('Bài 1 – Đồ ăn')).toBeInTheDocument();
  });

  test('shows WPM', () => {
    render(<SessionResults stats={baseStats} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  test('accuracy 95 → 3 stars', () => {
    render(<SessionResults stats={{ ...baseStats, accuracy: 95 }} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByLabelText('3 sao')).toBeInTheDocument();
  });

  test('accuracy 80 → 2 stars', () => {
    render(<SessionResults stats={{ ...baseStats, accuracy: 80 }} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByLabelText('2 sao')).toBeInTheDocument();
  });

  test('accuracy 60 → 1 star', () => {
    render(<SessionResults stats={{ ...baseStats, accuracy: 60 }} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByLabelText('1 sao')).toBeInTheDocument();
  });

  test('accuracy 59 → 0 stars', () => {
    render(<SessionResults stats={{ ...baseStats, accuracy: 59 }} onRedo={() => {}} onContinue={() => {}} />);
    expect(screen.getByLabelText('0 sao')).toBeInTheDocument();
  });

  test('clicking Làm lại calls onRedo', async () => {
    const onRedo = vi.fn();
    render(<SessionResults stats={baseStats} onRedo={onRedo} onContinue={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /làm lại/i }));
    expect(onRedo).toHaveBeenCalledOnce();
  });

  test('clicking Tiếp tục calls onContinue', async () => {
    const onContinue = vi.fn();
    render(<SessionResults stats={baseStats} onRedo={() => {}} onContinue={onContinue} />);
    await userEvent.click(screen.getByRole('button', { name: /tiếp tục/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
