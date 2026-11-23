import { PORCENTAJE } from "../lib/format";

const trazo = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
};

const ICONOS = {
  Ventas: (
    <svg {...trazo}>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  Transacciones: (
    <svg {...trazo}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  ),
  "Ticket promedio": (
    <svg {...trazo}>
      <path d="M3 8h18v3a2 2 0 0 0 0 2v3H3v-3a2 2 0 0 0 0-2V8z" />
      <path d="M14 8v8" />
    </svg>
  ),
  Unidades: (
    <svg {...trazo}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </svg>
  ),
};

/** KPI con comparativo: dos barras (período actual vs anterior) con sus cifras. */
export default function Kpi({ titulo, valor, delta, acento, actual, previo, fmt }) {
  const sin = delta === null || delta === undefined || Number.isNaN(delta);
  const sube = !sin && delta >= 0;
  const maximo = Math.max(actual || 0, previo || 0) || 1;
  const anchoActual = ((actual || 0) / maximo) * 100;
  const anchoPrevio = ((previo || 0) / maximo) * 100;

  return (
    <article className="tarjeta kpi">
      <div className="kpi-fila">
        <span className="kpi-icono" style={{ color: acento, borderColor: acento }}>
          {ICONOS[titulo]}
        </span>
        <div className="kpi-texto">
          <span className="kpi-titulo">{titulo}</span>
          <strong className="kpi-valor">{valor ?? "—"}</strong>
        </div>
      </div>

      <div className="comparar">
        <div className="barra-fila">
          <span className="barra-etiqueta">Actual</span>
          <div className="barra-pista">
            <div className="barra-valor" style={{ width: `${anchoActual}%`, background: acento }} />
          </div>
          <span className="barra-num">{fmt ? fmt(actual) : actual}</span>
        </div>
        <div className="barra-fila">
          <span className="barra-etiqueta">Anterior</span>
          <div className="barra-pista">
            <div className="barra-valor previo" style={{ width: `${anchoPrevio}%` }} />
          </div>
          <span className="barra-num">{fmt ? fmt(previo) : previo}</span>
        </div>
      </div>

      <span className={`kpi-delta ${sin ? "" : sube ? "sube" : "baja"}`}>
        {sin ? "Sin comparativo" : `${PORCENTAJE.format(delta)} vs período anterior`}
      </span>
    </article>
  );
}
