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
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeftRight,
  PauseCircle,
  PlayCircle,
  X,
  ArrowUp,
  ArrowDown,
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

// --- CONSTANTES DE SEGURIDAD Y LÍMITES OPERATIVOS ---
const CARD_DIAPER_SURCHARGE_RATE = 0.05; // +5% en pañales abonando con tarjeta
const MAX_MULTIPLIER = 999; // Evita desbordamiento si se escanea un EAN seguido de '*'
const MAX_OPEN_TICKETS = 10; // Límite de tickets simultáneos en memoria
const MAX_COMMAND_LENGTH = 100;
const MAX_CASH_TENDERED = 999_999_999;

// TODO (Backend): eliminar este bloque temporal cuando clientId sea opcional en POST /sales
const GENERIC_CLIENT_PAYLOAD = {
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
} as const;

// --- HELPERS PUROS DE SANITIZACIÓN Y ARITMÉTICA SEGURA ---
const roundCurrency = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const toSafePrice = (raw: unknown): number => {
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return 0;
  return roundCurrency(num);
};

const toSafeStock = (raw: unknown): number => {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(MAX_CASH_TENDERED, Math.floor(num));
};

/** Elimina caracteres de control, etiquetas HTML/script y limita longitud de forma segura */
const sanitizeText = (raw: string, maxLen: number): string => {
  let clean = "";
  for (let i = 0; i < raw.length && clean.length < maxLen; i++) {
    const code = raw.charCodeAt(i);
    if (code >= 32 && code !== 127 && code !== 60 && code !== 62) {
      clean += raw[i];
    }
  }
  return clean;
};

const sanitizeDigits = (raw: string, maxLen: number): string =>
  raw.replace(/\D/g, "").slice(0, maxLen);

const normalizeSearchText = (value?: string | null): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatARS = (val: number): string =>
  arsFormatter.format(Number.isFinite(val) ? val : 0);

// --- TIPOS DEL POS ---
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

interface PosTicket {
  id: string;
  label: string;
  items: CartItem[];
  paymentMethod: PaymentMethodType;
  cashTendered: string;
}

const createEmptyTicket = (num: number): PosTicket => ({
  id: `t-${Date.now()}-${num}`,
  label: `#${num}`,
  items: [],
  paymentMethod: "CASH",
  cashTendered: "",
});

