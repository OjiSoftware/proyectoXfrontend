import React from "react";
import logo from "@/assets/upalele_logo.svg";
import { MapPin, Phone, Instagram, Heart, Sparkles } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto font-nunito">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#37b9c7] via-[#33aab8] to-[#268d99] text-white pt-12 pb-7 w-full subpixel-antialiased border-t-8 border-[#FFF6B8]">
        {/* Formas decorativas suaves */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-10 -bottom-20 w-56 h-56 rounded-full bg-[#FFF6B8]/15" />

        <div className="relative w-full max-[1187px]:px-6 max-w-[1187px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Columna 1: Marca */}
            <div className="flex flex-col items-start gap-3">

              <img
                src={logo}
                alt="Upa Lelé Pañalera"
                className="h-20 object-contain rounded-xl"
              />


              <p className="text-sm text-white/95 font-medium max-w-xs mt-1 leading-relaxed">
                Todo para tu bebé, en un solo lugar. Acompañándote con amor, suavidad y los mejores precios.
              </p>
            </div>

            {/* Columna 2: Accesos rápidos */}
            <div className="flex flex-col items-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-base font-bold tracking-wide text-[#FFF000] mb-1">
                <Sparkles className="w-4 h-4" /> Explorá Upa Lelé
              </span>
              <a
                href="/"
                className="text-sm text-white/90 hover:text-[#FFF6B8] hover:translate-x-1 transition-all"
              >
                Inicio
              </a>
              <a
                href="/catalogo"
                className="text-sm text-white/90 hover:text-[#FFF6B8] hover:translate-x-1 transition-all"
              >
                Tienda online
              </a>
              <a
                href="/nosotros"
                className="text-sm text-white/90 hover:text-[#FFF6B8] hover:translate-x-1 transition-all"
              >
                Sobre nosotros
              </a>
              <a
                href="/contacto"
                className="text-sm text-white/90 hover:text-[#FFF6B8] hover:translate-x-1 transition-all"
              >
                Contacto y ubicación
              </a>
            </div>

            {/* Columna 3: Contacto con íconos en burbuja */}
            <div className="flex flex-col items-start gap-3">
              <h3 className="text-base font-bold tracking-wide text-[#FFF000] mb-1">
                Contacto
              </h3>

              <div className="flex items-start gap-3">
                <div className="bg-white/15 border border-white/25 rounded-xl p-2 shrink-0">
                  <MapPin className="w-4 h-4 text-[#FFF6B8]" />
                </div>
                <p className="text-xs md:text-sm text-white/90 leading-snug">
                  <span className="font-bold text-white block">Sucursal Centro</span>
                  Avenida Siburu 2045, Chajarí, Entre Ríos.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/15 border border-white/25 rounded-xl p-2 shrink-0">
                  <Phone className="w-4 h-4 text-[#FFF6B8]" />
                </div>
                <a
                  href="https://wa.me/5493456479016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm text-white/90 hover:text-[#FFF6B8] transition-colors"
                >
                  <span className="font-bold text-white">Tel / WhatsApp:</span> +54 9 3456 47-9016
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/15 border border-white/25 rounded-xl p-2 shrink-0">
                  <Instagram className="w-4 h-4 text-[#FFF6B8]" />
                </div>
                <a
                  href="https://www.instagram.com/upalele_chajari/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm text-white/90 hover:text-[#FFF6B8] underline underline-offset-2 transition-colors"
                >
                  @upalele_chajari
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/15 mt-10 pt-6">
          <div className="w-full max-[1187px]:px-6 max-w-[1187px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/90 text-center md:text-left">
              © 2026 Pañalera Upa Lelé | Todos los derechos reservados. Desarrollado por OJI Software.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-[#FFF6B8] font-semibold">
              Hecho con <Heart className="w-3.5 h-3.5 fill-[#FFF6B8] text-[#FFF6B8]" /> en Chajarí
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
