import { renderTab, type TabNote } from '../theory/tab';

/** Monospace tab. Wraps into short lines; each line scrolls sideways on its own if it must. */
export function TabView({ notes, groupSize, label }: { notes: TabNote[]; groupSize?: number; label: string }) {
  const systems = renderTab(notes, { groupSize: groupSize ?? 4, perLine: (groupSize ?? 4) * 4 });
  return (
    <div className="tab-view" role="img" aria-label={`Tab: ${label}`}>
      {systems.map((lines, i) => (
        <pre key={i}>{lines.join('\n')}</pre>
      ))}
    </div>
  );
}
