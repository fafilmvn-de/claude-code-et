// cat-learner/client/src/components/SessionResults.jsx

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

/**
 * Props:
 *   stats       {{ wpm, accuracy, elapsedMs, correctKeystrokes, totalKeystrokes, lessonTitle }}
 *   onRedo      {fn()} — retake the same lesson
 *   onContinue  {fn()} — go back to lesson picker
 */
export function SessionResults({ stats, onRedo, onContinue }) {
  const { wpm, accuracy, elapsedMs, correctKeystrokes, totalKeystrokes, lessonTitle } = stats;
  const stars = starsForAccuracy(accuracy);

  const encouragement =
    stars === 3 ? 'Xuất sắc! Miu rất tự hào!' :
    stars === 2 ? 'Làm tốt lắm! Cố thêm chút nữa nhé!' :
    stars === 1 ? 'Cố gắng lên! Bạn sẽ giỏi hơn!' :
                  'Đừng nản! Luyện tập thêm nhé!';

  return (
    <div className="max-w-lg mx-auto text-center py-8 space-y-6">
      {/* Stars */}
      <div>
        <p className="text-orange-400 font-bold text-xl font-vi mb-3">{encouragement}</p>
        <div
          className="flex justify-center gap-3 text-5xl"
          aria-label={`${stars} sao`}
        >
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? 'opacity-100' : 'opacity-20'}>⭐</span>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2 font-vi">{lessonTitle}</p>
      </div>

      {/* Key metrics */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 p-6 space-y-1">
        <p className="text-gray-500 font-vi text-sm mb-3">Kết quả của bạn</p>
        <p className="text-5xl font-bold text-blue-500">
          {wpm}<span className="text-xl text-gray-400 font-normal"> wpm</span>
        </p>
        <p className="text-3xl font-bold text-green-500">
          {accuracy}%<span className="text-base text-gray-400 font-normal"> chính xác</span>
        </p>
      </div>

      {/* Detail row */}
      <div className="flex justify-center gap-8 text-sm font-vi text-gray-500">
        <div>
          <p className="font-bold text-gray-700">{formatTime(elapsedMs)}</p>
          <p>Thời gian</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">{totalKeystrokes}</p>
          <p>Số phím gõ</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">{correctKeystrokes}</p>
          <p>Phím đúng</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onRedo}
          className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-600 font-semibold font-vi hover:border-gray-400 transition-colors"
        >
          Làm lại
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-2.5 rounded-full bg-orange-400 text-white font-bold font-vi hover:bg-orange-500 transition-colors"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}
