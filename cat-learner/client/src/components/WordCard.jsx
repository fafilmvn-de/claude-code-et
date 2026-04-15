export function WordCard({ word, meaning, emoji }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <span className="text-8xl" role="img" aria-label={meaning}>{emoji}</span>
      <p className="text-4xl font-bold text-orange-700 font-vi tracking-wide">{word}</p>
      <p className="text-lg text-gray-500 italic">{meaning}</p>
    </div>
  );
}
