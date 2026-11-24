import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { MapPin, Phone, Clock, Instagram, Sparkles } from "lucide-react";

export default function ContactoPage() {
  const [search, setSearch] = useState("");

  // Google Maps Embed URL para Av. Siburu 2045, Chajarí, Entre Ríos
  const mapEmbedUrl = "https://www.google.com/maps?q=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos&output=embed";
  const mapDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos";
  const instagramUrl = "https://www.instagram.com/upalele_chajari/";
  const instagramUser = "@upalele_chajari";
  const phoneClean = "5493456479016";
  const phoneDisplay = "+54 9 3456 47-9016";
  const address = "Avenida Siburu 2045, Chajarí, Entre Ríos";

  const contactCards = [
    {
      icon: MapPin,
      title: "Dirección",
      bg: "from-[#E2F8F9] to-[#D5F3F4]",
      border: "border-[#bce8ea]",
      content: <p className="text-sm text-[#3d635f] leading-snug">{address}</p>,
    },
    {
      icon: Phone,
      title: "Teléfono / WhatsApp",
      bg: "from-[#FFF9CE] to-[#FFF6B8]",
      border: "border-amber-200/70",
      content: (
        <a
          href={`https://wa.me/${phoneClean}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-[#2b99a6] hover:underline"
        >
          {phoneDisplay}
        </a>
      ),
    },
    {
      icon: Instagram,
      title: "Instagram",
      bg: "from-[#FFF0DC] to-[#FFE2C0]",
      border: "border-orange-200/70",
      content: (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-[#2b99a6] hover:underline"
        >
          {instagramUser}
        </a>
      ),
    },
    {
      icon: Clock,
      title: "Horarios de Atención",
      bg: "from-[#E2F8F9] to-[#D5F3F4]",
      border: "border-[#bce8ea]",
      content: (
        <>
          <p className="text-sm font-semibold text-[#3d635f]">Lunes a Sábados</p>
          <p className="text-xs text-[#3d635f]/80">Consultá promociones vigentes en el local</p>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_460px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      <main className="max-w-[1187px] mx-auto px-4 py-6 md:py-10 w-full flex-grow flex flex-col gap-8">
        {/* Banner superior Contacto */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#37b9c7] via-[#33aab8] to-[#28929f] p-8 md:p-10 shadow-[0_14px_34px_-12px_rgba(43,170,176,0.45)] border border-white/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute left-24 -bottom-16 w-48 h-48 rounded-full bg-[#FFF6B8]/20" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF000]" /> Encontranos
            </span>
            <h1 className="text-2xl md:text-4xl font-bold font-fredoka text-[#FFF000] drop-shadow-[0_2px_0_rgba(0,0,0,0.14)]">
              Vení a visitarnos a nuestro local
            </h1>
            <p className="text-white/95 text-sm md:text-base mt-1.5 max-w-xl">
              Estamos ubicados en Avenida Siburu 2045, Chajarí, Entre Ríos. ¡Te esperamos!
            </p>
          </div>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative bg-[#FFF6B8] hover:bg-white text-[#1A2D2A] text-xs md:text-sm font-bold uppercase tracking-wider py-3.5 px-7 rounded-full transition-all inline-flex items-center gap-2 shrink-0 w-fit shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5"
          >
            <MapPin className="w-4 h-4 text-[#2b99a6]" /> Cómo llegar con Google Maps
          </a>
        </section>

        {/* Grid: Tarjetas informativas + Mapa */}
        <section className="bg-white rounded-3xl border border-[#D5F3F4] p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Datos de contacto / horarios */}
            <div className="flex flex-col gap-4 justify-between">
              {contactCards.map(({ icon: Icon, title, bg, border, content }) => (
                <div
                  key={title}
                  className={`relative overflow-hidden bg-gradient-to-br ${bg} ${border} border p-5 rounded-3xl flex items-start gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <div className="pointer-events-none absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/45" />
                  <div className="relative bg-white text-[#2b99a6] p-3 rounded-2xl shrink-0 shadow-xs ring-4 ring-white/60">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="relative">
                    <h3 className="font-bold text-base font-fredoka text-[#2b99a6] mb-0.5">{title}</h3>
                    {content}
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps Iframe */}
            <div className="lg:col-span-2 min-h-[340px] md:min-h-[440px] w-full rounded-3xl overflow-hidden shadow-sm border-2 border-[#D5F3F4] relative">
              <iframe
                title="Ubicación de Upa Lelé en Chajarí"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
