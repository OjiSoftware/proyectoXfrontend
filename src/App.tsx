import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; // <-- Agregamos tu AuthProvider
import { ThemeProvider } from "./context/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";
import ToastProvider from "@/components/ToastProvider";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                    <ToastProvider />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
