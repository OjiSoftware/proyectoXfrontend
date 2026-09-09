// ProductDetailPage.tsx
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
        style: { backgroundColor: "#EDC062", color: "#1A2D2A" },
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
      <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5]">
        <Navbar search="" setSearch={() => { }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EDC062]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[#f1f3f5]">
        <Navbar search="" setSearch={() => { }} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl text-gray-700 font-bold">{error || "Producto no encontrado"}</h2>
          <button
            onClick={() => navigate("/catalogo")}
            className="bg-[#EDC062] hover:bg-[#FAD390] text-[#1A2D2A] py-2 px-6 rounded-md font-bold transition-colors"
          >
            Volver al Catálogo
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F8F8F8] font-domine">
      {/* Navbar */}
      <Navbar search="" setSearch={() => { }} />

      <div className="w-full max-[1187px]:px-4 max-w-[1187px] mx-auto py-6 md:py-8 flex-grow">
        {/* BREADCRUMBS */}
        <div className="text-[#9E9494] md:text-sm text-xs mb-6 flex items-center gap-1.5 flex-wrap">
          <span
            className="hover:text-gray-600 cursor-pointer transition-colors"
            onClick={() => navigate("/")}
          >
            ElementAll
          </span>
          <span>/</span>
          <span
            className="hover:text-gray-600 cursor-pointer transition-colors"
            onClick={() => navigate("/catalogo")}
          >
            Catálogo
          </span>
          <span>/</span>
          <span className="cursor-default font-semibold text-gray-500">
            {product.name}
          </span>
        </div>

        {/* PRODUCT DETAIL CONTAINER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 [zoom:0.8] md:[zoom:1]">

          {/* LEFT COLUMN: Image */}
          <div className="w-full md:w-1/2 aspect-square flex items-center justify-center rounded-xl overflow-hidden p-4 bg-gray-50 relative">
            <img
              src={getDriveDirectLink(product.imageUrl) || "https://via.placeholder.com/400"}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />

            {/* IN CART BADGE */}
            {(() => {
              const cartItem = cart.find(item => item.product.id === product.id);
              if (cartItem && cartItem.quantity > 0) {
                return (
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#1A2D2A] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
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
            <h1 className="text-2xl md:text-3xl text-[#1A2D2A] font-bold tracking-tight mb-1">
              {product.name}
            </h1>
            <div className="text-xl text-[#1A2D2A] mb-1">
              {product.unit}
            </div>

            <div className="flex items-end gap-3 my-3">
              <div className="text-[#EDC062] font-black text-2xl md:text-3xl">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* PRODUCT METADATA */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 text-sm text-gray-600">
              {product.brand && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#1A2D2A]">Marca:</span>
                  <span>{product.brand.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1A2D2A]">Stock:</span>
                <span className={`${(product.stock || 0) > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}`}>
                  {(product.stock || 0) > 0 ? `${product.stock} disponibles` : "Agotado"}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="mt-3 mb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descripción</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <hr className="my-2 border-gray-100" />

            {maxAvailable <= 0 && quantityInCart > 0 && (
              <div className="mb-4 p-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm">
                Has alcanzado la cantidad máxima. Ya tienes todo el stock disponible de este producto en tu carrito.
              </div>
            )}
            {maxAvailable <= 0 && quantityInCart === 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                Producto agotado temporalmente.
              </div>
            )}

            {/* ADD TO CART CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              {/* Quantity Selector */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-10 shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-50 overflow-hidden w-fit mx-auto sm:w-auto sm:mx-0 shrink-0">
                <button
                  type="button"
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-colors cursor-pointer active:bg-gray-100"
                  onClick={() => setProductQuantity(Math.max(minQuantity, productQuantity - 1))}
                  disabled={maxAvailable <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
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
                  className="w-10 h-full text-center bg-transparent border-none font-bold text-[#3b4b5e] text-base focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={maxAvailable <= 0}
                />
                <button
                  type="button"
                  disabled={productQuantity >= maxAvailable}
                  className={`w-10 h-full flex items-center justify-center transition-colors ${productQuantity >= maxAvailable ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-white hover:text-[#EDC062] cursor-pointer active:bg-gray-100"}`}
                  onClick={() => setProductQuantity(Math.min(maxAvailable, productQuantity + 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Add Button */}
              <button
                className={`relative w-full h-10 ${isAdding ? "bg-[#FAD390]" : "bg-[#EDC062] hover:bg-[#FAD390]"} text-[#1A2D2A] rounded-lg flex items-center justify-center text-base font-bold transition-colors ${isAdding || maxAvailable <= 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer"} overflow-hidden shadow-sm`}
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Agregar al carrito</span>
                </div>
              </button>
            </div>
            {/* SUBTOTAL / TOTAL INFO */}
            <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <span>Unidades a agregar</span>
                <span className="font-bold text-[#1A2D2A]">{productQuantity}</span>
              </div>
              {quantityInCart > 0 && (
                <div className="flex justify-between items-center text-gray-600 text-sm">
                  <span>Unidades ya en carrito</span>
                  <span className="font-bold text-[#1A2D2A]">{quantityInCart}</span>
                </div>
              )}
              <hr className="my-1 border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#1A2D2A]">Subtotal Final <span className="text-sm font-normal text-gray-500">({productQuantity + quantityInCart} unid.)</span></span>
                <span className="text-2xl font-black text-[#EDC062]">
                  {formatPrice(product.price * (productQuantity + quantityInCart))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <SimilarProducts
          currentProductId={product.id}
          subCategoryId={product.subCategoryId}
        />
      </div>

      <Footer />
    </div>
  );
}
