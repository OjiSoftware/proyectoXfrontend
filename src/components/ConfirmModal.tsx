import { useEffect, ReactNode } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: ReactNode; // <-- cambio aquí
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "success" | "primary";
}

export function ConfirmModal({
    isOpen,
    title = "Confirmar acción",
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isLoading = false,
    variant = "primary",
}: ConfirmModalProps) {
    const variantClasses = {
        primary: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30 hover:border-indigo-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(79,70,229,0.15)]",
        success: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
        danger: "bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-400/50 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(225,29,72,0.15)]",
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onCancel();
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
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    {message}
                </p>
                <div className="mt-6 flex flex-col md:flex-row justify-center gap-3 w-full">
                    <button
                        className="flex-1 w-full px-5 py-2.5 bg-transparent border border-white/10 text-slate-300 rounded-2xl hover:bg-white/5 hover:text-white transition-all cursor-pointer font-bold text-sm active:scale-95"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`flex-1 w-full px-5 py-2.5 font-bold border rounded-2xl active:scale-95 active:translate-y-0 transition-all text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Cargando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

