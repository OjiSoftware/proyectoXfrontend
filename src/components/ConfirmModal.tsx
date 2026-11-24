import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

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
        primary: "btn-primary",
        success: "btn-success",
        danger: "btn-danger",
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onCancel();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-poppins"
            onClick={onCancel}
        >
            <div
                className="mgmt-modal backdrop-blur-3xl rounded-3xl p-6 md:p-8 w-full max-w-[384px] shadow-[0_0_50px_rgba(0,0,0,0.45)] text-center transform transition-all duration-300 scale-95 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    {title}
                </h2>
                <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {message}
                </div>
                <div className="mt-6 flex flex-col md:flex-row justify-center gap-3 w-full">
                    <button
                        className="btn btn-md btn-ghost flex-1 w-full rounded-2xl"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-md flex-1 w-full rounded-2xl ${variantClasses[variant]}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Cargando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

