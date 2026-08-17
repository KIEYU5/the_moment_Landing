/* Stroke data only — kept out of the component so the hero can ask how
   long the painting takes without a component file exporting things that
   are not components. */
/* The blue M of "THE MOMENT" is a painted brush mark. Rather than wiping it
   in with a rectangle, the artwork is masked by three thick strokes traced
   along the centre of each gesture — left leg with its tail, the inner V,
   then the right leg — and each is drawn on with stroke-dashoffset so the
   mark appears the way it was painted.

   Coordinates follow the artwork's own 217.825 x 209.331 viewBox. Widths are
   set per stroke so the mask always covers the bristle spread at its widest
   without bleeding into the neighbouring gesture.

   Caps are butt, not round. A round cap puts a half disc of half the stroke
   width ahead of the tip, which reads as a blob leading the brush and reaches
   far enough sideways to pop the artwork's loose spatter flecks into view on
   their own. A flat cap is also simply what the edge of a brush looks like.
   The trailing L segments push each path past the artwork so the flat cap
   still clears the tail once the stroke is fully drawn. */
export const STROKES = [
  {
    d: "M106 0 C 106 30 100 55 76 88 C 55 117 28 155 0 185 L -18 204",
    width: 46,
    delay: 0,
    duration: 500,
  },
  {
    d: "M91 61 Q 103 95 115 124 Q 130 95 166 49",
    width: 58,
    delay: 400,
    duration: 540,
  },
  {
    d: "M186 0 C 184 25 172 45 173 76 C 174 110 180 145 206 206 L 216 230",
    width: 62,
    delay: 820,
    duration: 540,
  },
];

export const BRUSH_RUNS = Math.max(
  ...STROKES.map((s) => s.delay + s.duration),
);
