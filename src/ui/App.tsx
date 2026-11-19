import { useEffect, useState, type ReactNode } from 'react';
import { MetronomeBar } from './MetronomeBar';
import { MetronomeProvider } from './MetronomeContext';
import { ChordsPage } from './pages/ChordsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { LearnPage } from './pages/LearnPage';
import { MetronomePage } from './pages/MetronomePage';
import { PracticePage } from './pages/PracticePage';
import { ScalesPage } from './pages/ScalesPage';
import { PracticeProvider } from './PracticeContext';
import { SessionChip } from './SessionChip';

interface Route {
  id: string;
  label: string;
  /** Label for the phone tab bar, where space is tight. */
  short?: string;
  render: (sub?: string) => ReactNode;
}

const ROUTES: Route[] = [
  { id: 'metronome', label: 'Metronome', short: 'Tempo', render: () => <MetronomePage /> },
  { id: 'chords', label: 'Chords', render: () => <ChordsPage /> },
  { id: 'scales', label: 'Scales', render: () => <ScalesPage /> },
  { id: 'exercises', label: 'Drills', render: () => <ExercisesPage /> },
  { id: 'learn', label: 'Learn', render: (sub) => <LearnPage sub={sub} /> },
  { id: 'practice', label: 'Practice', render: () => <PracticePage /> },
];

// Hash routing (#/learn/intervals): reload keeps your page, the back button works,
// and it needs no server config on GitHub Pages.
function useRoute(): { route: Route; sub?: string } {
  const read = () => location.hash.replace(/^#\/?/, '');
  const [hash, setHash] = useState(read);
  useEffect(() => {
    const on = () => {
      setHash(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const [id, sub] = hash.split('/');
  return { route: ROUTES.find((r) => r.id === id) ?? ROUTES[0], sub };
}

export function App() {
  const { route, sub } = useRoute();
  return (
    <MetronomeProvider>
      <PracticeProvider>
        <div className="app">
          <header className="top">
            <span className="brand">Fret Buddy</span>
            <nav className="tabs" aria-label="Sections">
              {ROUTES.map((r) => (
                <a key={r.id} href={`#/${r.id}`} className={r === route ? 'on' : ''} aria-current={r === route ? 'page' : undefined}>
                  <span className="long">{r.label}</span>
                  <span className="short">{r.short ?? r.label}</span>
                </a>
              ))}
            </nav>
          </header>
          <main>{route.render(sub)}</main>
          <footer className="bottom">
            {route.id !== 'practice' && <SessionChip />}
            <MetronomeBar />
          </footer>
        </div>
      </PracticeProvider>
    </MetronomeProvider>
  );
}
