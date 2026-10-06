import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { cargarDatos } from "@/lib/series";

// La página se construye una vez, con los CSV de data/series/: no hay datos
// en vivo ni consultas en el navegador.
export const dynamic = "force-static";

export default function Home() {
  const datos = cargarDatos();
  const atribuciones = [...new Set(datos.fichas.filter((f) => f.publicada).map((f) => f.atribucion))];

  return (
    <main className="min-h-screen">
      <Header ultimoMes={datos.ultimoMes} />
      <Dashboard datos={datos} />
      <Footer lock={datos.lock} atribuciones={atribuciones} />
    </main>
  );
}
