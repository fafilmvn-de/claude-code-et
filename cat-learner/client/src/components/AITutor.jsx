/**
 * AITutor — renders Gemini's "Miu" feedback with a cat mascot.
 * Props:
 *   feedback {string|null}  — AI text, or null when not yet fetched
 *   loading  {boolean}
 *   error    {string|null}
 */
export function AITutor({ feedback, loading, error }) {
  if (!feedback && !loading && !error) return null;

  return (
    <div className="mt-6 flex gap-3 items-start bg-orange-50 border border-orange-200 rounded-2xl p-4">
      <span className="text-4xl shrink-0" aria-hidden="true">🐱</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-orange-600 mb-1 font-vi">Miu nói:</p>
        {loading && (
          <p className="text-gray-400 animate-pulse font-vi">Đang suy nghĩ…</p>
        )}
        {error && (
          <p className="text-red-500 text-sm font-vi">{error}</p>
        )}
        {feedback && (
          <p className="text-gray-700 font-vi leading-relaxed whitespace-pre-wrap">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
