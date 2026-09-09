import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "rgba(47, 48, 39, 0.8)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "500",
                },
            }}
        />
    );
}
