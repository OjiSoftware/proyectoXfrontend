import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useProviderEdit } from "@/hooks/useProviderEdit";
import { SquarePen } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";

export default function EditProviderPage() {
    const navigate = useNavigate();
    const { id, formData, loading, isFetching, handleChange, handleSubmit } = useProviderEdit();

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (!id) return null;

    const isFormInvalid = (!formData.name.trim() && !formData.businessName.trim()) || loading;

    return (
        <DashboardLayout>
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <button
                            onClick={() => navigate(ROUTES.providers.list)}
                            className="text-xs px-2 py-1 -ml-2 text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1 cursor-pointer font-medium"
                        >
                            ← Volver
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <SquarePen className="text-indigo-400" size={24} />
                            Editar proveedor
                        </h1>
                    </div>
                    <p className="text-slate-300 text-sm hidden md:block">
                        Modifique la información del proveedor.
                    </p>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 mb-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 shadow-inner">
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                            {formData.businessName || formData.name || "Proveedor sin nombre"}
                        </h2>
                        {formData.name && formData.businessName && (
                            <p className="text-slate-300 text-xs mt-0.5">
                                Contacto / Fantasía: {formData.name}
                            </p>
                        )}
                        <p className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mt-0.5">
                            ID: #{id}
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.name.trim() && !formData.businessName.trim()) {
                            toast.error("Complete al menos el nombre o la razón social");
                            return;
                        }
                        setShowConfirmModal(true);
                    }}
                    className="bg-[#0C0A15]/95 border border-white/10 p-5 md:p-6 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-4"
                >
                    <div className="space-y-4">
                        <h3 className="text-indigo-400 text-xs font-semibold tracking-wider border-b border-white/5 pb-1 uppercase">
                            Identificación del proveedor
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Nombre comercial / Fantasía
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre comercial"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Razón social (Business Name)
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Ingrese la razón social"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-indigo-400 text-xs font-semibold tracking-wider border-b border-white/5 pb-1 uppercase">
                                Contacto y comunicación
                            </h3>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Teléfono (Phone Number)
                                </label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Ej: +54 9 11 4455-6677"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ej: contacto@empresa.com"
                                    className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-end w-full">
                            <div className="flex flex-row items-stretch gap-3 mt-4 w-full border-t border-white/5 pt-5">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.providers.list)}
                                    className="btn btn-md btn-ghost flex-1 md:flex-none md:min-w-32"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={isFormInvalid}
                                    className="btn btn-md btn-success flex-1 md:flex-none md:min-w-32"
                                >
                                    Guardar cambios
                                </button>
                            </div>

                            <div className="relative h-6 w-full">
                                {isFormInvalid && !loading && !isFetching && (
                                    <p className="absolute top-3 right-0 text-amber-400/80 text-xs text-right font-medium">
                                        * Complete al menos el nombre o la razón social
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                <ConfirmModal
                    isOpen={showConfirmModal}
                    title="Guardar cambios"
                    variant="success"
                    message={
                        <>
                            ¿Seguro que querés guardar los cambios de{" "}
                            <b>{formData.businessName || formData.name}</b>?
                        </>
                    }
                    isLoading={loading}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleSubmit}
                    confirmText="Guardar"
                    cancelText="Cancelar"
                />
            </div>
        </DashboardLayout>
    );
}
