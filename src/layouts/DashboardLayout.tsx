import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import {
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    PlusIcon,
    TagIcon,
    DocumentChartBarIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/OJI_logo/OJI_logo_soft_color_v3.svg";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { BlocksIcon, DollarSign, Truck, MoreHorizontal, Sun, Moon } from "lucide-react";

const navigation = [
    /*     { name: "Dashboard", href: "/management/dashboard", icon: ChartBarIcon }, */
    { name: "Ventas", href: "/management/sales", icon: DollarSign },
    { name: "Productos", href: "/management/products", icon: TagIcon },
    /*     { name: "Marcas", href: "/management/brands", icon: BriefcaseIcon }, */
    { name: "Categorías", href: "/management/categories", icon: BlocksIcon },
    { name: "Proveedores", href: "/management/providers", icon: Truck },
    /*     { name: "Subcategorías", href: "/management/subcategories", icon: DocumentChartBarIcon }, */
    { name: "Analíticas", href: "/management/analytics", icon: DocumentChartBarIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({
    children,
    title,
    subtitle,
    actions,
    headerWidgets,
}: {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    headerWidgets?: React.ReactNode;
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { managementTheme, toggleManagementTheme, setActiveScope } = useTheme();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileQuickCreateOpen, setMobileQuickCreateOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    useEffect(() => {
        setActiveScope("management");
        document.body.classList.add("overflow-hidden");
        return () => {
            setActiveScope("public");
            document.body.classList.remove("overflow-hidden");
        };
    }, [setActiveScope]);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoggingOut(true);
        try {
            await Promise.all([
                logout(),
                new Promise((resolve) => setTimeout(resolve, 400)),
            ]);
            navigate("/auth/login", { replace: true });
        } catch (error) {
            navigate("/auth/login", { replace: true });
        }
    };

    const userImage =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(user?.name || "Admin") +
        "&background=6366f1&color=fff";

    return (
        <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-poppins transition-colors duration-200">

            {/* --------------------------- */}
            {/* SIDEBAR ESCRITORIO          */}
            {/* --------------------------- */}
            <aside className="hidden md:flex md:w-64 md:flex-col bg-[var(--bg-sidebar)] backdrop-blur-xl border-r border-[var(--border-subtle)] shadow-2xl relative z-20 transition-colors duration-200">
                {/* Header Layout Lateral (Logo) */}
                <Link
                    to="/management"
                    title="Ir a la web pública"
                    className="flex shrink-0 items-center justify-center px-4 h-25 hover:opacity-80 transition-opacity"
                >
                    <img
                        alt="OJI"
                        src={logo}
                        className={`h-18 w-auto transition-all ${managementTheme === "light" ? "brightness-0" : ""}`}
                    />
                </Link>

                {/* Zona central scrolleable con Menu */}
                <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-6">
                    {/* Botón Global '+'  */}
                    <div className="p-4">
                        <Menu as="div" className="relative w-full">
                            <MenuButton className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500/10 text-indigo-400 font-bold hover:bg-indigo-500/20 transition-all cursor-pointer border border-indigo-500/20 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] focus:outline-none active:scale-[0.98]">
                                <PlusIcon className="w-5 h-5 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" strokeWidth={2.5} />
                                <span>Crear Nuevo</span>
                            </MenuButton>
                            <MenuItems transition className="absolute left-0 mt-3 w-full rounded-2xl bg-[#151320]/95 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 focus:outline-none overflow-hidden z-50">
                                <MenuItem>
                                    <Link to="/management/sales/create" className="block px-4 py-3 text-xs font-medium text-white hover:bg-white/5 transition-colors text-center w-full focus:outline-none">
                                        Nueva venta
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/products/create" className="block px-4 py-3 text-xs font-medium text-white hover:bg-white/5 transition-colors text-center border-y border-white/5 w-full focus:outline-none">
                                        Nuevo producto
                                    </Link>
                                </MenuItem>
                                {/*                                 <MenuItem>
                                    <Link to="/management/brands/create" className="block px-4 py-3 text-xs font-medium text-white hover:bg-white/5 transition-colors text-center border-b border-white/5 w-full focus:outline-none">
                                        Nueva marca
                                    </Link>
                                </MenuItem> */}
                                <MenuItem>
                                    <Link to="/management/categories/create" className="block px-4 py-3 text-xs font-medium text-white hover:bg-white/5 transition-colors text-center border-b border-white/5 w-full focus:outline-none">
                                        Nueva categoría
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/providers/create" className="block px-4 py-3 text-xs font-medium text-white hover:bg-white/5 transition-colors text-center w-full focus:outline-none">
                                        Nuevo proveedor
                                    </Link>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>

                    {/* Navegación Base Expandida */}
                    <div className="px-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">Menú Principal</p>
                        <nav className="flex flex-col space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            isActive
                                                ? "bg-indigo-500/15 text-indigo-300 font-semibold shadow-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                                                : "text-slate-200 hover:bg-white/5 hover:text-white border border-transparent font-medium",
                                            "group flex items-center px-4 py-2.5 text-sm rounded-2xl transition-all"
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200",
                                                "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-4 mt-4 border-t border-white/5">
                            <Link
                                to="/"
                                className="group flex items-center px-4 py-2.5 text-sm font-medium rounded-2xl text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 hover:border-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                            >
                                <GlobeAltIcon className="mr-3 h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                                <span>Ver tienda pública</span>
                            </Link>
                        </div>

                        {/* Selector de tema Management (Dark / Light) */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={toggleManagementTheme}
                                className="btn btn-sm btn-subtle w-full justify-between px-4"
                                title={managementTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
                            >
                                <span className="flex items-center gap-2">
                                    {managementTheme === "dark" ? (
                                        <Moon className="h-4 w-4 text-indigo-400" />
                                    ) : (
                                        <Sun className="h-4 w-4 text-amber-500" />
                                    )}
                                    <span>{managementTheme === "dark" ? "Tema Oscuro" : "Tema Claro"}</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-wider opacity-70">
                                    {managementTheme === "dark" ? "Dark" : "Light"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Perfil Fijo Abajo */}
                <div className="shrink-0 p-4 border-t border-white/5 bg-transparent">
                    <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors p-2 rounded-2xl cursor-pointer border border-white/5">
                        <img
                            alt="avatar"
                            src={userImage}
                            className="inline-block h-10 w-10 rounded-full border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name || "Admin"}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg focus:outline-none active:scale-95 cursor-pointer"
                            title="Cerrar sesión"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>


            {/* --------------------------- */}
            {/* NAVBAR MÓVIL (Small screen) */}
            {/* --------------------------- */}
            <div className="md:hidden shrink-0 fixed top-0 inset-x-0 z-40 bg-[#0A0812]/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
                <div className="mx-auto px-4">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center gap-2.5 shrink-0 select-none">
                            <img alt="OJI" src={logo} className="h-7 w-auto shrink-0" />
                            <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
                                Gestión
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={toggleManagementTheme}
                                className="btn btn-icon btn-ghost"
                                title={managementTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
                            >
                                {managementTheme === "dark" ? (
                                    <Moon className="h-4 w-4 text-indigo-400" />
                                ) : (
                                    <Sun className="h-4 w-4 text-amber-500" />
                                )}
                            </button>
                            <button
                                onClick={() => setMobileDrawerOpen(true)}
                                className="shrink-0 inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none active:scale-95 transition-all"
                            >
                                <span className="sr-only">Menú</span>
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --------------------------- */}
            {/* AREA PRINCIPAL 100% WIDTH   */}
            {/* --------------------------- */}
            <div className="flex flex-1 flex-col overflow-hidden pt-14 md:pt-0 bg-[var(--bg-app)] transition-colors duration-200">
                {title && (
                    <>
                        {/* HEADER MOBILE (< md): Ultracompacto, sin widgets de stock ni botón crear */}
                        <header className="md:hidden shrink-0 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-subtle)] relative z-30 shadow-sm px-3.5 py-2">
                            <h1 className="text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">{title}</h1>
                            {subtitle && <p className="text-[11px] text-[var(--text-muted)] truncate">{subtitle}</p>}
                        </header>

                        {/* HEADER DESKTOP (md+): Sin tocar, mantiene widgets de alertas y botón crear */}
                        <header className="hidden md:block shrink-0 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-subtle)] relative z-30 shadow-sm overflow-visible">
                            <div className="w-full px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] truncate">{title}</h1>
                                    {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1 truncate">{subtitle}</p>}
                                </div>

                                {/* WIDGETS + ACCIONES agrupados a la derecha */}
                                <div className="flex items-center gap-3 shrink-0 overflow-visible">
                                    {headerWidgets && headerWidgets}
                                    {actions && actions}
                                </div>
                            </div>
                        </header>
                    </>
                )}

                {/* CONTENIDO (Scroll interno, ancho completo w-full sin límites) */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.08),rgba(7,5,12,0))]">
                    <div className="w-full px-3.5 py-3 md:px-4 md:py-8 sm:px-6 lg:px-8 pb-28 md:pb-20">
                        {/* W-FULL reemplazando al max-w de tailwind, para que todo toque los bordes del flex */}
                        {children}
                    </div>
                </main>
            </div>

            {/* --------------------------- */}
            {/* BOTTOM NAVIGATION BAR MÓVIL */}
            {/* --------------------------- */}
            <nav className="md:hidden shrink-0 fixed bottom-0 inset-x-0 bg-[#0A0812]/95 backdrop-blur-xl border-t border-white/10 z-40 grid grid-cols-5 items-center shadow-[0_-10px_30px_rgba(0,0,0,0.6)] py-1">
                <Link
                    to="/management/sales"
                    className={classNames(
                        location.pathname.startsWith("/management/sales")
                            ? "text-indigo-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200 font-medium",
                        "flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-colors w-full"
                    )}
                >
                    <DollarSign className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] truncate">Ventas</span>
                </Link>

                <Link
                    to="/management/products"
                    className={classNames(
                        location.pathname.startsWith("/management/products")
                            ? "text-indigo-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200 font-medium",
                        "flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-colors w-full"
                    )}
                >
                    <TagIcon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] truncate">Productos</span>
                </Link>

                {/* Botón Central Flotante (+) */}
                <div className="-mt-5 flex items-center justify-center w-full">
                    <button
                        onClick={() => setMobileQuickCreateOpen(true)}
                        className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(79,70,229,0.5)] border-2 border-[#07050C] active:scale-90 transition-all shrink-0"
                        title="Crear Nuevo"
                    >
                        <PlusIcon className="w-6 h-6 stroke-[2.5] shrink-0" />
                    </button>
                </div>

                <Link
                    to="/management/categories"
                    className={classNames(
                        location.pathname.startsWith("/management/categories")
                            ? "text-indigo-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200 font-medium",
                        "flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-colors w-full"
                    )}
                >
                    <BlocksIcon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] truncate">Categorías</span>
                </Link>

                <button
                    onClick={() => setMobileDrawerOpen(true)}
                    className={classNames(
                        mobileDrawerOpen || location.pathname.startsWith("/management/providers") || location.pathname.startsWith("/management/analytics") || location.pathname.startsWith("/management/reports")
                            ? "text-indigo-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200 font-medium",
                        "flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-colors w-full"
                    )}
                >
                    <MoreHorizontal className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] truncate">Más</span>
                </button>
            </nav>

            {/* --------------------------- */}
            {/* BOTTOM SHEET: CREAR NUEVO   */}
            {/* --------------------------- */}
            {mobileQuickCreateOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
                    onClick={() => setMobileQuickCreateOpen(false)}
                >
                    <div
                        className="bg-[#12101F] border-t border-white/10 rounded-t-[28px] p-5 space-y-3 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />
                        <div className="flex items-center justify-between pb-1">
                            <h3 className="text-sm font-bold text-white">¿Qué deseas crear?</h3>
                            <button
                                onClick={() => setMobileQuickCreateOpen(false)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Link
                                to="/management/sales/create"
                                onClick={() => setMobileQuickCreateOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-left transition"
                            >
                                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">Nueva venta</p>
                                    <p className="text-[11px] text-slate-400">Registrar cobro y operación</p>
                                </div>
                            </Link>
                            <Link
                                to="/management/products/create"
                                onClick={() => setMobileQuickCreateOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-left transition"
                            >
                                <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                                    <TagIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">Nuevo producto</p>
                                    <p className="text-[11px] text-slate-400">Cargar artículo al catálogo y stock</p>
                                </div>
                            </Link>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    to="/management/categories/create"
                                    onClick={() => setMobileQuickCreateOpen(false)}
                                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-left transition"
                                >
                                    <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
                                        <BlocksIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-white">Categoría</span>
                                </Link>
                                <Link
                                    to="/management/providers/create"
                                    onClick={() => setMobileQuickCreateOpen(false)}
                                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-left transition"
                                >
                                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-white">Proveedor</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --------------------------- */}
            {/* DRAWER LATERAL MÓVIL ("MÁS")*/}
            {/* --------------------------- */}
            {mobileDrawerOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
                    onClick={() => setMobileDrawerOpen(false)}
                >
                    <div
                        className="w-4/5 max-w-xs h-full bg-[#0A0812] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <img alt="OJI" src={logo} className="h-6 w-auto" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menú General</span>
                                </div>
                                <button
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setMobileDrawerOpen(false)}
                                            className={classNames(
                                                isActive
                                                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                                                    : "text-slate-200 hover:bg-white/5 hover:text-white border border-transparent font-medium",
                                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-all"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4 opacity-80" />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                <div className="pt-3 mt-3 border-t border-white/10">
                                    <Link
                                        to="/"
                                        onClick={() => setMobileDrawerOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 transition-all"
                                    >
                                        <GlobeAltIcon className="h-4 w-4 text-emerald-400" />
                                        <span>Ver tienda pública</span>
                                    </Link>
                                </div>
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1 gap-2.5">
                                <img className="h-9 w-9 rounded-full border border-white/10 shrink-0" src={userImage} alt="" />
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-white truncate">{user?.name || "Admin"}</div>
                                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="ml-2 shrink-0 rounded-xl p-2 text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                                title="Cerrar sesión"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

