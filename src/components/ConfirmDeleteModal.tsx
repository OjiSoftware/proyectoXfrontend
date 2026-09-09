import { useEffect } from "react";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    itemName: string;
    onCancel: () => void;
    onConfirm: () => void;
    isLoading?: boolean; // nuevo prop opcional
}

export function ConfirmDeleteModal({
    isOpen,
    itemName,
    onCancel,
    onConfirm,
    isLoading = false,
}: ConfirmDeleteModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onCancel();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={onCancel}
        >
            <div
                className="bg-[#0C0A15]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center transform transition-all duration-300 scale-95 animate-fade-in ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 mb-4 border border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                    <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                    Confirmar eliminación
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    ¿Estás absolutamente seguro de que querés eliminar <b>{itemName}</b>? Esta acción no se puede deshacer.
                </p>
                <div className="mt-6 flex flex-col md:flex-row justify-center gap-3 w-full">
                    <button
                        className="flex-1 w-full px-5 py-2.5 bg-transparent border border-white/10 text-slate-300 rounded-2xl hover:bg-white/5 hover:text-white transition-all cursor-pointer font-bold text-sm active:scale-95"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        className="flex-1 w-full px-5 py-2.5 bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30 rounded-2xl hover:bg-rose-500/30 hover:border-rose-400/50 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all shadow-[0_0_20px_rgba(225,29,72,0.15)] text-sm"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
