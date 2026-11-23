import "./globals.css";

export const metadata = {
  title: "Dashboard de ventas",
  description: "Análisis de ventas con agente de IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
