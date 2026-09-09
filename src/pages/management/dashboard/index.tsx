import DashboardLayout from "@/layouts/DashboardLayout";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Activity, AlertTriangle, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Lun", ventas: 4000, meta: 5000 },
    { name: "Mar", ventas: 3000, meta: 5000 },
    { name: "Mié", ventas: 6000, meta: 5000 },
    { name: "Jue", ventas: 2780, meta: 5000 },
    { name: "Vie", ventas: 5890, meta: 5000 },
    { name: "Sáb", ventas: 6390, meta: 5000 },
    { name: "Dom", ventas: 3490, meta: 5000 },
];

export default function DashboardPage() {
    return (
        <DashboardLayout
            title="Dashboard Overview"
            subtitle="M�tricas clave y estado actual de tu negocio."
        >
            <div className="space-y-6">
                {/* Meta del mes (GAMIFICACI�N) */}
                <div className="bg-gradient-to-r from-brand-900/40 to-emerald-900/30 border border-emerald-500/20 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-2">�Est�s muy cerca de la meta mensual! ??</h2>
                        <p className="text-emerald-200/80 text-xs mb-4">Te faltan solo $4,768 para superar tu mejor mes hist�rico.</p>
                        <div className="w-full bg-gray-900/50 rounded-full h-3 mb-1 border border-white/5 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-brand-500 h-3 rounded-full relative" style={{ width: '85%' }}>
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-400/60 font-medium">
                            <span>0</span>
                            <span>85%</span>
                            <span>$50,000</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Ventas Totales (Mes)"
                        value="$45,231.89"
                        icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                        trend="+20.1% vs mes anterior"
                        positive={true}
                    />
                    <StatCard
                        title="Nuevos Clientes"
                        value="+2350"
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                        trend="+180% vs mes anterior"
                        positive={true}
                    />
                    <StatCard
                        title="Pedidos Pendientes"
                        value="12"
                        icon={<ShoppingCart className="w-6 h-6 text-amber-400" />}
                        trend="-4% vs mes anterior"
                        positive={false}
                    />
                    <StatCard
                        title="Productos (Stock)"
                        value="432"
                        icon={<Package className="w-6 h-6 text-brand-400" />}
                        trend="+12 nuevos productos"
                        positive={true}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Intercative Chart Area */}
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-brand-400" />
                                    Ritmo de Ventas vs Meta
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Comparativa de los últimos 7 días</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    />
                                    {/* Linea de meta de referencia */}
                                    <Area type="monotone" dataKey="meta" stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                    <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Efecto Zeigarnik (Tareas sin terminar) e insights */}
                    <div className="flex flex-col gap-6">
                        {/* Atenci�n Requerida - Stock */}
                        <div className="bg-rose-900/20 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle className="w-16 h-16 text-rose-500" />
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Atención Requerida</h4>
                                    <p className="text-xs text-gray-300 mb-3">Tienes <strong>3 productos</strong> con stock crítico (menos de 5 unidades).</p>
                                    <button className="text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20">
                                        Gestionar Inventario
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actividad Reciente */}
                        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex-1">
                            <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                <Clock className="w-4 h-4 text-brand-400" />
                                Actividad Viva
                            </h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <div>
                                        <p className="text-xs text-gray-200">Venta procesada <span className="text-emerald-400 font-bold">+$120.00</span></p>
                                        <p className="text-xs text-gray-500">Hace 2 minutos</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-gray-200">Usuario "Admin" editó "Remera M"</p>
                                        <p className="text-xs text-gray-500">Hace 15 minutos</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-gray-200">Nueva Marca "Nike" registrada</p>
                                        <p className="text-xs text-gray-500">Hace 1 hora</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon, trend, positive }: { title: string, value: string, icon: React.ReactNode, trend: string, positive: boolean }) {
    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-lg group hover:bg-gray-800/80 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-900/50 rounded-xl group-hover:scale-105 transition-transform border border-white/5">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">{value}</h4>
                <p className={`text-xs font-medium flex items-center gap-1.5 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {positive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                        <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                    )}
                    {trend}
                </p>
            </div>
        </div>
    );
}

