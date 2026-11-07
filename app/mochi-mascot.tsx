type MochiMascotSize = "favicon" | "navbar" | "welcome" | "hero";

export function MochiMascot({
  size = "navbar",
  title,
}: {
  size?: MochiMascotSize;
  title?: string;
}) {
  return (
    <svg
      className={`mochi-mascot mochi-mascot-${size}`}
      viewBox="0 0 64 64"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M32.1 5.2c3.1 0 5.8 2.4 6.7 5.3 7.7-2 15.9 2.3 18.4 9.8 1.1 3.2.9 6.4-.2 9.1 2.2 2.1 3.5 5 3.5 8.3 0 6.5-4.9 11.8-11.2 12.5-3.1 6-9.2 9.8-16.2 9.8-7 0-13.1-3.8-16.2-9.8C10.6 49.5 5.7 44.2 5.7 37.7c0-3.3 1.3-6.2 3.5-8.3-1.1-2.7-1.3-5.9-.2-9.1 2.5-7.5 10.7-11.8 18.4-9.8.9-2.9 3.6-5.3 6.7-5.3Z"
        fill="#FFF9EE"
        stroke="#D8E3D8"
        strokeWidth="2"
      />
      <path d="M28.1 8.2c-2.4-4.3-1.1-6.4 2.2-5.2 2.1.8 3.1 2.6 3.1 5.1" fill="#FFF9EE" />
      <path d="M31.8 4.7c3.2-3.1 6.2-2.4 5.4.3-.5 1.8-2.1 2.9-4.3 3.3" fill="#DDE9DC" />
      <path d="M28.1 8.2c-2.4-4.3-1.1-6.4 2.2-5.2 2.1.8 3.1 2.6 3.1 5.1M31.8 4.7c3.2-3.1 6.2-2.4 5.4.3-.5 1.8-2.1 2.9-4.3 3.3" stroke="#D8E3D8" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="22" cy="33" rx="2.3" ry="3" fill="#24382F" />
      <ellipse cx="42" cy="33" rx="2.3" ry="3" fill="#24382F" />
      <ellipse cx="15.4" cy="38.4" rx="4" ry="2.2" fill="#E9B7AD" fillOpacity=".72" />
      <ellipse cx="48.6" cy="38.4" rx="4" ry="2.2" fill="#E9B7AD" fillOpacity=".72" />
      <path d="M28.3 39.1c1 1.4 2.2 2.1 3.7 2.1s2.7-.7 3.7-2.1" stroke="#24382F" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.3 20.7c2.4-2.1 5.1-2.9 8.1-2.3M38.6 18.4c3-.6 5.7.2 8.1 2.3" stroke="#E8ECDD" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
