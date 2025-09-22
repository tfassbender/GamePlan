// Utility to determine if a color is light or dark
// Accepts hex color strings (e.g., "#123456")
export function isColorDark(hex: string): boolean {
  // Remove hash if present
  hex = hex.replace('#', '');
  // Parse r, g, b
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
  }
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  // Return true if dark
  return luminance < 128;
}

