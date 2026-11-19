import { useEffect, useRef } from 'react';

/**
 * Press handlers for a +/- button: a tap calls `onTap`; holding it calls `onHold`
 * after a short delay and then repeats. Shift-click counts as a hold step.
 */
export function useRepeatPress(onTap: () => void, onHold: () => void) {
  const timers = useRef<number[]>([]);
  const held = useRef(false);
  const clear = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.forEach((t) => clearInterval(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      held.current = false;
      clear();
      timers.current.push(
        window.setTimeout(() => {
          held.current = true;
          onHold();
          timers.current.push(window.setInterval(onHold, 180));
        }, 450),
      );
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(), // long-press menu on phones
    onClick: (e: React.MouseEvent) => {
      if (held.current) return; // the hold already stepped
      if (e.shiftKey) onHold();
      else onTap();
    },
  };
}
