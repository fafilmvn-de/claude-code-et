import { useState } from 'react';
import { HowToUse }     from './components/HowToUse.jsx';
import { TypingModule } from './components/TypingModule.jsx';
import { StoryStudio }  from './components/StoryStudio.jsx';
import { MiuAvatar }    from './components/ui/MiuAvatar.jsx';

const TABS = ['guide', 'typing', 'story'];
const TAB_LABELS = {
  guide:  '📖 Hướng dẫn',
  typing: '⌨️ Gõ phím',
  story:  '✍️ Viết văn',
};

export default function App() {
  const [tab, setTab] = useState('guide');
  return (
    <div className="min-h-screen bg-ds-bg font-vi">
      <header
        className="border-b border-ds-border px-6 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(180deg, #0f0e1a, #08090f)' }}
      >
        <MiuAvatar size={32} />
        <h1 className="font-mono text-ds-text font-bold tracking-widest text-sm uppercase">CatLearner</h1>
        <nav
          className="ml-auto flex gap-1 bg-white/[0.03] border border-ds-border rounded-xl p-1"
          role="tablist"
          aria-label="App sections"
        >
          {TABS.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200
                ${tab === t
                  ? 'bg-gradient-to-br from-ds-accent/30 to-ds-accent/10 border border-ds-border text-ds-accent-lt shadow-[0_0_12px_rgba(108,99,255,0.2)]'
                  : 'text-ds-text-muted hover:text-ds-text hover:bg-white/5'}`}
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
