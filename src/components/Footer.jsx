import Faceted from "./Faceted";
import Reveal from "./Reveal";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Instagram", href: "#" },
];

const LEGAL_LINKS = [{ label: "Privacy Policy", href: "#" }];

const linkClass =
  "font-bold text-[#292b2f] text-label transition-colors duration-500 ease-out hover:text-[#4a80f8]";

export default function Footer() {
  return (
    <footer className="relative bg-[#fbfbfb] w-full">
      <div className="px-gutter py-section flex flex-col lg:flex-row lg:items-start lg:justify-between gap-block">
        <div>
          <Faceted as="p" className="font-bold text-[#292b2f] text-title">
            THE MOMENT
          </Faceted>
          <Faceted
            as="p"
            density="coarse"
            delay={140}
            className="font-bold text-[#555962] text-subtitle mt-4"
          >
            A development partner innovating the moment.
          </Faceted>
          <Faceted
            as="p"
            density="wide"
            delay={280}
            className="font-normal text-[#555962] text-caption mt-block"
          >
            © 2026 the_moment. All rights reserved.
          </Faceted>
        </div>

        <Reveal delay={140} className="flex gap-block">
          <div className="flex flex-col gap-stack">
            <Faceted
              as="p"
              density="wide"
              className="font-normal text-[#555962] text-caption"
            >
              SOCIAL
            </Faceted>
            <div className="flex flex-col gap-stack">
              {SOCIAL_LINKS.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-stack">
            <Faceted
              as="p"
              density="wide"
              className="font-normal text-[#555962] text-caption"
            >
              LEGAL
            </Faceted>
            <div className="flex flex-col gap-stack">
              {LEGAL_LINKS.map((link) => (
                <a key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
