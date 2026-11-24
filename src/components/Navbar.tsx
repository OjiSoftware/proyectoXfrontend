import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import logo from '@/assets/upalele_logo.svg';
import SearchBar from '@/components/SearchBar';
import { catalogApi } from '@/services/CatalogService';
import { Product } from '@/types/product.types';
import { useCart } from '@/context/CartContext';
import {
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface NavbarProps {
  search?: string;
  setSearch?: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  search: externalSearch,
  setSearch: externalSetSearch,
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState(
    searchParams.get('search') || '',
  );
  const search = externalSearch !== undefined ? externalSearch : localSearch;
  const setSearch = externalSetSearch || localSearchSetter;

  function localSearchSetter(value: string) {
    setLocalSearch(value);
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showEmptyToast, setShowEmptyToast] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await catalogApi.getCatalog();
        setCatProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCatalog();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const searchTerms = value.toLowerCase().trim().split(/\s+/);

    const filtered = catProducts.filter((p) => {
      const productName = p.name.toLowerCase();
      return searchTerms.every((term) => productName.includes(term));
    });

    setSuggestions(filtered.slice(0, 5));
    setIsDropdownOpen(true);
  };

  const handleSearchSubmit = (value: string) => {
    if (value.trim()) {
      setIsDropdownOpen(false);
      window.location.href = `/catalogo?search=${encodeURIComponent(value.trim())}`;
    } else {
      window.location.href = `/catalogo`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navPillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full transition-all duration-200 ${
      active
        ? 'bg-[#FFF6B8] text-[#2b99a6] font-bold shadow-xs border border-amber-200/70'
        : 'text-[#3d635f] hover:text-[#2b99a6] hover:bg-[#F4FBFB]'
    }`;

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md relative z-30 border-b border-[#D5F3F4] shadow-[0_6px_24px_-14px_rgba(43,170,176,0.25)] font-fredoka">
        <div className="max-w-[1187px] mx-auto px-4 py-3 md:pt-3 md:pb-3.5">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Botón Menú Móvil */}
            <button
              className="md:hidden text-[#2b99a6] bg-[#F4FBFB] border border-[#D5F3F4] rounded-xl p-2 hover:bg-[#D5F3F4]/50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="shrink-0">
              <img
                src={logo}
                alt="Logo"
                className="h-12 md:hidden object-contain my-0.5 drop-shadow-xs"
                onClick={() => (window.location.href = '/')}
                style={{ cursor: 'pointer' }}
              />
              <img
                src={logo}
                alt="Logo"
                className="hidden md:block h-20 object-contain rounded-2xl drop-shadow-xs hover:scale-[1.02] transition-transform"
                onClick={() => (window.location.href = '/')}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Bloque Central */}
            <div
              className="hidden md:flex flex-1 flex-col items-center max-w-[640px] relative"
              ref={wrapperRef}
            >
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                placeholder="¿Qué estás buscando para tu bebé?"
                containerClassName="w-full"
                inputClassName="
                  bg-[#F4FBFB]
                  text-[#1A2D2A]
                  placeholder:text-[#3d635f]/65
                  border-2 border-[#D5F3F4]
                  focus:border-[#37b9c7]
                  focus:bg-white
                  focus:shadow-[0_0_0_4px_rgba(213,243,244,0.55)]
                  py-2.5
                  h-auto
                  font-nunito
                  text-sm
                "
                iconClassName="text-[#2b99a6]"
              />

              {isDropdownOpen && (
                <div className="absolute top-[50px] w-full bg-white shadow-xl rounded-2xl mt-1 max-h-80 overflow-y-auto z-20 border border-[#D5F3F4] divide-y divide-gray-50">
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-3 hover:bg-[#F4FBFB] cursor-pointer flex items-center justify-between transition-colors group"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(p.name);
                        setIsDropdownOpen(false);
                        window.location.href = `/catalogo?search=${encodeURIComponent(p.name)}`;
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-[#F4FBFB] border border-[#D5F3F4] p-2 rounded-full text-[#2b99a6] group-hover:bg-[#37b9c7] group-hover:text-white transition-colors shrink-0">
                          <MagnifyingGlassIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#1A2D2A] font-nunito text-sm truncate max-w-[430px] group-hover:text-[#2b99a6] transition-colors">
                          {p.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <img
                          src={p.imageUrl || '/assets/placeholder-product.png'}
                          alt={p.name}
                          className="w-10 h-10 object-contain bg-[#F4FBFB] p-1 rounded-xl border border-[#D5F3F4]"
                        />
                        <span className="text-xs font-bold text-[#2b99a6] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver
                        </span>
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="px-6 py-8 text-center text-[#3d635f] flex flex-col items-center font-nunito">
                      <svg
                        className="w-12 h-12 text-[#37b9c7]/40 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="font-bold text-[#1A2D2A] mb-1">
                        No encontramos lo que buscás
                      </p>
                      <p className="text-sm text-[#3d635f]">
                        Intentá con otras palabras o{' '}
                        <NavLink
                          to="/contacto"
                          className="text-[#2b99a6] hover:text-[#33aab8] font-bold underline transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          contactanos
                        </NavLink>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex w-full justify-center items-center gap-4 lg:gap-8 text-[12px] subpixel-antialiased font-semibold font-nunito uppercase tracking-[0.16rem] mt-2.5">
                <a
                  href="/"
                  className={navPillClass(location.pathname === '/')}
                >
                  Inicio
                </a>
                <NavLink
                  to="/nosotros"
                  className={({ isActive }) => navPillClass(isActive)}
                >
                  Nosotros
                </NavLink>
                <NavLink
                  to="/contacto"
                  className={({ isActive }) => navPillClass(isActive)}
                >
                  Contacto
                </NavLink>
                <a
                  href="/catalogo"
                  className={navPillClass(location.pathname.startsWith('/catalogo'))}
                >
                  Tienda
                </a>
              </div>
            </div>

            {/* Carrito */}
            <div
              className="relative cursor-pointer shrink-0 group"
              ref={cartRef}
              onClick={() => {
                if (totalItems === 0) {
                  setShowEmptyToast(true);
                  setTimeout(() => setShowEmptyToast(false), 2000);
                  return;
                }
                navigate('/cart');
              }}
            >
              <div className="bg-[#F4FBFB] group-hover:bg-[#D5F3F4]/60 border-2 border-[#D5F3F4] group-hover:border-[#37b9c7] p-2 md:p-3 rounded-2xl shadow-xs transition-all duration-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-[#2b99a6] group-hover:scale-105 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              {/* TOAST POSICIONADO RESPECTO AL ICONO */}
              {showEmptyToast && (
                <div
                  className="absolute -bottom-13 right-0 flex items-center gap-2 whitespace-nowrap z-[100] animate-in fade-in slide-in-from-top-2 duration-300 bg-[#2b99a6] text-white px-3.5 py-2 rounded-xl shadow-lg border border-white/30"
                >
                  <div className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-[#2b99a6] border-l border-t border-white/30" />
                  <ExclamationCircleIcon
                    className="w-4 h-4 text-[#FFF6B8]"
                    strokeWidth={2.2}
                  />
                  <span className="text-xs font-bold font-nunito uppercase tracking-wider">
                    El carrito está vacío
                  </span>
                </div>
              )}

              {/* Badge de cantidad (totalItems) */}
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFF6B8] text-[#1A2D2A] border-2 border-white shadow-sm font-nunito text-[11px] font-extrabold h-5 w-5 md:h-6 md:w-6 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            </div>
          </div>

          {/* SearchBar Mobile */}
          <div className="mt-2.5 md:hidden relative" ref={wrapperRef}>
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Buscá pañales, toallitas..."
              inputClassName="
                bg-[#F4FBFB]
                text-[#1A2D2A]
                placeholder:text-[#3d635f]/65
                border-2 border-[#D5F3F4]
                focus:border-[#37b9c7]
                focus:bg-white
                py-2
                h-auto
                text-xs
                font-nunito
              "
              iconClassName="text-[#2b99a6]"
            />

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-2xl mt-1 max-h-64 overflow-y-auto z-20 border border-[#D5F3F4] divide-y divide-gray-50">
                {suggestions.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="px-4 py-3 hover:bg-[#F4FBFB] cursor-pointer flex items-center justify-between transition-colors group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearch(p.name);
                      setIsDropdownOpen(false);
                      window.location.href = `/catalogo?search=${encodeURIComponent(p.name)}`;
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-[#F4FBFB] border border-[#D5F3F4] p-2 rounded-full text-[#2b99a6] group-hover:bg-[#37b9c7] group-hover:text-white transition-colors shrink-0">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[#1A2D2A] font-nunito text-xs truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <img
                        src={p.imageUrl || '/assets/placeholder-product.png'}
                        alt={p.name}
                        className="w-8 h-8 object-contain bg-[#F4FBFB] p-0.5 rounded-lg border border-[#D5F3F4]"
                      />
                      <span className="text-xs font-bold text-[#2b99a6] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver
                      </span>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div className="px-6 py-6 text-center text-[#3d635f] flex flex-col items-center font-nunito">
                    <svg
                      className="w-10 h-10 text-[#37b9c7]/40 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="font-bold text-[#1A2D2A] mb-1 text-sm">
                      No encontramos lo que buscás
                    </p>
                    <p className="text-xs text-[#3d635f]">
                      Intentá con otras palabras o{' '}
                      <NavLink
                        to="/contacto"
                        className="text-[#2b99a6] hover:text-[#33aab8] font-bold underline transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        contactanos
                      </NavLink>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menú Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-[#37b9c7] to-[#2e9ca9] border-t border-white/20 shadow-inner">
            <div className="font-nunito flex flex-col p-4 space-y-2 text-xs font-bold uppercase tracking-widest">
              <a
                href="/"
                className={`px-4 py-2.5 rounded-xl transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#FFF6B8] text-[#1A2D2A]'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                Inicio
              </a>
              <NavLink
                to="/nosotros"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#FFF6B8] text-[#1A2D2A]'
                      : 'text-white hover:bg-white/15'
                  }`
                }
              >
                Nosotros
              </NavLink>
              <NavLink
                to="/contacto"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#FFF6B8] text-[#1A2D2A]'
                      : 'text-white hover:bg-white/15'
                  }`
                }
              >
                Contacto
              </NavLink>
              <a
                href="/catalogo"
                className={`px-4 py-2.5 rounded-xl transition-colors ${
                  location.pathname.startsWith('/catalogo')
                    ? 'bg-[#FFF6B8] text-[#1A2D2A]'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                Tienda
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* FAB carrito - solo mobile */}
      <button
        onClick={() => navigate('/cart')}
        className="md:hidden fixed bottom-6 right-5 z-50 w-14 h-14 bg-gradient-to-br from-[#37b9c7] to-[#28929f] text-white rounded-full ring-4 ring-white shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label="Ir al carrito"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FFF6B8] text-[#1A2D2A] border-2 border-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>
    </>
  );
};

export default Navbar;
