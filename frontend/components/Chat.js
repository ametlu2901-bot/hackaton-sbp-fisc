"use client";

import { useEffect, useRef, useState } from "react";

const SUGERENCIAS = [
  "¿Qué sucursal vendió más?",
  "Ventas por canal",
  "Top 5 productos por ingreso",
  "¿Cuál fue el día con más ventas?",
];

export default function Chat({ api, ia, onCerrar }) {
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const fin = useRef(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, cargando]);

  async function enviar(texto) {
    const limpio = (texto ?? pregunta).trim();
    if (!limpio || cargando) return;
    setMensajes((m) => [...m, { rol: "usuario", texto: limpio }]);
    setPregunta("");
    setCargando(true);
    try {
      const r = await fetch(`${api}/api/agente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: limpio }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setMensajes((m) => [
        ...m,
        { rol: "agente", texto: data.respuesta, modo: data.modo, consultas: data.consultas ?? [] },
      ]);
    } catch {
      setMensajes((m) => [
        ...m,
        { rol: "agente", texto: "No pude consultar al agente. Revisa que la API esté corriendo.", error: true },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function enviarForm(e) {
    e.preventDefault();
    enviar();
  }

  return (
    <section className="tarjeta chat-panel" aria-labelledby="titulo-agente">
      <header className="chat-cabecera">
        <div>
          <h2 id="titulo-agente">Agente de datos</h2>
          <p className="subtitulo">
            {ia ? "Claude analiza tu base con SQL de solo lectura" : "Respuestas predefinidas (sin clave de IA)"}
          </p>
        </div>
        <div className="chat-acciones">
          <span className={`chip-modo ${ia ? "ok" : ""}`}>{ia ? "IA" : "Respaldo"}</span>
          {onCerrar && (
            <button type="button" className="icono" onClick={onCerrar} aria-label="Cerrar agente">
              cerrar
            </button>
          )}
        </div>
      </header>

      <div className="mensajes" aria-live="polite">
        {mensajes.length === 0 && (
          <div className="bienvenida">
            <p>Pregunta lo que necesites sobre las ventas. Te muestro la respuesta y la consulta que usé.</p>
            <div className="sugerencias">
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" className="sugerencia" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`burbuja ${m.rol} ${m.error ? "error" : ""}`}>
            <div className="texto">{m.texto}</div>
            {m.rol === "agente" && m.consultas?.length > 0 && (
              <details className="sql">
                <summary>Ver consulta SQL ({m.consultas.length})</summary>
                {m.consultas.map((q, j) => (
                  <pre key={j}>
                    <code>{q}</code>
                  </pre>
                ))}
              </details>
            )}
          </div>
        ))}

        {cargando && (
          <div className="burbuja agente">
            <div className="escribiendo" aria-label="Analizando">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={fin} />
      </div>

      <form className="entrada" onSubmit={enviarForm}>
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe tu pregunta…"
          aria-label="Pregunta para el agente"
          maxLength={500}
        />
        <button type="submit" disabled={cargando || !pregunta.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
