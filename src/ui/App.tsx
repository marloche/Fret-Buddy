import { useEffect, useState } from 'react';
import { MetronomeBar } from './MetronomeBar';
import { MetronomeProvider } from './MetronomeContext';
import { MetronomePage } from './pages/MetronomePage';

interface Route {
  id: string;
  label: string;
  /** Label for the phone tab bar, where space is tight. */
  short?: string;
  phase?: number; // not built yet: which phase brings it
}

const ROUTES: Route[] = [
  { id: 'metronome', label: 'Metronome', short: 'Tempo' },
  { id: 'chords', label: 'Chords', phase: 2 },
  { id: 'scales', label: 'Scales', phase: 2 },
  { id: 'exercises', label: 'Drills', phase: 3 },
  { id: 'learn', label: 'Learn', phase: 4 },
  { id: 'practice', label: 'Practice', phase: 4 },
];

// Hash routing: reload keeps your page, the back button works, and it needs no server config on GitHub Pages.
function useRoute(): string {
  const read = () => location.hash.replace(/^#\/?/, '') || 'metronome';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return ROUTES.some((r) => r.id === route) ? route : 'metronome';
}

export function App() {
  const route = useRoute();
  const current = ROUTES.find((r) => r.id === route)!;
  return (
    <MetronomeProvider>
      <div className="app">
        <header className="top">
          <span className="brand">Fret Buddy</span>
          <nav className="tabs" aria-label="Sections">
            {ROUTES.map((r) => (
              <a key={r.id} href={`#/${r.id}`} className={r.id === route ? 'on' : ''} aria-current={r.id === route ? 'page' : undefined}>
                <span className="long">{r.label}</span>
                <span className="short">{r.short ?? r.label}</span>
              </a>
            ))}
          </nav>
        </header>
        <main>
          {route === 'metronome' ? (
            <MetronomePage />
          ) : (
            <div className="page">
              <section className="card center">
                <h2>{current.label}</h2>
                <p className="muted">Coming in phase {current.phase}. The metronome below keeps playing while you look around.</p>
              </section>
            </div>
          )}
        </main>
        <footer className="bottom">
          <MetronomeBar />
        </footer>
      </div>
    </MetronomeProvider>
  );
}
