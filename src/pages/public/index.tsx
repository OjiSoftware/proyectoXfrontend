import homeBg from '@/assets/bright-brunette-yellow-sweater-smiling-standing-yellow.jpg';
import logoElementAll3 from '@/assets/logo_elementAll3.png';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

import { Glasses, Sun, Contact, Eye, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export default function HomePage() {
    // ---------------- STATE ----------------
    const [search, setSearch] = useState(""); // estado de búsqueda
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8F8F8] font-domine">
            {/* Sección Superior (Navbar + Hero) - Se estira para cubrir el resto de la pantalla, pero manteniendo como mínimo el 61.8% del alto */}
            <div className="flex flex-col h-[61.8vh] flex-grow">
                <div>
                    {/* Navbar con búsqueda */}
                    <Navbar search={search} setSearch={setSearch} />
                </div>

                {/* Contenido principal con imagen de fondo */}
                <div
                    className=" w-full flex-grow flex flex-col bg-cover bg-no-repeat bg-[center_top_20%]"
                    style={{ backgroundImage: `url(${homeBg})` }}
                >
                    <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto flex-grow flex flex-col pt-12 md:pt-24 lg:pt-32">
                        {/* Contenedor Flex para H1 (Izquierda) */}
                        <div className="w-full flex justify-between items-start">
                            <div className="w-full md:w-[50%] lg:w-[45%] bg-transparent p-6 lg:p-10 rounded-2xl ">
                                <h1 className="text-[1.8rem] md:text-[2.5rem] lg:text-[3.2rem] font-bold text-[#1A2D2A] text-left leading-[1.1] tracking-tight mb-4 lg:mb-6">
                                    Especialistas en Salud Visual.
                                </h1>
                                <p className="text-[#3b4b5e] text-sm md:text-base mb-6 md:mb-8 font-medium leading-relaxed max-w-sm">
                                    Encontrá tus anteojos ideales con asesoramiento profesional. Primeras marcas y la mejor calidad para tus ojos.
                                </p>
                                <button
                                    onClick={() => navigate('/catalogo')}
                                    className="bg-[#f5f6f8] hover:bg-[#EDC062]  text-[#1A2D2A] font-bold py-3 md:py-4 px-8 md:px-10 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    Ver Colección
                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#1A2D2A]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nueva Sección Inferior - Ocupa un mínimo del 38.2% del alto de la pantalla */}
            <div className="bg-white w-full flex flex-col items-center justify-center shadow-md relative z-10 border-t border-white ">
                <div className="w-full h-full max-h-[380px] max-[1187px]:px-4 max-w-[1187px] mx-auto flex flex-col justify-center lg:pt-5 pt-4 pb-6">
                    {/* Header de Categorias */}
                    <div className="flex justify-between items-end mb-4 pt-0">
                        <h2 className="text-[0.9rem] lg:text-[1.2rem] font-bold text-[#1A2D2A] text-left leading-tight">
                            Categorias destacadas
                        </h2>
                    </div>

                    {/* Cards de Categorias */}
                    <div className="flex w-full stretch md:justify-between gap-3 pb-2 md:gap-5 overflow-x-auto md:py-0 md:pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {[
                            {
                                id: 1,
                                name: "ANTEOJOS DE RECETA",
                                icon: <Glasses className="w-10 h-10 lg:w-14 lg:h-14 stroke-[1.5] text-[#EDC062]" />
                            },
                            {
                                id: 2,
                                name: "ANTEOJOS DE SOL",
                                icon: <Sun className="w-10 h-10 lg:w-14 lg:h-14 stroke-[1.5] text-[#EDC062]" />
                            },
                            {
                                id: 3,
                                name: "LENTES DE CONTACTO",
                                icon: <Contact className="w-10 h-10 lg:w-14 lg:h-14 stroke-[1.5] text-[#EDC062]" />
                            },
                            {
                                id: 4,
                                name: "SALUD VISUAL",
                                icon: <Eye className="w-10 h-10 lg:w-14 lg:h-14 stroke-[1.5] text-[#EDC062]" />
                            },
                        ].map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/catalogo?search=${encodeURIComponent(cat.name)}`)}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 hover:shadow-lg hover:border-[#FAD390] hover:-translate-y-1 transition-all duration-300 cursor-pointer aspect-square max-h-[160px] lg:max-h-[220px] w-full min-w-[120px] lg:min-w-[180px] max-w-[220px] flex-auto snap-start shrink-0 group"
                            >
                                <div className="bg-orange-50/50 p-4 rounded-full group-hover:bg-[#FAD390]/20 transition-colors duration-300">
                                    {cat.icon}
                                </div>
                                <h3 className="text-[#1A2D2A] font-bold text-[10px] lg:text-[14px] tracking-widest uppercase text-center mt-1">
                                    {cat.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trust Signals Section */}
            <div className="w-full bg-[#1A2D2A] py-8 md:py-12 border-t-4 border-[#EDC062]">
                <div className="w-full max-w-[1187px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
                    <div className="flex flex-col items-center justify-center p-4">
                        <Truck className="w-8 h-8 text-[#EDC062] mb-3" />
                        <h4 className="text-white font-bold text-sm lg:text-base uppercase tracking-widest mb-1">Envíos a todo el país</h4>
                        <p className="text-gray-400 text-xs lg:text-sm font-sans">Rapidez y seguridad garantizada en cada entrega.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <Eye className="w-8 h-8 text-[#EDC062] mb-3" />
                        <h4 className="text-white font-bold text-sm lg:text-base uppercase tracking-widest mb-1">Garantía de Adaptación</h4>
                        <p className="text-gray-400 text-xs lg:text-sm font-sans">Si no te acostumbrás a tus lentes de receta, te los cambiamos.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <ShieldCheck className="w-8 h-8 text-[#EDC062] mb-3" />
                        <h4 className="text-white font-bold text-sm lg:text-base uppercase tracking-widest mb-1">Compra 100% Segura</h4>
                        <p className="text-gray-400 text-xs lg:text-sm font-sans">Tus datos están protegidos y operamos con máxima confidencialidad.</p>
                    </div>
                </div>
            </div>


            <Footer />
        </div>
    );
}
