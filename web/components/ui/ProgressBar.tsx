export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-bg-card-sand rounded-full overflow-hidden">
      <div
        className="h-full bg-accent-sage transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
