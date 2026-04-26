export const IDENTITY_LINES = [
  "You're someone who is showing up.",
  "Small steps count.",
  "Consistency beats intensity.",
  "You don't need to do everything — just something.",
  "Showing up is the practice.",
  "Today is enough.",
  "The work is in the noticing.",
  "You're allowed to begin again.",
];

export function identityLineFor(userId: string, dateIso: string): string {
  const seed = (userId + dateIso)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return IDENTITY_LINES[seed % IDENTITY_LINES.length];
}
