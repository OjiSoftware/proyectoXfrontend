import logoUpaLele from '@/assets/upalele_logo.svg';
import icon_logo from '@/assets/icon_logo.png';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { catalogApi } from "@/services/CatalogService";
import { Product } from "@/types/product.types";

import {
    Baby, Heart, Tag,
    ChevronLeft, ChevronRight, ArrowRight, Sparkles,
    DollarSign,
} from 'lucide-react';

type IconProps = { className?: string; strokeWidth?: number };

const DiaperIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 6h16v4c0 5.5-3.8 9-8 9s-8-3.5-8-9V6Z" />
        <path d="M4 10c3 0 5 2.5 5 6" />
        <path d="M20 10c-3 0-5 2.5-5 6" />
        <path d="M6.5 8.5h2" />
        <path d="M15.5 8.5h2" />
    </svg>
);

const WipesIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 8c0-2.5 2-4.5 4.5-4.5 1.8 0 3 1.2 3 2.5 0 1-1 2-1.5 2" />
        <rect x="3" y="8" width="18" height="12" rx="3" />
        <ellipse cx="12" cy="14" rx="4.5" ry="2.2" />
    </svg>
);

const PerfumeIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 4h4v3h-4z" />
        <path d="M12 4V2" />
        <path d="M9 3h6" />
        <rect x="6" y="7" width="12" height="14" rx="4" />
        <circle cx="12" cy="14" r="2.5" />
        <path d="M18 4l1.5-1.5" />
        <path d="M19.5 5.5H21" />
    </svg>
);

const BabyOnesieIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8.5 3.5 4 6.5l2 3.5 2-1v6c0 2 1.2 3 2.5 3.5.5 1 1 1.5 1.5 1.5s1-.5 1.5-1.5c1.3-.5 2.5-1.5 2.5-3.5V9l2 1 2-3.5-4.5-3c-.8 1.3-2 2-3.5 2s-2.7-.7-3.5-2Z" />
        <circle cx="12" cy="18" r="0.6" fill="currentColor" />
    </svg>
);

const RattleToyIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="14.5" cy="8.5" r="5" />
        <path d="M10.5 7c2 1 4 3 5 5" />
        <path d="M11 12 6.5 16.5" />
        <circle cx="5" cy="18" r="2" />
    </svg>
);

const BabyBottleIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 3h4v2a2 2 0 0 1-4 0V3Z" />
        <path d="M8 7h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
        <path d="M8 10h8v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-9Z" />
        <path d="M10 14h2" />
        <path d="M10 17h2" />
    </svg>
);

const ElderlyIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="5" r="2.2" />
        <path d="M13 10.5c-1-1.5-2.5-2-4-1.5l-1.5 5.5" />
        <path d="M9.5 14.5 8 21" />
        <path d="M11.5 14.5 13 21" />
        <path d="M13 10.5l3 3.5" />
        <path d="M17.5 14a1.5 1.5 0 0 0-3 0v7" />
    </svg>
);

