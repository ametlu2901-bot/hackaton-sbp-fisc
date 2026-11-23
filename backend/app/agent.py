"""Agente de análisis de datos.

Con ANTHROPIC_API_KEY: Claude recibe la pregunta, escribe consultas SQL de solo
lectura con la herramienta `consultar_sql`, interpreta los resultados y responde.

Sin API key: un modo de respaldo que responde preguntas frecuentes con consultas
fijas, para que el demo siga funcionando.
"""
import json
import os
import re
from contextlib import closing

from .db import get_conn

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
MAX_PASOS = 6
MAX_FILAS = 200

def esquema() -> str:
    """Describe las tablas y columnas de la base, leídas directamente de SQLite."""
    partes = []
    with closing(get_conn()) as conn:
        tablas = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).fetchall()
        for (tabla,) in tablas:
            columnas = conn.execute(f'PRAGMA table_info("{tabla}")').fetchall()
            detalle = ", ".join(f"{c[1]} {c[2] or 'TEXT'}" for c in columnas)
            partes.append(f"Tabla {tabla}({detalle})")
    return "\n".join(partes) or "La base no tiene tablas."


def _system() -> str:
    return (
        "Eres un analista de datos de negocio para stakeholders. Responde siempre en español, "
        "de forma breve y con cifras concretas. Para cualquier número usa la herramienta "
        "consultar_sql; nunca inventes datos. Si la pregunta es ambigua, elige la lectura más "
        "razonable y dilo. Motor: SQLite. Esquema disponible:\n" + esquema()
    )


TOOLS = [
    {
        "name": "consultar_sql",
        "description": (
            "Ejecuta una única consulta SELECT de solo lectura sobre la base "
            f"y devuelve hasta {MAX_FILAS} filas en JSON."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"sql": {"type": "string", "description": "Consulta SELECT en SQLite"}},
            "required": ["sql"],
        },
    }
]


def run_sql(sql: str) -> dict:
    limpio = sql.strip().rstrip(";").strip()
    if not re.match(r"(?is)^(select|with)\b", limpio) or ";" in limpio:
        return {"error": "Solo se permite una sentencia SELECT (o WITH ... SELECT)."}
    try:
        with closing(get_conn()) as conn:
            cur = conn.execute(limpio)
            columnas = [c[0] for c in cur.description]
            filas = [dict(zip(columnas, fila)) for fila in cur.fetchmany(MAX_FILAS)]
        return {"filas": filas, "total_filas": len(filas)}
    except Exception as exc:  # noqa: BLE001 - se devuelve el error al modelo para que corrija
        return {"error": str(exc)}


def responder(pregunta: str) -> dict:
    if not os.getenv("ANTHROPIC_API_KEY"):
        return _respaldo(pregunta)
    return _con_claude(pregunta)


def _con_claude(pregunta: str) -> dict:
    from anthropic import Anthropic

    client = Anthropic()
    mensajes = [{"role": "user", "content": pregunta}]
    consultas: list[str] = []

    for _ in range(MAX_PASOS):
        resp = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=_system(),
            tools=TOOLS,
            messages=mensajes,
        )
        if resp.stop_reason != "tool_use":
            texto = "".join(b.text for b in resp.content if b.type == "text").strip()
            return {"respuesta": texto, "consultas": consultas, "modo": "claude"}

        mensajes.append({"role": "assistant", "content": resp.content})
        resultados = []
        for bloque in resp.content:
            if bloque.type == "tool_use":
                sql = bloque.input.get("sql", "")
                consultas.append(sql)
                resultado = run_sql(sql)
                resultados.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": bloque.id,
                        "content": json.dumps(resultado, ensure_ascii=False, default=str),
                    }
                )
        mensajes.append({"role": "user", "content": resultados})

    return {
        "respuesta": "No pude terminar el análisis dentro del límite de pasos. Intenta una pregunta más concreta.",
        "consultas": consultas,
        "modo": "claude",
    }


# ---------- Modo de respaldo (sin API key) ----------

CONSULTAS_RESPALDO = {
    "sucursal": (
        "SELECT sucursal, ROUND(SUM(total), 2) AS ventas FROM ventas GROUP BY sucursal ORDER BY ventas DESC",
        "Ventas por sucursal",
    ),
    "canal": (
        "SELECT canal, ROUND(SUM(total), 2) AS ventas FROM ventas GROUP BY canal ORDER BY ventas DESC",
        "Ventas por canal",
    ),
    "producto": (
        "SELECT producto, SUM(cantidad) AS unidades, ROUND(SUM(total), 2) AS ventas FROM ventas "
        "GROUP BY producto ORDER BY ventas DESC LIMIT 5",
        "Top 5 productos por ventas",
    ),
    "total": (
        "SELECT ROUND(SUM(total), 2) AS ventas, COUNT(*) AS transacciones FROM ventas",
        "Ventas totales",
    ),
}


def _respaldo(pregunta: str) -> dict:
    texto = pregunta.lower()
    clave = next((k for k in CONSULTAS_RESPALDO if k in texto), "total")
    sql, titulo = CONSULTAS_RESPALDO[clave]
    resultado = run_sql(sql)
    if "error" in resultado:
        return {"respuesta": f"Error al consultar: {resultado['error']}", "consultas": [sql], "modo": "respaldo"}

    lineas = [f"{titulo} (modo sin IA; configura ANTHROPIC_API_KEY para preguntas libres):"]
    for fila in resultado["filas"]:
        lineas.append("- " + ", ".join(f"{k}: {v}" for k, v in fila.items()))
    return {"respuesta": "\n".join(lineas), "consultas": [sql], "modo": "respaldo"}
