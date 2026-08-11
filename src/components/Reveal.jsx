import useInView from "../hooks/useInView";

export default function Reveal({
  as: Tag = "div",
  variant = "reveal-up",
  delay = 0,
  threshold,
  className = "",
  children,
  ...rest
}) {
  const [ref, inView] = useInView(threshold === undefined ? {} : { threshold });

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${variant}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
