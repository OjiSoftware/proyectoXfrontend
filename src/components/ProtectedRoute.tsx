import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Asegurate de que la ruta sea correcta
import { Loader2 } from "lucide-react";

export const ProtectedRoute = () => {
    // Traemos el estado real desde tu contexto
    const { isAuthenticated, isLoading } = useAuth();

    // 1. Mientras le pregunta al backend si el usuario es válido, mostramos un spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#07050c]  flex items-center justify-center">
                <Loader2 data-testid="loader" className="w-12 h-12 #5e5cf7 animate-spin" />
            </div>
        );
    }

    // 2. Si ya terminó de chequear y resulta que NO está autenticado, afuera.
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // 3. Si pasó todas las validaciones, renderiza la ruta (ej: /management/products)
    return <Outlet />;
};

