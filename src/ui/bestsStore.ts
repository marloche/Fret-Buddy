// Shared, saved personal bests. One store each, so every card on screen sees the same values.
import type { Bests } from '../logic/bests';
import { sharedStored } from '../store';

/** Drill id → fastest BPM marked clean. */
export const useDrillBests = sharedStored<Bests>('bests', {});
/** Chord pair → most changes in a minute. */
export const useChangeBests = sharedStored<Bests>('changes', {});
