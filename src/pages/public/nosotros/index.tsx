import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoUpaLele from "@/assets/upalele_logo.svg";
import iconLogo from "@/assets/icon_logo.png";
import {
  Heart,
  MapPin,
  Phone,
  Instagram,
  Clock,
  ShieldCheck,
  Sparkles,
  Baby,
  Store,
  Award,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NosotrosPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const address = "Avenida Siburu 2045, Chajarí, Entre Ríos, Argentina";
  const phoneDisplay = "+54 9 3456 47-9016";
  const phoneClean = "5493456479016";
  const instagramUser = "@upalele_chajari";
  const instagramUrl = "https://www.instagram.com/upalele_chajari/";

  // Google Maps Embed URL para Av. Siburu 2045, Chajarí, Entre Ríos
  const mapEmbedUrl = "https://www.google.com/maps?q=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos&output=embed";
  const mapDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos";

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fa] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      {/* Hero Nosotros */}
      <section className="w-full bg-[#33aab8] text-white relative overflow-hidden py-12 md:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-10 -bottom-20 w-64 h-64 rounded-full bg-[#fbe6d6]/20" />

        <div className="max-w-[1187px] mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-block bg-white/20 text-[#fff000] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              Nuestra Historia
            </span>
            <h1 className="text-3xl md:text-5xl font-fredoka font-bold text-[#fff000] leading-tight mb-4 drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">
              Cuidamos lo más importante con amor y confianza
            </h1>
            <p className="text-base md:text-lg text-white/95 leading-relaxed font-normal">
              En <strong className="font-bold">Upa Lelé</strong> somos una pañalera nacida en Chajarí pensada para acompañarte a vos y a tu bebé en cada etapa de crecimiento, con los mejores precios y una atención cálida y personalizada.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#fff000]/25 rounded-3xl blur-xl transform scale-105" />
              <img
                src={iconLogo}
                alt="Bebé Upa Lelé"
                className="relative w-48 md:w-60 -rotate-3 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="max-w-[1187px] mx-auto px-4 py-12 md:py-16 w-full flex-grow flex flex-col gap-12 md:gap-16">



        {/* Sección Quiénes Somos / Identidad */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/2 flex flex-col items-start">
            <span className="text-[#33aab8] font-bold text-xs uppercase tracking-widest font-fredoka mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFE600]" /> ¿Quiénes Somos?
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-fredoka text-[#1A2D2A] mb-5">
              Tu pañalera amiga en Chajarí
            </h2>
            <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
              <p>
                <strong className="text-[#1A2D2A]">Upa Lelé</strong> nació con un propósito muy claro: facilitarle la vida a las mamás, papás y familias enteras que buscan productos de máxima calidad sin pagar de más.
              </p>
              <p>
                En nuestro local encontrás todo el stock en un solo lugar: desde recién nacidos hasta las etapas más grandes, pasando por cuidados especiales, alimentación y maternidad.
              </p>
              <p>
                Te esperamos todos los días en nuestro local comercial sobre la Avenida Siburu o a través de nuestros canales online para consultas y pedidos directos.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/catalogo')}
                className="bg-[#33aab8] hover:bg-[#37b9c7] text-white font-bold py-3 px-6 rounded-full transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wider shadow-sm active:scale-95"
              >
                Ver Catálogo Online <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${phoneClean}?text=${encodeURIComponent("¡Hola! Me gustaría hacer una consulta en Upa Lelé.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-[#33aab8] text-[#33aab8] hover:bg-[#33aab8] hover:text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center gap-2 text-sm uppercase tracking-wider"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md bg-[#FFF6B8]/40 rounded-3xl p-8 border border-[#FFF6B8] flex flex-col items-center text-center">
              <img
                src={logoUpaLele}
                alt="Logo Upa Lelé"
                className="h-28 object-contain mb-6 drop-shadow-sm"
              />
              <blockquote className="italic text-gray-700 text-base md:text-lg mb-4">
                "Todo para tu bebé, en un solo lugar."
              </blockquote>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#33aab8]">
                <ShieldCheck className="w-4 h-4 text-[#33aab8]" />
                Atención personalizada garantizada
              </div>
            </div>
          </div>
        </section>



      </main>

      <Footer />
    </div>
  );
}
