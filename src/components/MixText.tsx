/** Arabic text with embedded formulas: every run that is not Arabic and contains a digit or operator is isolated LTR. */
export default function MixText({ text }: { text: string }) {
  const parts = text.split(/([؀-ۿ][؀-ۿ\s،:؛.]*[؀-ۿ:]?)/);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (/[؀-ۿ]/.test(p) || !/[0-9=×+−^·δ]/.test(p)) return <span key={i}>{p}</span>;
        const lead = p.match(/^\s*/)![0], trail = p.match(/\s*[،.]?\s*$/)![0];
        const core = p.slice(lead.length, p.length - trail.length);
        return <span key={i}>{lead}<bdi dir="ltr">{core}</bdi>{trail}</span>;
      })}
    </>
  );
}
