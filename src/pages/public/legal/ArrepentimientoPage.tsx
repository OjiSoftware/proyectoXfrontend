import { useState, FormEvent } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ArrepentimientoPage() {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Solicitud de arrepentimiento enviada. Nos pondremos en contacto a la brevedad.");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-8 lg:py-12 flex-grow flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 w-full flex-1 flex flex-col relative overflow-hidden">

          <div className="relative z-10 w-full flex flex-col items-start lg:block">
            <h1 className="text-2xl md:text-3xl font-bold font-fredoka mb-4 text-[#1A2D2A] leading-tight text-left">
              Botón de Arrepentimiento
            </h1>
            <p className="text-gray-600 mb-8 text-[14px] md:text-[16px] leading-relaxed text-left max-w-4xl font-nunito">
              Para compras realizadas online, disponés de 10 días desde la entrega del producto para revocar tu aceptación. Completá el siguiente formulario y nos contactaremos para procesar tu solicitud según la legislación vigente en la República Argentina.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg w-full font-nunito">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700">Nombre y Apellido *</label>
                <input type="text" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1E8A90] focus:ring-1 focus:ring-[#1E8A90] transition-colors bg-[#f9fafa]" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700">Email de contacto *</label>
                <input type="email" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1E8A90] focus:ring-1 focus:ring-[#1E8A90] transition-colors bg-[#f9fafa]" placeholder="tuemail@ejemplo.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700">Número de Pedido/Orden *</label>
                <input type="text" required className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1E8A90] focus:ring-1 focus:ring-[#1E8A90] transition-colors bg-[#f9fafa]" placeholder="Ej: ORD-12345" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700">Motivo (Opcional)</label>
                <textarea rows={4} className="p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1E8A90] focus:ring-1 focus:ring-[#1E8A90] transition-colors bg-[#f9fafa]" placeholder="Escriba aquí los motivos (opcional)..."></textarea>
              </div>
              <button type="submit" className="mt-4 bg-[#1E8A90] hover:bg-[#2BAAB0] text-white font-bold py-3 px-6 rounded-xl transition-colors w-max shadow-sm text-sm md:text-base">
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
