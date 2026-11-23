# Hackathon SBP-FISC: base de agente + dashboard

Base genérica para construir un agente de IA que consulta datos de negocio y un
dashboard para presentarlos.

## Estructura

```
backend/    FastAPI + SQLite + agente (Claude con herramienta SQL de solo lectura)
frontend/   Next.js + ECharts (KPIs, gráficos y chat con el agente)
docker-compose.yml
```

## Correr en local (sin Docker)

Backend (desde `backend/`):

```bash
pip install -r requirements.txt
python seed.py                      # crea data/ventas.db de ejemplo
set ANTHROPIC_API_KEY=tu_clave      # opcional: sin clave, el agente usa modo respaldo
uvicorn app.main:app --reload --port 8000
```

Frontend (desde `frontend/`):

```bash
npm install
npm run dev                         # http://localhost:3000
```

Con Docker: `docker compose up --build`.

## Adaptar a sus datos

1. **Datos:** reemplaza `backend/seed.py` por tu carga de datos (CSV, Excel, PostgreSQL, etc.).
   El agente lee las tablas y columnas automáticamente, así que no hay que tocar el prompt.
2. **Consultas del dashboard:** en `backend/app/main.py` están los endpoints de ejemplo
   (`/api/kpis`, `/api/ventas-diarias`, etc.). Cámbialos por los indicadores de su caso.
3. **Gráficos:** en `frontend/app/page.js` cambia las opciones de ECharts y los datos que consumen.
4. **Título:** variable `NEXT_PUBLIC_TITULO` (en `.env` o en `docker-compose`).
5. **Modelo de IA:** `ANTHROPIC_MODEL` (por defecto `claude-sonnet-5-5`). También se puede
   cambiar `backend/app/agent.py` para usar OpenAI, Google u otro proveedor.

## Seguridad del agente

- La conexión a la base es de solo lectura (`mode=ro`).
- Solo se aceptan sentencias `SELECT` o `WITH ... SELECT` de una sola sentencia.
- Las respuestas se limitan a 200 filas por consulta.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado y si hay clave de IA configurada |
| GET | `/api/kpis` | Indicadores generales |
| GET | `/api/ventas-diarias` | Serie diaria |
| GET | `/api/por-sucursal` | Agregado por sucursal |
| GET | `/api/top-productos` | Top de productos |
| POST | `/api/agente` | Body `{"pregunta": "..."}` |
