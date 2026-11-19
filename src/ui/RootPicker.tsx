import { ROOTS } from '../theory/notes';

/** 12 root buttons, in two rows of six on phones. */
export function RootPicker({ value, onChange, label }: { value: number; onChange: (pc: number) => void; label: string }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="seg roots" role="group" aria-label={label}>
        {ROOTS.map((r) => (
          <button key={r.pc} className={value === r.pc ? 'on' : ''} aria-pressed={value === r.pc} onClick={() => onChange(r.pc)}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
