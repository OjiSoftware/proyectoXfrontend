import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "@/services/ProductService";
import { Product } from "@/types/product.types";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SimilarProducts from "@/components/SimilarProducts";
import { getDriveDirectLink } from "@/helpers/url.helper";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await productApi.getById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        setError("El producto no existe o hubo un error al cargarlo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      addToCart(product, productQuantity);
      toast.success(`${product.name} agregado al carrito 🛒`, {
        style: { backgroundColor: "#37b9c7", color: "#FFE600", fontWeight: "bold" },
        duration: 2000,
      });
      setProductQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Error al agregar al carrito", {
        style: { backgroundColor: "#f44336", color: "white" },
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Evaluate if user can add more in the selector based on current cart
  const quantityInCart = cart.find(item => item.product.id === product?.id)?.quantity || 0;
  const maxAvailable = product?.stock !== undefined ? Math.max(0, product.stock - quantityInCart) : 0;
  const minQuantity = maxAvailable <= 0 ? 0 : 1;

  // React to maxAvailable changes to keep productQuantity valid
  useEffect(() => {
    if (productQuantity > maxAvailable) {
      setProductQuantity(Math.max(minQuantity, maxAvailable));
    } else if (productQuantity < minQuantity) {
      setProductQuantity(minQuantity);
    }
  }, [maxAvailable, minQuantity, productQuantity]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito">
        <Navbar search="" setSearch={() => { }} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#33aab8]"></div>
          <p className="text-sm font-bold text-[#2b99a6]">Cargando producto...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito">
        <Navbar search="" setSearch={() => { }} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="bg-white rounded-3xl p-8 border border-[#D5F3F4] shadow-sm text-center max-w-md">
            <h2 className="text-2xl text-[#2b99a6] font-bold mb-3">{error || "Producto no encontrado"}</h2>
            <button
              onClick={() => navigate("/catalogo")}
              className="bg-[#FFF6B8] hover:bg-[#FFF29C] text-[#1A2D2A] py-3 px-8 rounded-full font-bold transition-all shadow-sm cursor-pointer"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[linear-gradient(180deg,#d8f3f5_0%,#ffffff_420px,#ffffff_100%)] font-nunito text-[#1A2D2A]">
      {/* Navbar */}
      <Navbar search="" setSearch={() => { }} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-6 md:py-8 flex-grow">
        {/* BREADCRUMBS */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="text-[#3d635f] md:text-sm text-xs font-semibold flex items-center gap-1.5 flex-wrap bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D5F3F4] shadow-2xs">
            <span
              className="hover:text-[#2b99a6] cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              Upa Lelé
            </span>
            <span className="text-[#37b9c7]">/</span>
            <span
              className="hover:text-[#2b99a6] cursor-pointer transition-colors"
              onClick={() => navigate("/catalogo")}
            >
              Catálogo
            </span>
            {product.category?.name && (
              <>
                <span className="text-[#37b9c7]">/</span>
                <span
                  className="hover:text-[#2b99a6] cursor-pointer transition-colors"
                  onClick={() => navigate(`/catalogo?categoryId=${product.category.id}`)}
                >
                  {product.category.name}
                </span>
              </>
            )}
            <span className="text-[#37b9c7]">/</span>
            <span className="cursor-default font-bold text-[#2b99a6]">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => navigate("/catalogo")}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#2b99a6] hover:text-[#1A2D2A] bg-white/80 px-4 py-2 rounded-full border border-[#D5F3F4] shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </button>
        </div>

        {/* PRODUCT DETAIL CONTAINER */}
        <div className="bg-white rounded-3xl shadow-md border border-[#D5F3F4] p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">

          {/* LEFT COLUMN: Image */}
          <div className="w-full md:w-1/2 aspect-square flex items-center justify-center rounded-3xl overflow-hidden p-0 sm:p-4 md:p-6 bg-white border border-[#D5F3F4]/70 relative">
            <img
              src={getDriveDirectLink(product.imageUrl) || "https://via.placeholder.com/400"}
              alt={product.name}
              className="relative w-full h-full object-contain bg-white transition-transform duration-300 hover:scale-105"
            />
            {product.isOffer && (
              <span className="absolute top-4 right-4 rounded-full bg-[#FF8A3D] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                Oferta
              </span>
            )}
            {/* IN CART BADGE */}
            {(() => {
              const cartItem = cart.find(item => item.product.id === product.id);
              if (cartItem && cartItem.quantity > 0) {
                return (
                  <div className="absolute top-4 left-4 bg-[#2b99a6] text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5 ring-2 ring-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FFF000]">
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                    {cartItem.quantity} en tu carrito
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* RIGHT COLUMN: Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.brand && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2b99a6] bg-[#D5F3F4]/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> {product.brand.name}
                </span>
              )}
              {product.category?.name && (
                <span className="inline-block text-xs font-bold text-[#3d635f] bg-[#FFF6B8]/80 px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl text-[#1A2D2A] font-bold font-nunito tracking-tight mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 my-2">
              <div className="text-[#2b99a6] font-extrabold text-3xl md:text-4xl">
                {formatPrice(product.price)}
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${(product.stock || 0) > 0 ? 'bg-[#E2F8F9] text-[#2b99a6]' : 'bg-red-50 text-red-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {(product.stock || 0) > 0 ? `${product.stock} disponibles` : "Agotado"}
              </span>
            </div>

            {product.description && (
              <div className="mt-4 mb-5 bg-[#F4FBFB] border border-[#D5F3F4]/70 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-[#2b99a6] uppercase tracking-wider mb-1">Descripción</h3>
                <p className="text-sm text-[#3d635f] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {maxAvailable <= 0 && quantityInCart > 0 && (
              <div className="mb-4 p-3.5 bg-[#FFF0DC] text-[#8a5311] border border-orange-200 rounded-2xl text-sm font-semibold">
                Has alcanzado la cantidad máxima. Ya tenés todo el stock disponible de este producto en tu carrito.
              </div>
            )}
            {maxAvailable <= 0 && quantityInCart === 0 && (
              <div className="mb-4 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-semibold">
                Producto agotado temporalmente.
              </div>
            )}

            {/* ADD TO CART CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              {/* Quantity Selector */}
              <div className="flex items-center bg-[#F4FBFB] border border-[#D5F3F4] rounded-full h-12 shadow-xs transition-all focus-within:border-[#2BAAB0] focus-within:ring-2 focus-within:ring-[#2BAAB0]/20 overflow-hidden w-fit mx-auto sm:w-auto sm:mx-0 shrink-0 px-1">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#3d635f] hover:bg-white hover:text-red-500 transition-colors cursor-pointer"
                  onClick={() => setProductQuantity(Math.max(minQuantity, productQuantity - 1))}
                  disabled={maxAvailable <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={productQuantity === 0 ? "" : productQuantity}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === "") {
                      setProductQuantity(0);
                      return;
                    }
                    const val = parseInt(rawValue, 10);
                    if (!isNaN(val)) {
                      setProductQuantity(Math.min(Math.max(0, val), maxAvailable));
                    }
                  }}
                  onBlur={() => {
                    if (productQuantity < minQuantity) setProductQuantity(minQuantity);
                  }}
                  className="w-12 h-full text-center bg-transparent border-none font-extrabold text-[#1A2D2A] text-base focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={maxAvailable <= 0}
                />
                <button
                  type="button"
                  disabled={productQuantity >= maxAvailable}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${productQuantity >= maxAvailable ? "text-gray-300 cursor-not-allowed" : "text-[#3d635f] hover:bg-white hover:text-[#2b99a6] cursor-pointer"}`}
                  onClick={() => setProductQuantity(Math.min(maxAvailable, productQuantity + 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Add Button */}
              <button
                className={`relative w-full h-12 ${isAdding ? "bg-[#2b99a6]" : "bg-[#33aab8] hover:bg-[#2b99a6]"} text-white rounded-full flex items-center justify-center text-base font-bold transition-all ${isAdding || maxAvailable <= 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:-translate-y-0.5"} overflow-hidden shadow-[0_5px_0_rgba(26,45,42,0.12)]`}
                onClick={handleAddToCart}
                disabled={isAdding || maxAvailable <= 0}
              >
                {isAdding && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                <div className={`flex items-center justify-center gap-2 ${isAdding ? "invisible" : "visible"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Agregar al carrito</span>
                </div>
              </button>
            </div>

            {/* SUBTOTAL / TOTAL INFO */}
            <div className="mt-6 bg-gradient-to-br from-[#FFF9CE]/65 to-[#FFF6B8]/50 rounded-2xl p-5 border border-amber-200/70 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[#3d635f] text-sm font-semibold">
                <span>Unidades a agregar</span>
                <span className="font-extrabold text-[#2b99a6]">{productQuantity}</span>
              </div>
              {quantityInCart > 0 && (
                <div className="flex justify-between items-center text-[#3d635f] text-sm font-semibold">
                  <span>Unidades ya en carrito</span>
                  <span className="font-extrabold text-[#2b99a6]">{quantityInCart}</span>
                </div>
              )}
              <hr className="my-1 border-amber-200/60" />
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg font-bold text-[#2b99a6]">
                  Subtotal Final <span className="text-xs font-semibold text-[#3d635f]">({productQuantity + quantityInCart} unid.)</span>
                </span>
                <span className="text-2xl font-black text-[#2b99a6]">
                  {formatPrice(product.price * (productQuantity + quantityInCart))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <SimilarProducts
          currentProductId={product.id}
          categoryId={product.category?.id}
        />
      </div>

      <Footer />
    </div>
  );
}
