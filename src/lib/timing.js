import { BRUSH_RUNS } from "./brush";
import { WORDMARK_RUNS } from "./wordmark";

/* One clock for the whole page. Sections used to invent their own numbers —
   90 here, 120 there, 140 and 320 elsewhere — so nothing arrived on a shared
   rhythm. These are the only two intervals in use.

   BEAT  between one item and the next in the same run.
   GROUP between blocks that read as separate things within a section. */
export const BEAT = 90;
export const GROUP = 200;

/* i-th item of a run, optionally starting a group in. */
export const beat = (i, from = 0) => from + i * BEAT;

/* These three have to match index.css: the reveal transition, the colour
   swap, and the dots fading up. Nothing reads a stylesheet at runtime, so
   they are written down in both places. */
export const REVEAL_RUNS = 950;
export const INVERT_RUNS = 900;
export const DOTS_RUNS = 700;

/* The hero is a chain: each phase starts when the one before it has finished,
   and every length is asked of whatever owns it rather than estimated. The M
   and the wordmark count as one phase — they share a cue. */
const MARK_AT = 220;
const MARK_RUNS = Math.max(BRUSH_RUNS, WORDMARK_RUNS);
const NAV_AT = MARK_AT + MARK_RUNS;
const NAV_RUNS = 3 * BEAT + REVEAL_RUNS; // last link's stagger plus its travel
const INVERT_AT = NAV_AT + NAV_RUNS;
const DOTS_AT = INVERT_AT + INVERT_RUNS;

export const HERO = {
  mark: MARK_AT,
  nav: NAV_AT,
  invert: INVERT_AT,
  dots: DOTS_AT,
  ends: DOTS_AT + DOTS_RUNS,
};
