export function formatStat(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatSigned(value: number): string {
  return value > 0 ? `+${formatStat(value)}` : formatStat(value);
}
