import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import logo from '@/assets/logo_elementAll.png';
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
  const setSearch = externalSetSearch || setLocalSearch;

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

  return (
    <>
      <nav className="w-full bg-white relative z-30 border-b-10 border-[#f5f6f8] font-domine">
        <div className="max-w-[1187px] mx-auto px-4 py-3 md:pt-2! md:pb-2!">
          <div className="flex items-center md:items-start! justify-between gap-4 md:gap-8">
            {/* Botón Menú Móvil */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="shrink-0 pt-1">
              <img
                src={logo}
                alt="Logo"
                className="h-12 md:hidden object-contain my-1"
                onClick={() => (window.location.href = '/')}
                style={{ cursor: 'pointer' }}
              />
              <img
                src={logo}
                alt="Logo"
                className="hidden md:block h-26 object-contain "
                onClick={() => (window.location.href = '/')}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Bloque Central */}
            <div
              className="hidden md:flex flex-1 flex-col items-center max-w-[650px] mt-4 relative"
              ref={wrapperRef}
            >
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                placeholder="Buscá anteojos, marcas, lentes..."
                containerClassName="w-full mb-3"
                inputClassName="
                                bg-[#f5f6f8]
                                text-[#1A2D2A]
                                placeholder:text-[#1A2D2A]/60
                                border-none
                                py-2
                                h-auto
                                font-sans
                            "
                iconClassName="text-[#1A2D2A]/80"
              />

              {isDropdownOpen && (
                <div className="absolute top-[55px] center w-[650px] bg-white shadow-xl rounded-xl mt-1 max-h-80 overflow-y-auto z-20 border border-gray-100 divide-y divide-gray-50">
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors group"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(p.name);
                        setIsDropdownOpen(false);
                        window.location.href = `/catalogo?search=${encodeURIComponent(p.name)}`;
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-[#FAD390] group-hover:text-[#1A2D2A] transition-colors">
                          <MagnifyingGlassIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-700 font-sans text-[14px] truncate max-w-[450px]">
                          {p.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Imagen del producto chiquita */}
                        <img
                          src={p.imageUrl || '/assets/placeholder-product.png'} // Ajustá la ruta a tu placeholder
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                        <span className="text-xs font-bold text-[#D4AC58] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver
                        </span>
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
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
                      <p className="font-semibold text-gray-700 mb-1 font-sans">
                        No encontramos lo que buscás
                      </p>
                      <p className="text-sm text-gray-500 font-sans">
                        Intentá con otras palabras o{' '}
                        <NavLink
                          to="/contacto"
                          className="text-[#D4AC58] hover:text-[#1A2D2A] font-semibold underline transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          contactanos
                        </NavLink>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex w-full justify-between text-[13px]  subpixel-antialiased font-medium font-sans uppercase tracking-[0.2rem] mt-2">
                <a
                  href="/"
                  className={`transition-colors ${location.pathname === '/' ? 'text-[#f9c72a]' : 'text-[#1A2D2A] hover:text-[#f9c72a]'}`}
                >
                  Inicio
                </a>
                <NavLink
                  to="/nosotros"
                  className={({ isActive }) =>
                    `transition-colors ${isActive ? 'text-[#f9c72a]' : 'text-[#1A2D2A] hover:text-[#f9c72a]'}`
                  }
                >
                  Nosotros
                </NavLink>
                <NavLink
                  to="/contacto"
                  className={({ isActive }) =>
                    `transition-colors ${isActive ? 'text-[#f9c72a]' : 'text-[#1A2D2A] hover:text-[#f9c72a]'}`
                  }
                >
                  Contacto
                </NavLink>
                <a
                  href="/catalogo"
                  className={`transition-colors ${location.pathname.startsWith('/catalogo') ? 'text-[#f9c72a]' : 'text-[#1A2D2A] hover:text-[#f9c72a]'}`}
                >
                  Tienda
                </a>
              </div>
            </div>

            {/* Carrito */}
            <div
              className="relative cursor-pointer shrink-0 md:pt-3"
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
              {/* Carrito mobile */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="md:hidden h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {/* Carrito desktop */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="hidden md:block h-7 w-7 text-[#1A2D2A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {/* TOAST POSICIONADO RESPECTO AL ICONO */}
              {showEmptyToast && (
                <div
                  className="absolute -bottom-12 right-0 flex items-center gap-2 whitespace-nowrap z-[100] animate-in fade-in slide-in-from-top-2 duration-300"
                  style={{
                    background: 'rgba(169, 68, 66, 0.95)', // El color #A94442 que ya usás
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Triangulito (flecha) apuntando hacia arriba */}
                  <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 bg-[#A94442] border-l border-t border-white/20"></div>

                  <ExclamationCircleIcon
                    className="w-5 h-5 text-red-200"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold font-sans uppercase tracking-tight">
                    El carrito está vacío
                  </span>
                </div>
              )}

              {/* Badge de cantidad (totalItems) */}
              <span className="md:mt-3 absolute -top-2 -right-2.5 bg-[#f5f6f8] text-[#1A2D2A] font-sans text-[10px] font-bold h-4 w-4 md:h-5 md:w-5 flex items-center justify-center rounded-full ">
                {totalItems}
              </span>
            </div>
          </div>

          {/* SearchBar Mobile */}
          <div className="mt-3 md:hidden relative" ref={wrapperRef}>
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Buscá anteojos..."
              inputClassName="
                            bg-[#82C355]
                            text-white
                            placeholder:text-green-100
                            border-none
                            py-2
                            h-auto
                            text-xs
                            font-sans
                        "
              iconClassName="text-white/80"
            />

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl mt-1 max-h-64 overflow-y-auto z-20 border border-gray-100 divide-y divide-gray-50">
                {suggestions.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearch(p.name);
                      setIsDropdownOpen(false);
                      window.location.href = `/catalogo?search=${encodeURIComponent(p.name)}`;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-green-50 group-hover:text-[#4caf50] transition-colors">
                        <MagnifyingGlassIcon className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-gray-700 font-sans text-[12px] truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <img
                        src={p.imageUrl || '/assets/placeholder-product.png'}
                        alt={p.name}
                        className="w-8 h-8 object-cover rounded-md border border-gray-200"
                      />
                      <span className="text-xs font-bold text-[#4caf50] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver
                      </span>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div className="px-6 py-6 text-center text-gray-500 flex flex-col items-center">
                    <svg
                      className="w-10 h-10 text-gray-300 mb-2"
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
                    <p className="font-semibold text-gray-700 mb-1 font-sans text-sm">
                      No encontramos lo que buscás
                    </p>
                    <p className="text-xs text-gray-500 font-sans">
                      Intentá con otras palabras o{' '}
                      <NavLink
                        to="/contacto"
                        className="text-[#4caf50] hover:text-[#f9c72a] font-semibold underline transition-colors"
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
          <div className="md:hidden bg-[#EDC062] border-t border-[#D4AC58]">
            <div className="flex flex-col p-4 space-y-4 text-[12px] font-bold font-sans uppercase tracking-widest">
              <a
                href="/"
                className={`transition-colors ${location.pathname === '/' ? 'text-[#f9c72a]' : 'text-white hover:text-[#f9c72a]'}`}
              >
                Inicio
              </a>
              <NavLink
                to="/nosotros"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'text-[#f9c72a]' : 'text-white hover:text-[#f9c72a]'}`
                }
              >
                Nosotros
              </NavLink>
              <NavLink
                to="/contacto"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'text-[#f9c72a]' : 'text-white hover:text-[#f9c72a]'}`
                }
              >
                Contacto
              </NavLink>
              <a
                href="/catalogo"
                className={`transition-colors ${location.pathname.startsWith('/catalogo') ? 'text-[#f9c72a]' : 'text-white hover:text-[#f9c72a]'}`}
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
        className="md:hidden fixed bottom-6 right-5 z-50 w-14 h-14 bg-[#1A2D2A] hover:bg-[#1A2D2A]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
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
          <span className="absolute -top-1 -right-1 bg-[#f9c72a] text-[#2f3027] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>
    </>
  );
};

export default Navbar;
