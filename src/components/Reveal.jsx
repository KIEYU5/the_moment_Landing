import useInView from "../hooks/useInView";
import { useRevealGroup } from "../lib/revealGroup";

export default function Reveal({
  as: Tag = "div",
  variant = "reveal-up",
  delay = 0,
  threshold,
  className = "",
  children,
  ...rest
}) {
  /* A group above takes over the cue, and the element's own observer is not
     attached at all. */
  const group = useRevealGroup();
  const [ref, own] = useInView({
    enabled: group === null,
    ...(threshold === undefined ? {} : { threshold }),
  });
  const inView = group === null ? own : group;

  return (
    <Tag
      ref={ref}
      /* The stagger applies on the way in only, and there is no way out —
         the reveal fires once. */
      style={{ transitionDelay: inView && delay ? `${delay}ms` : "0ms" }}
      className={`${variant}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
