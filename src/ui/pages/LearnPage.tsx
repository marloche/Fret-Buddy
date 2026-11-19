import { Fragment, type ReactNode } from 'react';
import { LESSONS, lessonById, type Block } from '../../data/lessons';
import { buildChord, buildScale, qualityById, scaleTypeById } from '../../theory/build';
import { parseNote, pcOf } from '../../theory/notes';
import { voicingsFor } from '../../theory/voicings';
import { ChordDiagram } from '../ChordDiagram';
import { Fretboard } from '../Fretboard';
import { TabView } from '../TabView';

/** Lesson list, or one lesson when the URL is #/learn/<id>. */
export function LearnPage({ sub }: { sub?: string }) {
  const lesson = sub ? lessonById(sub) : undefined;
  if (!lesson) {
    return (
      <div className="page">
        {LESSONS.map((l, i) => (
          <a key={l.id} className="card lesson-link" href={`#/learn/${l.id}`}>
            <span className="lesson-num">{i + 1}</span>
            <span>
              <strong>{l.title}</strong>
              <span className="muted small lesson-summary">{l.summary}</span>
            </span>
          </a>
        ))}
      </div>
    );
  }
  const idx = LESSONS.indexOf(lesson);
  const next = LESSONS[idx + 1];
  return (
    <div className="page">
      <article className="card lesson">
        <a className="back" href="#/learn">
          ← All lessons
        </a>
        <h2 className="lesson-title">{lesson.title}</h2>
        {lesson.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
        {next && (
          <a className="next-lesson" href={`#/learn/${next.id}`}>
            Next: {next.title} →
          </a>
        )}
      </article>
    </div>
  );
}

/** Very small inline formatter: **bold** only. */
function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case 'h':
      return <h3 className="lesson-h">{b.text}</h3>;
    case 'p':
      return <p>{rich(b.text)}</p>;
    case 'tip':
      return <p className="tip">{rich(b.text)}</p>;
    case 'list': {
      const items = b.items.map((t) => <li key={t}>{rich(t)}</li>);
      return b.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case 'tab':
      return (
        <figure className="lesson-fig">
          <TabView notes={b.notes} groupSize={b.groupSize} label={b.caption ?? 'example'} />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    case 'chord': {
      const pc = pcOf(parseNote(b.root));
      const chord = buildChord(pc, qualityById(b.quality));
      const voicing = voicingsFor(pc, b.quality)[b.voicing ?? 0];
      return (
        <figure className="lesson-fig chord-fig">
          <ChordDiagram voicing={voicing} chord={chord} />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    }
    case 'scale': {
      const built = buildScale(pcOf(parseNote(b.root)), scaleTypeById(b.scale));
      return (
        <figure className="lesson-fig">
          <Fretboard built={built} labels={b.labels ?? 'names'} maxFret={b.maxFret ?? 12} />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    }
    case 'table':
      return (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.join()}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
