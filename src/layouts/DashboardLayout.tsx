import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
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
    ChartBarIcon,
    ShoppingBagIcon,
    TagIcon,
    BriefcaseIcon,
    DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/OJI_logo/OJI_logo_soft_color_v3.svg";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

const navigation = [
    { name: "Dashboard", href: "/management/dashboard", icon: ChartBarIcon },
    { name: "Ventas", href: "/management/sales", icon: ShoppingBagIcon },
    { name: "Productos", href: "/management/products", icon: TagIcon },
    { name: "Marcas", href: "/management/brands", icon: BriefcaseIcon },
    { name: "Categorías", href: "/management/categories", icon: DocumentChartBarIcon },
    { name: "Subcategorías", href: "/management/subcategories", icon: DocumentChartBarIcon },
    { name: "Reportes", href: "/management/reports", icon: DocumentChartBarIcon },
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
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        document.body.classList.add("bg-[#00001A]", "overflow-hidden");
        return () => {
            document.body.classList.remove("bg-[#00001A]", "overflow-hidden");
        };
    }, []);

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
        <div className="flex h-screen w-full bg-[#00001A] overflow-hidden font-poppins">

            {/* --------------------------- */}
            {/* SIDEBAR ESCRITORIO          */}
            {/* --------------------------- */}
            <aside className="hidden md:flex md:w-64 md:flex-col bg-[#0A0812] backdrop-blur-xl border-r border-white/5 shadow-2xl relative z-20">
                {/* Header Layout Lateral (Logo) */}
                <div className="flex shrink-0 items-center justify-center px-4 h-25">
                    <img alt="OJI" src={logo} className="h-18 w-auto" />
                </div>

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
                                    <Link to="/management/sales/create" className="block px-4 py-3 text-xs font-medium text-emerald-400 hover:bg-white/5 transition-colors text-center w-full focus:outline-none">
                                        Nueva Venta
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/products/create" className="block px-4 py-3 text-xs font-medium text-indigo-400 hover:bg-white/5 transition-colors text-center border-y border-white/5 w-full focus:outline-none">
                                        Nuevo Producto
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/brands/create" className="block px-4 py-3 text-xs font-medium text-amber-400 hover:bg-white/5 transition-colors text-center border-b border-white/5 w-full focus:outline-none">
                                        Nueva Marca
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/categories/create" className="block px-4 py-3 text-xs font-medium text-purple-400 hover:bg-white/5 transition-colors text-center border-b border-white/5 w-full focus:outline-none">
                                        Nueva Categoría
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link to="/management/subcategories/create" className="block px-4 py-3 text-xs font-medium text-pink-400 hover:bg-white/5 transition-colors text-center w-full focus:outline-none">
                                        Nueva Subcategoría
                                    </Link>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>

                    {/* Navegación Base Expandida */}
                    <div className="px-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">Menú Principal</p>
                        <nav className="flex flex-col space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            isActive
                                                ? "bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent",
                                            "group flex items-center px-4 py-3 text-xs font-medium rounded-2xl transition-all"
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300",
                                                "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
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
                            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || "Admin"}</p>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 truncate mt-0.5">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg focus:outline-none active:scale-95"
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
            <div className="md:hidden absolute inset-x-0 top-0 z-50">
                <Disclosure as="nav" className="bg-[#0A0812]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                    <div className="mx-auto px-4 sm:px-6">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="shrink-0">
                                    <img alt="OJI" src={logo} className="h-8 w-auto" />
                                </div>
                            </div>
                            <div className="-mr-2 flex items-center">
                                <DisclosureButton className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none active:scale-95 transition-all">
                                    <span className="sr-only">Menu</span>
                                    <Bars3Icon className="block h-7 w-7 group-data-[open]:hidden" aria-hidden="true" />
                                    <XMarkIcon className="hidden h-7 w-7 group-data-[open]:block" aria-hidden="true" />
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="border-t border-white/10 bg-[#00001A] shadow-2xl">
                        <div className="space-y-1 px-3 py-3">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <DisclosureButton
                                        key={item.name}
                                        as={Link}
                                        to={item.href}
                                        className={classNames(
                                            isActive
                                                ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                                                : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent",
                                            "flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-medium transition-all"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 opacity-70" />
                                        {item.name}
                                    </DisclosureButton>
                                )
                            })}
                        </div>
                        <div className="border-t border-white/10 pb-4 pt-4 bg-gray-800/30">
                            <div className="flex items-center justify-between px-5">
                                <div className="flex items-center min-w-0 flex-1">
                                    <img className="h-10 w-10 rounded-full border border-white/10 shrink-0" src={userImage} alt="" />
                                    <div className="ml-3 min-w-0 flex-1">
                                        <div className="text-xs font-medium text-white truncate">{user?.name || "Admin"}</div>
                                        <div className="text-[11px] uppercase tracking-wider text-gray-500 truncate mt-0.5">{user?.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="ml-auto shrink-0 rounded-full p-2.5 text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                                >
                                    <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
            </div>

            {/* --------------------------- */}
            {/* AREA PRINCIPAL 100% WIDTH   */}
            {/* --------------------------- */}
            <div className="flex flex-1 flex-col overflow-hidden pt-16 md:pt-0 bg-gradient-to-tl from-[#0A0812] to-[#07050C] md:bg-[#07050C]">
                {title && (
                    <header className=" shrink-0 bg-[#0A0812] backdrop-blur-md border-b border-white/5 relative z-50 shadow-sm overflow-visible">
                        <div className="w-full px-4 py-5 sm:px-6 lg:px-8 flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold tracking-tight text-white truncate">{title}</h1>
                                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                            </div>

                            {/* WIDGETS + ACCIONES agrupados a la derecha */}
                            <div className="flex items-center gap-3 shrink-0 overflow-visible">
                                {headerWidgets && headerWidgets}
                                {actions && actions}
                            </div>
                        </div>
                    </header>
                )}

                {/* CONTENIDO (Scroll interno, ancho completo w-full sin límites) */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-0">
                    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 pb-20">
                        {/* W-FULL reemplazando al max-w de tailwind, para que todo toque los bordes del flex */}
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}

