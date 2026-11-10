/**
 * #21 Letters bounce up one after another on hover (parent needs `group`-less
 * hover: the CSS targets `a:hover .split-hover span`). Devanagari is left whole.
 */
export function SplitHover({ text }: { text: string }) {
  if (/[ऀ-ॿ]/.test(text)) return <>{text}</>;
  return (
    <span className="split-hover" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden style={{ transitionDelay: `${i * 22}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
