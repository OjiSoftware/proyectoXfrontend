import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
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
  X,
  ArrowUp,
  ArrowDown,
  Zap,
  LogOut,
  Pencil,
  Check,
  Keyboard,
} from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "@/services/ProductService";
import { saleApi } from "@/services/SaleService";
import { clientApi } from "@/services/ClientService";
import { Product } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { Client } from "@/types/client.types";

interface CartItem {
  productId: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  isDiaper: boolean;
}

type PaymentMethodType = "CASH" | "CARD" | "TRANSFER" | "QR";

interface CustomerData {
  mode: "FINAL_CONSUMER" | "EXISTING" | "NEW";
  existingClientId?: number;
  name: string;
  surname: string;
  dni: string;
  phoneNumber: string;
  email: string;
}

interface PosTicket {
  id: string;
  label: string;
  items: CartItem[];
  paymentMethod: PaymentMethodType;
  cashTendered: string;
  customer: CustomerData;
}

const CARD_DIAPER_SURCHARGE_RATE = 0.05; // +5% en pañales abonando con tarjeta

const normalizeText = (value?: string | null): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const DEFAULT_CUSTOMER: CustomerData = {
  mode: "FINAL_CONSUMER",
  name: "Consumidor",
  surname: "Final",
  dni: "99999999",
  phoneNumber: "1100000000",
  email: "consumidorfinal@oji.local",
};

const createEmptyTicket = (num: number): PosTicket => ({
  id: `t-${Date.now()}-${num}`,
  label: `#${num}`,
  items: [],
  paymentMethod: "CASH",
  cashTendered: "",
  customer: { ...DEFAULT_CUSTOMER },
});

