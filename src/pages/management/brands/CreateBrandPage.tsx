import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { PackagePlus } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import { useCreateBrand } from "@/hooks/useBrandForm";
import { useNavigate } from "react-router-dom";

export default function CreateBrandPage() {
    const {
        formData,
        /* categories, */
        /* filteredSubCategories, */
        isLoading,
        handleChange,
        handleSubmit,
    } = useCreateBrand();

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleConfirm = async () => {
        setShowConfirmModal(false);
        await handleSubmit();
    };

    const isFormInvalid = !formData.name.trim() || isLoading;

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
                            <PackagePlus
                                className="text-brand-400"
                                size={24}
                            />
                            Nueva marca
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs hidden md:block">
                        Complete la informaci�n para crear una nueva marca.
                    </p>
                </div>

                {/* Card de preview sin imagen */}
                <div className="flex items-center gap-4 mb-4 bg-slate-800/30 p-3 rounded-xl border border-white/10 shadow-lg">
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">
                            {formData.name || "Nueva marca"}
                        </h2>
                        <p className="text-brand-400 text-xs font-medium">
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
                        <h3 className="text-brand-400 text-xs font-semibold border-b border-white/10 pb-1.5 uppercase">
                            Informaci�n b�sica
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Nombre de la marca{" "}
                                <span className="font-bold">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Samsung"
                                autoComplete="off"
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
                                className="btn btn-md btn-ghost flex-1 md:flex-none md:min-w-32"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isFormInvalid}
                                className="btn btn-md btn-success flex-1 md:flex-none md:min-w-32"
                            >
                                Crear marca
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
                    title="Crear marca"
                    variant="success"
                    message={
                        <>
                            �Seguro que quer�s crear la marca{" "}
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

