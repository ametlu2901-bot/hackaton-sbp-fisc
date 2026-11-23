import os
from contextlib import closing

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agent import responder
from .db import get_conn

app = FastAPI(title="Agente de Ventas - Hackathon")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_ORIGIN", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


def _consultar(sql: str, params: tuple = ()) -> list[dict]:
    with closing(get_conn()) as conn:
        return [dict(fila) for fila in conn.execute(sql, params).fetchall()]


@app.get("/api/health")
def health():
    return {"ok": True, "ia_configurada": bool(os.getenv("ANTHROPIC_API_KEY"))}


@app.get("/api/kpis")
def kpis():
    fila = _consultar(
        "SELECT ROUND(SUM(total), 2) AS ventas, COUNT(*) AS transacciones, "
        "ROUND(SUM(total) / COUNT(*), 2) AS ticket_promedio, SUM(cantidad) AS unidades FROM ventas"
    )[0]
    return fila


@app.get("/api/ventas-diarias")
def ventas_diarias():
    return _consultar(
        "SELECT fecha, ROUND(SUM(total), 2) AS total, COUNT(*) AS transacciones, "
        "SUM(cantidad) AS unidades FROM ventas GROUP BY fecha ORDER BY fecha"
    )


@app.get("/api/por-canal")
def por_canal():
    return _consultar(
        "SELECT canal, ROUND(SUM(total), 2) AS total FROM ventas GROUP BY canal ORDER BY total DESC"
    )


@app.get("/api/por-sucursal")
def por_sucursal():
    return _consultar(
        "SELECT sucursal, ROUND(SUM(total), 2) AS total FROM ventas GROUP BY sucursal ORDER BY total DESC"
    )


@app.get("/api/top-productos")
def top_productos():
    return _consultar(
        "SELECT producto, SUM(cantidad) AS unidades, ROUND(SUM(total), 2) AS total "
        "FROM ventas GROUP BY producto ORDER BY total DESC LIMIT 8"
    )


class Pregunta(BaseModel):
    pregunta: str


@app.post("/api/agente")
def agente(body: Pregunta):
    texto = body.pregunta.strip()[:500]
    if not texto:
        return {"respuesta": "Escribe una pregunta.", "consultas": [], "modo": "vacio"}
    return responder(texto)
