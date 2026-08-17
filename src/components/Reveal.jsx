import useInView from "../hooks/useInView";

export default function Reveal({
  as: Tag = "div",
  variant = "reveal-up",
  delay = 0,
  threshold,
  once = false,
  className = "",
  children,
  ...rest
}) {
  const [ref, inView] = useInView({
    once,
    ...(threshold === undefined ? {} : { threshold }),
  });

  return (
    <Tag
      ref={ref}
      /* The stagger applies on the way in only. Leaving it set would hold the
         rearm behind the delay, so a quick scroll back could catch the reset
         happening on screen. */
      style={{ transitionDelay: inView && delay ? `${delay}ms` : "0ms" }}
      className={`${variant}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
