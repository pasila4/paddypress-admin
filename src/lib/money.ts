export function toNumberOrNull(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function formatBagSizeLabel(
  bagSize: 'KG_40' | 'KG_75' | 'KG_100',
): string {
  switch (bagSize) {
    case 'KG_40':
      return '40 kg';
    case 'KG_75':
      return '75 kg';
    case 'KG_100':
      return '100 kg';
  }
}
