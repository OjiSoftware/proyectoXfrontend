import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, MapPin, Sparkles } from "lucide-react";

export default function ContactoPage() {
  // ---------------- STATE ----------------
  const [search, setSearch] = useState(""); // estado de búsqueda

  const phoneNumber = "5491140000000";
  const displayPhone = "+54 9 11 4000-0000";
  const email = "consultas@elementalloptica.com.ar";
  const address = "Sucursal Centro: Av. Corrientes 1234, CABA.";

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f5f6f8] font-domine">
      <Navbar search={search} setSearch={setSearch} />

      {/* Contenedor principal con márgenes centrado al estilo del catalog */}
      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-8 lg:py-16 flex-grow flex flex-col">

        {/* Contenedor Limpio (Premium Card) */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 md:p-16 w-full flex-1 flex flex-col justify-center relative overflow-hidden">

          <div className="relative z-10 w-full flex flex-col items-start lg:block [zoom:0.9] lg:[zoom:1]">
            <h1 className="text-[2rem] md:text-[3rem] font-bold mb-4 text-[#1A2D2A] leading-tight text-left tracking-tight">
              Contactanos
            </h1>
            <p className="text-[#3b4b5e] mb-12 text-[15px] md:text-[17px] leading-relaxed text-left max-w-2xl">
              Estamos acá para ayudarte. Si tenés consultas sobre tus anteojos de receta, envíos o necesitás asesoramiento estético, no dudes en escribirnos.
            </p>

            <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Tarjetas de contacto */}
              <div className="flex flex-col gap-6 w-full lg:w-1/2 max-w-xl">
                
                <a
                  href={`https://wa.me/${phoneNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-6 group p-5 rounded-2xl bg-[#f5f6f8] border border-transparent hover:bg-white hover:border-[#EDC062] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-white p-4 rounded-2xl text-[#1A2D2A] group-hover:bg-[#EDC062] group-hover:text-[#1A2D2A] transition-colors duration-300 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Asesoramiento por WhatsApp</p>
                    <p className="text-[18px] font-bold text-[#1A2D2A] pb-1">
                      {displayPhone}
                    </p>
                    <span className="text-[13px] font-medium text-[#EDC062] group-hover:underline">
                      Iniciar chat →
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-6 group p-5 rounded-2xl bg-[#f5f6f8] border border-transparent hover:bg-white hover:border-[#EDC062] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-white p-4 rounded-2xl text-[#1A2D2A] group-hover:bg-[#EDC062] transition-colors duration-300 shadow-sm">
                    <Mail size={28} strokeWidth={2} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Correo Electrónico</p>
                    <p className="text-[16px] font-bold text-[#1A2D2A]">{email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-6 p-5 rounded-2xl bg-[#f5f6f8] border border-transparent">
                  <div className="bg-white p-4 rounded-2xl text-[#1A2D2A] shadow-sm">
                    <MapPin size={28} strokeWidth={2} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Ubicación</p>
                    <p className="text-[16px] font-bold text-[#1A2D2A]">{address}</p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha - CTA Elegante */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6">
                <div className="bg-[#1A2D2A] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group shadow-xl">
                  {/* Decoración geométrica sutil de fondo */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#EDC062] rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                  
                  <div className="relative z-10 flex flex-col items-start">
                    <div className="bg-[#EDC062]/20 p-3 rounded-xl mb-6">
                        <Sparkles className="text-[#EDC062] w-8 h-8" />
                    </div>
                    <h3 className="text-[1.8rem] font-bold mb-3 tracking-tight">Colección Exclusiva</h3>
                    <p className="text-gray-300 text-[15px] leading-relaxed mb-8 max-w-sm">
                      Descubrí las últimas tendencias en armazones y lentes de contacto. La mejor calidad óptica con precios exclusivos para clientes.
                    </p>
                    <a href="/catalogo" className="inline-flex items-center justify-center gap-3 bg-[#EDC062] hover:bg-[#FAD390] text-[#1A2D2A] px-8 py-4 rounded-xl text-[14px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg">
                      Ver catálogo completo
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
