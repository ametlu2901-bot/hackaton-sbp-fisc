// Paleta validada (skill dataviz, references/palette.md). No cambiar los hex sin
// volver a correr scripts/validate_palette.js.
export const PALETA = {
  light: {
    surface: "#fcfcfb",
    fondo: "#f4f4f2",
    texto: "#0b0b0b",
    texto2: "#52514e",
    muted: "#8a8984",
    grid: "#e6e5e1",
    series: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"],
  },
  dark: {
    surface: "#1a1a19",
    fondo: "#0f0f0e",
    texto: "#f0efec",
    texto2: "#c3c2b7",
    muted: "#8f8e86",
    grid: "#2c2c29",
    series: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#0ca30c", "#9085e9", "#e66767"],
  },
};

/** Convierte #rrggbb + alfa a rgba(). */
export function conAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}