export default function CreateSalePage() {
  const navigate = useNavigate();

  // --- DATOS CACHEADOS EN MEMORIA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<number, string>>(
    () => new Map()
  );
  const [defaultClientId, setDefaultClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADO DE CAJA Y TICKETS ---
  const [tickets, setTickets] = useState<PosTicket[]>(() => [
    createEmptyTicket(1),
  ]);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [ticketCounter, setTicketCounter] = useState(2);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // --- ENTRADA PRINCIPAL (ESCÁNER / MULTIPLICADOR) ---
  const [commandInput, setCommandInput] = useState("");
  const [pendingMultiplier, setPendingMultiplier] = useState<number | null>(
    null
  );
  const [clockText, setClockText] = useState("");

  // --- MODALES PUNTUALES ---
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showQtyEditModal, setShowQtyEditModal] = useState(false);
  const [qtyEditValue, setQtyEditValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // --- REFS DE FOCO Y MUTEX ANTI DOBLE COBRO ---
  const commandInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);
  const submittingLockRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  const safeTicketIndex =
    activeTicketIndex >= 0 && activeTicketIndex < tickets.length
      ? activeTicketIndex
      : 0;
  const activeTicket = tickets[safeTicketIndex];

  const isAnyModalOpen =
    showSearchModal ||
    showCheckoutModal ||
    showQtyEditModal ||
    showClearConfirm ||
    showHelpModal;

  // Reloj operativo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockText(
        `${now.toLocaleDateString("es-AR")} ${now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial segura con guardia de desmontaje
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const [prodData, catData, cliData] = await Promise.all([
          productApi.getAllProducts().catch(() => []),
          productApi.getAllCategories().catch(() => []),
          clientApi.getAllClients().catch(() => []),
        ]);

        if (cancelled || !isMountedRef.current) return;

        const validProds = Array.isArray(prodData)
          ? prodData.filter(
            (p): p is Product =>
              Boolean(p) &&
              typeof p.id === "number" &&
              p.id > 0 &&
              p.status !== false
          )
          : [];
        const validCats: Category[] = Array.isArray(catData)
          ? catData.filter(
            (c): c is Category =>
              Boolean(c) && typeof c.id === "number" && typeof c.name === "string"
          )
          : [];
        const validClients: Client[] = Array.isArray(cliData)
          ? cliData.filter((c): c is Client => Boolean(c) && typeof c.dni === "string")
          : [];

        const catMap = new Map<number, string>();
        validCats.forEach((c) => catMap.set(c.id, c.name));

        setCategoriesMap(catMap);
        setProducts(validProds);

        // TODO (Backend): quitar búsqueda de cliente genérico cuando clientId sea opcional
        const existingCF = validClients.find(
          (c) =>
            c.dni === GENERIC_CLIENT_PAYLOAD.dni ||
            (c.name?.toLowerCase() === "consumidor" &&
              c.surname?.toLowerCase() === "final")
        );
        if (existingCF?.id && existingCF.id > 0) {
          setDefaultClientId(existingCF.id);
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          toast.error("No se pudieron cargar los datos de caja");
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  // Detector de pañales (por categoría o nombre, normalizando tildes)
  const isDiaperProduct = useCallback(
    (product: Product): boolean => {
      const categoryName =
        product.category?.name ||
        (product.categoryId ? categoriesMap.get(product.categoryId) : "");
      const normCat = normalizeSearchText(categoryName);
      const normName = normalizeSearchText(product.name);
      return normCat.includes("panal") || normName.includes("panal");
    },
    [categoriesMap]
  );

  // Gestión limpia del foco en el lector
  const focusScanner = useCallback(() => {
    if (isAnyModalOpen || submittingLockRef.current) return;
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && !isAnyModalOpen) {
        commandInputRef.current?.focus();
      }
    }, 15);
  }, [isAnyModalOpen]);

  useEffect(() => {
    focusScanner();
  }, [isAnyModalOpen, safeTicketIndex, focusScanner]);

  // Updater puro sobre el ticket activo
  const updateActiveTicket = useCallback(
    (updater: (prev: PosTicket) => PosTicket) => {
      setTickets((prev) =>
        prev.map((t, idx) => (idx === safeTicketIndex ? updater(t) : t))
      );
    },
    [safeTicketIndex]
  );

  // Mantener fila seleccionada válida
  useEffect(() => {
    if (activeTicket.items.length === 0) {
      if (selectedRowId !== null) setSelectedRowId(null);
    } else if (
      selectedRowId === null ||
      !activeTicket.items.some((i) => i.productId === selectedRowId)
    ) {
      setSelectedRowId(
        activeTicket.items[activeTicket.items.length - 1].productId
      );
    }
  }, [activeTicket.items, selectedRowId]);

  // --- TOTALES CON ARITMÉTICA REDONDEADA A CENTAVOS ---
  const subtotal = useMemo(
    () =>
      roundCurrency(
        activeTicket.items.reduce(
          (acc, item) => acc + roundCurrency(item.price * item.quantity),
          0
        )
      ),
    [activeTicket.items]
  );

  const diaperSubtotal = useMemo(
    () =>
      roundCurrency(
        activeTicket.items.reduce(
          (acc, item) =>
            item.isDiaper ? acc + roundCurrency(item.price * item.quantity) : acc,
          0
        )
      ),
    [activeTicket.items]
  );

  const potentialCardDiaperSurcharge = useMemo(
    () => roundCurrency(diaperSubtotal * CARD_DIAPER_SURCHARGE_RATE),
    [diaperSubtotal]
  );

  const activeCardSurcharge = useMemo(
    () =>
      activeTicket.paymentMethod === "CARD" ? potentialCardDiaperSurcharge : 0,
    [activeTicket.paymentMethod, potentialCardDiaperSurcharge]
  );

  const finalTotal = useMemo(
    () => Math.max(0, roundCurrency(subtotal + activeCardSurcharge)),
    [subtotal, activeCardSurcharge]
  );

  const totalUnits = useMemo(
    () => activeTicket.items.reduce((acc, i) => acc + i.quantity, 0),
    [activeTicket.items]
  );

  const parsedCashTendered = Number(activeTicket.cashTendered);
  const cashTenderedNum =
    Number.isFinite(parsedCashTendered) && parsedCashTendered >= 0
      ? Math.min(MAX_CASH_TENDERED, roundCurrency(parsedCashTendered))
      : 0;

  const changeAmount =
    cashTenderedNum >= finalTotal
      ? roundCurrency(cashTenderedNum - finalTotal)
      : 0;

  // Stock reservado en otros tickets abiertos en espera
  const getReservedInOtherTickets = useCallback(
    (productId: number): number =>
      tickets.reduce((sum, ticket, idx) => {
        if (idx === safeTicketIndex) return sum;
        const found = ticket.items.find((i) => i.productId === productId);
        return sum + (found ? found.quantity : 0);
      }, 0),
    [tickets, safeTicketIndex]
  );

  // --- OPERACIONES PURAS DE LÍNEAS DEL TICKET ---
  const addProduct = useCallback(
    (product: Product, explicitQty?: number): boolean => {
      const rawQty = explicitQty ?? pendingMultiplier ?? 1;
      const qty = Math.floor(rawQty);

      if (!Number.isFinite(qty) || qty <= 0 || qty > MAX_MULTIPLIER) {
        toast.error(`Cantidad inválida (máx. ${MAX_MULTIPLIER})`, {
          duration: 1800,
        });
        setPendingMultiplier(null);
        return false;
      }

      const totalStock = toSafeStock(product.stock);
      const reservedElsewhere = getReservedInOtherTickets(product.id);
      const availableForThisTicket = Math.max(0, totalStock - reservedElsewhere);

      if (availableForThisTicket <= 0) {
        toast.error(
          reservedElsewhere > 0
            ? `Sin stock libre (${reservedElsewhere} u. en otro ticket en espera)`
            : `SIN STOCK: ${product.name}`,
          { duration: 2000 }
        );
        setPendingMultiplier(null);
        return false;
      }

      const existing = activeTicket.items.find(
        (i) => i.productId === product.id
      );
      const nextQty = (existing?.quantity ?? 0) + qty;

      if (nextQty > availableForThisTicket) {
        toast.error(
          `Stock disponible insuficiente (máx. ${availableForThisTicket} u.)`,
          { duration: 1800 }
        );
        return false;
      }

      const safePrice = toSafePrice(product.price);
      const diaperFlag = isDiaperProduct(product);

      updateActiveTicket((ticket) => {
        const itemExists = ticket.items.some((i) => i.productId === product.id);
        if (itemExists) {
          return {
            ...ticket,
            items: ticket.items.map((i) =>
              i.productId === product.id
                ? {
                  ...i,
                  price: safePrice,
                  quantity: i.quantity + qty,
                  stock: totalStock,
                  isDiaper: diaperFlag,
                }
                : i
            ),
          };
        }

        return {
          ...ticket,
          items: [
            ...ticket.items,
            {
              productId: product.id,
              code: sanitizeText(product.barcode || String(product.id), 40),
              name: sanitizeText(product.name, 120),
              price: safePrice,
              quantity: qty,
              stock: totalStock,
              isDiaper: diaperFlag,
            },
          ],
        };
      });

      setSelectedRowId(product.id);
      setPendingMultiplier(null);
      return true;
    },
    [
      activeTicket.items,
      getReservedInOtherTickets,
      isDiaperProduct,
      pendingMultiplier,
      updateActiveTicket,
    ]
  );

  const setLineQuantity = useCallback(
    (productId: number, requestedQty: number) => {
      const cleanQty = Math.floor(requestedQty);
      if (!Number.isFinite(cleanQty) || cleanQty <= 0) {
        updateActiveTicket((ticket) => ({
          ...ticket,
          items: ticket.items.filter((i) => i.productId !== productId),
        }));
        return;
      }

      const liveProd = products.find((p) => p.id === productId);
      const totalStock = liveProd
        ? toSafeStock(liveProd.stock)
        : activeTicket.items.find((i) => i.productId === productId)?.stock ?? 0;
      const reservedElsewhere = getReservedInOtherTickets(productId);
      const maxAllowed = Math.max(
        1,
        Math.min(MAX_MULTIPLIER, totalStock - reservedElsewhere)
      );

      let finalQty = cleanQty;
      if (cleanQty > maxAllowed) {
        toast.error(`Stock máximo disponible: ${maxAllowed} u.`, {
          duration: 1500,
        });
        finalQty = maxAllowed;
      }

      updateActiveTicket((ticket) => ({
        ...ticket,
        items: ticket.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: finalQty, stock: totalStock }
            : item
        ),
      }));
    },
    [activeTicket.items, getReservedInOtherTickets, products, updateActiveTicket]
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

  // --- PROCESADOR SEGURO DE ENTRADA RÁPIDA ---
  const executeCommand = (rawInput: string) => {
    const trimmed = sanitizeText(rawInput, MAX_COMMAND_LENGTH).trim();
    if (!trimmed) return;

    // Multiplicador aislado: ej. "5*" (limitado a 1..999 para no confundir con códigos EAN)
    const multOnlyMatch = trimmed.match(/^(\d{1,3})\*$/);
    if (multOnlyMatch) {
      const qty = parseInt(multOnlyMatch[1], 10);
      if (qty >= 1 && qty <= MAX_MULTIPLIER) {
        setPendingMultiplier(qty);
        setCommandInput("");
      } else {
        toast.error(`Multiplicador válido entre 1 y ${MAX_MULTIPLIER}`);
      }
      return;
    }

    // Rechazar si intentó poner un número gigante con asterisco (ej. código escaneado + *)
    if (/^\d{4,}\*$/.test(trimmed)) {
      toast.error(`Multiplicador demasiado grande (máx. ${MAX_MULTIPLIER})`);
      setCommandInput("");
      return;
    }

    let qty = pendingMultiplier ?? 1;
    let query = trimmed;
    const inlineMultMatch = trimmed.match(/^(\d{1,3})\*(.+)$/);
    if (inlineMultMatch) {
      const parsedMult = parseInt(inlineMultMatch[1], 10);
      if (parsedMult < 1 || parsedMult > MAX_MULTIPLIER) {
        toast.error(`Cantidad inválida (máx. ${MAX_MULTIPLIER})`);
        return;
      }
      qty = parsedMult;
      query = inlineMultMatch[2].trim();
    }

    if (!query) return;

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
      toast.error(`Código o artículo no encontrado`, {
        duration: 1800,
      });
      setCommandInput("");
    }
  };

  const openCheckout = useCallback(() => {
    if (submittingLockRef.current) return;
    if (activeTicket.items.length === 0) {
      toast.error("El ticket está vacío", { duration: 1500 });
      return;
    }
    const totalForCurrentMethod = roundCurrency(
      subtotal +
      (activeTicket.paymentMethod === "CARD"
        ? potentialCardDiaperSurcharge
        : 0)
    );

    updateActiveTicket((t) => ({
      ...t,
      cashTendered: String(totalForCurrentMethod),
    }));
    setShowCheckoutModal(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        cashInputRef.current?.focus();
        cashInputRef.current?.select();
      }
    }, 30);
  }, [
    activeTicket.items.length,
    activeTicket.paymentMethod,
    potentialCardDiaperSurcharge,
    subtotal,
    updateActiveTicket,
  ]);

  // --- VALIDACIÓN Y PROCESAMIENTO SEGURO DE VENTA ---
  const processSale = useCallback(
    async (overrideMethod?: PaymentMethodType) => {
      // Mutex sincrónico contra doble disparo (Enter / F12 simultáneos)
      if (submittingLockRef.current || activeTicket.items.length === 0) return;

      const method = overrideMethod || activeTicket.paymentMethod;
      const appliedSurcharge =
        method === "CARD" ? potentialCardDiaperSurcharge : 0;
      const computedTotal = roundCurrency(subtotal + appliedSurcharge);

      // Si viene desde el modal de cobro en Efectivo (sin overrideMethod), validar pago suficiente
      if (!overrideMethod && method === "CASH") {
        if (!Number.isFinite(cashTenderedNum) || cashTenderedNum < computedTotal) {
          toast.error("El monto abonado en efectivo es menor al total a cobrar");
          cashInputRef.current?.focus();
          return;
        }
      }

      // Verificar integridad de stock actual antes de enviar al servidor
      for (const item of activeTicket.items) {
        const liveProduct = products.find((p) => p.id === item.productId);
        const currentStock = liveProduct ? toSafeStock(liveProduct.stock) : 0;
        if (
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          item.quantity > currentStock
        ) {
          toast.error(
            `Stock insuficiente para "${item.name}" (disp: ${currentStock})`
          );
          return;
        }
      }

      submittingLockRef.current = true;
      setIsSubmitting(true);
      const toastId = toast.loading("Cerrando venta...");

      try {
        // TODO (Backend): eliminar resolución de cliente genérico cuando clientId sea opcional en POST /sales
        let clientIdToUse: number | undefined =
          defaultClientId && defaultClientId > 0 ? defaultClientId : undefined;

        if (!clientIdToUse) {
          const cfResp = await clientApi.create(GENERIC_CLIENT_PAYLOAD);
          const createdId = Number(cfResp?.id ?? cfResp?.client?.id);
          if (Number.isInteger(createdId) && createdId > 0) {
            clientIdToUse = createdId;
            if (isMountedRef.current) setDefaultClientId(createdId);
          }
        }

        if (!clientIdToUse || !Number.isInteger(clientIdToUse) || clientIdToUse <= 0) {
          throw new Error("CLIENT_RESOLUTION_FAILED");
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

        // Dejar constancia segura en notas si hubo recargo del 5% en pañales con tarjeta
        const createdSaleId = Number(createdSale?.id ?? createdSale?.sale?.id);
        if (
          Number.isInteger(createdSaleId) &&
          createdSaleId > 0 &&
          method === "CARD" &&
          appliedSurcharge > 0
        ) {
          saleApi
            .update(String(createdSaleId), {
              status: "COMPLETED",
              notes: `Pago con Tarjeta • Incluye +5% recargo en pañales (${formatARS(
                appliedSurcharge
              )}) • Total cobrado: ${formatARS(computedTotal)}`,
              details: saleDetails,
            })
            .catch(() => {
              // No interrumpir flujo de caja si falla actualización secundaria de nota
            });
        }

        if (!isMountedRef.current) return;

        // Actualizar stock en memoria tanto en catálogo como en tickets en espera abiertos
        const soldMap = new Map<number, number>();
        activeTicket.items.forEach((i) => soldMap.set(i.productId, i.quantity));

        setProducts((prev) =>
          prev.map((p) => {
            const soldQty = soldMap.get(p.id);
            return soldQty
              ? { ...p, stock: Math.max(0, toSafeStock(p.stock) - soldQty) }
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
          const remaining = tickets
            .filter((_, idx) => idx !== safeTicketIndex)
            .map((t) => ({
              ...t,
              items: t.items.map((item) => {
                const soldQty = soldMap.get(item.productId) ?? 0;
                const updatedStock = Math.max(0, item.stock - soldQty);
                return {
                  ...item,
                  stock: updatedStock,
                  quantity: Math.min(item.quantity, Math.max(1, updatedStock)),
                };
              }),
            }));
          setTickets(remaining);
          setActiveTicketIndex(Math.max(0, safeTicketIndex - 1));
        } else {
          setTickets([createEmptyTicket(ticketCounter)]);
          setTicketCounter((c) => c + 1);
        }
      } catch {
        if (isMountedRef.current) {
          toast.error("No se pudo registrar la venta. Verificá tu conexión.", {
            id: toastId,
          });
        }
      } finally {
        submittingLockRef.current = false;
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [
      activeTicket,
      cashTenderedNum,
      defaultClientId,
      potentialCardDiaperSurcharge,
      products,
      safeTicketIndex,
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
    if (submittingLockRef.current) return;
    if (tickets.length >= MAX_OPEN_TICKETS) {
      toast.error(`Máximo ${MAX_OPEN_TICKETS} tickets abiertos en simultáneo`);
      return;
    }
    const next = createEmptyTicket(ticketCounter);
    setTickets((prev) => [...prev, next]);
    setActiveTicketIndex(tickets.length);
    setTicketCounter((c) => c + 1);
    toast(`Ticket ${next.label} listo`, { duration: 1200 });
  }, [ticketCounter, tickets.length]);

  const closeTicketTab = (idx: number) => {
    if (submittingLockRef.current) return;
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

  // Alternar rápido Efectivo <-> Tarjeta
  const toggleCardMode = useCallback(() => {
    if (submittingLockRef.current) return;
    updateActiveTicket((t) => ({
      ...t,
      paymentMethod: t.paymentMethod === "CARD" ? "CASH" : "CARD",
    }));
  }, [updateActiveTicket]);

  // --- ATAJOS GLOBALES PROTEGIDOS ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (submittingLockRef.current) return;

      if (e.key === "F2") {
        e.preventDefault();
        setShowSearchModal(false);
        setShowCheckoutModal(false);
        focusScanner();
        return;
      }
      if (e.key === "F3") {
        e.preventDefault();
        setSearchModalQuery(sanitizeText(commandInput.trim(), MAX_COMMAND_LENGTH));
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
      if (e.key === "F12") {
        e.preventDefault();
        if (activeTicket.items.length > 0) {
          processSale("CASH");
        }
        return;
      }

      if (e.key === "Escape") {
        if (isAnyModalOpen) {
          e.preventDefault();
          setShowSearchModal(false);
          setShowCheckoutModal(false);
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
    focusScanner,
    handleParkOrNewTicket,
    isAnyModalOpen,
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
        {/* 1. BARRA DE HERRAMIENTAS SUPERIOR                               */}
        {/* =============================================================== */}
        <div
          className="shrink-0 flex items-center justify-between gap-2 bg-[#110E1C] border border-white/10 rounded-xl px-2.5 py-1.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botonera Operativa Izquierda */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/management/sales")}
              className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
              title="Salir al listado de ventas"
            >
              <LogOut size={15} className="rotate-180 text-slate-400" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-0.5 hidden sm:block" />

            {/* Tickets / Ventas en espera (HTML5 válido sin botones anidados) */}
            <div className="flex items-center gap-1 flex-wrap">
              {tickets.map((t, idx) => {
                const active = idx === safeTicketIndex;
                const count = t.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <div
                    key={t.id}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center overflow-hidden transition ${active
                      ? "bg-indigo-600 text-white border-indigo-400 shadow"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                      }`}
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setActiveTicketIndex(idx)}
                      className="h-full px-2.5 flex items-center gap-1.5 cursor-pointer"
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
                    </button>

                    {tickets.length > 1 && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => closeTicketTab(idx)}
                        className="h-full pr-2 pl-1 hover:text-rose-300 cursor-pointer flex items-center"
                        title={`Cerrar Ticket ${t.label}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                disabled={isSubmitting || tickets.length >= MAX_OPEN_TICKETS}
                onClick={handleParkOrNewTicket}
                className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
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
              disabled={activeTicket.items.length === 0 || isSubmitting}
              onClick={() => setShowClearConfirm(true)}
              className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold cursor-pointer transition"
              title="Anular / Vaciar ticket completo"
            >
              <Trash2 size={15} />
              <span className="hidden lg:inline">Vaciar</span>
            </button>
          </div>

          {/* Botonera Derecha: Medio rápido (Efectivo / Tarjeta), Ayuda y Reloj */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={toggleCardMode}
              className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition disabled:opacity-40 ${isCardActive
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
        {/* 2. ÁREA CENTRAL DE OPERACIÓN (ANCHO COMPLETO)                   */}
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
                autoComplete="off"
                maxLength={MAX_COMMAND_LENGTH}
                value={commandInput}
                onChange={(e) =>
                  setCommandInput(
                    sanitizeText(e.target.value, MAX_COMMAND_LENGTH)
                  )
                }
                placeholder={
                  isLoading
                    ? "Cargando artículos..."
                    : "Código de barras, cant*código (ej: 3*779...) o nombre + [Enter]"
                }
                className="flex-1 bg-transparent! border-0! ring-0! focus:ring-0! focus:border-0! shadow-none! px-1! py-0.5! text-sm md:text-base font-mono font-semibold text-white placeholder:text-slate-500 outline-none"
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
                disabled={isLoading || isSubmitting}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-bold tracking-wide cursor-pointer shrink-0 transition"
              >
                ENTER
              </button>
            </form>

            {/* Íconos de Acción de Línea uno al lado del otro */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                disabled={activeTicket.items.length === 0 || isSubmitting}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-sky-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Subir línea (↑)"
              >
                <ArrowUp size={18} />
              </button>

              <button
                type="button"
                onClick={() => moveSelection(1)}
                disabled={activeTicket.items.length === 0 || isSubmitting}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-sky-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Bajar línea (↓)"
              >
                <ArrowDown size={18} />
              </button>

              <button
                type="button"
                onClick={() => adjustSelectedRowQty(-1)}
                disabled={!selectedItem || isSubmitting}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-rose-500/25 border border-white/10 text-rose-300 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Restar 1 unidad (-)"
              >
                <Minus size={18} />
              </button>

              <button
                type="button"
                onClick={() => adjustSelectedRowQty(1)}
                disabled={!selectedItem || isSubmitting}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-emerald-500/25 border border-white/10 text-emerald-300 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Sumar 1 unidad (+)"
              >
                <Plus size={18} />
              </button>

              <button
                type="button"
                disabled={!selectedItem || isSubmitting}
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
                disabled={!selectedItem || isSubmitting}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-rose-500/25 border border-white/10 text-rose-400 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
                title="Quitar artículo seleccionado (Supr)"
              >
                <Trash2 size={17} />
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSearchModalQuery("");
                  setSearchSelectedIndex(0);
                  setShowSearchModal(true);
                  setTimeout(() => searchModalInputRef.current?.focus(), 20);
                }}
                className="w-9 h-9 rounded-lg bg-[#1C1830] hover:bg-indigo-600/30 border border-white/10 text-indigo-300 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition"
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
                    const lineBase = roundCurrency(item.price * item.quantity);
                    const lineCardExtra =
                      isCardActive && item.isDiaper
                        ? roundCurrency(lineBase * CARD_DIAPER_SURCHARGE_RATE)
                        : 0;

                    return (
                      <tr
                        key={item.productId}
                        onClick={() => {
                          setSelectedRowId(item.productId);
                          focusScanner();
                        }}
                        className={`cursor-pointer transition-colors ${isSelected
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
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${isCardActive
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
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
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
                className={`rounded-lg px-3 py-2 cursor-pointer transition border ${isCardActive && activeCardSurcharge > 0
                  ? "bg-amber-950/30 border-amber-500/40"
                  : "bg-[#0B0914] border-white/10 hover:border-amber-500/30"
                  }`}
                title="Clic para alternar Efectivo / Tarjeta (+5% en pañales)"
              >
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                  {isCardActive ? "Tarj. +5% Pañales" : "Recargo Tarj."}
                </span>
                <span
                  className={`text-base font-mono font-bold ${activeCardSurcharge > 0 ? "text-amber-400" : "text-slate-500"
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
                onClick={openCheckout}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:pointer-events-none font-black text-base flex items-center justify-center gap-2  cursor-pointer active:scale-95 transition"
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
      {/* MODAL BUSCADOR TABULAR RÁPIDO (F3)                              */}
      {/* =============================================================== */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-md flex items-start justify-center pt-10 md:pt-16 p-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-[780px] bg-[#0F0C1A] border border-white/15 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[78vh] ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del buscador */}
            <div className="px-4 py-3 bg-[#171327] border-b border-white/10 flex items-center gap-3 shrink-0">
              <div className="flex-1 flex items-center gap-2.5 bg-[#090710] border border-indigo-500/40 focus-within:border-indigo-400 rounded-xl px-3 py-2">
                <Search size={17} className="text-indigo-400 shrink-0" />
                <input
                  ref={searchModalInputRef}
                  type="text"
                  autoFocus
                  autoComplete="off"
                  maxLength={MAX_COMMAND_LENGTH}
                  value={searchModalQuery}
                  onChange={(e) => {
                    setSearchModalQuery(
                      sanitizeText(e.target.value, MAX_COMMAND_LENGTH)
                    );
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
                      if (chosen && addProduct(chosen)) {
                        setShowSearchModal(false);
                      }
                    }
                  }}
                  placeholder="Buscar artículo por nombre o código..."
                  className="flex-1 min-w-0 bg-transparent! border-0! ring-0! focus:ring-0! focus:border-0! shadow-none! p-0! text-sm text-white placeholder:text-slate-500 outline-none"
                />
                {searchModalQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchModalQuery("");
                      setSearchSelectedIndex(0);
                      searchModalInputRef.current?.focus();
                    }}
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer shrink-0"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition"
                title="Cerrar (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabla de resultados */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[#141122] text-slate-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4 w-32 font-semibold">Código</th>
                    <th className="py-2.5 px-4 font-semibold">Artículo</th>
                    <th className="py-2.5 px-4 w-24 text-center font-semibold">
                      Stock
                    </th>
                    <th className="py-2.5 px-4 w-32 text-right font-semibold">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-slate-500 text-sm"
                      >
                        No se encontraron artículos para "{searchModalQuery}"
                      </td>
                    </tr>
                  ) : (
                    searchResults.map((p, idx) => {
                      const active = idx === searchSelectedIndex;
                      const avail =
                        toSafeStock(p.stock) - getReservedInOtherTickets(p.id);
                      const noStock = avail <= 0;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => {
                            if (!noStock && addProduct(p)) {
                              setShowSearchModal(false);
                            }
                          }}
                          className={`transition-colors ${
                            noStock
                              ? "opacity-40 cursor-not-allowed"
                              : active
                              ? "bg-indigo-600/35 text-white cursor-pointer"
                              : "hover:bg-white/5 text-slate-200 cursor-pointer"
                          }`}
                        >
                          <td className="py-2.5 px-4 font-mono text-slate-400 truncate">
                            {p.barcode || p.id}
                          </td>
                          <td className="py-2.5 px-4 font-semibold truncate">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                noStock
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-white/5 text-slate-200"
                              }`}
                            >
                              {Math.max(0, avail)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {formatARS(toSafePrice(p.price))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie informativo */}
            <div className="px-4 py-2 bg-[#141122] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <span>
                Mostrando {searchResults.length} resultado
                {searchResults.length === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-mono">
                    ↑↓
                  </kbd>{" "}
                  Mover
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-mono">
                    Enter
                  </kbd>{" "}
                  Agregar
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-mono">
                    Esc
                  </kbd>{" "}
                  Cerrar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL DE COBRO EXPRESS (= / F4)                                 */}
      {/* =============================================================== */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowCheckoutModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processSale();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-[#12101F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#181529] border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cobro de Venta
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Medios de Pago */}
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
                      disabled={isSubmitting}
                      onClick={() => {
                        const nextTotal = roundCurrency(
                          subtotal +
                          (pm.id === "CARD" ? potentialCardDiaperSurcharge : 0)
                        );
                        updateActiveTicket((t) => ({
                          ...t,
                          paymentMethod: pm.id,
                          cashTendered: String(nextTotal),
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

              {/* Desglose y Total */}
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
                        disabled={isSubmitting}
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
                        step="0.01"
                        min={finalTotal}
                        max={MAX_CASH_TENDERED}
                        autoComplete="off"
                        value={activeTicket.cashTendered}
                        onChange={(e) =>
                          updateActiveTicket((t) => ({
                            ...t,
                            cashTendered: e.target.value.slice(0, 12),
                          }))
                        }
                        className={`w-full bg-[#090710]! border rounded-xl! px-3! py-2! text-lg font-mono font-bold text-white outline-none focus:ring-0! ${
                          cashTenderedNum < finalTotal
                            ? "border-rose-500/70!"
                            : "border-indigo-400/50!"
                        }`}
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
                disabled={isSubmitting}
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 disabled:opacity-40 cursor-pointer"
              >
                Cancelar (Esc)
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (activeTicket.paymentMethod === "CASH" &&
                    cashTenderedNum < finalTotal)
                }
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowQtyEditModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(qtyEditValue, 10);
              if (Number.isFinite(val) && val >= 0) {
                setLineQuantity(selectedItem.productId, val);
              }
              setShowQtyEditModal(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#12101F] border border-white/15 rounded-2xl p-4 space-y-3 shadow-2xl"
          >
            <h3 className="text-xs font-bold uppercase text-slate-300 truncate">
              Cantidad: {selectedItem.name}
            </h3>
            <input
              type="number"
              min="0"
              max={Math.min(MAX_MULTIPLIER, selectedItem.stock)}
              step="1"
              autoFocus
              autoComplete="off"
              value={qtyEditValue}
              onChange={(e) =>
                setQtyEditValue(sanitizeDigits(e.target.value, 4))
              }
              onFocus={(e) => e.currentTarget.select()}
              className="w-full bg-[#090710]! border border-indigo-400! rounded-xl! px-3! py-2.5! text-xl font-mono font-bold text-center text-white outline-none focus:ring-0!"
            />
            <p className="text-[11px] text-slate-400 text-center">
              Stock disponible:{" "}
              {Math.max(
                0,
                selectedItem.stock -
                getReservedInOtherTickets(selectedItem.productId)
              )}{" "}
              u. (0 elimina la línea)
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
      {/* MODAL DE ATAJOS DE CAJA                                         */}
      {/* =============================================================== */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] bg-[#12101F] border border-white/15 rounded-2xl p-5 space-y-3 shadow-2xl"
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
                ["F6", "Poner ticket en espera y abrir otro"],
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
