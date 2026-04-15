import { useState, useRef, useEffect } from 'react';
import { AITutor } from './AITutor.jsx';

// /api/tutor is served by a Netlify Function on the same origin in production,
// or by the Express dev server via VITE_API_BASE in local development.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const MAX_CHARS = 2000;
const MIN_CHARS = 20; // require at least a sentence

export function StoryStudio() {
  const [text, setText]       = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // I7: AbortController ref to cancel in-flight fetch on unmount
  const abortRef = useRef(null);
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  async function handleSubmit() {
    if (text.trim().length < MIN_CHARS) return;
    // I7: Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Lỗi không xác định');
      setFeedback(data.feedback);
    } catch (err) {
      if (err.name === 'AbortError') return; // ignore cancelled requests
      setError(`Miu đang bận, thử lại nhé! (${err.message})`);
    } finally {
      setLoading(false);
    }
  }

  const remaining = MAX_CHARS - text.length;
  const canSubmit = text.trim().length >= MIN_CHARS && !loading;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 text-orange-500 font-vi">
        ✍️ Xưởng Viết Văn
      </h2>
      <p className="text-center text-gray-500 mb-6 font-vi text-sm">
        Viết một câu chuyện ngắn hoặc nhật ký bằng tiếng Việt. Miu sẽ đọc và khen bạn! 🐱
      </p>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Hôm nay em đi học về thì thấy một chú mèo nhỏ…"
          rows={8}
          aria-label="Viết bài tiếng Việt để Miu nhận xét"
          className="w-full border-2 border-orange-200 rounded-2xl p-4 text-lg font-vi resize-none focus:outline-none focus:border-orange-400 transition-colors"
        />
        <span className={`absolute bottom-3 right-4 text-xs ${remaining < 50 ? 'text-red-400' : 'text-gray-400'}`}>
          {remaining} ký tự còn lại
        </span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => { setText(''); setFeedback(null); setError(null); }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-vi"
        >
          Xoá bài
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-8 py-3 rounded-full text-lg font-bold font-vi transition-colors
            ${canSubmit
              ? 'bg-orange-400 text-white hover:bg-orange-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {loading ? 'Đang hỏi Miu…' : 'Hỏi ý kiến Miu 🐾'}
        </button>
      </div>

      <AITutor feedback={feedback} loading={loading} error={error} />
    </div>
  );
}
