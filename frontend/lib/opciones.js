// Constructores de opciones de ECharts. Reciben la paleta del tema activo,
// así que cada gráfico se repinta bien en claro y en oscuro.
import { MONEDA, NUMERO, compacto } from "./format";
import { conAlfa } from "./paleta";

const base = {
  animationDuration: 600,
  animationEasing: "cubicOut",
};

export function opcionLinea(p, diarias) {
  const fechas = diarias.map((d) => d.fecha);
  const ventas = diarias.map((d) => d.total);
  const promedio = ventas.map((_, i) => {
    const tramo = ventas.slice(Math.max(0, i - 6), i + 1);
    return Number((tramo.reduce((a, b) => a + b, 0) / tramo.length).toFixed(2));
  });

  return {
    ...base,
    legend: {
      top: 0,
      right: 0,
      itemWidth: 14,
      itemHeight: 3,
      textStyle: { color: p.texto2, fontSize: 12 },
      data: ["Ventas diarias", "Promedio móvil 7 días"],
    },
    grid: { left: 8, right: 28, top: 40, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.texto },
      axisPointer: { type: "line", lineStyle: { color: p.muted, type: "dashed" } },
      // Se muestra arriba de la curva para no tapar los datos
      position: (pt) => [pt[0] + 14, 44],
      valueFormatter: (v) => MONEDA.format(v),
    },
    xAxis: {
      type: "category",
      data: fechas,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.muted, hideOverlap: true, formatter: (f) => f.slice(5) },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: p.grid } },
      axisLabel: { color: p.muted, formatter: (v) => compacto(v) },
    },
    series: [
      {
        name: "Ventas diarias",
        type: "line",
        smooth: false,
        symbol: "circle",
        symbolSize: 4,
        showSymbol: false,
        emphasis: { focus: "series", scale: true },
        data: ventas,
        lineStyle: { width: 2, color: p.series[0] },
        itemStyle: { color: p.series[0] },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: conAlfa(p.series[0], 0.3) },
              { offset: 1, color: conAlfa(p.series[0], 0) },
            ],
          },
        },
      },
      {
        name: "Promedio móvil 7 días",
        type: "line",
        smooth: false,
        symbol: "none",
        data: promedio,
        lineStyle: { width: 2, type: "dashed", color: p.muted },
        itemStyle: { color: p.muted },
      },
    ],
  };
}

export function opcionSucursales(p, sucursales) {
  return {
    ...base,
    grid: { left: 8, right: 8, top: 28, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.texto },
      axisPointer: { type: "shadow", shadowStyle: { color: conAlfa(p.series[0], 0.08) } },
      valueFormatter: (v) => MONEDA.format(v),
    },
    xAxis: {
      type: "category",
      data: sucursales.map((s) => s.sucursal),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: p.grid } },
      axisLabel: { color: p.texto2 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: p.grid } },
      axisLabel: { color: p.muted, formatter: (v) => compacto(v) },
    },
    series: [
      {
        type: "bar",
        barWidth: "45%",
        data: sucursales.map((s) => s.total),
        itemStyle: { color: p.series[0], borderRadius: 0 },
        label: {
          show: true,
          position: "top",
          color: p.texto2,
          fontSize: 12,
          formatter: ({ value }) => compacto(value),
        },
      },
    ],
  };
}

export function opcionProductos(p, productos) {
  const orden = [...productos].reverse();
  return {
    ...base,
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.texto },
      axisPointer: { type: "shadow", shadowStyle: { color: conAlfa(p.series[2], 0.08) } },
      valueFormatter: (v) => MONEDA.format(v),
    },
    xAxis: { type: "value", show: false, splitLine: { show: false } },
    yAxis: {
      type: "category",
      data: orden.map((x) => x.producto),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: p.texto2 },
    },
    series: [
      {
        type: "bar",
        barWidth: 12,
        data: orden.map((x) => x.total),
        itemStyle: { color: p.series[2], borderRadius: 0 },
        label: {
          show: true,
          position: "right",
          color: p.texto2,
          fontSize: 12,
          formatter: ({ value }) => compacto(value),
        },
      },
    ],
  };
}

export function opcionDona(p, canales) {
  const total = canales.reduce((s, c) => s + c.total, 0);
  return {
    ...base,
    color: p.series,
    tooltip: {
      trigger: "item",
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.texto },
      valueFormatter: (v) => MONEDA.format(v),
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: compacto(total),
          fill: p.texto,
          font: "500 14px ui-monospace, Consolas, monospace",
          textAlign: "center",
        },
      },
    ],
    series: [
      {
        type: "pie",
        radius: ["62%", "84%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        itemStyle: { borderColor: p.surface, borderWidth: 2 },
        emphasis: { scale: true, scaleSize: 4 },
        data: canales.map((c) => ({ name: c.canal, value: c.total })),
      },
    ],
  };
}

export function opcionSpark(p, serie, color) {
  return {
    animation: false,
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    tooltip: { show: false },
    xAxis: { type: "category", show: false, boundaryGap: false, data: serie.map((_, i) => i) },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        data: serie,
        lineStyle: { width: 2, color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: conAlfa(color, 0.22) },
              { offset: 1, color: conAlfa(color, 0) },
            ],
          },
        },
      },
    ],
  };
}

/** Mini barras: un día por barra; el último día va resaltado con el color del KPI. */
export function opcionBarrasMini(p, serie, color) {
  const ultimo = serie.length - 1;
  return {
    animation: false,
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    tooltip: { show: false },
    xAxis: { type: "category", show: false, data: serie.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: 0 },
    series: [
      {
        type: "bar",
        barCategoryGap: "32%",
        data: serie.map((v, i) => ({
          value: v,
          itemStyle: {
            color: i === ultimo ? color : conAlfa(color, 0.32),
            borderRadius: 0,
          },
        })),
      },
    ],
  };
}

export { NUMERO };
