"use client";

type Inputs = {
  loggedMood: boolean;
  wroteJournal: boolean;
  loggedPhysical: boolean;
};

function buildLine({ loggedMood, wroteJournal, loggedPhysical }: Inputs): string | null {
  const parts: string[] = [];
  if (wroteJournal) {
    parts.push("wrote something down");
  } else if (loggedMood) {
    parts.push("logged your mood");
  }
  if (loggedPhysical) parts.push("moved your body");
  if (parts.length === 0) return null;
  if (parts.length === 1) return `You showed up today: ${parts[0]}.`;
  if (parts.length === 2) return `You showed up today: ${parts[0]} and ${parts[1]}.`;
  return `You showed up today: ${parts[0]}, ${parts[1]}, and ${parts[2]}.`;
}

export default function ShowedUpToday(props: Inputs) {
  const line = buildLine(props);
  if (!line) return null;
  return (
    <div className="text-sm text-ink-secondary text-center mt-2">
      {line}
    </div>
  );
}
