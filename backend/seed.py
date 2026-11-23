"""Genera una base SQLite con datos de ventas de ejemplo (6 meses, 4 sucursales).

Uso:  python seed.py
"""
import datetime as dt
import os
import random
import sqlite3

from app.db import DB_PATH

SUCURSALES = ["Centro", "Norte", "Sur", "Costa"]
PRODUCTOS = [
    ("Café americano", "Bebidas", 2.50),
    ("Capuchino", "Bebidas", 3.50),
    ("Jugo natural", "Bebidas", 2.80),
    ("Sándwich de pollo", "Comida", 5.90),
    ("Ensalada César", "Comida", 6.50),
    ("Wrap vegetariano", "Comida", 5.20),
    ("Croissant", "Panadería", 2.20),
    ("Pastel de chocolate", "Panadería", 3.80),
]
CANALES = ["Local", "Llevar", "PedidosYa", "Uber Eats"]
PESO_SUCURSAL = {"Centro": 1.4, "Norte": 1.0, "Sur": 0.8, "Costa": 1.2}
DIAS = 180


def main() -> None:
    random.seed(42)
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """CREATE TABLE ventas (
            id INTEGER PRIMARY KEY,
            fecha TEXT NOT NULL,
            sucursal TEXT NOT NULL,
            producto TEXT NOT NULL,
            categoria TEXT NOT NULL,
            canal TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            total REAL NOT NULL
        )"""
    )

    hoy = dt.date.today()
    filas = []
    for i in range(DIAS):
        dia = hoy - dt.timedelta(days=DIAS - i)
        # Fines de semana venden más
        factor_dia = 1.35 if dia.weekday() >= 5 else 1.0
        for sucursal in SUCURSALES:
            transacciones = int(random.randint(8, 16) * PESO_SUCURSAL[sucursal] * factor_dia)
            for _ in range(transacciones):
                nombre, categoria, precio = random.choice(PRODUCTOS)
                cantidad = random.randint(1, 4)
                canal = random.choices(CANALES, weights=[5, 3, 2, 1])[0]
                total = round(cantidad * precio, 2)
                filas.append((dia.isoformat(), sucursal, nombre, categoria, canal, cantidad, precio, total))

    conn.executemany(
        "INSERT INTO ventas (fecha, sucursal, producto, categoria, canal, cantidad, precio_unitario, total) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        filas,
    )
    conn.commit()
    conn.close()
    print(f"Base creada en {DB_PATH} con {len(filas)} ventas.")


if __name__ == "__main__":
    main()
