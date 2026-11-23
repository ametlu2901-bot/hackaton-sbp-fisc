"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

/**
 * Envoltura de ECharts. Si no se pasa `height`, el gráfico llena el contenedor
 * (útil para el layout de una sola pantalla). Con `height`, usa esa altura fija.
 */
export default function Chart({ option, height, etiqueta }) {
  const contenedor = useRef(null);
  const instancia = useRef(null);

  useEffect(() => {
    const chart = echarts.init(contenedor.current, null, { renderer: "canvas" });
    instancia.current = chart;
    const observador = new ResizeObserver(() => chart.resize());
    observador.observe(contenedor.current);
    return () => {
      observador.disconnect();
      chart.dispose();
      instancia.current = null;
    };
  }, []);

  useEffect(() => {
    if (instancia.current && option) {
      instancia.current.setOption(option, true);
    }
  }, [option]);

  return (
    <div
      className="chart-wrap"
      style={height ? { height } : undefined}
      role="img"
      aria-label={etiqueta}
    >
      <div ref={contenedor} className="chart-canvas" />
      {!option && <div className="skel skel-full" aria-hidden="true" />}
    </div>
  );
}
