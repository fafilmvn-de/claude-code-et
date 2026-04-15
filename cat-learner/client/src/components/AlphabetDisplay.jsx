import { ALPHABET } from '../data/vietnameseData.js';

export function AlphabetDisplay() {
  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-orange-500 font-vi">
        🐱 Bảng chữ cái tiếng Việt
      </h2>
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 max-w-2xl mx-auto">
        {ALPHABET.map(({ letter, label }) => (
          <div
            key={letter}
            className="flex flex-col items-center justify-center bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-3 hover:bg-yellow-100 transition-colors cursor-default select-none"
          >
            <span className="text-4xl font-bold text-orange-600 font-vi leading-none">
              {letter}
            </span>
            <span className="text-xs text-gray-500 mt-1 font-vi">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
