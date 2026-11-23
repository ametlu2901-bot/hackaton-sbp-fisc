export const MONEDA = new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const MONEDA_2 = new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const NUMERO = new Intl.NumberFormat("es");

export const PORCENTAJE = new Intl.NumberFormat("es", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 1,
});

/** 12345 -> "12.3k" para ejes y etiquetas compactas. */
export function compacto(valor) {
  return `$${(valor / 1000).toFixed(1)}k`;
}
