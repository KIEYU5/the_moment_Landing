import Reveal from "./Reveal";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Instagram", href: "#" },
];

const LEGAL_LINKS = [{ label: "Privacy Policy", href: "#" }];

const linkClass =
  "font-bold text-[#292b2f] text-label transition-colors duration-300 hover:text-[#4a80f8]";

export default function Footer() {
  return (
    <footer className="relative bg-[#fbfbfb] w-full">
      <div className="max-w-[1440px] mx-auto px-10 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
        <Reveal>
          <p className="font-bold text-[#292b2f] text-title">THE MOMENT</p>
          <p className="font-bold text-[#555962] text-subtitle mt-4">
            A development partner innovating the moment.
          </p>
          <p className="font-normal text-[#555962] text-caption mt-12 lg:mt-[152px]">
            © 2026 the_moment. All rights reserved.
          </p>
        </Reveal>

        <Reveal delay={140} className="flex gap-16 sm:gap-20">
          <div className="flex flex-col gap-6 sm:gap-20">
            <p className="font-normal text-[#555962] text-caption">SOCIAL</p>
            <div className="flex flex-col gap-4 sm:gap-6">
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

          <div className="flex flex-col gap-6 sm:gap-20">
            <p className="font-normal text-[#555962] text-caption">LEGAL</p>
            <div className="flex flex-col gap-4 sm:gap-6">
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
