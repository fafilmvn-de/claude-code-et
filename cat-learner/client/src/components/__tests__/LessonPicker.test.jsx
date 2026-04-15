import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { LessonPicker } from '../LessonPicker.jsx';

describe('LessonPicker', () => {
  test('renders all 4 level cards', () => {
    render(<LessonPicker onSelect={() => {}} />);
    expect(screen.getByText('Người mới bắt đầu')).toBeInTheDocument();
    expect(screen.getByText('Trung cấp')).toBeInTheDocument();
    expect(screen.getByText('Nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Chuyên gia')).toBeInTheDocument();
  });

  test('clicking a level expands its lesson list', async () => {
    render(<LessonPicker onSelect={() => {}} />);
    const beginnerBtn = screen.getByRole('button', { name: /người mới bắt đầu/i });
    expect(screen.queryByText('Bài 1 – Đồ ăn')).not.toBeInTheDocument();
    await userEvent.click(beginnerBtn);
    expect(screen.getByText('Bài 1 – Đồ ăn')).toBeInTheDocument();
  });

  test('clicking a lesson calls onSelect with level and lesson', async () => {
    const onSelect = vi.fn();
    render(<LessonPicker onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /người mới bắt đầu/i }));
    await userEvent.click(screen.getByRole('button', { name: /bài 1 – đồ ăn/i }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'beginner' }),
      expect.objectContaining({ id: 'b1' })
    );
  });

  test('clicking the active level again collapses it', async () => {
    render(<LessonPicker onSelect={() => {}} />);
    const btn = screen.getByRole('button', { name: /người mới bắt đầu/i });
    await userEvent.click(btn);
    expect(screen.getByText('Bài 1 – Đồ ăn')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.queryByText('Bài 1 – Đồ ăn')).not.toBeInTheDocument();
  });
});
