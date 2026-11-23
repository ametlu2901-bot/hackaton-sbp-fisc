"use client";

import { useEffect, useState } from "react";

const CLAVE = "tema";

/** Devuelve "light" o "dark" según el atributo data-theme, o el sistema si no hay elección. */
export function useTema() {
  const [tema, setTema] = useState("light");

  useEffect(() => {
    const raiz = document.documentElement;
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) raiz.setAttribute("data-theme", guardado);
    } catch {
      /* almacenamiento no disponible: se usa el tema del sistema */
    }

    const calcular = () => {
      const attr = raiz.getAttribute("data-theme");
      const oscuro = attr
        ? attr === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTema(oscuro ? "dark" : "light");
    };

    calcular();
    const observador = new MutationObserver(calcular);
    observador.observe(raiz, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", calcular);

    return () => {
      observador.disconnect();
      mq.removeEventListener("change", calcular);
    };
  }, []);

  return tema;
}

export function alternarTema() {
  const raiz = document.documentElement;
  const actual =
    raiz.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const nuevo = actual === "dark" ? "light" : "dark";
  raiz.setAttribute("data-theme", nuevo);
  try {
    localStorage.setItem(CLAVE, nuevo);
  } catch {
    /* sin persistencia: el cambio dura hasta recargar */
  }
}
