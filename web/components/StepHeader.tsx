import { Markdown } from "./Markdown";

export function StepHeader({
  prompt,
  helperText,
  body,
}: {
  prompt: string;
  helperText?: string | null;
  body?: string | null;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 leading-snug">{prompt}</h2>
      {helperText ? (
        <p className="text-sm text-ink-muted mb-3 italic">{helperText}</p>
      ) : null}
      {body ? <Markdown source={body} /> : null}
    </div>
  );
}
