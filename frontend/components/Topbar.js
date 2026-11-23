import { alternarTema } from "../lib/tema";

const NAV = [
  { href: "#resumen", texto: "Resumen" },
  { href: "#tendencia", texto: "Tendencia" },
  { href: "#sucursales", texto: "Sucursales" },
  { href: "#canales", texto: "Canales" },
  { href: "#productos", texto: "Productos" },
];

export default function Topbar({
  titulo,
  subtitulo,
  rangos,
  rango,
  onRango,
  tema,
  ia,
  conectado,
  agenteAbierto,
  onAgente,
}) {
  return (
    <header className="topbar">
      <div className="marca">
        <h1>{titulo}</h1>
        <p className="subtitulo">{subtitulo}</p>
      </div>

      <nav className="nav" aria-label="Secciones">
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.texto}
          </a>
        ))}
      </nav>

      <div className="acciones">
        <div className="segmentos" role="group" aria-label="Período">
          {rangos.map((r) => (
            <button
              key={r}
              type="button"
              className={r === rango ? "activo" : ""}
              onClick={() => onRango(r)}
              aria-pressed={r === rango}
            >
              {r}D
            </button>
          ))}
        </div>

        <span className={`pill ${conectado ? (ia ? "ok" : "aviso") : "error"}`}>
          <i aria-hidden="true" />
          {!conectado ? "Sin API" : ia ? "En línea" : "Respaldo"}
        </span>

        <button
          type="button"
          className={`icono boton-agente ${agenteAbierto ? "activo" : ""}`}
          onClick={onAgente}
          aria-expanded={agenteAbierto}
          aria-controls="panel-agente"
        >
          agente
        </button>

        <button
          type="button"
          className="icono"
          onClick={alternarTema}
          aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          title="Cambiar tema"
        >
          {tema === "dark" ? "claro" : "oscuro"}
        </button>
      </div>
    </header>
  );
}
