import React, { useState, useMemo } from "react";
import {
    PackagePlus,
    SquarePen,
    Camera,
    Barcode,
    ScanLine,
    Image as ImageIcon,
    Check,
    X,
    ChevronRight,
    TrendingUp,
    Percent,
    DollarSign,
    Layers,
    Eye,
    Plus,
    Minus,
    Sparkles,
    Trash2,
    RefreshCw,
    Smartphone,
    Monitor,
    Maximize2,
    SlidersHorizontal,
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowLeft,
    Tag,
    Boxes
} from "lucide-react";
import toast from "react-hot-toast";

// --- Tipos del prototipo ---
interface PrototypeProduct {
    id: number;
    name: string;
    barcode: string;
    description: string;
    price: number;
    costPrice: number;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    providerId: number | null;
    providerName: string;
    stock: number;
    minStock: number;
    showingInCatalog: boolean;
    isOffer: boolean;
}

// --- Categorías y Proveedores Mock ---
const MOCK_CATEGORIES = [
    { id: 1, name: "Periféricos", icon: "⌨️" },
    { id: 2, name: "Audio", icon: "🎧" },
    { id: 3, name: "Monitores", icon: "🖥️" },
    { id: 4, name: "Componentes", icon: "⚡" },
    { id: 5, name: "Accesorios", icon: "🎒" },
];

const MOCK_PROVIDERS = [
    { id: 1, name: "TechDistribuidora S.A." },
    { id: 2, name: "Global Imports Latam" },
    { id: 3, name: "Mayorista Gamer SRL" },
];

