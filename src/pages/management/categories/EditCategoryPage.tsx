import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useCategoryEdit } from "@/hooks/useCategoryEdit";
import { SquarePen } from "lucide-react";

export default function EditCategoryPage() {
    const navigate = useNavigate();
    const { id, name, setName, loading, handleSubmit } = useCategoryEdit();

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (!id) return null;

    const isFormInvalid = !name.trim() || loading;

    return (
        <DashboardLayout>
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <button
                            onClick={() => navigate("/management/categories")}
                            className="text-xs px-2 py-1 -ml-2 text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1 cursor-pointer font-medium"
                        >
                            ← Volver
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <SquarePen className="text-indigo-400" size={24} />
                            Editar categoría
                        </h1>
                    </div>
                    <p className="text-slate-300 text-sm hidden md:block">
                        Modifique la información de la categoría.
                    </p>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 mb-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 shadow-inner">
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                            {name || "Categoría sin nombre"}
                        </h2>
                        <p className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mt-0.5">
                            ID: #{id}
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setShowConfirmModal(true);
                    }}
                    className="bg-[#0C0A15]/95 border border-white/10 p-5 md:p-6 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/5 grid grid-cols-1 gap-6"
                >
                    {/* Nombre */}
                    <div className="space-y-4">
                        <h3 className="text-indigo-400 text-xs font-semibold tracking-wider border-b border-white/5 pb-1 uppercase">
                            Información básica
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Nombre de la categoría{" "}
                                <span className="font-bold text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ingrese el nombre de la categoría"
                                className="w-full bg-[#151320] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-500 shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-end w-full">
                        <div className="flex flex-row items-stretch gap-3 mt-2 w-full border-t border-white/5 pt-5">
                            <button
                                type="button"
                                onClick={() => navigate("/management/categories")}
                                className="flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-white/5 hover:text-white active:scale-95"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isFormInvalid}
                                className={`flex-1 md:flex-none md:min-w-32 px-5 py-2.5 text-xs font-semibold border rounded-xl transition-all duration-300 active:scale-95 active:translate-y-0
                                      ${
                                          isFormInvalid
                                              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 border-white/5 pointer-events-none"
                                              : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                      }`}
                            >
                                Guardar cambios
                            </button>
                        </div>

                        <div className="relative h-6 w-full">
                            {isFormInvalid && !loading && (
                                <p className="absolute top-3 right-0 text-amber-400/80 text-xs text-right font-medium">
                                    * Complete todos los campos requeridos para guardar
                                </p>
                            )}
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
                            <b>{name}</b>?
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
