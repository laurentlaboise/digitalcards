/** Orange squircle + white scribble. Sister lao.services magenta is never used here. */
export default function TapCardMark({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#FF5722" />
      <path
        d="M8.5 19.2c1.2-5.4 4.2-8.6 8.1-8.4 3.4.2 5.4 2.8 5.1 5.6-.3 3.2-3.2 4.8-6.1 4.2 2.8 1.6 6.8.8 9.2-1.8"
        stroke="#FFFFFF"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 22.4c2.4 1.1 5.6 1.3 8.4.2"
        stroke="#FFFFFF"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
