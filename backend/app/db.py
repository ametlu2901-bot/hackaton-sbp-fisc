import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.abspath(os.getenv("DB_PATH", os.path.join(BASE_DIR, "data", "ventas.db")))


def get_conn() -> sqlite3.Connection:
    """Conexión de solo lectura: el agente nunca puede modificar los datos."""
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