const SAMPLE_PRESET_IMAGES = [
    { label: "Auriculares Gamer", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80" },
    { label: "Teclado Mecánico", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80" },
    { label: "Mouse Inalámbrico", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80" },
    { label: "Micrófono USB", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80" },
    { label: "Smartwatch Deportivo", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" },
];

const INITIAL_MOCK_PRODUCTS: PrototypeProduct[] = [
    {
        id: 101,
        name: "Auriculares Inalámbricos Pro Wireless ANC",
        barcode: "7791234567890",
        description: "Auriculares con cancelación de ruido activa, conectividad Bluetooth 5.3 y 30hs de batería.",
        price: 85900,
        costPrice: 52000,
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
        categoryId: 2,
        categoryName: "Audio",
        providerId: 1,
        providerName: "TechDistribuidora S.A.",
        stock: 14,
        minStock: 5,
        showingInCatalog: true,
        isOffer: true,
    },
    {
        id: 102,
        name: "Teclado Mecánico RGB Switch Red TKL",
        barcode: "7799876543210",
        description: "Formato compacto tenkeyless con switches lineales rojos y keycaps PBT doble inyección.",
        price: 114500,
        costPrice: 72000,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        categoryId: 1,
        categoryName: "Periféricos",
        providerId: 3,
        providerName: "Mayorista Gamer SRL",
        stock: 6,
        minStock: 8,
        showingInCatalog: true,
        isOffer: false,
    },
    {
        id: 103,
        name: "Mouse Ergonómico Ultra Ligero 58g",
        barcode: "7794561238902",
        description: "Sensor óptico de 26000 DPI con switches ópticos y cable paracord ultra flexible.",
        price: 49900,
        costPrice: 28500,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
        categoryId: 1,
        categoryName: "Periféricos",
        providerId: 2,
        providerName: "Global Imports Latam",
        stock: 3,
        minStock: 5,
        showingInCatalog: false,
        isOffer: false,
    },
];

type ActiveTab = "basic" | "pricing" | "stock" | "preview";

export default function MobileProductPrototype() {
    // Modo de vista: Simulador con marco de smartphone o Pantalla completa
    const [viewMode, setViewMode] = useState<"frame" | "fullscreen">("frame");

    // Modo de operación: "create" o "edit"
    const [mode, setMode] = useState<"create" | "edit">("create");

    // Lista de productos del prototipo (permite probar crear y editar en vivo)
    const [productList, setProductList] = useState<PrototypeProduct[]>(INITIAL_MOCK_PRODUCTS);
    const [selectedProductId, setSelectedProductId] = useState<number>(INITIAL_MOCK_PRODUCTS[0].id);

    // Tab activa del formulario móvil
    const [activeTab, setActiveTab] = useState<ActiveTab>("basic");

    // Estado del formulario
    const [name, setName] = useState("");
    const [barcode, setBarcode] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number>(1);
    const [providerId, setProviderId] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    // Precios y Margen
    const [costPrice, setCostPrice] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [marginPercent, setMarginPercent] = useState<string>("35");

    // Inventario y Visibilidad
    const [stock, setStock] = useState<number>(10);
    const [minStock, setMinStock] = useState<number>(5);
    const [showingInCatalog, setShowingInCatalog] = useState<boolean>(true);
    const [isOffer, setIsOffer] = useState<boolean>(false);

    // Estados de modal y utilitarios
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showProductDrawer, setShowProductDrawer] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Cargar producto al cambiar a modo "edit" o cambiar de producto seleccionado
    const loadProductToEdit = (prod: PrototypeProduct) => {
        setSelectedProductId(prod.id);
        setName(prod.name);
        setBarcode(prod.barcode);
        setDescription(prod.description);
        setCategoryId(prod.categoryId);
        setProviderId(prod.providerId);
        setImageUrl(prod.imageUrl);
        setCostPrice(prod.costPrice);
        setPrice(prod.price);
        setStock(prod.stock);
        setMinStock(prod.minStock);
        setShowingInCatalog(prod.showingInCatalog);
        setIsOffer(prod.isOffer);

        if (prod.costPrice > 0 && prod.price > 0) {
            const m = (((prod.price - prod.costPrice) / prod.costPrice) * 100).toFixed(1);
            setMarginPercent(m);
        } else {
            setMarginPercent("30");
        }
    };

    // Resetear a formulario vacío para "create"
    const resetFormForCreate = () => {
        setName("");
        setBarcode(generateRandomBarcode());
        setDescription("");
        setCategoryId(1);
        setProviderId(null);
        setImageUrl(SAMPLE_PRESET_IMAGES[0].url);
        setCostPrice(15000);
        setPrice(22500);
        setMarginPercent("50");
        setStock(12);
        setMinStock(4);
        setShowingInCatalog(true);
        setIsOffer(false);
        setActiveTab("basic");
    };

    // Cambiar entre modo Crear y Editar
    const handleSwitchMode = (newMode: "create" | "edit") => {
        setMode(newMode);
        if (newMode === "create") {
            resetFormForCreate();
            toast("Modo creación activado", { icon: "✨" });
        } else {
            const current = productList.find(p => p.id === selectedProductId) || productList[0];
            if (current) loadProductToEdit(current);
            toast(`Modo edición activado: "${current.name.slice(0, 24)}..."`, { icon: "✏️" });
        }
    };

    // Generador de código de barras simulado
    function generateRandomBarcode() {
        return "779" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }

    // Cálculos de precios reactivos
    const handleCostChange = (val: number) => {
        const cost = Math.max(0, val);
        setCostPrice(cost);
        const margin = parseFloat(marginPercent) || 0;
        if (cost > 0) {
            const calculatedSale = Math.round(cost * (1 + margin / 100));
            setPrice(calculatedSale);
        }
    };

    const handleMarginChipClick = (marginVal: number) => {
        setMarginPercent(marginVal.toString());
        if (costPrice > 0) {
            const calculatedSale = Math.round(costPrice * (1 + marginVal / 100));
            setPrice(calculatedSale);
            toast.success(`Margen fijado en +${marginVal}%`);
        }
    };

    const handlePriceChange = (val: number) => {
        const sale = Math.max(0, val);
        setPrice(sale);
        if (costPrice > 0 && sale > 0) {
            const calculatedMargin = (((sale - costPrice) / costPrice) * 100).toFixed(1);
            setMarginPercent(calculatedMargin);
        }
    };

    // Ganancia calculada
    const profit = Math.max(0, price - costPrice);
    const profitMargin = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : "0";

    // Validaciones
    const isValid = name.trim().length > 0 && barcode.trim().length > 0 && price > 0 && categoryId > 0;

    // Guardar producto (Crear o Actualizar)
    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Ingresá el nombre del producto");
            setActiveTab("basic");
            return;
        }
        if (!barcode.trim()) {
            toast.error("El código de barras es requerido");
            setActiveTab("basic");
            return;
        }
        if (price <= 0) {
            toast.error("El precio debe ser mayor a $0");
            setActiveTab("pricing");
            return;
        }

        setIsSaving(true);

        setTimeout(() => {
            const cat = MOCK_CATEGORIES.find(c => c.id === categoryId)?.name || "General";
            const prov = MOCK_PROVIDERS.find(p => p.id === providerId)?.name || "Sin proveedor";

            if (mode === "create") {
                const newProduct: PrototypeProduct = {
                    id: Date.now(),
                    name: name.trim(),
                    barcode: barcode.trim(),
                    description: description.trim(),
                    price,
                    costPrice,
                    imageUrl: imageUrl || SAMPLE_PRESET_IMAGES[0].url,
                    categoryId,
                    categoryName: cat,
                    providerId,
                    providerName: prov,
                    stock,
                    minStock,
                    showingInCatalog,
                    isOffer,
                };
                setProductList(prev => [newProduct, ...prev]);
                setSelectedProductId(newProduct.id);
                toast.success("¡Producto cargado exitosamente en el catálogo!");
                // Opcional pasar a modo edición para continuar afinándolo
                setMode("edit");
            } else {
                setProductList(prev =>
                    prev.map(p =>
                        p.id === selectedProductId
                            ? {
                                  ...p,
                                  name: name.trim(),
                                  barcode: barcode.trim(),
                                  description: description.trim(),
                                  price,
                                  costPrice,
                                  imageUrl: imageUrl || p.imageUrl,
                                  categoryId,
                                  categoryName: cat,
                                  providerId,
                                  providerName: prov,
                                  stock,
                                  minStock,
                                  showingInCatalog,
                                  isOffer,
                              }
                            : p
                    )
                );
                toast.success("¡Cambios del producto guardados!");
            }

            setIsSaving(false);
            setShowConfirmModal(false);
        }, 600);
    };

    // Componente interno: Lector de Código de Barras Simulado
    const renderScannerModal = () => {
        if (!isScannerOpen) return null;

        return (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-white pt-2">
                    <div className="flex items-center gap-2">
                        <ScanLine className="text-indigo-400 animate-pulse" size={20} />
                        <span className="font-semibold text-sm">Escáner Móvil Activo</span>
                    </div>
                    <button
                        onClick={() => setIsScannerOpen(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Visor de escaneo con láser */}
                <div className="my-auto flex flex-col items-center">
                    <div className="relative w-64 h-48 border-2 border-indigo-400/80 rounded-2xl overflow-hidden flex items-center justify-center bg-indigo-950/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        {/* Esquinas destacadas */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>

                        {/* Línea roja láser animada */}
                        <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-bounce"></div>

                        <p className="absolute bottom-3 text-[11px] text-indigo-200/80 font-mono tracking-wider">
                            Apunte al código EAN / UPC
                        </p>
                    </div>

                    <p className="text-xs text-slate-300 mt-4 text-center max-w-xs">
                        Utiliza la cámara trasera de tu smartphone para lectura instantánea de código de barras.
                    </p>
                </div>

                {/* Acciones simuladas del escáner */}
                <div className="space-y-2 pb-4">
                    <button
                        onClick={() => {
                            const code = generateRandomBarcode();
                            setBarcode(code);
                            setIsScannerOpen(false);
                            toast.success(`Código escaneado: ${code}`);
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
                    >
                        <Barcode size={18} />
                        Simular Detección de Código
                    </button>
                    <button
                        onClick={() => setIsScannerOpen(false)}
                        className="w-full py-2.5 bg-white/10 text-slate-300 font-medium text-xs rounded-xl hover:bg-white/15 transition"
                    >
                        Cerrar Escáner
                    </button>
                </div>
            </div>
        );
    };

    // Componente interno: Selector de Fotos Móvil
    const renderPhotoPickerModal = () => {
        if (!isPhotoPickerOpen) return null;

        return (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-white pt-2">
                    <span className="font-semibold text-sm flex items-center gap-2">
                        <Camera size={18} className="text-indigo-400" />
                        Cargar Foto del Producto
                    </span>
                    <button
                        onClick={() => setIsPhotoPickerOpen(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto space-y-4 my-2 pr-1">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Fotos de muestra para prueba rápida:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {SAMPLE_PRESET_IMAGES.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setImageUrl(img.url);
                                        setIsPhotoPickerOpen(false);
                                        toast.success("Foto seleccionada");
                                    }}
                                    className="p-2 bg-slate-900 border border-white/10 rounded-xl flex flex-col items-center gap-2 text-left hover:border-indigo-500 transition group"
                                >
                                    <div className="w-full h-24 rounded-lg overflow-hidden bg-black/40">
                                        <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    </div>
                                    <span className="text-[11px] text-slate-300 font-medium line-clamp-1">{img.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            O pegar URL directa de imagen:
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-[#151320] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => setIsPhotoPickerOpen(false)}
                        className="w-full py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-500 transition"
                    >
                        Confirmar Foto
                    </button>
                </div>
            </div>
        );
    };

    // Componente interno: Selector de Producto a Editar (Drawer)
    const renderProductDrawer = () => {
        if (!showProductDrawer) return null;

        return (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
                <div className="bg-[#12101e] border-t border-white/10 rounded-t-3xl max-h-[80%] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3"></div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Boxes size={18} className="text-indigo-400" />
                            Seleccionar Producto para Editar
                        </h3>
                        <button
                            onClick={() => setShowProductDrawer(false)}
                            className="p-1 rounded-full text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="overflow-y-auto space-y-2 pr-1">
                        {productList.map((prod) => {
                            const isSelected = prod.id === selectedProductId;
                            return (
                                <button
                                    key={prod.id}
                                    onClick={() => {
                                        loadProductToEdit(prod);
                                        setShowProductDrawer(false);
                                        toast.success(`Cargado: ${prod.name}`);
                                    }}
                                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                                        isSelected
                                            ? "bg-indigo-600/20 border-indigo-500/50"
                                            : "bg-[#181528] border-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden shrink-0 border border-white/5">
                                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                                                ${prod.price.toLocaleString("es-AR")}
                                            </span>
                                            <span className="text-[10px] text-slate-400">• Stock: {prod.stock}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                                                {prod.categoryName}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-500 shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // PANTALLA PRINCIPAL DEL PROTOTIPO
    return (
        <div className="min-h-screen bg-[#07050d] text-slate-100 flex flex-col">
            {/* BARRA SUPERIOR DE CONTROL DEL PROTOTIPO (Herramienta para el desarrollador/diseñador) */}
            <header className="bg-[#0e0b1c] border-b border-white/10 px-4 py-3 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <a
                            href="/management/products"
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
                        >
                            <ArrowLeft size={14} />
                            Volver al ERP
                        </a>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                                Prototipo Mobile Aislado
                            </span>
                            <h1 className="text-sm md:text-base font-bold text-white leading-tight">
                                Carga y Edición de Productos
                            </h1>
                        </div>
                    </div>

                    {/* Selector de modo y visualización */}
                    <div className="flex items-center gap-2">
                        {/* Selector de modo operativo: Crear / Editar */}
                        <div className="bg-[#151224] p-1 rounded-xl border border-white/10 flex items-center">
                            <button
                                onClick={() => handleSwitchMode("create")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    mode === "create"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <PackagePlus size={14} />
                                Cargar Nuevo
                            </button>
                            <button
                                onClick={() => handleSwitchMode("edit")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    mode === "edit"
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <SquarePen size={14} />
                                Editar Existente
                            </button>
                        </div>

                        {/* Toggle Frame Móvil vs Fullscreen */}
                        <div className="hidden sm:flex bg-[#151224] p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setViewMode("frame")}
                                title="Vista Teléfono Smartphone"
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === "frame" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Smartphone size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode("fullscreen")}
                                title="Vista Pantalla Completa"
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === "fullscreen" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENEDOR CENTRAL: MODO MARCO DE SMARTPHONE O FULLSCREEN */}
            <main className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
                <div
                    className={
                        viewMode === "frame"
                            ? "w-full max-w-[410px] h-[844px] max-h-[92vh] bg-[#0c0a15] rounded-[48px] border-[10px] border-[#222033] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.15)] flex flex-col relative overflow-hidden ring-1 ring-white/10"
                            : "w-full max-w-md min-h-screen bg-[#0c0a15] flex flex-col relative shadow-2xl"
                    }
                >
                    {/* BARRAS DE ESTADO DEL SMARTPHONE (Notch / Isla Dinámica y Hora) */}
                    <div className="pt-3 pb-2 px-6 flex items-center justify-between text-slate-400 text-[11px] font-semibold select-none shrink-0 bg-[#0c0a15]/90 backdrop-blur z-20">
                        <span>09:41</span>
                        {/* Dynamic Island / Notch */}
                        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500/80 animate-ping"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <span>5G</span>
                            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                                <div className="h-full w-full bg-emerald-400 rounded-xs"></div>
                            </div>
                        </div>
                    </div>

                    {/* CABECERA MÓVIL DEL FORMULARIO */}
                    <div className="px-4 py-3 bg-[#110e1f] border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    mode === "create"
                                        ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30"
                                        : "bg-purple-600/30 text-purple-400 border border-purple-500/30"
                                }`}
                            >
                                {mode === "create" ? <PackagePlus size={16} /> : <SquarePen size={16} />}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white leading-tight">
                                    {mode === "create" ? "Alta de Producto" : "Editar Producto"}
                                </h2>
                                <p className="text-[10px] text-slate-400">
                                    {mode === "create" ? "Nuevo ingreso de stock" : `ID: #${selectedProductId}`}
                                </p>
                            </div>
                        </div>

                        {/* Botón para cambiar de producto si está en modo edición */}
                        {mode === "edit" && (
                            <button
                                onClick={() => setShowProductDrawer(true)}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-semibold text-indigo-300 flex items-center gap-1 transition active:scale-95"
                            >
                                <Boxes size={12} />
                                Cambiar
                            </button>
                        )}
                    </div>

                    {/* TABS NAVEGACIÓN MÓVIL (Thumb-friendly swipeable/touch tabs) */}
                    <div className="px-2 py-2 bg-[#0e0b1c] border-b border-white/5 flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab("basic")}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                activeTab === "basic"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Tag size={13} />
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab("pricing")}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                activeTab === "pricing"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <DollarSign size={13} />
                            Precios
                        </button>
                        <button
                            onClick={() => setActiveTab("stock")}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                activeTab === "stock"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Layers size={13} />
                            Stock
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                activeTab === "preview"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Eye size={13} />
                            Vista
                        </button>
                    </div>

                    {/* CUERPO CON SCROLL DEL FORMULARIO */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                        {/* 1. TAB: GENERAL (Nombre, Código, Categoría, Proveedor, Foto) */}
                        {activeTab === "basic" && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* CARD DE FOTO PRINCIPAL CON BOTÓN RÁPIDO */}
                                <div className="bg-[#141124] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                                    <div className="relative w-20 h-20 rounded-xl bg-black/40 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center group">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Producto" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={28} className="text-slate-500" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setIsPhotoPickerOpen(true)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white"
                                        >
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                            Imagen de Portada
                                        </span>
                                        <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                                            {imageUrl ? "Imagen cargada" : "Sin imagen asignada"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsPhotoPickerOpen(true)}
                                                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-95"
                                            >
                                                <Camera size={13} />
                                                Tomar / Elegir Foto
                                            </button>
                                            {imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setImageUrl("")}
                                                    className="p-1 text-slate-400 hover:text-red-400 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* NOMBRE DEL PRODUCTO */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Nombre del Producto <span className="text-indigo-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Teclado Mecánico RGB"
                                        className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition"
                                    />
                                </div>

                                {/* CÓDIGO DE BARRA CON BOTÓN DE ESCÁNER */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Código de Barras <span className="text-indigo-400">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setBarcode(generateRandomBarcode())}
                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                                        >
                                            + Auto-generar
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                placeholder="7790000000000"
                                                className="w-full bg-[#151226] border border-white/10 rounded-xl pl-3.5 pr-8 py-3 text-sm font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            />
                                            <Barcode size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsScannerOpen(true)}
                                            className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
                                        >
                                            <ScanLine size={16} />
                                            <span>Escanear</span>
                                        </button>
                                    </div>
                                </div>

                                {/* CATEGORÍA - CHIPS TÁCTILES RÁPIDOS */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                                        Categoría <span className="text-indigo-400">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {MOCK_CATEGORIES.map((cat) => {
                                            const isSelected = categoryId === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategoryId(cat.id)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                                                        isSelected
                                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                            : "bg-[#161328] text-slate-300 border border-white/5 hover:border-white/20"
                                                    }`}
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PROVEEDOR */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Proveedor
                                    </label>
                                    <select
                                        value={providerId || ""}
                                        onChange={(e) => setProviderId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                    >
                                        <option value="">Sin proveedor asignado</option>
                                        {MOCK_PROVIDERS.map((prov) => (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* DESCRIPCIÓN */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Descripción o Especificaciones
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Breve reseña del producto..."
                                        className="w-full bg-[#151226] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 2. TAB: PRECIOS Y MARGEN */}
                        {activeTab === "pricing" && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* CARD RESUMEN FINANCIERO */}
                                <div className="bg-linear-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase text-indigo-300">
                                            Ganancia Neta Estimada
                                        </span>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                            +{profitMargin}%
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                                        ${profit.toLocaleString("es-AR")}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Calculado sobre Costo (${costPrice.toLocaleString("es-AR")}) vs Venta (${price.toLocaleString("es-AR")})
                                    </p>
                                </div>

                                {/* PRECIO DE COSTO */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Precio de Costo ($)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={costPrice || ""}
                                            onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full bg-[#151226] border border-white/10 rounded-xl pl-8 pr-3.5 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* CHIPS RÁPIDOS DE MARGEN % */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Margen de Ganancia Deseado
                                        </label>
                                        <span className="text-xs font-bold text-indigo-400 font-mono">
                                            {marginPercent}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {[15, 30, 50, 100].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => handleMarginChipClick(m)}
                                                className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                                                    marginPercent === m.toString()
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                        : "bg-[#161328] text-indigo-300 border border-white/5 hover:border-white/20"
                                                }`}
                                            >
                                                +{m}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* PRECIO FINAL DE VENTA */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Precio Final de Venta ($) <span className="text-indigo-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={price || ""}
                                            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full bg-[#151226] border border-emerald-500/40 rounded-xl pl-8 pr-3.5 py-3.5 text-base font-bold font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-start gap-2.5">
                                    <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                        Podés ajustar tanto el margen como el precio final; el sistema recalculará automáticamente la otra variable de forma bidireccional.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 3. TAB: STOCK E INVENTARIO */}
                        {activeTab === "stock" && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* STOCK ACTUAL CON STEPPER TÁCTIL GIGANTE */}
                                <div className="bg-[#141124] border border-white/10 rounded-2xl p-4">
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                                        Stock en Depósito / Mostrador
                                    </span>

                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setStock((prev) => Math.max(0, prev - 10))}
                                            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition"
                                        >
                                            -10
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStock((prev) => Math.max(0, prev - 1))}
                                            className="w-11 h-11 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-90 transition"
                                        >
                                            <Minus size={18} />
                                        </button>

                                        <div className="flex-1 text-center">
                                            <input
                                                type="number"
                                                value={stock}
                                                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full text-center bg-transparent text-2xl font-black font-mono text-white outline-none"
                                            />
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">unidades</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setStock((prev) => prev + 1)}
                                            className="w-11 h-11 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-90 transition"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStock((prev) => prev + 10)}
                                            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition"
                                        >
                                            +10
                                        </button>
                                    </div>
                                </div>

                                {/* STOCK MÍNIMO DE ALERTA */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                        Stock Mínimo de Alerta
                                    </label>
                                    <input
                                        type="number"
                                        value={minStock}
                                        onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full bg-[#151226] border border-white/10 rounded-xl px-3.5 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <div className="mt-1 flex items-center gap-1.5">
                                        {stock <= minStock ? (
                                            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                Alerta: El stock actual está cerca o por debajo del mínimo
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                                <CheckCircle2 size={12} />
                                                Stock en niveles óptimos
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* SWITCHES TÁCTILES: CATÁLOGO Y OFERTA */}
                                <div className="space-y-3 pt-2">
                                    <div
                                        onClick={() => setShowingInCatalog(!showingInCatalog)}
                                        className="p-3.5 bg-[#141124] border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer select-none active:scale-[0.99] transition"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <ShoppingBag size={14} className="text-indigo-400" />
                                                Publicar en Catálogo Web
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                Visible para compras directas de clientes
                                            </div>
                                        </div>
                                        <div
                                            className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                                                showingInCatalog ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
                                            }`}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setIsOffer(!isOffer)}
                                        className="p-3.5 bg-[#141124] border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer select-none active:scale-[0.99] transition"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <Sparkles size={14} className="text-amber-400" />
                                                Destacar como Oferta
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                Muestra badge especial en la tienda online
                                            </div>
                                        </div>
                                        <div
                                            className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                                                isOffer ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"
                                            }`}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. TAB: VISTA PREVIA DEL PRODUCTO EN MOBILE */}
                        {activeTab === "preview" && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="text-center pb-1">
                                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                        Vista Previa en Tienda Mobile
                                    </span>
                                    <p className="text-[10px] text-slate-400">
                                        Así es como tus clientes verán este producto en su smartphone
                                    </p>
                                </div>

                                <div className="bg-[#151226] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                    <div className="relative aspect-square w-full bg-black/50 overflow-hidden flex items-center justify-center">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={48} className="text-slate-600" />
                                        )}
                                        {isOffer && (
                                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                                                ¡OFERTA!
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-white/10">
                                            {MOCK_CATEGORIES.find((c) => c.id === categoryId)?.name}
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        <h3 className="text-base font-bold text-white leading-snug">
                                            {name || "Nombre del Producto"}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {description || "Sin descripción proporcionada aún."}
                                        </p>

                                        <div className="pt-2 flex items-baseline justify-between border-t border-white/5">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Precio Contado</span>
                                                <span className="text-xl font-black text-emerald-400 font-mono">
                                                    ${price.toLocaleString("es-AR")}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 block">Disponibilidad</span>
                                                <span
                                                    className={`text-xs font-bold ${
                                                        stock > 0 ? "text-indigo-400" : "text-red-400"
                                                    }`}
                                                >
                                                    {stock > 0 ? `${stock} en stock` : "Sin stock"}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="w-full mt-3 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 pointer-events-none opacity-90 shadow-md shadow-indigo-600/30"
                                        >
                                            <ShoppingBag size={14} />
                                            Agregar al Carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BARRA INFERIOR FLOTANTE / STICKY THUMB-ZONE ACTION BAR */}
                    <div className="p-3 bg-[#0e0b1c]/95 border-t border-white/10 backdrop-blur flex items-center gap-2 shrink-0 z-30">
                        <button
                            type="button"
                            onClick={() => {
                                if (mode === "create") {
                                    resetFormForCreate();
                                    toast("Formulario reiniciado");
                                } else {
                                    const curr = productList.find((p) => p.id === selectedProductId);
                                    if (curr) loadProductToEdit(curr);
                                    toast("Cambios descartados");
                                }
                            }}
                            className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold active:scale-95 transition"
                            title="Descartar / Limpiar"
                        >
                            <RefreshCw size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={!isValid || isSaving}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
                                !isValid || isSaving
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                    : mode === "create"
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                            }`}
                        >
                            {isSaving ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : mode === "create" ? (
                                <>
                                    <PackagePlus size={16} />
                                    <span>Crear Producto</span>
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* MODALES INTERACTIVOS FLOTANTES */}
                    {renderScannerModal()}
                    {renderPhotoPickerModal()}
                    {renderProductDrawer()}

                    {/* MODAL DE CONFIRMACIÓN DE GUARDADO */}
                    {showConfirmModal && (
                        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                            <div className="bg-[#151226] border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3">
                                <div
                                    className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                                        mode === "create"
                                            ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30"
                                            : "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30"
                                    }`}
                                >
                                    {mode === "create" ? <PackagePlus size={24} /> : <Check size={24} />}
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    {mode === "create" ? "¿Confirmar nuevo producto?" : "¿Guardar modificaciones?"}
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Se guardará <b>"{name}"</b> con un precio de venta de{" "}
                                    <span className="text-emerald-400 font-mono font-bold">
                                        ${price.toLocaleString("es-AR")}
                                    </span>{" "}
                                    y stock de {stock} unidades.
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
