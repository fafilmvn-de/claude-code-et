import { MiuAvatar } from './ui/MiuAvatar.jsx';

export function AITutor({ feedback, loading, error }) {
  if (!feedback && !loading && !error) return null;

  return (
    <div className="mt-6 flex gap-3 items-start bg-ds-accent-sub border border-ds-border rounded-2xl p-4 animate-fadeIn">
      <div className="relative shrink-0">
        <MiuAvatar size={44} />
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-ds-accent rounded-full border-2 border-ds-bg shadow-[0_0_5px_var(--ds-accent)]" />
      </div>
      <div className="flex-1">
        <p className="font-mono text-ds-accent-lt text-[10px] tracking-widest uppercase mb-1">
          Miu · AI Tutor
        </p>
        {loading && (
          <p className="text-ds-text-muted animate-pulse font-vi">Đang suy nghĩ…</p>
        )}
        {error && (
          <p className="text-ds-error text-sm font-vi">{error}</p>
        )}
        {feedback && (
          <p className="text-ds-text font-vi leading-relaxed whitespace-pre-wrap text-sm">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
