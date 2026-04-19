function starsForAccuracy(accuracy) {
  if (accuracy >= 95) return 3;
  if (accuracy >= 80) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function SessionResults({ stats, onRedo, onContinue }) {
  const { wpm, accuracy, elapsedMs, correctKeystrokes, totalKeystrokes, lessonTitle } = stats;
  const stars = starsForAccuracy(accuracy);

  const encouragement =
    stars === 3 ? 'Xuất sắc! Miu rất tự hào!' :
    stars === 2 ? 'Làm tốt lắm! Cố thêm chút nữa nhé!' :
    stars === 1 ? 'Cố gắng lên! Bạn sẽ giỏi hơn!' :
                  'Đừng nản! Luyện tập thêm nhé!';

  return (
    <div className="max-w-lg mx-auto text-center py-8 space-y-6 animate-fadeIn">
      {/* SESSION_COMPLETE label */}
      <p className="font-mono text-ds-accent text-[10px] tracking-[3px] uppercase">
        // SESSION_COMPLETE
      </p>

      {/* Title */}
      <div>
        <p className="text-ds-text text-2xl font-bold font-vi mb-1">{lessonTitle}</p>
        <p className="text-ds-text-muted font-vi text-sm">{encouragement}</p>
      </div>

      {/* Stars */}
      <div
        className="flex justify-center gap-3 text-5xl"
        aria-label={`${stars} sao`}
      >
        {[1, 2, 3].map(i => (
          <span key={i} className={`text-ds-warn ${i <= stars ? 'opacity-100' : 'opacity-20'}`}>
            ★
          </span>
        ))}
      </div>

      {/* Key metrics */}
      <div className="flex justify-center gap-0 border border-ds-border rounded-2xl bg-ds-surface overflow-hidden">
        <div className="flex-1 py-5">
          <p className="font-mono text-ds-accent-lt text-3xl font-bold">{wpm}</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-[2px] uppercase mt-1">WPM</p>
        </div>
        <div className="w-px bg-ds-border" />
        <div className="flex-1 py-5">
          <p className="font-mono text-ds-correct text-3xl font-bold">{accuracy}%</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-[2px] uppercase mt-1">ACC</p>
        </div>
        <div className="w-px bg-ds-border" />
        <div className="flex-1 py-5">
          <p className="font-mono text-ds-accent-lt text-3xl font-bold">{formatTime(elapsedMs)}</p>
          <p className="font-mono text-ds-text-ghost text-[9px] tracking-[2px] uppercase mt-1">TIME</p>
        </div>
      </div>

      {/* Detail row */}
      <div className="flex justify-center gap-8 text-sm font-vi text-ds-text-muted">
        <div>
          <p className="font-bold text-ds-text">{totalKeystrokes}</p>
          <p>Số phím gõ</p>
        </div>
        <div>
          <p className="font-bold text-ds-text">{correctKeystrokes}</p>
          <p>Phím đúng</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onRedo}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-ds-text-muted font-semibold font-vi hover:text-ds-text hover:border-white/20 transition-colors"
        >
          ↩ Làm lại
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-2.5 rounded-xl text-white font-bold font-vi shadow-[0_0_16px_rgba(108,99,255,0.4)] hover:shadow-[0_0_24px_rgba(108,99,255,0.5)] transition-shadow"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}
