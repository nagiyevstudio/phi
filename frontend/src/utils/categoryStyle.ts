const fallbackCategoryColor = '#9CA3AF';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function getCategoryStyle(color: string | null, isActive: boolean) {
  const baseColor = color || fallbackCategoryColor;
  const rgb = hexToRgb(baseColor);
  const backgroundColor =
    isActive && rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)` : 'transparent';
  return {
    borderColor: baseColor,
    color: baseColor,
    backgroundColor,
  };
}
