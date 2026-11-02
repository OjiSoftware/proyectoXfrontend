import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";


export default function ContactoPage() {
  // ---------------- STATE ----------------
  const [search, setSearch] = useState(""); // estado de búsqueda

  const phoneNumber = "+54 9 3456 47-9016";
  const displayPhone = "+54 9 3456 47-9016";
  const instagram = "@upalele_chajari";

  // Google Maps Embed URL para Av. Siburu 2045, Chajarí, Entre Ríos
  const mapEmbedUrl = "https://www.google.com/maps?q=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos&output=embed";
  const mapDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Avenida+Siburu+2045,+Chajar%C3%AD,+Entre+R%C3%ADos";
  const instagramUrl = "https://www.instagram.com/upalele_chajari/";
  const instagramUser = "@upalele_chajari";
  const phoneClean = "5493456479016";
  const phoneDisplay = "+54 9 3456 47-9016";
  const address = "Av. 9 de Julio 2045, Chajarí, Entre Ríos";


  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f5f6f8] font-nunito text-[#1A2D2A]">
      <Navbar search={search} setSearch={setSearch} />

      <main className="max-w-[1187px] mx-auto px-4 py-8 md:py-16 w-full flex-grow flex flex-col gap-12 md:gap-16">
        {/* Sección Ubicación y Google Maps */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#33aab8] font-bold text-xs uppercase tracking-widest font-fredoka mb-2 block">
                Encontranos
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-fredoka text-[#1A2D2A]">
                Vení a visitarnos a nuestro local
              </h2>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Estamos ubicados en una de las avenidas principales de Chajarí, Entre Ríos.
              </p>
            </div>

            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#33aab8] hover:bg-[#37b9c7] text-white text-xs md:text-sm font-bold uppercase tracking-wider py-3 px-6 rounded-full transition-all inline-flex items-center gap-2 shrink-0 w-fit shadow-sm"
            >
              <MapPin className="w-4 h-4" /> Cómo llegar con Google Maps
            </a>
          </div>

          {/* Grid: Tarjetas informativas + Mapa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Datos de contacto / horarios */}
            <div className="flex flex-col gap-4 justify-between">
              <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="bg-[#33aab8] text-white p-3 rounded-xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka text-[#1A2D2A] mb-1">Dirección</h3>
                  <p className="text-sm text-gray-600 leading-snug">{address}</p>
                </div>
              </div>

              <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="bg-[#33aab8] text-white p-3 rounded-xl shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka text-[#1A2D2A] mb-1">Teléfono / WhatsApp</h3>
                  <a
                    href={`https://wa.me/${phoneClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#33aab8] hover:underline"
                  >
                    {phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="bg-[#33aab8] text-white p-3 rounded-xl shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka text-[#1A2D2A] mb-1">Instagram</h3>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#33aab8] hover:underline"
                  >
                    {instagramUser}
                  </a>
                </div>
              </div>

              <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="bg-[#33aab8] text-white p-3 rounded-xl shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka text-[#1A2D2A] mb-1">Horarios de Atención</h3>
                  <p className="text-sm text-gray-600">Lunes a Sábados</p>
                  <p className="text-xs text-gray-500">Consultá promociones vigentes en el local</p>
                </div>
              </div>
            </div>

            {/* Google Maps Iframe */}
            <div className="lg:col-span-2 min-h-[320px] md:min-h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
              <iframe
                title="Ubicación de Upa Lelé en Chajarí"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "360px" }}
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
