"use client";

import { useEffect, useMemo, useState } from "react";

import Chart from "../components/Chart";
import Chat from "../components/Chat";
import Kpi from "../components/Kpi";
import Topbar from "../components/Topbar";
import { MONEDA, MONEDA_2, NUMERO, compacto } from "../lib/format";
import { PALETA } from "../lib/paleta";
import { useTema } from "../lib/tema";
import {
  opcionDona,
  opcionLinea,
  opcionProductos,
  opcionBarrasMini,
  opcionSucursales,
} from "../lib/opciones";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TITULO = process.env.NEXT_PUBLIC_TITULO || "Dashboard de datos";
const RANGOS = [7, 30, 90, 180];

async function getJSON(ruta) {
  const r = await fetch(`${API}${ruta}`);
  if (!r.ok) throw new Error(ruta);
  return r.json();
}

const suma = (arr, campo) => arr.reduce((s, x) => s + (Number(x[campo]) || 0), 0);
const cambio = (actual, previo) => (previo ? (actual - previo) / previo : null);

export default function Home() {
  const tema = useTema();
  const p = PALETA[tema];

  const [rango, setRango] = useState(30);
  const [datos, setDatos] = useState(null);
  const [ia, setIa] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [error, setError] = useState("");
  const [agenteAbierto, setAgenteAbierto] = useState(false);
  const [vistaTendencia, setVistaTendencia] = useState("grafico");

  // Esc cierra el panel del agente
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === "Escape") setAgenteAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  useEffect(() => {
    Promise.all([
      getJSON("/api/ventas-diarias"),
      getJSON("/api/por-sucursal"),
      getJSON("/api/top-productos"),
      getJSON("/api/por-canal"),
      getJSON("/api/health"),
    ])
      .then(([diarias, sucursales, productos, canales, salud]) => {
        setDatos({ diarias, sucursales, productos, canales });
        setIa(Boolean(salud.ia_configurada));
      })
      .catch(() => {
        setConectado(false);
        setError(`No se pudo conectar con la API en ${API}. ¿Está corriendo uvicorn en el puerto 8000?`);
      });
  }, []);

  // KPIs del período seleccionado, comparados contra el período anterior de igual longitud.
  const kpis = useMemo(() => {
    if (!datos) return null;
    const d = datos.diarias;
    const actual = d.slice(-rango);
    const previo = d.slice(-2 * rango, -rango);

    const ventas = suma(actual, "total");
    const transacciones = suma(actual, "transacciones");
    const unidades = suma(actual, "unidades");
    const ventasPrev = suma(previo, "total");
    const transPrev = suma(previo, "transacciones");
    const unidadesPrev = suma(previo, "unidades");
    const ticket = transacciones ? ventas / transacciones : 0;
    const ticketPrev = transPrev ? ventasPrev / transPrev : 0;

    return [
      {
        titulo: "Ventas",
        valor: MONEDA.format(ventas),
        actual: ventas,
        previo: ventasPrev,
        fmt: (v) => MONEDA.format(v),
        delta: cambio(ventas, ventasPrev),
        serie: actual.map((x) => x.total),
        color: p.series[0],
      },
      {
        titulo: "Transacciones",
        valor: NUMERO.format(transacciones),
        actual: transacciones,
        previo: transPrev,
        fmt: (v) => NUMERO.format(v),
        delta: cambio(transacciones, transPrev),
        serie: actual.map((x) => x.transacciones),
        color: p.series[2],
      },
      {
        titulo: "Ticket promedio",
        valor: MONEDA_2.format(ticket),
        actual: ticket,
        previo: ticketPrev,
        fmt: (v) => MONEDA_2.format(v),
        delta: cambio(ticket, ticketPrev),
        serie: actual.map((x) => (x.transacciones ? x.total / x.transacciones : 0)),
        color: p.series[1],
      },
      {
        titulo: "Unidades",
        valor: NUMERO.format(unidades),
        actual: unidades,
        previo: unidadesPrev,
        fmt: (v) => NUMERO.format(v),
        delta: cambio(unidades, unidadesPrev),
        serie: actual.map((x) => x.unidades),
        color: p.series[3],
      },
    ];
  }, [datos, rango, p]);

  const opciones = useMemo(() => {
    if (!datos || !kpis) return null;
    return {
      sparks: kpis.map((k) => opcionBarrasMini(p, k.serie, k.color)),
      linea: opcionLinea(p, datos.diarias.slice(-rango)),
      sucursales: opcionSucursales(p, datos.sucursales),
      productos: opcionProductos(p, datos.productos),
      dona: opcionDona(p, datos.canales),
    };
  }, [datos, kpis, rango, p]);

  const totalCanales = datos ? datos.canales.reduce((s, c) => s + c.total, 0) : 0;

  return (
    <>
      <Topbar
        titulo={TITULO}
        subtitulo={`Últimos ${rango} días · comparado con el período anterior`}
        rangos={RANGOS}
        rango={rango}
        onRango={setRango}
        tema={tema}
        ia={ia}
        conectado={conectado}
        agenteAbierto={agenteAbierto}
        onAgente={() => setAgenteAbierto((v) => !v)}
      />

      <main className="layout">
        <div className="principal">
          {error && <div className="alerta">{error}</div>}

          <section className="kpis" id="resumen" aria-label="Indicadores clave">
            {(kpis ?? Array.from({ length: 4 })).map((k, i) =>
              k ? (
                <Kpi
                  key={k.titulo}
                  indice={i}
                  titulo={k.titulo}
                  valor={k.valor}
                  delta={k.delta}
                  acento={k.color}
                  actual={k.actual}
                  previo={k.previo}
                  fmt={k.fmt}
                />
              ) : (
                <div key={i} className="tarjeta kpi skel-card" aria-hidden="true">
                  <div className="skel" />
                </div>
              )
            )}
          </section>

          <section className="tarjeta fade" id="tendencia">
            <header className="tarjeta-cabecera">
              <div>
                <h2 data-num="01">Tendencia de ventas</h2>
                <p className="subtitulo">
                  {vistaTendencia === "grafico"
                    ? "Ventas diarias con promedio móvil de 7 días"
                    : "Valores exactos por día, del más reciente al más antiguo"}
                </p>
              </div>
              <button
                type="button"
                className="icono"
                onClick={() => setVistaTendencia((v) => (v === "grafico" ? "tabla" : "grafico"))}
              >
                {vistaTendencia === "grafico" ? "ver tabla" : "ver gráfico"}
              </button>
            </header>
            {vistaTendencia === "grafico" ? (
              <Chart option={opciones?.linea} etiqueta="Ventas diarias" />
            ) : (
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th className="num">Ventas</th>
                      <th className="num">Transacciones</th>
                      <th className="num">Ticket</th>
                      <th className="num">Unidades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos?.diarias
                      .slice(-rango)
                      .slice()
                      .reverse()
                      .map((d) => (
                        <tr key={d.fecha}>
                          <td>{d.fecha}</td>
                          <td className="num">{MONEDA_2.format(d.total)}</td>
                          <td className="num">{NUMERO.format(d.transacciones)}</td>
                          <td className="num">{MONEDA_2.format(d.transacciones ? d.total / d.transacciones : 0)}</td>
                          <td className="num">{NUMERO.format(d.unidades)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="fila-2">
            <section className="tarjeta fade" id="sucursales">
              <header className="tarjeta-cabecera">
                <div>
                  <h2 data-num="02">Ventas por sucursal</h2>
                  <p className="subtitulo">Histórico de 180 días</p>
                </div>
              </header>
              <Chart option={opciones?.sucursales} etiqueta="Ventas por sucursal" />
            </section>

            <section className="tarjeta fade" id="canales">
              <header className="tarjeta-cabecera">
                <div>
                  <h2 data-num="03">Mix por canal</h2>
                  <p className="subtitulo">Participación del total</p>
                </div>
              </header>
              <div className="dona-layout">
                <div className="dona">
                  <Chart option={opciones?.dona} etiqueta="Ventas por canal" />
                </div>
                <ul className="leyenda" aria-label="Leyenda de canales">
                  {datos?.canales.map((c, i) => (
                    <li key={c.canal}>
                      <span className="punto" style={{ background: p.series[i] }} aria-hidden="true" />
                      <span className="leyenda-nombre">{c.canal}</span>
                      <strong>{((c.total / totalCanales) * 100).toFixed(1)}%</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

          <section className="tarjeta fade" id="productos">
            <header className="tarjeta-cabecera">
              <div>
                <h2 data-num="04">Top productos por ingreso</h2>
                <p className="subtitulo">Histórico de 180 días</p>
              </div>
            </header>
            <Chart option={opciones?.productos} etiqueta="Top productos" />
          </section>
          </div>
        </div>

        <aside
          className={`lateral ${agenteAbierto ? "abierto" : ""}`}
          id="panel-agente"
          aria-hidden={!agenteAbierto}
        >
          <Chat api={API} ia={ia} onCerrar={() => setAgenteAbierto(false)} />
        </aside>
      </main>
    </>
  );
}
