import { type FC, type SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
}

const Spinner: FC<Props> = ({ width = 25 }, props) => (
  <svg
    width={width}
    className="spinner animate-spin"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <linearGradient
        id="a"
        x1="0%"
        x2="100%"
        y1="0%"
        y2="0%"
        gradientTransform="rotate(20)"
      >
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#fbcfe8" />
      </linearGradient>
    </defs>
    <path
      fill="none"
      stroke="url(#a)"
      strokeLinecap="round"
      strokeWidth={10}
      d="M50 10a40 40 0 1 0 40 40"
    />
  </svg>
);
export default Spinner;
