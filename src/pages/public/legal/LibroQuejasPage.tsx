import { useState, FormEvent } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function LibroQuejasPage() {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Reclamo registrado. Estaremos analizando su caso.");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-8 lg:py-12 flex-grow flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 w-full flex-1 flex flex-col relative overflow-hidden">

          <div className="relative z-10 w-full flex flex-col items-start lg:block">
            <h1 className="text-[1rem] md:text-[1.6rem] font-bold font-poppins mb-4 text-[#2f3027] leading-tight text-left">
              Libro de Quejas
            </h1>
            <p className="text-gray-500 mb-8 text-[14px] md:text-[16px] leading-snug text-left max-w-4xl font-lato">
              Si tuviste algún inconveniente con nuestros servicios o productos, por favor completá el formulario a continuación para dejar asentado tu reclamo y poder ofrecerte una solución.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-[13px] uppercase tracking-wider text-gray-500 font-bold mb-1 font-lato">Nombre y Apellido *</label>
                <input type="text" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#3ba732] focus:ring-1 focus:ring-[#3ba732] transition-colors bg-[#f9fafa]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-[13px] uppercase tracking-wider text-gray-500 font-bold mb-1 font-lato">DNI / CUIL *</label>
                <input type="text" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#3ba732] focus:ring-1 focus:ring-[#3ba732] transition-colors bg-[#f9fafa]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-[13px] uppercase tracking-wider text-gray-500 font-bold mb-1 font-lato">Email de contacto *</label>
                <input type="email" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#3ba732] focus:ring-1 focus:ring-[#3ba732] transition-colors bg-[#f9fafa]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-[13px] uppercase tracking-wider text-gray-500 font-bold mb-1 font-lato">Número de Teléfono</label>
                <input type="tel" className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#3ba732] focus:ring-1 focus:ring-[#3ba732] transition-colors bg-[#f9fafa]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-[13px] uppercase tracking-wider text-gray-500 font-bold mb-1 font-lato">Detalle del reclamo/queja *</label>
                <textarea required rows={5} className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#3ba732] focus:ring-1 focus:ring-[#3ba732] transition-colors bg-[#f9fafa]" placeholder="Describí los hechos de la forma más clarificada posible..."></textarea>
              </div>
              <button type="submit" className="mt-4 bg-[#3ba732] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2d8425] transition-colors w-max shadow-sm text-[14px] md:text-[15px]">
                Registrar Reclamo
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
