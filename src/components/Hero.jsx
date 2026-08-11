import theMomentWordmark from "../assets/the-moment-wordmark.svg";
import unionLogo from "../assets/union-logo.svg";

const NAV_LINKS = ["About", "Work", "SERVICE", "Contact"];

export default function Hero() {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto aspect-[1440/810] overflow-hidden bg-white">
      <nav className="absolute top-[2.5%] left-1/2 -translate-x-1/2 flex items-center gap-[clamp(16px,3.3vw,48px)] whitespace-nowrap">
        {NAV_LINKS.map((link) => (
          <p
            key={link}
            className="text-[#292b2f] text-[clamp(10px,1.1vw,16px)] font-light"
          >
            {link}
          </p>
        ))}
      </nav>

      <div className="absolute left-0 top-[76.5%] w-full h-[19.6%]">
        <img
          src={theMomentWordmark}
          alt="THE MOMENT"
          className="block w-full h-full"
        />
      </div>

      <div className="absolute left-[30.5%] top-[73.9%] w-[15.1%] h-[25.8%]">
        <img src={unionLogo} alt="" className="block w-full h-full" />
      </div>
    </section>
  );
}
