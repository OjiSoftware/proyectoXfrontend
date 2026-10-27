import logoUpaLele from '@/assets/logo_upalele.PNG';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { catalogApi } from "@/services/CatalogService";
import { Product } from "@/types/product.types";

import {
    Baby, Droplets, Bath, Heart, Utensils, Tag, ShieldCheck, Truck,
    ChevronLeft, ChevronRight, ArrowRight, BadgeCheck, Sparkles,
} from 'lucide-react';

const categories = [
    { name: "Pañales", icon: Baby, bg: "bg-[#FFF6B8]" },
    { name: "Toallitas", icon: Droplets, bg: "bg-[#D5F3F4]" },
    { name: "Baño e Higiene", icon: Bath, bg: "bg-[#FFE0E6]" },
    { name: "Cuidado del Bebé", icon: Heart, bg: "bg-[#FFF6B8]" },
    { name: "Alimentación", icon: Utensils, bg: "bg-[#D5F3F4]" },
    { name: "Ofertas", icon: Tag, bg: "bg-[#FFE0E6]" },
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
        <div className="flex flex-col min-h-screen w-full bg-white font-nunito text-[#1A2D2A]">
            <Navbar search={search} setSearch={setSearch} />

            {/* Hero: banner principal + dos banners secundarios (estilo Babylist) */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-6 md:pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="relative lg:col-span-2 overflow-hidden rounded-3xl bg-[#2BAAB0] p-8 md:p-12 flex flex-col justify-center min-h-[320px] md:min-h-[400px]">
                        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute right-24 -bottom-20 w-56 h-56 rounded-full bg-[#FFE600]/20" />
                        <img
                            src={logoUpaLele}
                            alt="Upa Lelé Pañalera"
                            className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-52 lg:w-64 rounded-[2rem] shadow-2xl rotate-3 animate-[float_4s_ease-in-out_infinite]"
                        />
                        <span className="relative inline-block w-fit bg-white/20 text-white text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
                            Pañalera online
                        </span>
                        <h1 className="relative text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-[#FFE600] leading-[1.05] max-w-md mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,0.12)]">
                            Todo para tu bebé, en un solo lugar.
                        </h1>
                        <p className="relative text-white text-base md:text-lg max-w-sm mb-7">
                            Pañales, toallitas e higiene con envío rápido y los mejores precios.
                        </p>
                        <button
                            onClick={() => navigate('/catalogo')}
                            className="relative w-fit bg-[#FFE600] hover:bg-white text-[#1A2D2A] font-bold py-3 px-8 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest inline-flex items-center gap-2"
                        >
                            Comprar ahora <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <button
                            onClick={() => goSearch("Pañales")}
                            className="group text-left rounded-3xl bg-[#FFE600] p-6 md:p-8 min-h-[190px] flex flex-col justify-between hover:shadow-lg transition-shadow"
                        >
                            <Baby className="w-10 h-10 text-[#1E8A90]" strokeWidth={1.6} />
                            <div>
                                <h2 className="text-2xl font-bold text-[#1E8A90] leading-tight">Pañales para cada etapa</h2>
                                <span className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[#1A2D2A] group-hover:gap-2 transition-all">
                                    Ver pañales <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => goSearch("Ofertas")}
                            className="group text-left rounded-3xl bg-[#FFE0E6] p-6 md:p-8 min-h-[190px] flex flex-col justify-between hover:shadow-lg transition-shadow"
                        >
                            <Tag className="w-10 h-10 text-[#1E8A90]" strokeWidth={1.6} />
                            <div>
                                <h2 className="text-2xl font-bold text-[#1E8A90] leading-tight">Ofertas de la semana</h2>
                                <span className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[#1A2D2A] group-hover:gap-2 transition-all">
                                    Ver ofertas <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Comprar por categoría */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Comprá por categoría</h2>
                <div className="flex gap-5 md:gap-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {categories.map(({ name, icon: Icon, bg }) => (
                        <button
                            key={name}
                            onClick={() => goSearch(name)}
                            className="group flex flex-col items-center gap-3 shrink-0 w-28 md:w-36"
                        >
                            <div className={`${bg} w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 border-transparent group-hover:border-[#2BAAB0] group-hover:scale-105 transition-all duration-300`}>
                                <Icon className="w-10 h-10 md:w-14 md:h-14 text-[#1E8A90]" strokeWidth={1.6} />
                            </div>
                            <span className="text-sm md:text-base font-semibold text-center group-hover:text-[#1E8A90] transition-colors">
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
                        <h2 className="text-2xl md:text-3xl font-bold">Los más elegidos</h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/catalogo')} className="hidden sm:inline text-sm font-semibold text-[#1E8A90] underline underline-offset-4 decoration-[#FFE600] decoration-2">
                                Ver todo
                            </button>
                            <button onClick={() => scrollCarousel(-1)} aria-label="Anterior" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#2BAAB0] hover:text-white hover:border-[#2BAAB0] transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scrollCarousel(1)} aria-label="Siguiente" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#2BAAB0] hover:text-white hover:border-[#2BAAB0] transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                        {products.map((p) => (
                            <article
                                key={p.id}
                                onClick={() => goSearch(p.name)}
                                className="group snap-start shrink-0 w-[44%] sm:w-[30%] md:w-[23.5%] cursor-pointer"
                            >
                                <div className="aspect-square rounded-2xl bg-[#F4FBFB] overflow-hidden flex items-center justify-center mb-3 border border-gray-100">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <Baby className="w-12 h-12 text-[#2BAAB0]/50" />
                                    )}
                                </div>
                                {p.brand?.name && (
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{p.brand.name}</p>
                                )}
                                <h3 className="text-sm md:text-base font-semibold leading-snug line-clamp-2 min-h-[2.6em]">{p.name}</h3>
                                <p className="text-base md:text-lg font-bold text-[#1E8A90] mt-1">{formatPrice(p.price)}</p>
                                <button className="mt-2 w-full border-2 border-[#2BAAB0] text-[#1E8A90] group-hover:bg-[#2BAAB0] group-hover:text-white font-semibold text-sm py-2 rounded-full transition-colors">
                                    Ver producto
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Banner de marca */}
            <section className="w-full max-w-[1187px] mx-auto px-4 pt-12">
                <div className="relative overflow-hidden rounded-3xl bg-[#FFF6B8] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="pointer-events-none absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-[#2BAAB0]/15" />
                    <img src={logoUpaLele} alt="Upa Lelé" className="relative w-36 md:w-44 rounded-3xl shadow-lg -rotate-3" />
                    <div className="relative text-center md:text-left">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1E8A90] mb-3">Cuidamos a tu bebé como si fuera nuestro</h2>
                        <p className="text-base md:text-lg text-[#1A2D2A]/80 max-w-xl mb-5">
                            En Upa Lelé seleccionamos productos suaves, seguros y confiables para acompañarte en cada etapa.
                        </p>
                        <button
                            onClick={() => navigate('/nosotros')}
                            className="bg-[#2BAAB0] hover:bg-[#1E8A90] text-white font-bold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2 text-sm uppercase tracking-widest"
                        >
                            Conocenos <Sparkles className="w-4 h-4 text-[#FFE600]" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Por qué elegirnos */}
            <section className="w-full max-w-[1187px] mx-auto px-4 py-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Por qué comprar en Upa Lelé</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: Truck, title: "Envíos a todo el país", text: "Rapidez y seguridad en cada entrega.", bg: "bg-[#D5F3F4]" },
                        { icon: BadgeCheck, title: "Productos confiables", text: "Marcas elegidas con cuidado para su piel.", bg: "bg-[#FFF6B8]" },
                        { icon: ShieldCheck, title: "Compra 100% segura", text: "Tus datos están protegidos siempre.", bg: "bg-[#FFE0E6]" },
                    ].map(({ icon: Icon, title, text, bg }) => (
                        <div key={title} className={`${bg} rounded-3xl p-6 flex items-start gap-4`}>
                            <div className="bg-white rounded-full p-3 shrink-0">
                                <Icon className="w-6 h-6 text-[#1E8A90]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#1E8A90]">{title}</h3>
                                <p className="text-sm text-[#1A2D2A]/80">{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
