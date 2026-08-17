/* One clock for the whole page. Sections used to invent their own numbers —
   90 here, 120 there, 140 and 320 elsewhere — so nothing arrived on a shared
   rhythm. These are the only two intervals in use.

   BEAT  between one item and the next in the same run.
   GROUP between blocks that read as separate things within a section. */
export const BEAT = 90;
export const GROUP = 200;

/* i-th item of a run, optionally starting a group in. */
export const beat = (i, from = 0) => from + i * BEAT;

/* The hero runs on its own, longer clock: the M and the wordmark are one
   event and the navigation waits for it to finish. How long that event takes
   is asked of the components themselves — see Hero. */
export const HERO_MARK = 220;