const StrollerIcon = ({ className, strokeWidth = 1.6 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 6h2.5l2.5 8h8.5a2 2 0 0 0 1.9-1.4L21 8H10" />
        <path d="M10 8a5 5 0 0 1 9 0" />
        <circle cx="9.5" cy="18.5" r="2" />
        <circle cx="17.5" cy="18.5" r="2" />
    </svg>
);

const categories = [
    { name: "Pañales", icon: DiaperIcon, bg: "bg-[#FFF6B8]", ring: "group-hover:shadow-[#FFF6B8]/80" },
    { name: "Toallitas", icon: WipesIcon, bg: "bg-[#D5F3F4]", ring: "group-hover:shadow-[#D5F3F4]/90" },
    { name: "Perfumería", icon: PerfumeIcon, bg: "bg-[#FFE5C8]", ring: "group-hover:shadow-[#FFE5C8]/90" },
    { name: "Indumentaria", icon: BabyOnesieIcon, bg: "bg-[#FFF6B8]", ring: "group-hover:shadow-[#FFF6B8]/80" },
    { name: "Juguetes", icon: RattleToyIcon, bg: "bg-[#D5F3F4]", ring: "group-hover:shadow-[#D5F3F4]/90" },
    { name: "Accesorios", icon: BabyBottleIcon, bg: "bg-[#FFE5C8]", ring: "group-hover:shadow-[#FFE5C8]/90" },
    { name: "Adultos", icon: ElderlyIcon, bg: "bg-[#FFF6B8]", ring: "group-hover:shadow-[#FFF6B8]/80" },
    { name: "Rodados", icon: StrollerIcon, bg: "bg-[#D5F3F4]", ring: "group-hover:shadow-[#D5F3F4]/90" },
];

const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function HomePage() {
    // ---------------- STATE ----------------
    const [search, setSearch] = useState(""); // estado de búsqueda
    const [products, setProducts] = useState<Product[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        catalogApi
            .getCatalog()
            .then((data) => setProducts(data.slice(0, 12)))
            .catch((err) => console.error(err));
    }, []);

    const scrollCarousel = (dir: 1 | -1) =>
        carouselRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

    const goSearch = (term: string) => navigate(`/catalogo?search=${encodeURIComponent(term)}`);

    return (
        <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_460px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
            <Navbar search={search} setSearch={setSearch} />

            {/* Hero: banner principal + dos banners secundarios (estilo Babylist) */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-6 md:pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="relative lg:col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#37b9c7] via-[#33aab8] to-[#28929f] p-8 md:p-12 flex flex-col justify-center min-h-[320px] md:min-h-[400px] shadow-[0_14px_34px_-12px_rgba(43,170,176,0.45)] border border-white/30">
                        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/15 blur-[1px]" />
                        <div className="pointer-events-none absolute right-24 -bottom-20 w-56 h-56 rounded-full bg-[#FFF6B8]/25" />
                        <div className="pointer-events-none absolute left-1/2 top-6 w-24 h-24 rounded-full bg-white/10" />
                        <img
                            src={logoUpaLele}
                            alt="Upa Lelé Pañalera"
                            className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-52 lg:w-64 rounded-[2rem] shadow-2xl ring-4 ring-white/25 rotate-3 animate-[float_4s_ease-in-out_infinite]"
                        />
                        <span className="relative inline-flex items-center gap-1.5 w-fit bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-[#FFF000]" /> Tu pañalera online
                        </span>
                        <h1 className="relative text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-[#FFF000] leading-[1.05] max-w-md mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,0.14)]">
                            Todo para tu bebé, en un solo lugar.
                        </h1>
                        <p className="relative text-white/95 text-base md:text-lg max-w-sm mb-7 drop-shadow-sm">
                            Lo que necesitás, al mejor precio.
                            <br /> Encontranos en Avenida Siburu 2045, Chajarí
                        </p>
                        <button
                            onClick={() => navigate('/catalogo')}
                            className="relative w-fit bg-[#FFF6B8] hover:bg-white text-[#1A2D2A] font-bold py-3.5 px-8 rounded-full shadow-[0_6px_0_rgba(26,45,42,0.12)] hover:shadow-[0_8px_16px_rgba(26,45,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest inline-flex items-center gap-2"
                        >
                            Comprar ahora <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <button
                            onClick={() => goSearch("Pañales")}
                            className="group relative overflow-hidden text-left rounded-3xl bg-gradient-to-br from-[#FFF9CE] to-[#FFF29C] p-6 md:p-8 min-h-[190px] flex flex-col justify-end border border-amber-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="pointer-events-none absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/50" />
                            <DiaperIcon className="pointer-events-none absolute right-5 top-4 w-20 h-20 text-[#37b9c7]/35 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" strokeWidth={1.5} />

                            <div className="relative mt-auto pt-12">
                                <h2 className="text-2xl font-bold text-[#2b99a6] leading-tight">Pañales para cada etapa</h2>
                                <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-[#3d635f] group-hover:text-[#2b99a6] group-hover:gap-2.5 transition-all">
                                    Ver pañales <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => goSearch("Ofertas")}
                            className="group relative overflow-hidden text-left rounded-3xl bg-gradient-to-br from-[#FFF0DC] to-[#FFDDB5] p-6 md:p-8 min-h-[190px] flex flex-col justify-end border border-orange-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="pointer-events-none absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/50" />
                            <Tag className="pointer-events-none absolute right-5 top-4 w-20 h-20 text-[#37b9c7]/35 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" strokeWidth={1.5} />

                            <div className="relative mt-auto pt-12">
                                <h2 className="text-2xl font-bold text-[#2b99a6] leading-tight">Ofertas de la semana</h2>
                                <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-[#3d635f] group-hover:text-[#2b99a6] group-hover:gap-2.5 transition-all">
                                    Ver ofertas <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Comprar por categoría */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-14">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#37b9c7]">Explorá</span>
                        <h2 className="text-2xl md:text-3xl font-bold">Comprá por categoría</h2>
                    </div>
                </div>
                <div className="flex items-start gap-4 md:gap-5 overflow-x-auto lg:overflow-visible lg:justify-between pt-3 pb-3 px-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] w-full">
                    {categories.map(({ name, icon: Icon, bg, ring }) => (
                        <button
                            key={name}
                            onClick={() => goSearch(name)}
                            className="group flex flex-col items-center gap-2.5 shrink-0 w-24 sm:w-28 lg:w-auto lg:flex-1 lg:min-w-0"
                        >
                            <div className={`relative ${bg} w-24 h-24 sm:w-28 sm:h-28 lg:w-full lg:max-w-[112px] lg:h-auto lg:aspect-square rounded-[2rem] flex items-center justify-center ring-4 ring-white shadow-md ${ring} group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:rotate-2 transition-all duration-300 border-2 border-black/5 group-hover:border-[#2BAAB0]`}>
                                <Icon className="relative w-10 h-10 md:w-11 md:h-11 text-[#2b99a6] drop-shadow-[0_2px_0_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.7} />
                            </div>
                            <span className="text-sm md:text-base font-bold text-center text-[#1A2D2A] group-hover:text-[#37b9c7] transition-colors">
                                {name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Carrusel de productos */}
            {products.length > 0 && (
                <section className="w-full max-w-[1187px] mx-auto px-4 pt-12">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#37b9c7]">Favoritos</span>
                            <h2 className="text-2xl md:text-3xl font-bold">Los más elegidos</h2>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button onClick={() => navigate('/catalogo')} className="hidden sm:inline text-sm font-bold text-[#37b9c7] hover:text-[#28929f] underline underline-offset-4 decoration-[#FFE600] decoration-2 mr-1">
                                Ver todo
                            </button>
                            <button onClick={() => scrollCarousel(-1)} aria-label="Anterior" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#2BAAB0] hover:text-white hover:border-[#2BAAB0] transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scrollCarousel(1)} aria-label="Siguiente" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#2BAAB0] hover:text-white hover:border-[#2BAAB0] transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div ref={carouselRef} className="flex gap-2.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory pt-2 pb-4 px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                        {products.map((p) => (
                            <article
                                key={p.id}
                                onClick={() => goSearch(p.name)}
                                className="group snap-start shrink-0 w-[46%] sm:w-[31%] md:w-[23.5%] cursor-pointer bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#D5F3F4] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative aspect-square rounded-2xl bg-white overflow-hidden flex items-center justify-center mb-3">
                                        {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-contain p-0 sm:p-2 bg-white group-hover:scale-108 transition-transform duration-300" />
                                        ) : (
                                            <Baby className="w-12 h-12 text-[#2BAAB0]/50" />
                                        )}
                                    </div>
                                    {p.brand?.name && (
                                        <span className="inline-block text-[11px] font-bold text-[#2b99a6] bg-[#D5F3F4]/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                                            {p.brand.name}
                                        </span>
                                    )}
                                    <h3 className="text-sm md:text-base font-bold text-[#1A2D2A] leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-[#2b99a6] transition-colors">
                                        {p.name}
                                    </h3>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-lg md:text-xl font-extrabold text-[#1A2D2A]">{formatPrice(p.price)}</p>
                                    <button className="mt-2.5 w-full bg-[#F4FBFB] border-2 border-[#2BAAB0] text-[#2b99a6] group-hover:bg-[#2BAAB0] group-hover:text-white font-bold text-sm py-2 rounded-full transition-all shadow-xs">
                                        Ver producto
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Banner de marca */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-12">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2e9ca9] via-[#33aab8] to-[#3ec0cf] p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-8 shadow-[0_14px_34px_-12px_rgba(43,170,176,0.45)] border border-white/30">
                    <div className="pointer-events-none absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-[#FFF6B8]/20" />
                    <div className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10" />
                    <img src={icon_logo} alt="Upa Lelé" className="relative w-48 md:w-60 -rotate-3 shrink-0 drop-shadow-xl" />
                    <div className="relative flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
                            Amor y confianza
                        </span>
                        <h2 className="text-2xl md:text-4xl font-bold text-[#FFF000] mb-3 drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">
                            Elegidos por mamás y papás que buscan lo mejor.
                        </h2>
                        <p className="text-sm md:text-base text-white/95 max-w-xl mb-6">
                            En Upa Lelé seleccionamos productos suaves, seguros y confiables para acompañarte en cada etapa de crecimiento.
                        </p>
                        <button
                            onClick={() => navigate('/nosotros')}
                            className="bg-[#FFF6B8] hover:bg-white text-[#1A2D2A] font-bold py-3 px-8 rounded-full shadow-[0_5px_0_rgba(26,45,42,0.12)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-sm uppercase tracking-widest"
                        >
                            Conocénos <Sparkles className="w-4 h-4 text-[#2b99a6]" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Por qué elegirnos */}
            <section className="w-full max-w-[1187px] mx-auto px-4 py-14">
                <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#37b9c7]">Nuestros pilares</span>
                    <h2 className="text-2xl md:text-3xl font-bold mt-1">Por qué comprar en Upa Lelé</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                </div>
            </section>

            <Footer />
        </div>
    );
}
