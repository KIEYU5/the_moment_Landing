import useInView from "../hooks/useInView";

/* "THE MOMENT" minus the M — the M is the blue brush stroke drawn by the
   Union logo, which sits in the gap between "THE" and "OMENT". Paths are
   inlined rather than loaded as an <img> so each letter can be animated. */
const LETTERS = [
  "M0 28.6371V2.1371H126.788V28.6371H79.3229V156.863H47.4655V28.6371H0Z",
  "M146.673 156.863V2.1371H178.744V66.25H245.88V2.1371H278.165V156.863H245.88V92.75H178.744V156.863H146.673Z",
  "M304.249 156.863V2.1371H408.16V28.6371H336.321V66.25H402.815V92.75H336.321V130.363H408.374V156.863H304.249Z",
  "M818.673 79.5C818.673 129.935 787.243 159 746.405 159C705.14 159 673.924 129.722 673.924 79.5C673.924 29.0645 705.14 0 746.405 0C787.243 0 818.673 29.0645 818.673 79.5ZM785.96 79.5C785.96 46.375 770.352 28.4234 746.405 28.4234C722.459 28.4234 706.637 46.375 706.637 79.5C706.637 112.625 722.459 130.577 746.405 130.577C770.352 130.577 785.96 112.625 785.96 79.5Z",
  "M841.764 2.1371H881.532L924.508 107.069H926.218L969.194 2.1371H1008.96V156.863H977.746V55.5645H976.463L936.053 156.222H914.673L874.263 55.1371H872.98V156.863H841.764V2.1371Z",
  "M1035.05 156.863V2.1371H1138.96V28.6371H1067.12V66.25H1133.61V92.75H1067.12V130.363H1139.17V156.863H1035.05Z",
  "M1293.11 2.1371V156.863H1265.32L1197.33 58.5564H1196.04V156.863H1163.97V2.1371H1192.2L1259.76 100.444H1261.26V2.1371H1293.11Z",
  "M1313.21 28.6371V2.1371H1440V28.6371H1392.53V156.863H1360.68V28.6371H1313.21Z",
];

export default function Wordmark({ delays = [], className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="THE MOMENT"
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 1440 159"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full ${className}`}
    >
      {LETTERS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="#292B2F"
          className={`wordmark-letter${inView ? " is-in" : ""}`}
          style={delays[i] ? { transitionDelay: `${delays[i]}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
