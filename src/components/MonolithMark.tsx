interface Props {
  size?: number;
}

export default function MonolithMark({ size = 22 }: Props) {
  const height = Math.round(size * 1.65);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 56 92"
      aria-hidden="true"
      style={{
        display: "block",
        filter: "drop-shadow(0 0 7px rgba(249,115,22,0.45))",
      }}
    >
      <polygon points="28,4 15,18 12,76 28,90" fill="#f4c15d" />
      <polygon points="28,4 41,18 44,76 28,90" fill="#ecb24a" />
      <rect x="25.5" y="7" width="5" height="80" rx="1.5" fill="#fff0c9" />
      <rect x="23.2" y="7" width="1.1" height="80" rx="0.5" fill="#ea580c" />
      <rect x="31.7" y="7" width="1.1" height="80" rx="0.5" fill="#ea580c" />
    </svg>
  );
}
