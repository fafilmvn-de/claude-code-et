import { useState } from 'react';
import { HowToUse }      from './components/HowToUse.jsx';
import { TypingModule }  from './components/TypingModule.jsx';
import { StoryStudio }   from './components/StoryStudio.jsx';

const TABS = ['guide', 'typing', 'story'];
const TAB_LABELS = {
  guide:  '📖 Hướng dẫn',
  typing: '⌨️ Gõ phím',
  story:  '✍️ Viết văn',
};

export default function App() {
  const [tab, setTab] = useState('guide');
  return (
    <div className="min-h-screen bg-orange-50 font-vi">
      <header className="bg-orange-400 text-white py-4 px-6 flex items-center gap-3 shadow-md">
        <span className="text-4xl">🐾</span>
        <h1 className="text-2xl font-bold tracking-wide">CatLearner</h1>
        <nav className="ml-auto flex gap-2" role="tablist" aria-label="App sections">
          {TABS.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
                ${tab === t ? 'bg-white text-orange-500' : 'hover:bg-orange-300'}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div id="panel-guide" role="tabpanel" hidden={tab !== 'guide'}>
          {tab === 'guide' && <HowToUse />}
        </div>
        <div id="panel-typing" role="tabpanel" hidden={tab !== 'typing'}>
          {tab === 'typing' && <TypingModule />}
        </div>
        <div id="panel-story" role="tabpanel" hidden={tab !== 'story'}>
          {tab === 'story' && <StoryStudio />}
        </div>
      </main>
    </div>
  );
}
