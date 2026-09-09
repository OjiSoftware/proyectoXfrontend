import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { PackagePlus } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import { useCreateSubCategory } from "@/hooks/useSubCategoryForm";
import { useNavigate } from "react-router-dom";

export default function CreateSubCategoryPage() {
    const {
        formData,
        categories,
        isLoading,
        handleChange,
        handleSubmit,
    } = useCreateSubCategory();

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleConfirm = async () => {
        setShowConfirmModal(false);
        await handleSubmit();
    };

    const isFormInvalid = !formData.name.trim() || formData.categoryId === 0 || isLoading;

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <button
                            onClick={() => navigate("/management/subcategories")}
                            className="text-xs px-2 py-1 -ml-2 text-pink-400 hover:text-subCategory-300 mb-3 flex items-center gap-1 cursor-pointer"
                        >
                            ? Volver
                        </button>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <PackagePlus
                                className="text-pink-400"
                                size={24}
                            />
                            Nueva subcategoría
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs hidden md:block">
                        Complete la informaci�n para crear una nueva subcategoría.
                    </p>
                </div>

                {/* Card de preview sin imagen */}
                <div className="flex items-center gap-4 mb-4 bg-slate-800/30 p-3 rounded-xl border border-white/10 shadow-lg">
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">
                            {formData.name || "Nueva subcategoría"}
                        </h2>
                        <p className="text-pink-400 text-xs font-medium">
                            ID: Nuevo
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.name.trim())
                            return toast.error("El nombre es obligatorio");
                        setShowConfirmModal(true);
                    }}
                    className="bg-slate-800/80 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-1 gap-6"
                >
                    <div className="space-y-4">
                        <h3 className="text-pink-400 text-xs font-semibold border-b border-white/10 pb-1.5 uppercase">
                            Informaci�n b�sica
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Nombre de la subcategoría{" "}
                                <span className="font-bold">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Smartphones"
                                autoComplete="off"
                                className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-pink-400 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Categoría Padre <span className="font-bold">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-slate-700/90 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                                required
                            >
                                <option value={0}>Seleccione una categoría</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col items-end w-full">
                        <div className="flex flex-row items-stretch gap-3 mt-2 w-full border-t border-white/10 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/management/subcategories")}
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
                                Crear subcategoría
                            </button>
                        </div>

                        <div className="relative h-6 w-full">
                            {" "}
                            {isFormInvalid && !isLoading && (
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
                    title="Crear subcategoría"
                    variant="success"
                    message={
                        <>
                            �Seguro que quer�s crear la subcategoría{" "}
                            <b>{formData.name}</b>?
                        </>
                    }
                    isLoading={isLoading}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirm}
                    confirmText="Crear"
                    cancelText="Cancelar"
                />
            </div>
        </DashboardLayout>
    );
}

