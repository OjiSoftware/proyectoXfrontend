import React, { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  ShoppingCart,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeftRight,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Percent,
  Package,
  Keyboard,
  X,
  Sparkles,
  Receipt,
  ChevronRight,
  RotateCcw,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "@/services/ProductService";
import { saleApi } from "@/services/SaleService";
import { clientApi } from "@/services/ClientService";
import { Product } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { Client } from "@/types/client.types";
import { getDriveDirectLink } from "@/helpers/url.helper";

// --- TIPOS DEL POS ---
interface CartItem {
  productId: number;
  name: string;
  barcode?: string | null;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
  categoryName?: string;
}

type PaymentMethodType = "CASH" | "TRANSFER" | "CARD" | "QR";

interface CustomerForm {
  mode: "FINAL_CONSUMER" | "EXISTING" | "NEW";
  existingClientId?: number;
  name: string;
  surname: string;
  dni: string;
  phoneNumber: string;
  email: string;
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  floor: string;
  apartment: string;
  reference: string;
}

interface PosTicket {
  id: string;
  label: string;
  createdAt: string;
  items: CartItem[];
  discountPercent: number;
  paymentMethod: PaymentMethodType;
  cashTendered: string;
  saleStatus: "COMPLETED" | "PENDING" | "IN_PROGRESS";
  sendEmail: boolean;
  customer: CustomerForm;
}

const DEFAULT_CUSTOMER: CustomerForm = {
  mode: "FINAL_CONSUMER",
  name: "Consumidor",
  surname: "Final",
  dni: "99999999",
  phoneNumber: "1100000000",
  email: "consumidorfinal@oji.local",
  street: "Mostrador",
  number: "1",
  city: "Local",
  province: "Buenos Aires",
  postalCode: "1000",
  country: "Argentina",
  floor: "",
  apartment: "",
  reference: "Venta en Caja POS",
};

const createEmptyTicket = (num: number): PosTicket => ({
  id: `ticket-${Date.now()}-${num}`,
  label: `Ticket #${num}`,
  createdAt: new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  items: [],
  discountPercent: 0,
  paymentMethod: "CASH",
  cashTendered: "",
  saleStatus: "COMPLETED",
  sendEmail: false,
  customer: { ...DEFAULT_CUSTOMER },
});

export default function CreateSalePage() {
  const navigate = useNavigate();

  // --- DATOS DE CATÁLOGO Y CLIENTES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- TICKETS / CARRITOS EN ESPERA ---
  const [tickets, setTickets] = useState<PosTicket[]>(() => [createEmptyTicket(1)]);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [ticketCounter, setTicketCounter] = useState(2);

  // --- FILTROS Y ESCÁNER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL" | "OFFERS">("ALL");
  const [mobileActivePane, setMobileActivePane] = useState<"CATALOG" | "TICKET">("CATALOG");

  // --- MODALES ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // --- REFS PARA ATAJOS DE TECLADO ---
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const activeTicket = tickets[activeTicketIndex] || tickets[0];

  // Helper para actualizar el ticket activo
  const updateActiveTicket = (updater: (prev: PosTicket) => PosTicket) => {
    setTickets((prev) =>
      prev.map((t, idx) => (idx === activeTicketIndex ? updater(t) : t))
    );
  };

  // --- CARGA INICIAL ---
  useEffect(() => {
    const loadPosData = async () => {
      try {
        setIsLoading(true);
        const [prodData, catData, cliData] = await Promise.all([
          productApi.getAllProducts().catch(() => []),
          productApi.getAllCategories().catch(() => []),
          clientApi.getAllClients().catch(() => []),
        ]);
        setProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);
        setClients(Array.isArray(cliData) ? cliData : []);
      } catch (err) {
        console.error("Error cargando datos del POS:", err);
        toast.error("Error al cargar catálogo de productos");
      } finally {
        setIsLoading(false);
      }
    };
    loadPosData();
  }, []);

  // --- CÁLCULOS DE TOTALES DEL TICKET ACTIVO ---
  const subtotal = useMemo(() => {
    return activeTicket.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );
  }, [activeTicket.items]);

  const discountAmount = useMemo(() => {
    const pct = Math.min(100, Math.max(0, activeTicket.discountPercent || 0));
    return Number(((subtotal * pct) / 100).toFixed(2));
  }, [subtotal, activeTicket.discountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  }, [subtotal, discountAmount]);

  const totalItemsCount = useMemo(() => {
    return activeTicket.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [activeTicket.items]);

  const cashTenderedNum = parseFloat(activeTicket.cashTendered) || 0;
  const changeAmount = Math.max(0, Number((cashTenderedNum - finalTotal).toFixed(2)));

  // --- FORMATEADOR MONEDA ---
  const formatARS = (amount: number) =>
    Number(amount || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  // --- FUNCIONES DE CARRITO ---
  const addProductToTicket = (product: Product, customQty = 1) => {
    const availableStock = product.stock ?? 0;
    if (availableStock <= 0) {
      toast.error(`"${product.name}" no tiene stock disponible`);
      return;
    }

    updateActiveTicket((ticket) => {
      const existing = ticket.items.find((i) => i.productId === product.id);
      let nextItems: CartItem[];

      if (existing) {
        if (existing.quantity + customQty > availableStock) {
          toast.error(`Stock máximo alcanzado (${availableStock} un.)`);
          return ticket;
        }
        nextItems = ticket.items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + customQty, availableStock) }
            : i
        );
      } else {
        nextItems = [
          ...ticket.items,
          {
            productId: product.id,
            name: product.name,
            barcode: product.barcode,
            price: Number(product.price),
            quantity: Math.min(customQty, availableStock),
            stock: availableStock,
            imageUrl: product.imageUrl,
            categoryName: product.category?.name,
          },
        ];
      }

      return { ...ticket, items: nextItems };
    });
  };

  const updateItemQuantity = (productId: number, newQty: number) => {
    updateActiveTicket((ticket) => {
      if (newQty <= 0) {
        return {
          ...ticket,
          items: ticket.items.filter((i) => i.productId !== productId),
        };
      }
      return {
        ...ticket,
        items: ticket.items.map((item) => {
          if (item.productId !== productId) return item;
          const clamped = Math.min(Math.max(1, newQty), item.stock);
          if (newQty > item.stock) {
            toast.error(`Solo hay ${item.stock} unidades en stock`);
          }
          return { ...item, quantity: clamped };
        }),
      };
    });
  };

  const removeItemFromTicket = (productId: number) => {
    updateActiveTicket((ticket) => ({
      ...ticket,
      items: ticket.items.filter((i) => i.productId !== productId),
    }));
  };

  const clearCurrentTicket = () => {
    updateActiveTicket((ticket) => ({
      ...ticket,
      items: [],
      discountPercent: 0,
      cashTendered: "",
    }));
    setShowClearConfirm(false);
    toast("Ticket vaciado", { icon: "🧹" });
  };

  // --- MANEJO DE ESCÁNER DE CÓDIGO DE BARRAS / ID ---
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const exactMatch = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        String(p.id) === code
    );

    if (exactMatch) {
      addProductToTicket(exactMatch);
      setBarcodeInput("");
      toast.success(`+1 ${exactMatch.name}`, { duration: 1500 });
      return;
    }

    const partialMatches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(code.toLowerCase()) ||
        (p.barcode && p.barcode.includes(code))
    );

    if (partialMatches.length === 1) {
      addProductToTicket(partialMatches[0]);
      setBarcodeInput("");
      toast.success(`+1 ${partialMatches[0].name}`, { duration: 1500 });
    } else if (partialMatches.length > 1) {
      setSearchQuery(code);
      setBarcodeInput("");
      toast(`Se encontraron ${partialMatches.length} productos similares`, {
        icon: "🔎",
      });
    } else {
      toast.error(`No se encontró producto con código "${code}"`);
    }
  };

  // --- GESTIÓN DE MÚLTIPLES TICKETS (VENTAS EN ESPERA) ---
  const handleCreateNewTicket = () => {
    const newTicket = createEmptyTicket(ticketCounter);
    setTickets((prev) => [...prev, newTicket]);
    setActiveTicketIndex(tickets.length);
    setTicketCounter((c) => c + 1);
    toast.success(`${newTicket.label} abierto en espera`);
  };

  const handleCloseTicketTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickets.length <= 1) {
      clearCurrentTicket();
      return;
    }
    const nextTickets = tickets.filter((_, i) => i !== idx);
    setTickets(nextTickets);
    if (activeTicketIndex >= nextTickets.length) {
      setActiveTicketIndex(nextTickets.length - 1);
    } else if (activeTicketIndex > idx) {
      setActiveTicketIndex((prev) => prev - 1);
    }
  };

  // --- FILTRADO DE PRODUCTOS EN EL CATÁLOGO ---
  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      if (p.status === false) return false;

      if (selectedCategoryId === "OFFERS") {
        if (!p.isOffer) return false;
      } else if (selectedCategoryId !== "ALL") {
        const prodCatId = p.category?.id ?? p.categoryId;
        if (prodCatId !== selectedCategoryId) return false;
      }

      if (!term) return true;

      const matchesName = p.name.toLowerCase().includes(term);
      const matchesBarcode = p.barcode?.toLowerCase().includes(term);
      const matchesId = String(p.id).includes(term);

      return matchesName || matchesBarcode || matchesId;
    });
  }, [products, searchQuery, selectedCategoryId]);

  // --- ATAJOS DE TECLADO GLOBALES PARA EL CAJERO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (activeTicket.items.length > 0) {
          setShowCheckoutModal(true);
        } else {
          toast.error("Agregá al menos un producto para cobrar");
        }
      } else if (e.key === "F6") {
        e.preventDefault();
        handleCreateNewTicket();
      } else if (e.key === "F8") {
        e.preventDefault();
        setShowClientModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // --- SUGERENCIAS DE BILLETES RÁPIDOS ---
  const quickCashSuggestions = useMemo(() => {
    if (finalTotal <= 0) return [];
    const exact = finalTotal;
    const roundUp1000 = Math.ceil(finalTotal / 1000) * 1000;
    const roundUp5000 = Math.ceil(finalTotal / 5000) * 5000;
    const roundUp10000 = Math.ceil(finalTotal / 10000) * 10000;
    const roundUp20000 = Math.ceil(finalTotal / 20000) * 20000;

    return Array.from(
      new Set([exact, roundUp1000, roundUp5000, roundUp10000, roundUp20000])
    )
      .filter((v) => v >= finalTotal)
      .slice(0, 4);
  }, [finalTotal]);

  // --- PROCESAR Y REGISTRAR LA VENTA EN EL BACKEND ---
  const handleFinalizeSale = async () => {
    if (activeTicket.items.length === 0) {
      toast.error("El ticket está vacío");
      return;
    }

    const cust = activeTicket.customer;

    if (cust.mode === "NEW") {
      const dniRegex = /^\d{7,8}$/;
      if (!cust.name.trim() || !cust.surname.trim()) {
        toast.error("Completá nombre y apellido del cliente");
        setShowClientModal(true);
        return;
      }
      if (!dniRegex.test(cust.dni.trim())) {
        toast.error("El DNI del cliente debe tener 7 u 8 dígitos sin puntos");
        setShowClientModal(true);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cust.email.trim())) {
        toast.error("Ingresá un email válido para el cliente");
        setShowClientModal(true);
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Procesando cobro y emitiendo ticket...");

    try {
      let resolvedClientId: number | undefined;

      if (cust.mode === "EXISTING" && cust.existingClientId) {
        resolvedClientId = cust.existingClientId;
      } else if (cust.mode === "FINAL_CONSUMER") {
        const existingCF = clients.find(
          (c) =>
            c.dni === "99999999" ||
            (c.name?.toLowerCase() === "consumidor" &&
              c.surname?.toLowerCase() === "final")
        );

        if (existingCF?.id) {
          resolvedClientId = existingCF.id;
        } else {
          const cfPayload = {
            name: "Consumidor",
            surname: "Final",
            dni: "99999999",
            phoneNumber: "1100000000",
            email: "consumidorfinal@oji.local",
            addresses: {
              street: "Venta en Mostrador POS",
              streetNum: 1,
              locality: "Local",
              province: "Buenos Aires",
              postalCode: "1000",
              country: "Argentina",
            },
          };
          const cfResp = await clientApi.create(cfPayload);
          resolvedClientId = cfResp.id || cfResp.client?.id;
        }
      } else {
        const clientPayload = {
          name: cust.name.trim(),
          surname: cust.surname.trim(),
          dni: cust.dni.trim(),
          phoneNumber: cust.phoneNumber.trim() || "1100000000",
          email: cust.email.trim(),
          addresses: {
            street: cust.street.trim() || "Mostrador",
            streetNum: parseInt(cust.number, 10) || 1,
            floor: cust.floor ? parseInt(cust.floor, 10) : undefined,
            apartment: cust.apartment || undefined,
            locality: cust.city.trim() || "Local",
            province: cust.province.trim() || "Buenos Aires",
            postalCode: cust.postalCode.trim() || "1000",
            country: cust.country.trim() || "Argentina",
            reference: cust.reference || undefined,
          },
        };
        const clientResponse = await clientApi.create(clientPayload);
        resolvedClientId = clientResponse.id || clientResponse.client?.id;
      }

      const salePayload = {
        clientId: resolvedClientId,
        status: activeTicket.saleStatus,
        sendEmail:
          activeTicket.saleStatus === "COMPLETED" &&
          cust.mode !== "FINAL_CONSUMER"
            ? activeTicket.sendEmail
            : false,
        details: activeTicket.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await saleApi.create(salePayload);

      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const soldItem = activeTicket.items.find((i) => i.productId === p.id);
          if (!soldItem) return p;
          return {
            ...p,
            stock: Math.max(0, (p.stock ?? 0) - soldItem.quantity),
          };
        })
      );

      toast.success("¡Venta registrada con éxito!", { id: toastId });
      setShowCheckoutModal(false);

      if (tickets.length > 1) {
        const remaining = tickets.filter((_, idx) => idx !== activeTicketIndex);
        setTickets(remaining);
        setActiveTicketIndex(Math.max(0, activeTicketIndex - 1));
      } else {
        setTickets([createEmptyTicket(ticketCounter)]);
        setTicketCounter((c) => c + 1);
      }
    } catch (error) {
      console.error("Error al registrar venta en POS:", error);
      toast.error("No se pudo registrar la venta. Verificá la conexión.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-3.5rem)] select-none">
        {/* ========================================================= */}
        {/* BARRA SUPERIOR POS: TÍTULO, TICKETS EN ESPERA Y ATAJOS    */}
        {/* ========================================================= */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          {/* Izquierda: Volver + Título Caja POS */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/management/sales")}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title="Volver al historial de ventas"
            >
              ← Historial
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Receipt size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-lg font-bold text-white leading-none">
                    Terminal POS
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Caja Abierta
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                  Punto de venta rápido • Facturación y control de stock
                </p>
              </div>
            </div>
          </div>

          {/* Centro: Pestañas de Tickets / Ventas en espera */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
            {tickets.map((t, idx) => {
              const isCurrent = idx === activeTicketIndex;
              const itemCount = t.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTicketIndex(idx)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600/25 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-[#12101F] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {isCurrent ? (
                    <PlayCircle size={14} className="text-indigo-400 shrink-0" />
                  ) : (
                    <PauseCircle size={14} className="text-amber-400 shrink-0" />
                  )}
                  <span>{t.label}</span>
                  {itemCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isCurrent
                          ? "bg-indigo-500 text-white"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseTicketTab(idx, e)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                      title="Cerrar este ticket"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleCreateNewTicket}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-dashed border-white/20 hover:border-indigo-400/40 text-xs font-semibold text-slate-300 hover:text-indigo-300 transition cursor-pointer shrink-0"
              title="Poner venta en espera y abrir nuevo ticket (F6)"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">En espera</span>
              <span className="text-[10px] text-slate-500 hidden lg:inline">(F6)</span>
            </button>
          </div>

          {/* Derecha: Botón de Atajos de teclado */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12101F] hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition cursor-pointer"
            >
              <Keyboard size={15} className="text-indigo-400" />
              <span>Atajos</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SWITCH MÓVIL: CATÁLOGO vs TICKET (< lg)                   */}
        {/* ========================================================= */}
        <div className="lg:hidden grid grid-cols-2 gap-2 my-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileActivePane("CATALOG")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
              mobileActivePane === "CATALOG"
                ? "bg-indigo-600 text-white border-indigo-400"
                : "bg-[#12101F] text-slate-400 border-white/10"
            }`}
          >
            <Package size={15} />
            Catálogo ({filteredProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePane("TICKET")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
              mobileActivePane === "TICKET"
                ? "bg-emerald-600 text-white border-emerald-400"
                : "bg-[#12101F] text-slate-400 border-white/10"
            }`}
          >
            <ShoppingCart size={15} />
            Ticket ({totalItemsCount}) • {formatARS(finalTotal)}
          </button>
        </div>

        {/* ========================================================= */}
        {/* CUERPO DIVIDIDO: IZQUIERDA (CATÁLOGO) | DERECHA (CAJA)    */}
        {/* ========================================================= */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 overflow-hidden">
          {/* --------------------------------------------------------- */}
          {/* PANEL IZQUIERDO (7 cols): ESCÁNER + FILTROS + GRILLA      */}
          {/* --------------------------------------------------------- */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 bg-[#0C0A15]/90 border border-white/10 rounded-2xl p-3.5 shadow-xl ${
              mobileActivePane === "TICKET" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Fila 1: Lector de código de barras + Buscador por nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 shrink-0">
              <form
                onSubmit={handleBarcodeSubmit}
                className="sm:col-span-5 relative group"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
                  <Barcode size={18} />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Escanear código o ID (F2)..."
                  className="w-full h-10 bg-[#151324] border border-indigo-500/30 focus:border-indigo-400 rounded-xl pl-9 pr-14 text-xs font-mono text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[10px] font-bold transition cursor-pointer"
                >
                  ENTER
                </button>
              </form>

              <div className="sm:col-span-7 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400">
                  <Search size={17} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto por nombre o marca (F3)..."
                  className="w-full h-10 bg-[#151320] border border-white/10 focus:border-indigo-400/50 rounded-xl pl-9 pr-8 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Fila 2: Chips de Categorías */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 shrink-0 border-b border-white/5">
              <button
                type="button"
                onClick={() => setSelectedCategoryId("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 border ${
                  selectedCategoryId === "ALL"
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                    : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                }`}
              >
                Todos ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategoryId("OFFERS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 border flex items-center gap-1 ${
                  selectedCategoryId === "OFFERS"
                    ? "bg-amber-500/25 text-amber-300 border-amber-400/50"
                    : "bg-amber-500/10 text-amber-300/80 border-amber-500/20 hover:bg-amber-500/20"
                }`}
              >
                <Sparkles size={13} />
                Ofertas
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 border ${
                    selectedCategoryId === cat.id
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                      : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Fila 3: Grilla de Productos Táctil Scrolleable */}
            <div className="flex-1 overflow-y-auto pr-1 pt-2.5 custom-scrollbar">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                  <Package size={36} className="text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    No se encontraron productos
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Probá con otro término o limpiá los filtros de categoría
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 pb-4">
                  {filteredProducts.map((product) => {
                    const stock = product.stock ?? 0;
                    const outOfStock = stock <= 0;
                    const lowStock = stock > 0 && stock <= 5;
                    const inCartItem = activeTicket.items.find(
                      (i) => i.productId === product.id
                    );

                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => addProductToTicket(product)}
                        className={`group relative text-left rounded-2xl p-2.5 border transition-all flex flex-col justify-between min-h-[128px] ${
                          outOfStock
                            ? "bg-[#110F1A]/50 border-white/5 opacity-45 cursor-not-allowed"
                            : inCartItem
                            ? "bg-indigo-950/40 border-indigo-500/60 hover:bg-indigo-900/40 shadow-[0_0_15px_rgba(99,102,241,0.15)] cursor-pointer active:scale-[0.98]"
                            : "bg-[#151322]/90 border-white/10 hover:border-indigo-400/50 hover:bg-[#1B182C] cursor-pointer active:scale-[0.98]"
                        }`}
                      >
                        {inCartItem && (
                          <span className="absolute -top-2 -right-2 z-10 min-w-6 h-6 px-1.5 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center shadow-lg border-2 border-[#0C0A15]">
                            {inCartItem.quantity}
                          </span>
                        )}

                        <div className="flex items-start gap-2.5">
                          <div className="w-11 h-11 rounded-xl bg-[#0C0A15] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={getDriveDirectLink(product.imageUrl)}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <Package size={18} className="text-slate-600" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-white">
                              {product.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">
                              {product.barcode ? `#${product.barcode}` : `ID: ${product.id}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-3 pt-2 border-t border-white/5 w-full">
                          <div>
                            {outOfStock ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase">
                                Sin stock
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  lowStock
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : "bg-white/5 text-slate-400"
                                }`}
                              >
                                Stock: {stock}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            {product.isOffer && (
                              <span className="block text-[9px] font-bold text-amber-400 uppercase">
                                Oferta
                              </span>
                            )}
                            <span className="text-sm font-black font-mono text-emerald-400">
                              {formatARS(product.price)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* PANEL DERECHO (5 cols): TICKET / CLIENTE / CAJA Y COBRO   */}
          {/* --------------------------------------------------------- */}
          <div
            className={`lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-[#0C0A15]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${
              mobileActivePane === "CATALOG" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* 1. Cabecera del Ticket: Selector Rápido de Cliente */}
            <div className="p-3 bg-[#141122] border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      activeTicket.customer.mode === "FINAL_CONSUMER"
                        ? "bg-slate-800 border-white/10 text-slate-300"
                        : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    }`}
                  >
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {activeTicket.customer.mode === "FINAL_CONSUMER"
                          ? "Consumidor Final"
                          : `${activeTicket.customer.name} ${activeTicket.customer.surname}`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                        {activeTicket.customer.mode === "FINAL_CONSUMER"
                          ? "Mostrador"
                          : `DNI ${activeTicket.customer.dni}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {activeTicket.customer.mode === "FINAL_CONSUMER"
                        ? "Venta rápida sin datos obligatorios"
                        : activeTicket.customer.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {activeTicket.customer.mode !== "FINAL_CONSUMER" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveTicket((t) => ({
                          ...t,
                          customer: { ...DEFAULT_CUSTOMER },
                        }))
                      }
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 cursor-pointer"
                      title="Volver a Consumidor Final"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition cursor-pointer"
                    title="Asignar o cargar datos de cliente (F8)"
                  >
                    <UserPlus size={14} />
                    <span>Cliente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Lista de Ítems del Ticket */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 px-3 custom-scrollbar">
              {activeTicket.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-2.5">
                    <ShoppingCart size={22} className="text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Ticket vacío
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[210px] mt-1">
                    Escaneá un código de barras o tocá cualquier producto del catálogo para sumarlo.
                  </p>
                </div>
              ) : (
                activeTicket.items.map((item, idx) => (
                  <div
                    key={item.productId}
                    className="py-2.5 flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">
                          #{idx + 1}
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {item.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatARS(item.price)} c/u
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (disp: {item.stock})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center bg-[#181528] border border-white/10 rounded-xl h-8 overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateItemQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-7 h-full flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            updateItemQuantity(item.productId, val);
                          }
                        }}
                        className="w-9 text-center bg-transparent text-xs font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        disabled={item.quantity >= item.stock}
                        onClick={() =>
                          updateItemQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-7 h-full flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold font-mono text-emerald-400 min-w-[70px] text-right">
                        {formatARS(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItemFromTicket(item.productId)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                        title="Quitar ítem"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Pie del Ticket: Descuentos, Medio de Pago, Totales y Botón Cobrar */}
            <div className="p-3.5 bg-[#131020] border-t border-white/10 space-y-3 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-[#0C0A15] border border-white/10 rounded-xl px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Percent size={12} className="text-indigo-400" />
                    Desc.
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          updateActiveTicket((t) => ({
                            ...t,
                            discountPercent: pct,
                          }))
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          activeTicket.discountPercent === pct
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#0C0A15] border border-white/10 rounded-xl px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Estado:
                  </span>
                  <select
                    value={activeTicket.saleStatus}
                    onChange={(e) =>
                      updateActiveTicket((t) => ({
                        ...t,
                        saleStatus: e.target.value as PosTicket["saleStatus"],
                      }))
                    }
                    className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="COMPLETED" className="bg-[#141122] text-emerald-400">
                      Completada
                    </option>
                    <option value="PENDING" className="bg-[#141122] text-amber-400">
                      Pendiente
                    </option>
                    <option value="IN_PROGRESS" className="bg-[#141122] text-blue-400">
                      En curso
                    </option>
                  </select>
                </div>
              </div>

              {/* Selector de Medio de Pago Rápido */}
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "CASH", label: "Efectivo", icon: Banknote },
                    { id: "TRANSFER", label: "Transf.", icon: ArrowLeftRight },
                    { id: "CARD", label: "Tarjeta", icon: CreditCard },
                    { id: "QR", label: "QR / MP", icon: QrCode },
                  ] as const
                ).map((pm) => {
                  const Icon = pm.icon;
                  const active = activeTicket.paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() =>
                        updateActiveTicket((t) => ({
                          ...t,
                          paymentMethod: pm.id,
                        }))
                      }
                      className={`py-2 px-1.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        active
                          ? "bg-indigo-600/25 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                          : "bg-[#0C0A15] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={active ? "text-indigo-300" : "text-slate-400"}
                      />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Resumen de importes */}
              <div className="bg-[#090710] border border-white/10 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    Subtotal ({totalItemsCount}{" "}
                    {totalItemsCount === 1 ? "unidad" : "unidades"})
                  </span>
                  <span className="font-mono">{formatARS(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>Descuento ({activeTicket.discountPercent}%)</span>
                    <span className="font-mono">- {formatARS(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-1 border-t border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Total a Cobrar
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatARS(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Botones de Acción de Caja */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeTicket.items.length === 0}
                  onClick={() => setShowClearConfirm(true)}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/15 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  title="Vaciar ticket actual"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  type="button"
                  disabled={activeTicket.items.length === 0 || isSubmitting}
                  onClick={() => setShowCheckoutModal(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTicket.items.length === 0 || isSubmitting
                      ? "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>Cobrar Venta (F4)</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE COBRO Y CÁLCULO DE VUELTO (CHECKOUT POS)         */}
      {/* ========================================================= */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowCheckoutModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#12101F] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#181529] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirmar Cobro • {activeTicket.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cliente:{" "}
                    <b className="text-slate-200">
                      {activeTicket.customer.mode === "FINAL_CONSUMER"
                        ? "Consumidor Final"
                        : `${activeTicket.customer.name} ${activeTicket.customer.surname}`}
                    </b>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-[#0B0914] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Total a Pagar
                  </span>
                  <span className="text-xs text-slate-500">
                    {totalItemsCount} productos en el ticket
                  </span>
                </div>
                <span className="text-3xl font-black font-mono text-emerald-400">
                  {formatARS(finalTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Medio de pago seleccionado
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: "CASH", label: "Efectivo", icon: Banknote },
                      { id: "TRANSFER", label: "Transferencia", icon: ArrowLeftRight },
                      { id: "CARD", label: "Tarjeta", icon: CreditCard },
                      { id: "QR", label: "QR / MP", icon: QrCode },
                    ] as const
                  ).map((pm) => {
                    const Icon = pm.icon;
                    const active = activeTicket.paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() =>
                          updateActiveTicket((t) => ({
                            ...t,
                            paymentMethod: pm.id,
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          active
                            ? "bg-indigo-600/30 border-indigo-400 text-white"
                            : "bg-[#171426] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTicket.paymentMethod === "CASH" && (
                <div className="bg-[#171426] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      ¿Con cuánto abona el cliente?
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {quickCashSuggestions.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            updateActiveTicket((t) => ({
                              ...t,
                              cashTendered: String(val),
                            }))
                          }
                          className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold transition cursor-pointer"
                        >
                          {formatARS(val)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Dinero recibido ($)
                      </span>
                      <input
                        ref={cashInputRef}
                        type="number"
                        min="0"
                        step="any"
                        autoFocus
                        value={activeTicket.cashTendered}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            cashTendered: e.target.value,
                          }))
                        }
                        placeholder={String(finalTotal)}
                        className="w-full bg-[#0C0A15] border border-white/15 focus:border-indigo-400 rounded-xl px-3 py-2 text-base font-mono font-bold text-white outline-none"
                      />
                    </div>

                    <div className="bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 flex flex-col justify-center">
                      <span className="text-[11px] text-slate-400">
                        Vuelto a entregar
                      </span>
                      <span
                        className={`text-xl font-black font-mono ${
                          cashTenderedNum >= finalTotal
                            ? "text-amber-400"
                            : "text-slate-600"
                        }`}
                      >
                        {cashTenderedNum >= finalTotal
                          ? formatARS(changeAmount)
                          : "$ 0"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTicket.customer.mode !== "FINAL_CONSUMER" &&
                activeTicket.saleStatus === "COMPLETED" && (
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeTicket.sendEmail}
                      onChange={(e) =>
                        updateActiveTicket((t) => ({
                          ...t,
                          sendEmail: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-white/20"
                    />
                    <span className="text-xs text-slate-200">
                      Enviar comprobante automático por email a{" "}
                      <b>{activeTicket.customer.email}</b>
                    </span>
                  </label>
                )}
            </div>

            <div className="px-6 py-4 bg-[#181529] border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 cursor-pointer"
              >
                Seguir editando
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalizeSale}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>
                  {isSubmitting ? "Registrando..." : "Confirmar y Emitir Venta"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE ASIGNACIÓN / CARGA DE CLIENTE (F8)               */}
      {/* ========================================================= */}
      {showClientModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowClientModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#12101F] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#181529] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="text-indigo-400" size={20} />
                <h3 className="text-base font-bold text-white">
                  Cliente del Ticket ({activeTicket.label})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      mode: "FINAL_CONSUMER",
                      title: "Consumidor Final",
                      desc: "Venta rápida de mostrador",
                    },
                    {
                      mode: "EXISTING",
                      title: "Cliente Registrado",
                      desc: `Elegir de la base (${clients.length})`,
                    },
                    {
                      mode: "NEW",
                      title: "Nuevo Cliente",
                      desc: "Cargar datos y facturación",
                    },
                  ] as const
                ).map((opt) => {
                  const active = activeTicket.customer.mode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        if (opt.mode === "FINAL_CONSUMER") {
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...DEFAULT_CUSTOMER },
                          }));
                        } else if (opt.mode === "NEW") {
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: {
                              mode: "NEW",
                              name: "",
                              surname: "",
                              dni: "",
                              phoneNumber: "",
                              email: "",
                              street: "Mostrador",
                              number: "1",
                              city: "Buenos Aires",
                              province: "Buenos Aires",
                              postalCode: "1000",
                              country: "Argentina",
                              floor: "",
                              apartment: "",
                              reference: "",
                            },
                          }));
                        } else {
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: {
                              ...t.customer,
                              mode: "EXISTING",
                            },
                          }));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        active
                          ? "bg-indigo-600/25 border-indigo-400 text-white"
                          : "bg-[#171426] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <p className="text-xs font-bold">{opt.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {activeTicket.customer.mode === "FINAL_CONSUMER" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                  <div>
                    <p className="font-bold">
                      Modo Consumidor Final activado
                    </p>
                    <p className="text-emerald-300/80 mt-0.5">
                      No necesitás pedir DNI ni dirección para cobrar en mostrador.
                    </p>
                  </div>
                </div>
              )}

              {activeTicket.customer.mode === "EXISTING" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase">
                    Seleccionar cliente existente
                  </label>
                  <div className="max-h-60 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-2xl bg-[#0C0A15]">
                    {clients.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">
                        No hay clientes registrados todavía. Usá la pestaña "Nuevo Cliente".
                      </p>
                    ) : (
                      clients.map((cli) => {
                        const isSelected =
                          activeTicket.customer.existingClientId === cli.id;
                        return (
                          <button
                            key={cli.id}
                            type="button"
                            onClick={() =>
                              updateActiveTicket((t) => ({
                                ...t,
                                customer: {
                                  ...t.customer,
                                  mode: "EXISTING",
                                  existingClientId: cli.id,
                                  name: cli.name,
                                  surname: cli.surname,
                                  dni: cli.dni,
                                  email: cli.email,
                                  phoneNumber: cli.phoneNumber || "",
                                },
                              }))
                            }
                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600/25 text-white"
                                : "hover:bg-white/5 text-slate-300"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">
                                {cli.surname}, {cli.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                DNI: {cli.dni} • {cli.email}
                              </p>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-indigo-400" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTicket.customer.mode === "NEW" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.name}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, name: e.target.value },
                          }))
                        }
                        placeholder="Ej: Juan"
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.surname}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, surname: e.target.value },
                          }))
                        }
                        placeholder="Ej: Pérez"
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        DNI (7-8 dígitos) *
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.dni}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, dni: e.target.value },
                          }))
                        }
                        placeholder="Sin puntos"
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        value={activeTicket.customer.email}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, email: e.target.value },
                          }))
                        }
                        placeholder="cliente@correo.com"
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.phoneNumber}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: {
                              ...t.customer,
                              phoneNumber: e.target.value,
                            },
                          }))
                        }
                        placeholder="+54 9 11..."
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Calle
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.street}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, street: e.target.value },
                          }))
                        }
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.number}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, number: e.target.value },
                          }))
                        }
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={activeTicket.customer.city}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: { ...t.customer, city: e.target.value },
                          }))
                        }
                        className="w-full bg-[#0C0A15] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#181529] border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Guardar y volver a Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE ATAJOS DE TECLADO                                */}
      {/* ========================================================= */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#12101F] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="text-indigo-400" size={20} />
                <h3 className="text-sm font-bold text-white">
                  Atajos de Teclado del Cajero
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                ["F2", "Enfocar lector de código de barras / ID"],
                ["F3", "Enfocar buscador de productos por nombre"],
                ["F4", "Abrir ventana de Cobro y Vuelto"],
                ["F6", "Poner ticket en espera y abrir uno nuevo"],
                ["F8", "Cambiar o cargar datos del Cliente"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="text-slate-300">{desc}</span>
                  <kbd className="px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-mono font-bold">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación para vaciar ticket */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Vaciar ticket actual"
        variant="danger"
        message="¿Estás seguro de quitar todos los productos cargados en este ticket?"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={clearCurrentTicket}
        confirmText="Vaciar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
