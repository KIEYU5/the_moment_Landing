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

/* The hero is a chain, and every length in it is asked of whatever owns that
   length rather than estimated.

   The opening is one phase, not three: the M is painted, the wordmark gathers
   out of its facets and the navigation arrives, all on the same cue. Holding
   the nav back until the mark had settled was costing 1.2s before the colour
   swap could even begin.

   The swap then waits on whichever of the two is still going. */
const MARK_AT = 140;
const NAV_AT = MARK_AT;
const MARK_RUNS = Math.max(BRUSH_RUNS, WORDMARK_RUNS);
const NAV_RUNS = 3 * BEAT + REVEAL_RUNS; // last link's stagger plus its travel
const INVERT_AT = Math.max(MARK_AT + MARK_RUNS, NAV_AT + NAV_RUNS);
const DOTS_AT = INVERT_AT + INVERT_RUNS;

export const HERO = {
  mark: MARK_AT,
  nav: NAV_AT,
  invert: INVERT_AT,
  dots: DOTS_AT,
  ends: DOTS_AT + DOTS_RUNS,
};