export default function CreateSalePage() {
  const navigate = useNavigate();

  // --- DATOS CACHEADOS EN MEMORIA PARA RESPUESTA INSTANTÁNEA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<number, string>>(
    () => new Map()
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [defaultClientId, setDefaultClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADO DE CAJA Y TICKETS ---
  const [tickets, setTickets] = useState<PosTicket[]>(() => [createEmptyTicket(1)]);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [ticketCounter, setTicketCounter] = useState(2);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // --- ENTRADA PRINCIPAL (ESCÁNER / TECLADO NUMÉRICO / MULTIPLICADOR) ---
  const [commandInput, setCommandInput] = useState("");
  const [pendingMultiplier, setPendingMultiplier] = useState<number | null>(null);
  const [clockText, setClockText] = useState("");

  // --- MODALES PUNTUALES (SOLO CUANDO SE NECESITAN) ---
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showQtyEditModal, setShowQtyEditModal] = useState(false);
  const [qtyEditValue, setQtyEditValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // --- REFS PARA FOCO PERMANENTE (CERO CLICS) ---
  const commandInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const activeTicket = tickets[activeTicketIndex] || tickets[0];

  const isAnyModalOpen =
    showSearchModal ||
    showCheckoutModal ||
    showClientModal ||
    showQtyEditModal ||
    showClearConfirm ||
    showHelpModal;

  // Reloj operativo estilo POS clásico
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockText(
        now.toLocaleDateString("es-AR") +
        " " +
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial en paralelo
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const [prodData, catData, cliData] = await Promise.all([
          productApi.getAllProducts().catch(() => []),
          productApi.getAllCategories().catch(() => []),
          clientApi.getAllClients().catch(() => []),
        ]);
        const validProds = Array.isArray(prodData)
          ? prodData.filter((p) => p.status !== false)
          : [];
        const validCats: Category[] = Array.isArray(catData) ? catData : [];
        const validClients = Array.isArray(cliData) ? cliData : [];

        const catMap = new Map<number, string>();
        validCats.forEach((c) => catMap.set(c.id, c.name));

        setCategoriesMap(catMap);
        setProducts(validProds);
        setClients(validClients);

        const existingCF = validClients.find(
          (c) =>
            c.dni === "99999999" ||
            (c.name?.toLowerCase() === "consumidor" &&
              c.surname?.toLowerCase() === "final")
        );
        if (existingCF?.id) {
          setDefaultClientId(existingCF.id);
        }
      } catch (error) {
        console.error("Error cargando POS:", error);
        toast.error("Error al cargar datos de caja");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Detector de artículo de pañales (por categoría o por nombre del producto)
  const isDiaperProduct = useCallback(
    (product: Product): boolean => {
      const categoryName =
        product.category?.name ||
        (product.categoryId ? categoriesMap.get(product.categoryId) : "");
      const normCat = normalizeText(categoryName);
      const normName = normalizeText(product.name);
      return normCat.includes("panal") || normName.includes("panal");
    },
    [categoriesMap]
  );

  // Mantener foco siempre en la lectora cuando no hay un modal abierto
  const focusScanner = useCallback(() => {
    if (!isAnyModalOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 10);
    }
  }, [isAnyModalOpen]);

  useEffect(() => {
    focusScanner();
  }, [isAnyModalOpen, activeTicketIndex, focusScanner]);

  // --- HELPER ACTUALIZACIÓN TICKET ---
  const updateActiveTicket = useCallback(
    (updater: (prev: PosTicket) => PosTicket) => {
      setTickets((prev) =>
        prev.map((t, idx) => (idx === activeTicketIndex ? updater(t) : t))
      );
    },
    [activeTicketIndex]
  );

  // Mantener fila seleccionada válida
  useEffect(() => {
    if (activeTicket.items.length === 0) {
      setSelectedRowId(null);
    } else if (
      selectedRowId === null ||
      !activeTicket.items.some((i) => i.productId === selectedRowId)
    ) {
      setSelectedRowId(
        activeTicket.items[activeTicket.items.length - 1].productId
      );
    }
  }, [activeTicket.items, selectedRowId]);

  // --- TOTALES Y RECARGO TARJETA EN PAÑALES (+5%) ---
  const subtotal = useMemo(
    () =>
      activeTicket.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
    [activeTicket.items]
  );

  const diaperSubtotal = useMemo(
    () =>
      activeTicket.items.reduce(
        (acc, item) => (item.isDiaper ? acc + item.price * item.quantity : acc),
        0
      ),
    [activeTicket.items]
  );

  const potentialCardDiaperSurcharge = useMemo(
    () => Number((diaperSubtotal * CARD_DIAPER_SURCHARGE_RATE).toFixed(2)),
    [diaperSubtotal]
  );

  const activeCardSurcharge = useMemo(
    () =>
      activeTicket.paymentMethod === "CARD" ? potentialCardDiaperSurcharge : 0,
    [activeTicket.paymentMethod, potentialCardDiaperSurcharge]
  );

  const finalTotal = useMemo(
    () => Math.max(0, Number((subtotal + activeCardSurcharge).toFixed(2))),
    [subtotal, activeCardSurcharge]
  );

  const totalUnits = useMemo(
    () => activeTicket.items.reduce((acc, i) => acc + i.quantity, 0),
    [activeTicket.items]
  );

  const cashTenderedNum = parseFloat(activeTicket.cashTendered) || 0;
  const changeAmount = Math.max(
    0,
    Number((cashTenderedNum - finalTotal).toFixed(2))
  );

  const formatARS = (val: number) =>
    Number(val || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // --- OPERACIONES DE LÍNEAS DEL TICKET ---
  const addProduct = useCallback(
    (product: Product, qtyToAdd?: number) => {
      const qty = qtyToAdd ?? pendingMultiplier ?? 1;
      const available = product.stock ?? 0;

      if (available <= 0) {
        toast.error(`SIN STOCK: ${product.name}`, { duration: 1800 });
        setPendingMultiplier(null);
        return false;
      }

      const diaperFlag = isDiaperProduct(product);
      let addedOk = true;

      updateActiveTicket((ticket) => {
        const existing = ticket.items.find((i) => i.productId === product.id);
        if (existing) {
          if (existing.quantity + qty > available) {
            toast.error(`Stock máximo disponible: ${available}`, {
              duration: 1800,
            });
            addedOk = false;
            return ticket;
          }
          return {
            ...ticket,
            items: ticket.items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + qty, isDiaper: diaperFlag }
                : i
            ),
          };
        }

        if (qty > available) {
          toast.error(`Solo hay ${available} u. disponibles`, {
            duration: 1800,
          });
          addedOk = false;
          return ticket;
        }

        return {
          ...ticket,
          items: [
            ...ticket.items,
            {
              productId: product.id,
              code: product.barcode || String(product.id),
              name: product.name,
              price: Number(product.price),
              quantity: qty,
              stock: available,
              isDiaper: diaperFlag,
            },
          ],
        };
      });

      if (addedOk) {
        setSelectedRowId(product.id);
        setPendingMultiplier(null);
      }
      return addedOk;
    },
    [isDiaperProduct, pendingMultiplier, updateActiveTicket]
  );

  const setLineQuantity = useCallback(
    (productId: number, newQty: number) => {
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
            if (newQty > item.stock) {
              toast.error(`Stock máximo: ${item.stock}`, { duration: 1500 });
              return { ...item, quantity: item.stock };
            }
            return { ...item, quantity: newQty };
          }),
        };
      });
    },
    [updateActiveTicket]
  );

  const adjustSelectedRowQty = useCallback(
    (delta: number) => {
      if (selectedRowId === null) return;
      const item = activeTicket.items.find((i) => i.productId === selectedRowId);
      if (!item) return;
      setLineQuantity(selectedRowId, item.quantity + delta);
      focusScanner();
    },
    [selectedRowId, activeTicket.items, setLineQuantity, focusScanner]
  );

  const removeSelectedRow = useCallback(() => {
    if (selectedRowId === null) return;
    updateActiveTicket((ticket) => ({
      ...ticket,
      items: ticket.items.filter((i) => i.productId !== selectedRowId),
    }));
    focusScanner();
  }, [selectedRowId, updateActiveTicket, focusScanner]);

  const moveSelection = useCallback(
    (direction: -1 | 1) => {
      if (activeTicket.items.length === 0) return;
      const idx = activeTicket.items.findIndex(
        (i) => i.productId === selectedRowId
      );
      const nextIdx = Math.min(
        activeTicket.items.length - 1,
        Math.max(0, (idx === -1 ? 0 : idx) + direction)
      );
      setSelectedRowId(activeTicket.items[nextIdx].productId);
      focusScanner();
    },
    [activeTicket.items, selectedRowId, focusScanner]
  );

  // --- PROCESADOR DE ENTRADA RÁPIDA (BARCODE / CANT*CODIGO / TEXTO) ---
  const executeCommand = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const multOnlyMatch = trimmed.match(/^(\d+)\*$/);
    if (multOnlyMatch) {
      const qty = Math.max(1, parseInt(multOnlyMatch[1], 10));
      setPendingMultiplier(qty);
      setCommandInput("");
      return;
    }

    let qty = pendingMultiplier ?? 1;
    let query = trimmed;
    const inlineMultMatch = trimmed.match(/^(\d+)\*(.+)$/);
    if (inlineMultMatch) {
      qty = Math.max(1, parseInt(inlineMultMatch[1], 10));
      query = inlineMultMatch[2].trim();
    }

    const exactProduct = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
        String(p.id) === query
    );

    if (exactProduct) {
      addProduct(exactProduct, qty);
      setCommandInput("");
      return;
    }

    const qLower = query.toLowerCase();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(qLower))
    );

    if (matches.length === 1) {
      addProduct(matches[0], qty);
      setCommandInput("");
    } else if (matches.length > 1) {
      if (inlineMultMatch) setPendingMultiplier(qty);
      setCommandInput("");
      setSearchModalQuery(query);
      setSearchSelectedIndex(0);
      setShowSearchModal(true);
    } else {
      toast.error(`Código o artículo no encontrado: "${query}"`, {
        duration: 1800,
      });
      setCommandInput("");
    }
  };

  const openCheckout = useCallback(() => {
    if (activeTicket.items.length === 0) {
      toast.error("El ticket está vacío", { duration: 1500 });
      return;
    }
    const totalForCurrentMethod =
      subtotal +
      (activeTicket.paymentMethod === "CARD" ? potentialCardDiaperSurcharge : 0);

    updateActiveTicket((t) => ({
      ...t,
      cashTendered: String(Number(totalForCurrentMethod.toFixed(2))),
    }));
    setShowCheckoutModal(true);
    setTimeout(() => {
      cashInputRef.current?.focus();
      cashInputRef.current?.select();
    }, 30);
  }, [
    activeTicket.items.length,
    activeTicket.paymentMethod,
    potentialCardDiaperSurcharge,
    subtotal,
    updateActiveTicket,
  ]);

  // --- PROCESAR VENTA EN SERVIDOR ---
  const processSale = useCallback(
    async (overrideMethod?: PaymentMethodType) => {
      if (activeTicket.items.length === 0 || isSubmitting) return;

      const cust = activeTicket.customer;
      if (cust.mode === "NEW") {
        if (
          !cust.name.trim() ||
          !cust.surname.trim() ||
          !/^\d{7,8}$/.test(cust.dni.trim())
        ) {
          toast.error("Revisá Nombre, Apellido y DNI (7-8 dígitos) del cliente");
          setShowClientModal(true);
          return;
        }
      }

      const method = overrideMethod || activeTicket.paymentMethod;
      const appliedSurcharge =
        method === "CARD" ? potentialCardDiaperSurcharge : 0;
      const computedTotal = Number((subtotal + appliedSurcharge).toFixed(2));

      setIsSubmitting(true);
      const toastId = toast.loading("Cerrando venta...");

      try {
        let clientIdToUse: number | undefined;

        if (cust.mode === "EXISTING" && cust.existingClientId) {
          clientIdToUse = cust.existingClientId;
        } else if (cust.mode === "FINAL_CONSUMER") {
          if (defaultClientId) {
            clientIdToUse = defaultClientId;
          } else {
            const cfResp = await clientApi.create({
              name: "Consumidor",
              surname: "Final",
              dni: "99999999",
              phoneNumber: "1100000000",
              email: "consumidorfinal@oji.local",
              addresses: {
                street: "Mostrador",
                streetNum: 1,
                locality: "Local",
                province: "Entre Ríos",
                postalCode: "3228",
                country: "Argentina",
              },
            });
            const createdId = cfResp.id || cfResp.client?.id;
            clientIdToUse = createdId;
            if (createdId) setDefaultClientId(createdId);
          }
        } else {
          const newCliResp = await clientApi.create({
            name: cust.name.trim(),
            surname: cust.surname.trim(),
            dni: cust.dni.trim(),
            phoneNumber: cust.phoneNumber.trim() || "1100000000",
            email: cust.email.trim() || "cliente@oji.local",
            addresses: {
              street: "Mostrador",
              streetNum: 1,
              locality: "Local",
              province: "Entre Ríos",
              postalCode: "3228",
              country: "Argentina",
            },
          });
          clientIdToUse = newCliResp.id || newCliResp.client?.id;
        }

        const saleDetails = activeTicket.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        }));

        const createdSale = await saleApi.create({
          clientId: clientIdToUse,
          status: "COMPLETED",
          sendEmail: false,
          details: saleDetails,
        });

        // Si hubo recargo del 5% en pañales con tarjeta, dejar constancia en notas sin bloquear la caja
        const createdSaleId = createdSale?.id || createdSale?.sale?.id;
        if (createdSaleId && method === "CARD" && appliedSurcharge > 0) {
          saleApi
            .update(String(createdSaleId), {
              status: "COMPLETED",
              notes: `Pago con Tarjeta • Incluye +5% recargo en pañales (${formatARS(
                appliedSurcharge
              )}) • Total cobrado: ${formatARS(computedTotal)}`,
              details: saleDetails,
            })
            .catch(() => { });
        }

        // Descontar stock local al instante sin recargar
        setProducts((prev) =>
          prev.map((p) => {
            const sold = activeTicket.items.find((i) => i.productId === p.id);
            return sold
              ? { ...p, stock: Math.max(0, (p.stock ?? 0) - sold.quantity) }
              : p;
          })
        );

        toast.success(`Venta cerrada • ${formatARS(computedTotal)}`, {
          id: toastId,
          duration: 2000,
        });

        setShowCheckoutModal(false);
        setCommandInput("");
        setPendingMultiplier(null);

        if (tickets.length > 1) {
          const nextTickets = tickets.filter((_, i) => i !== activeTicketIndex);
          setTickets(nextTickets);
          setActiveTicketIndex(Math.max(0, activeTicketIndex - 1));
        } else {
          setTickets([createEmptyTicket(ticketCounter)]);
          setTicketCounter((c) => c + 1);
        }
      } catch (err) {
        console.error("Error en cobro POS:", err);
        toast.error("Error al guardar la venta", { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      activeTicket,
      activeTicketIndex,
      defaultClientId,
      isSubmitting,
      potentialCardDiaperSurcharge,
      subtotal,
      ticketCounter,
      tickets,
    ]
  );

  // --- RESULTADOS DEL MODAL DE BÚSQUEDA RÁPIDA (F3) ---
  const searchResults = useMemo(() => {
    const q = searchModalQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 30);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          String(p.id) === q
      )
      .slice(0, 40);
  }, [products, searchModalQuery]);

  // --- TICKETS EN ESPERA (F6) ---
  const handleParkOrNewTicket = useCallback(() => {
    const next = createEmptyTicket(ticketCounter);
    setTickets((prev) => [...prev, next]);
    setActiveTicketIndex(tickets.length);
    setTicketCounter((c) => c + 1);
    toast(`Ticket ${next.label} listo`, { duration: 1200 });
  }, [ticketCounter, tickets.length]);

  const closeTicketTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickets.length <= 1) {
      setShowClearConfirm(true);
      return;
    }
    const next = tickets.filter((_, i) => i !== idx);
    setTickets(next);
    setActiveTicketIndex((prev) =>
      prev >= next.length ? next.length - 1 : prev > idx ? prev - 1 : prev
    );
  };

  // Alternar rápido Efectivo <-> Tarjeta (para consultar precio con tarjeta al instante)
  const toggleCardMode = useCallback(() => {
    updateActiveTicket((t) => ({
      ...t,
      paymentMethod: t.paymentMethod === "CARD" ? "CASH" : "CARD",
    }));
  }, [updateActiveTicket]);

  // --- ATAJOS GLOBALES DE CAJERO ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setShowSearchModal(false);
        setShowCheckoutModal(false);
        setTimeout(() => commandInputRef.current?.focus(), 10);
        return;
      }
      if (e.key === "F3") {
        e.preventDefault();
        setSearchModalQuery(commandInput.trim());
        setCommandInput("");
        setSearchSelectedIndex(0);
        setShowSearchModal(true);
        setTimeout(() => searchModalInputRef.current?.focus(), 20);
        return;
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (!showCheckoutModal) openCheckout();
        return;
      }
      if (e.key === "F6") {
        e.preventDefault();
        handleParkOrNewTicket();
        return;
      }
      if (e.key === "F7") {
        e.preventDefault();
        toggleCardMode();
        return;
      }
      if (e.key === "F8") {
        e.preventDefault();
        setShowClientModal(true);
        return;
      }
      if (e.key === "F12") {
        e.preventDefault();
        if (activeTicket.items.length > 0 && !isSubmitting) {
          processSale("CASH");
        }
        return;
      }

      if (e.key === "Escape") {
        if (isAnyModalOpen) {
          e.preventDefault();
          setShowSearchModal(false);
          setShowCheckoutModal(false);
          setShowClientModal(false);
          setShowQtyEditModal(false);
          setShowClearConfirm(false);
          setShowHelpModal(false);
          return;
        }
        if (commandInput || pendingMultiplier) {
          e.preventDefault();
          setCommandInput("");
          setPendingMultiplier(null);
          return;
        }
      }

      if (!isAnyModalOpen && commandInput === "") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          moveSelection(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveSelection(1);
        } else if (e.key === "+" || e.key === "Add") {
          e.preventDefault();
          adjustSelectedRowQty(1);
        } else if (e.key === "-" || e.key === "Subtract") {
          e.preventDefault();
          adjustSelectedRowQty(-1);
        } else if (e.key === "Delete") {
          e.preventDefault();
          removeSelectedRow();
        } else if (e.key === "=") {
          e.preventDefault();
          openCheckout();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeTicket.items.length,
    adjustSelectedRowQty,
    commandInput,
    handleParkOrNewTicket,
    isAnyModalOpen,
    isSubmitting,
    moveSelection,
    openCheckout,
    pendingMultiplier,
    processSale,
    removeSelectedRow,
    showCheckoutModal,
    toggleCardMode,
  ]);

  const quickBills = useMemo(() => {
    if (finalTotal <= 0) return [];
    return Array.from(
      new Set([
        finalTotal,
        Math.ceil(finalTotal / 1000) * 1000,
        Math.ceil(finalTotal / 5000) * 5000,
        Math.ceil(finalTotal / 10000) * 10000,
        Math.ceil(finalTotal / 20000) * 20000,
      ])
    )
      .filter((n) => n >= finalTotal)
      .slice(0, 4);
  }, [finalTotal]);

  const selectedItem = activeTicket.items.find(
    (i) => i.productId === selectedRowId
  );

  const isCardActive = activeTicket.paymentMethod === "CARD";

  return (
    <DashboardLayout>
      {/* Contenedor bloqueado a pantalla completa sin scroll externo */}
      <div
        className="w-full -mt-2 md:-mt-5 -mb-14 flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-2.5rem)] select-none gap-2"
        onClick={() => focusScanner()}
      >
        {/* =============================================================== */}
        {/* 1. BARRA DE HERRAMIENTAS SUPERIOR     */}
        {/* =============================================================== */}
        <div
          className="shrink-0 flex items-center justify-between gap-2 bg-[#110E1C] border border-white/10 rounded-xl px-2.5 py-1.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botonera Operativa Izquierda */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/management/sales")}
              className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
              title="Salir al listado de ventas"
            >
              <LogOut size={15} className="rotate-180 text-slate-400" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            {/* Botón Cliente */}
            <button
              type="button"
              onClick={() => setShowClientModal(true)}
              className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition ${activeTicket.customer.mode === "FINAL_CONSUMER"
                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                : "bg-indigo-600/25 border-indigo-400/50 text-indigo-200"
                }`}
              title="Seleccionar o crear cliente (F8)"
            >
              <User size={15} className="text-indigo-400" />
              <span className="max-w-[130px] truncate">
                {activeTicket.customer.mode === "FINAL_CONSUMER"
                  ? "Consumidor Final"
                  : `${activeTicket.customer.name} ${activeTicket.customer.surname}`}
              </span>
              <kbd className="hidden xl:inline text-[10px] text-slate-400 bg-black/30 px-1 rounded">
                F8
              </kbd>
            </button>

            <div className="h-6 w-px bg-white/10 mx-0.5 hidden sm:block" />

            {/* Tickets / Ventas en espera */}
            <div className="flex items-center gap-1">
              {tickets.map((t, idx) => {
                const active = idx === activeTicketIndex;
                const count = t.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTicketIndex(idx)}
                    className={`h-9 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${active
                      ? "bg-indigo-600 text-white border-indigo-400 shadow"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                      }`}
                    title={`Cambiar a Ticket ${t.label}`}
                  >
                    {active ? (
                      <PlayCircle size={13} />
                    ) : (
                      <PauseCircle size={13} className="text-amber-400" />
                    )}
                    <span>{t.label}</span>
                    {count > 0 && (
                      <span className="px-1.5 rounded bg-black/30 text-[10px]">
                        {count}
                      </span>
                    )}
                    {tickets.length > 1 && (
                      <span
                        onClick={(e) => closeTicketTab(idx, e)}
                        className="ml-0.5 hover:text-rose-300"
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleParkOrNewTicket}
                className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                title="Dejar ticket en espera y abrir otro (F6)"
              >
                <Plus size={14} />
                <span className="hidden md:inline">Espera</span>
                <kbd className="hidden xl:inline text-[10px] text-slate-400 bg-black/30 px-1 rounded">
                  F6
                </kbd>
              </button>
            </div>

            {/* Vaciar Ticket */}
            <button
              type="button"
              disabled={activeTicket.items.length === 0}
              onClick={() => setShowClearConfirm(true)}
              className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold cursor-pointer transition"
              title="Anular / Vaciar ticket completo"
            >
              <Trash2 size={15} />
              <span className="hidden lg:inline">Vaciar</span>
            </button>
          </div>

          {/* Botonera Derecha: Medio rápido (Efectivo / Tarjeta), Buscar, Ayuda y Reloj */}
          <div className="flex items-center gap-1.5">
            {/* Selector Rápido Efectivo vs Tarjeta (+5% pañales) */}
            <button
              type="button"
              onClick={toggleCardMode}
              className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${isCardActive
                ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                }`}
              title="Alternar simulación / cobro con Tarjeta (+5% en pañales) [F7]"
            >
              {isCardActive ? (
                <CreditCard size={15} className="text-amber-400" />
              ) : (
                <Banknote size={15} className="text-emerald-400" />
              )}
              <span>{isCardActive ? "Tarjeta" : "Efectivo"}</span>
              <kbd className="hidden xl:inline text-[10px] bg-black/30 px-1 rounded text-slate-400">
                F7
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              title="Atajos de teclado"
            >
              <Keyboard size={16} />
            </button>

            <div className="hidden xl:flex items-center pl-2 ml-1 border-l border-white/10 text-[11px] font-mono text-slate-400">
              {clockText}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 2. ÁREA CENTRAL DE OPERACIÓN (ANCHO COMPLETO SIN NUMPAD)        */}
        {/* =============================================================== */}
        <div className="flex-1 min-h-0 flex flex-col bg-[#0D0B16] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {/* Barra Superior de Tabla: Lector de Código + Íconos de Acción uno al lado del otro */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-2 bg-[#151224] border-b border-white/10 flex flex-wrap items-center justify-between gap-2"
          >
            {/* Input Escáner (Siempre con foco) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(commandInput);
              }}
              className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#0B0914] border border-white/10 focus-within:border-indigo-400/60 rounded-lg px-2.5 py-1.5"
            >
              <Barcode size={19} className="text-emerald-400 shrink-0" />

              {pendingMultiplier !== null && (
                <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-black font-mono flex items-center gap-1">
                  {pendingMultiplier} ×
                  <button
                    type="button"
                    onClick={() => setPendingMultiplier(null)}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <input
                ref={commandInputRef}
                type="text"
                autoFocus
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder={
                  isLoading
                    ? "Cargando artículos..."
                    : "Código de barras, cant*código (ej: 3*779...) o nombre + [Enter]"
                }
                className="flex-1 bg-transparent text-sm md:text-base font-mono font-semibold text-white placeholder:text-slate-500 outline-none"
              />

              {commandInput && (
                <button
                  type="button"
                  onClick={() => setCommandInput("")}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold tracking-wide cursor-pointer shrink-0 transition"
              >
                ENTER
              </button>
            </form>

            {/* Íconos de Acción de Línea uno al lado del otro */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                disabled={activeTicket.items.length === 0}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-sky-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Subir línea (↑)"
              >
                <ArrowUp size={18} />
              </button>

              <button
                type="button"
                onClick={() => moveSelection(1)}
                disabled={activeTicket.items.length === 0}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-sky-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Bajar línea (↓)"
              >
                <ArrowDown size={18} />
              </button>

              <button
                type="button"
                onClick={() => adjustSelectedRowQty(-1)}
                disabled={!selectedItem}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-rose-500/25 border border-white/10 text-rose-300 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Restar 1 unidad (-)"
              >
                <Minus size={18} />
              </button>

              <button
                type="button"
                onClick={() => adjustSelectedRowQty(1)}
                disabled={!selectedItem}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-emerald-500/25 border border-white/10 text-emerald-300 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Sumar 1 unidad (+)"
              >
                <Plus size={18} />
              </button>

              <button
                type="button"
                disabled={!selectedItem}
                onClick={() => {
                  if (!selectedItem) return;
                  setQtyEditValue(String(selectedItem.quantity));
                  setShowQtyEditModal(true);
                }}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-amber-500/25 border border-white/10 text-amber-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Editar cantidad exacta"
              >
                <Pencil size={17} />
              </button>

              <button
                type="button"
                onClick={removeSelectedRow}
                disabled={!selectedItem}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-rose-500/25 border border-white/10 text-rose-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Quitar artículo seleccionado (Supr)"
              >
                <Trash2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchModalQuery("");
                  setSearchSelectedIndex(0);
                  setShowSearchModal(true);
                  setTimeout(() => searchModalInputRef.current?.focus(), 20);
                }}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-indigo-300 flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Buscar artículo por nombre (F3)"
              >
                <Search size={17} />
              </button>
            </div>
          </div>

          {/* Tabla de Líneas de Venta */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            onClick={(e) => {
              e.stopPropagation();
              focusScanner();
            }}
          >
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#181528] border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 select-none">
                <tr>
                  <th className="py-2.5 px-4 w-32 font-semibold">Código</th>
                  <th className="py-2.5 px-4 font-semibold">Artículo</th>
                  <th className="py-2.5 px-4 w-32 text-right font-semibold">
                    P. Unit.
                  </th>
                  <th className="py-2.5 px-4 w-32 text-center font-semibold">
                    Cant.
                  </th>
                  <th className="py-2.5 px-4 w-36 text-right font-semibold">
                    Importe
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {activeTicket.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-20 text-center text-slate-500"
                    >
                      <p className="text-sm font-semibold text-slate-400">
                        Caja lista para escanear
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Pasá el lector de código de barras o presioná{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                          F3
                        </kbd>{" "}
                        para buscar por nombre
                      </p>
                    </td>
                  </tr>
                ) : (
                  activeTicket.items.map((item) => {
                    const isSelected = item.productId === selectedRowId;
                    const lineBase = item.price * item.quantity;
                    const lineCardExtra =
                      isCardActive && item.isDiaper
                        ? Number(
                            (lineBase * CARD_DIAPER_SURCHARGE_RATE).toFixed(2)
                          )
                        : 0;

                    return (
                      <tr
                        key={item.productId}
                        onClick={() => {
                          setSelectedRowId(item.productId);
                          focusScanner();
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-600/25 text-white"
                            : "hover:bg-white/[0.04] text-slate-200"
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono text-xs text-slate-400 truncate max-w-[130px]">
                          {item.code}
                        </td>

                        <td className="py-2.5 px-4 font-semibold">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isSelected && (
                              <span className="w-1.5 h-4 rounded-full bg-indigo-400 shrink-0" />
                            )}
                            <span className="truncate">{item.name}</span>
                            {item.isDiaper && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                  isCardActive
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                                    : "bg-white/5 text-slate-400 border border-white/10"
                                }`}
                              >
                                {isCardActive
                                  ? `+5% Tarj. (+${formatARS(lineCardExtra)})`
                                  : "Pañales"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-300">
                          {formatARS(item.price)}
                        </td>

                        <td className="py-2 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-black/30 border border-white/10 rounded-lg px-1 py-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLineQuantity(
                                  item.productId,
                                  item.quantity - 1
                                );
                                focusScanner();
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-slate-300 hover:text-rose-400 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-[28px] text-center font-mono font-bold text-sm text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLineQuantity(
                                  item.productId,
                                  item.quantity + 1
                                );
                                focusScanner();
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-slate-300 hover:text-emerald-400 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatARS(lineBase)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Franja Inferior: Totales + Botones de Cobro Directo */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 bg-[#141122] border-t border-white/10 p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
          >
            {/* Totales */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 flex-1">
              <div className="hidden sm:block bg-[#0B0914] border border-white/10 rounded-lg px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Unidades
                </span>
                <span className="text-base font-mono font-bold text-slate-200">
                  {totalUnits}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({activeTicket.items.length} ítems)
                  </span>
                </span>
              </div>

              <div className="bg-[#0B0914] border border-white/10 rounded-lg px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Subtotal
                </span>
                <span className="text-base font-mono font-bold text-slate-200">
                  {formatARS(subtotal)}
                </span>
              </div>

              <div
                onClick={() => toggleCardMode()}
                className={`rounded-lg px-3 py-2 cursor-pointer transition border ${
                  isCardActive && activeCardSurcharge > 0
                    ? "bg-amber-950/30 border-amber-500/40"
                    : "bg-[#0B0914] border-white/10 hover:border-amber-500/30"
                }`}
                title="Clic para alternar Efectivo / Tarjeta (+5% en pañales)"
              >
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                  {isCardActive ? "Tarj. +5% Pañales" : "Recargo Tarj."}
                </span>
                <span
                  className={`text-base font-mono font-bold ${
                    activeCardSurcharge > 0 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  + {formatARS(activeCardSurcharge)}
                </span>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-lg px-3 py-2 text-right">
                <span className="block text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold">
                  Total {isCardActive ? "(Tarjeta)" : ""}
                </span>
                <span className="text-xl xl:text-2xl font-mono font-black text-emerald-400 leading-tight block truncate">
                  {formatARS(finalTotal)}
                </span>
              </div>
            </div>

            {/* Botones de Cobro Rápido */}
            <div className="flex items-stretch gap-2 shrink-0">
              <button
                type="button"
                disabled={activeTicket.items.length === 0 || isSubmitting}
                onClick={() => processSale("CASH")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition"
                title="Cerrar venta inmediata en efectivo exacto en 1 solo paso (F12)"
              >
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-amber-400" />
                  <span>Efvo. Exacto</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-300/80">
                  [F12]
                </span>
              </button>

              <button
                type="button"
                disabled={activeTicket.items.length === 0 || isSubmitting}
                onClick={openCheckout}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:pointer-events-none font-black text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer active:scale-95 transition"
                title="Abrir pantalla de cobro y vuelto (= o F4)"
              >
                <span className="text-2xl leading-none font-mono">=</span>
                <span>COBRAR</span>
                <kbd className="text-[11px] font-mono bg-black/25 px-1.5 py-0.5 rounded">
                  F4
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* MODAL BUSCADOR TABULAR RÁPIDO (F3 - CERO FOTOS, PURO TECLADO)   */}
      {/* =============================================================== */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-12 p-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#12101F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-[#181529] border-b border-white/10 flex items-center gap-2">
              <Search size={18} className="text-indigo-400 shrink-0" />
              <input
                ref={searchModalInputRef}
                type="text"
                autoFocus
                value={searchModalQuery}
                onChange={(e) => {
                  setSearchModalQuery(e.target.value);
                  setSearchSelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchSelectedIndex((i) =>
                      Math.min(searchResults.length - 1, i + 1)
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchSelectedIndex((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const chosen = searchResults[searchSelectedIndex];
                    if (chosen) {
                      if (addProduct(chosen)) {
                        setShowSearchModal(false);
                      }
                    }
                  }
                }}
                placeholder="Escribí nombre o código... (↑/↓ para elegir, Enter para agregar)"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#141122] text-slate-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="py-2 px-3 w-28">Código</th>
                    <th className="py-2 px-3">Artículo</th>
                    <th className="py-2 px-3 w-20 text-center">Stock</th>
                    <th className="py-2 px-3 w-28 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-500"
                      >
                        Sin coincidencias
                      </td>
                    </tr>
                  ) : (
                    searchResults.map((p, idx) => {
                      const active = idx === searchSelectedIndex;
                      const noStock = (p.stock ?? 0) <= 0;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => {
                            if (!noStock && addProduct(p)) {
                              setShowSearchModal(false);
                            }
                          }}
                          className={`cursor-pointer ${noStock
                            ? "opacity-40 cursor-not-allowed"
                            : active
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-white/5 text-slate-200"
                            }`}
                        >
                          <td className="py-2.5 px-3 font-mono">
                            {p.barcode || p.id}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">{p.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {p.stock ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300">
                            {formatARS(p.price)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL DE COBRO EXPRESS (= / F4 -> ENTER CONFIRMA AL INSTANTE)   */}
      {/* =============================================================== */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowCheckoutModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processSale();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#12101F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#181529] border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cobro de Venta
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Medios de Pago Rápidos */}
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "CASH", label: "Efectivo", icon: Banknote },
                    { id: "CARD", label: "Tarjeta", icon: CreditCard },
                    { id: "TRANSFER", label: "Transf.", icon: ArrowLeftRight },
                    { id: "QR", label: "QR / MP", icon: QrCode },
                  ] as const
                ).map((pm) => {
                  const Icon = pm.icon;
                  const active = activeTicket.paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        const nextTotal =
                          subtotal +
                          (pm.id === "CARD" ? potentialCardDiaperSurcharge : 0);
                        updateActiveTicket((t) => ({
                          ...t,
                          paymentMethod: pm.id,
                          cashTendered: String(Number(nextTotal.toFixed(2))),
                        }));
                      }}
                      className={`relative py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition ${active
                        ? "bg-indigo-600 text-white border-indigo-400"
                        : "bg-[#181528] text-slate-400 border-white/10 hover:text-white"
                        }`}
                    >
                      <Icon size={17} />
                      <span>{pm.label}</span>
                      {pm.id === "CARD" && potentialCardDiaperSurcharge > 0 && (
                        <span className="text-[9px] font-mono text-amber-300 leading-none">
                          +5% pañal
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Desglose y Total Gigante */}
              <div className="bg-[#090710] border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                {activeCardSurcharge > 0 && (
                  <div className="space-y-1 pb-2 border-b border-white/10 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal base</span>
                      <span className="font-mono">{formatARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-semibold">
                      <span>Recargo Tarjeta (+5% en pañales)</span>
                      <span className="font-mono">
                        + {formatARS(activeCardSurcharge)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Total a Cobrar
                  </span>
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {formatARS(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Abona con + Vuelto (Solo en Efectivo) */}
              {activeTicket.paymentMethod === "CASH" && (
                <div className="space-y-2.5 bg-[#171426] border border-white/10 rounded-xl p-3.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {quickBills.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          updateActiveTicket((t) => ({
                            ...t,
                            cashTendered: String(b),
                          }));
                          cashInputRef.current?.focus();
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-mono text-xs font-bold cursor-pointer"
                      >
                        {formatARS(b)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Abona con ($)
                      </label>
                      <input
                        ref={cashInputRef}
                        type="number"
                        step="any"
                        min="0"
                        value={activeTicket.cashTendered}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            cashTendered: e.target.value,
                          }))
                        }
                        className="w-full bg-[#090710] border border-indigo-400/50 rounded-xl px-3 py-2 text-lg font-mono font-bold text-white outline-none"
                      />
                    </div>

                    <div className="bg-[#090710] border border-white/10 rounded-xl px-3 py-2 flex flex-col justify-center text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Su Vuelto
                      </span>
                      <span className="text-xl font-black font-mono text-amber-400">
                        {formatARS(changeAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-[#181529] border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 cursor-pointer"
              >
                Cancelar (Esc)
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>{isSubmitting ? "Guardando..." : "CONFIRMAR (ENTER)"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL EDICIÓN DIRECTA DE CANTIDAD (BOTÓN ✎)                     */}
      {/* =============================================================== */}
      {showQtyEditModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowQtyEditModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(qtyEditValue, 10);
              if (!isNaN(val)) {
                setLineQuantity(selectedItem.productId, val);
              }
              setShowQtyEditModal(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-[#12101F] border border-white/15 rounded-2xl p-4 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase text-slate-300 truncate">
              Cantidad: {selectedItem.name}
            </h3>
            <input
              type="number"
              min="0"
              max={selectedItem.stock}
              autoFocus
              value={qtyEditValue}
              onChange={(e) => setQtyEditValue(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full bg-[#090710] border border-indigo-400 rounded-xl px-3 py-2.5 text-xl font-mono font-bold text-center text-white outline-none"
            />
            <p className="text-[11px] text-slate-400 text-center">
              Stock disponible: {selectedItem.stock} u. (0 elimina la línea)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQtyEditModal(false)}
                className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL CLIENTE SIMPLIFICADO (F8)                                 */}
      {/* =============================================================== */}
      {showClientModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowClientModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#12101F] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 bg-[#181529] border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-400" />
                Asignar Cliente al Ticket
              </span>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["FINAL_CONSUMER", "Consumidor Final"],
                    ["EXISTING", "Registrado"],
                    ["NEW", "Nuevo Rápido"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode === "FINAL_CONSUMER") {
                        updateActiveTicket((t) => ({
                          ...t,
                          customer: { ...DEFAULT_CUSTOMER },
                        }));
                        setShowClientModal(false);
                      } else if (mode === "NEW") {
                        updateActiveTicket((t) => ({
                          ...t,
                          customer: {
                            mode: "NEW",
                            name: "",
                            surname: "",
                            dni: "",
                            phoneNumber: "",
                            email: "",
                          },
                        }));
                      } else {
                        updateActiveTicket((t) => ({
                          ...t,
                          customer: { ...t.customer, mode: "EXISTING" },
                        }));
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border cursor-pointer ${activeTicket.customer.mode === mode
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : "bg-[#181528] text-slate-400 border-white/10 hover:text-white"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTicket.customer.mode === "EXISTING" && (
                <div className="max-h-52 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl bg-[#090710]">
                  {clients.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 text-center">
                      Sin clientes cargados
                    </p>
                  ) : (
                    clients.map((c) => (
                      <button
                        key={c.id ?? c.dni}
                        type="button"
                        onClick={() => {
                          updateActiveTicket((t) => ({
                            ...t,
                            customer: {
                              mode: "EXISTING",
                              existingClientId: c.id,
                              name: c.name,
                              surname: c.surname,
                              dni: c.dni,
                              phoneNumber: c.phoneNumber || "",
                              email: c.email,
                            },
                          }));
                          setShowClientModal(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-indigo-600/20 flex justify-between items-center text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-white">
                          {c.surname}, {c.name}
                        </span>
                        <span className="font-mono text-slate-400">
                          DNI {c.dni}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeTicket.customer.mode === "NEW" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={activeTicket.customer.name}
                    onChange={(e) =>
                      updateActiveTicket((t) => ({
                        ...t,
                        customer: { ...t.customer, name: e.target.value },
                      }))
                    }
                    className="bg-[#090710] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Apellido *"
                    value={activeTicket.customer.surname}
                    onChange={(e) =>
                      updateActiveTicket((t) => ({
                        ...t,
                        customer: { ...t.customer, surname: e.target.value },
                      }))
                    }
                    className="bg-[#090710] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="DNI (7-8 dígitos) *"
                    value={activeTicket.customer.dni}
                    onChange={(e) =>
                      updateActiveTicket((t) => ({
                        ...t,
                        customer: { ...t.customer, dni: e.target.value },
                      }))
                    }
                    className="bg-[#090710] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono (opcional)"
                    value={activeTicket.customer.phoneNumber}
                    onChange={(e) =>
                      updateActiveTicket((t) => ({
                        ...t,
                        customer: { ...t.customer, phoneNumber: e.target.value },
                      }))
                    }
                    className="bg-[#090710] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-[#181529] border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL DE ATAJOS DE CAJA                                         */}
      {/* =============================================================== */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#12101F] border border-white/15 rounded-2xl p-5 space-y-3"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold uppercase text-white">
                Atajos Rápidos de Operación
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                ["Cant * Código", "Ej: 5*7791234 agrega 5 unidades de golpe"],
                ["F3", "Buscar artículo por nombre (tabla rápida)"],
                ["=  ó  F4", "Abrir ventana de Cobro y Vuelto"],
                ["F12", "Cobro Exacto Efectivo en 1 sola tecla"],
                ["F7", "Alternar Efectivo / Tarjeta (+5% pañales)"],
                ["↑ / ↓", "Moverse entre líneas del ticket"],
                ["+ / - / Supr", "Sumar, restar o borrar la línea marcada"],
                ["F6 / F8", "Ticket en espera / Cambiar cliente"],
              ].map(([k, d]) => (
                <div
                  key={k}
                  className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-white/5"
                >
                  <span className="text-slate-300">{d}</span>
                  <kbd className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    {k}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Vaciar ticket"
        variant="danger"
        message="¿Anular todos los ítems del ticket actual?"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          updateActiveTicket((t) => ({
            ...t,
            items: [],
            cashTendered: "",
          }));
          setShowClearConfirm(false);
        }}
        confirmText="Vaciar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
