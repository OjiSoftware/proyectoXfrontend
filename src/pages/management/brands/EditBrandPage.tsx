import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useBrandEdit } from "@/hooks/useBrandEdit";
import { SquarePen } from "lucide-react";

export default function EditBrandPage() {
    const navigate = useNavigate();
    const { id, name, setName, loading, handleSubmit } = useBrandEdit();

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (!id) return null;

    const isFormInvalid = !name.trim() || loading;

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <button
                            onClick={() => navigate("/management/brands")}
                            className="text-xs px-2 py-1 -ml-2 text-brand-400 hover:text-brand-300 mb-3 flex items-center gap-1 cursor-pointer"
                        >
                            ? Volver
                        </button>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <SquarePen className="text-brand-400" size={24} />
                            Editar marca
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs hidden md:block">
                        Modifique la información de la marca.
                    </p>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 mb-4 bg-slate-800/30 p-3 rounded-xl border border-white/10 shadow-lg">
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">
                            {name || "Marca sin nombre"}
                        </h2>
                        <p className="text-brand-400 text-xs font-medium">
                            ID: {id}
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setShowConfirmModal(true);
                    }}
                    className="bg-slate-800/80 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-1 gap-6"
                >
                    {/* Nombre */}
                    <div className="space-y-4">
                        <h3 className="text-brand-400 text-xs font-semibold border-b border-white/10 pb-1.5 uppercase">
                            Información básica
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Nombre de la marca{" "}
                                <span className="font-bold">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ingrese el nombre de la marca"
                                className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-brand-400 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-end w-full">
                        <div className="flex flex-row items-stretch gap-3 mt-2 w-full border-t border-white/10 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/management/brands")}
                                className="flex-1 md:flex-none md:min-w-35 px-4 py-3 text-xs font-bold rounded-lg border border-slate-600 text-slate-300 bg-transparent transition-all duration-300 cursor-pointer hover:bg-slate-500/20 hover:text-white hover:border-slate-400"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isFormInvalid}
                                className={`flex-1 md:flex-none md:min-w-35 px-4 py-3 text-xs font-bold rounded-lg transition-all duration-300
                                      ${
                                          isFormInvalid
                                              ? "bg-emerald-600 text-white cursor-not-allowed opacity-50"
                                              : "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                      }`}
                            >
                                Guardar cambios
                            </button>
                        </div>

                        <div className="relative h-6 w-full">
                            {" "}
                            {isFormInvalid && !loading && (
                                <p className="absolute top-4 right-0 text-slate-500 text-[10px] text-right uppercase tracking-wide font-medium">
                                    * Complete todos los campos requeridos para
                                    guardar
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

