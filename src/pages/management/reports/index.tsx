import DashboardLayout from "@/layouts/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DownloadIcon, FilterIcon, CalendarIcon, LightbulbIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

// Mock Data
const barData = [
  { mes: 'Ene', online: 4000, offline: 2400 },
  { mes: 'Feb', online: 3000, offline: 1398 },
  { mes: 'Mar', online: 2000, offline: 9800 },
  { mes: 'Abr', online: 2780, offline: 3908 },
  { mes: 'May', online: 1890, offline: 4800 },
  { mes: 'Jun', online: 2390, offline: 3800 },
];

const pieData = [
  { name: 'Ropa', value: 400 },
  { name: 'Accesorios', value: 300 },
  { name: 'Zapatos', value: 300 },
  { name: 'Otros', value: 200 },
];

// Colores más vibrantes para persuasión visual
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function ReportsPage() {
    return (
        <DashboardLayout
            title="Analítica e Insights"
            subtitle="Interpretación de datos y sugerencias comerciales inteligentes."
            actions={
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-brand-500 rounded-lg shadow-lg hover:bg-brand-400 transition-colors">
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar PDF</span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                
                {/* AI / Actionable Insights (Sesgo de Acompañamiento) */}
                <div className="bg-gradient-to-r from-brand-900/40 to-purple-900/40 border border-brand-500/20 rounded-2xl p-5 shadow-lg flex items-start gap-4">
                    <div className="p-3 bg-brand-500/20 rounded-full shrink-0 border border-brand-500/30">
                        <LightbulbIcon className="w-6 h-6 text-brand-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-1">Oportunidad Estratégica Detectada</h3>
                        <p className="text-gray-300 text-xs leading-relaxed mb-3">
                            Tus ventas de <strong>Accesorios</strong> han subido un 20% este mes respecto al anterior, mientras que <em>Ropa</em> se ha estancado. Aprovecha este pico de interés: considera crear un <strong>Combo Promocional</strong> (Ropa + Accesorio).
                        </p>
                        <div className="flex gap-3">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                <TrendingUpIcon className="w-3 h-3" />
                                Accesorios (+20%)
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                                <TrendingDownIcon className="w-3 h-3" />
                                Ropa (-2%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Mockup */}
                <div className="bg-gray-800/40 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <FilterIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-300">Filtros de Perspectiva:</span>
                        <div className="flex bg-gray-900/50 rounded-lg p-1 border border-white/10">
                            <button className="px-3 py-1 text-xs font-medium bg-brand-500/20 text-brand-300 rounded-md shadow-sm border border-brand-500/30 cursor-pointer">Últimos 6 meses</button>
                            <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">Este año</button>
                            <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">YTD</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors">
                        <CalendarIcon className="w-4 h-4 text-brand-400" />
                        <span className="text-xs text-gray-300">01 Ene 2024 - 30 Jun 2024</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales by Channel - Bar Chart */}
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-6">Tráfico de Ventas (Online vs Offline)</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="mes" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                    <RechartsTooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="online" name="Comercio Electrónico" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="offline" name="Tienda Física" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Categories - Pie Chart */}
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-6">Comportamiento Segmentado</h3>
                        <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="rgba(31,41,55,1)"
                                        strokeWidth={2}
                                    >
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-xs font-medium text-gray-300">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

