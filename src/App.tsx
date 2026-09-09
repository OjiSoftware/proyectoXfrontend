import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; // <-- Agregamos tu AuthProvider
import { AppRoutes } from "./routes/AppRoutes";
import ToastProvider from "@/components/ToastProvider";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
                <ToastProvider />
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
