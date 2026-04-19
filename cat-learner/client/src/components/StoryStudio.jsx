import { useState, useRef, useEffect } from 'react';
import { AITutor } from './AITutor.jsx';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const MAX_CHARS = 2000;
const MIN_CHARS = 20;

export function StoryStudio() {
  const [text, setText]         = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const abortRef = useRef(null);
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  async function handleSubmit() {
    if (text.trim().length < MIN_CHARS) return;
    abortRef.current?.abort();
    const controller  = new AbortController();
    abortRef.current  = controller;

    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const res  = await fetch(`${API_BASE}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Lỗi không xác định');
      setFeedback(data.feedback);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(`Miu đang bận, thử lại nhé! (${err.message})`);
    } finally {
      setLoading(false);
    }
  }

  const remaining = MAX_CHARS - text.length;
  const canSubmit = text.trim().length >= MIN_CHARS && !loading;

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-3xl font-bold text-center mb-2 text-ds-accent-lt font-vi">
        ✍️ Xưởng Viết Văn
      </h2>
      <p className="text-center text-ds-text-muted mb-6 font-vi text-sm">
        Viết một câu chuyện ngắn hoặc nhật ký bằng tiếng Việt. Miu sẽ đọc và khen bạn!
      </p>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Hôm nay em đi học về thì thấy một chú mèo nhỏ…"
          rows={8}
          aria-label="Viết bài tiếng Việt để Miu nhận xét"
          className="w-full bg-ds-surface border border-ds-border rounded-2xl p-4 text-lg font-vi resize-none text-ds-text placeholder:text-ds-text-ghost focus:outline-none focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20 transition-colors"
        />
        <span className={`absolute bottom-3 right-4 font-mono text-xs ${remaining < 50 ? 'text-ds-error' : 'text-ds-text-ghost'}`}>
          {remaining} ký tự còn lại
        </span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => { setText(''); setFeedback(null); setError(null); }}
          className="text-sm text-ds-text-muted hover:text-ds-text transition-colors font-vi"
        >
          Xoá bài
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-8 py-3 rounded-xl text-lg font-bold font-vi transition-all
            ${canSubmit
              ? 'text-white shadow-[0_0_16px_rgba(108,99,255,0.4)] hover:shadow-[0_0_24px_rgba(108,99,255,0.5)]'
              : 'bg-ds-surface text-ds-text-ghost cursor-not-allowed border border-ds-border'}`}
          style={canSubmit ? { background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' } : {}}
        >
          {loading ? 'Đang hỏi Miu…' : 'Hỏi ý kiến Miu'}
        </button>
      </div>

      <AITutor feedback={feedback} loading={loading} error={error} />
    </div>
  );
}
