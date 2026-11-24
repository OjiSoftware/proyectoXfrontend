import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoUpaLele from "@/assets/upalele_logo.svg";
import iconLogo from "@/assets/icon_logo.png";
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Baby,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NosotrosPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const phoneClean = "5493456479016";

  return (
    <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_460px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      {/* Hero Nosotros */}
      <section className="w-full max-w-[1187px] mx-auto px-4 pt-6 md:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#37b9c7] via-[#33aab8] to-[#28929f] p-8 md:p-12 shadow-[0_14px_34px_-12px_rgba(43,170,176,0.45)] border border-white/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="pointer-events-none absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute left-10 -bottom-20 w-64 h-64 rounded-full bg-[#FFF6B8]/20" />

          <div className="relative z-10 max-w-xl text-center md:text-left">

            <h1 className="text-3xl md:text-5xl font-fredoka font-bold text-[#FFF000] leading-tight mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,0.14)]">
              Cuidamos lo más importante con amor y confianza
            </h1>
            <p className="text-base md:text-lg text-white/95 leading-relaxed font-normal">
              En <strong className="font-bold">Upa Lelé</strong> somos una pañalera nacida en Chajarí pensada para acompañarte a vos y a tu bebé en cada etapa de crecimiento, con los mejores precios y una atención cálida y personalizada.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFF000]/25 rounded-3xl blur-xl transform scale-105" />
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
      <main className="max-w-[1187px] mx-auto px-4 py-12 md:py-14 w-full flex-grow flex flex-col gap-12">
        {/* Sección Quiénes Somos / Identidad */}
        <section className="bg-white rounded-3xl border border-[#D5F3F4] p-8 md:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/2 flex flex-col items-start">
            <span className="text-[#33aab8] font-bold text-xs uppercase tracking-widest font-fredoka mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFE600]" /> ¿Quiénes Somos?
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-fredoka text-[#2b99a6] mb-5">
              Tu pañalera amiga en Chajarí
            </h2>
            <div className="space-y-4 text-[#3d635f] text-sm md:text-base leading-relaxed">
              <p>
                <strong className="text-[#2b99a6]">Upa Lelé</strong> nació con un propósito muy claro: facilitarle la vida a las mamás, papás y familias enteras que buscan productos de máxima calidad sin pagar de más.
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
                className="bg-[#33aab8] hover:bg-[#2b99a6] text-white font-bold py-3.5 px-7 rounded-full transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wider shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Ver Catálogo Online <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${phoneClean}?text=${encodeURIComponent("¡Hola! Me gustaría hacer una consulta en Upa Lelé.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FFF6B8] hover:bg-[#FFF29C] text-[#1A2D2A] border border-amber-200/80 font-bold py-3.5 px-7 rounded-full transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wider shadow-xs hover:-translate-y-0.5"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative overflow-hidden w-full max-w-md bg-gradient-to-br from-[#FFF9CE] to-[#FFF29C] rounded-3xl p-8 border border-amber-200/70 shadow-sm flex flex-col items-center text-center">
              <div className="pointer-events-none absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/45" />
              <img
                src={logoUpaLele}
                alt="Logo Upa Lelé"
                className="relative h-28 object-contain mb-6 rounded-2xl shadow-md ring-4 ring-white/50"
              />
              <blockquote className="relative italic text-[#2b99a6] font-bold text-base md:text-lg mb-4">
                "Todo para tu bebé, en un solo lugar."
              </blockquote>
              <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3d635f] bg-white/75 px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4 text-[#2b99a6]" />
                Atención personalizada garantizada
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Baby, title: "Productos seleccionados", text: "Calidad, suavidad y cuidado para cada etapa de tu bebé.", bg: "from-[#E2F8F9] to-[#D5F3F4]", border: "border-[#bce8ea]" },
            { icon: Heart, title: "Atención personalizada", text: "Te asesoramos con amor, cercanía y confianza siempre.", bg: "from-[#FFF9CE] to-[#FFF6B8]", border: "border-amber-200/70" },
            { icon: DollarSign, title: "Cuidamos tu bolsillo", text: "Las mejores marcas y ofertas pensadas para tu familia.", bg: "from-[#FFF0DC] to-[#FFE2C0]", border: "border-orange-200/70" },
          ].map(({ icon: Icon, title, text, bg, border }) => (
            <div
              key={title}
              className={`relative overflow-hidden bg-gradient-to-br ${bg} ${border} border rounded-3xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
            >
              <div className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/40" />
              <div className="relative bg-white rounded-2xl p-3.5 shrink-0 shadow-sm ring-4 ring-white/60">
                <Icon className="w-6 h-6 text-[#2b99a6]" strokeWidth={2} />
              </div>
              <div className="relative">
                <h3 className="font-bold text-lg text-[#2b99a6]">{title}</h3>
                <p className="text-sm text-[#3d635f] mt-0.5 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
