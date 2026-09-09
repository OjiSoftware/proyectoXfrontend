import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send, Loader2 } from "lucide-react";
import { validateEmail } from "../../helpers/email.validator";
import logo from "../../assets/OJI_logo/OJI_logo_soft_color_v3.svg";

export default function RecoverPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleInputChange = (value: string) => {
        setEmail(value);
        if (error) setError(undefined);
    };

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailErr = validateEmail(email);
        if (emailErr.email) {
            setError(emailErr.email);
            return;
        }

        setLoading(true);

        try {
            // await fetch("http://localhost:3000/api/auth/recover-password", {
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/recover-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            setSent(true);
        } catch (err) {
            setError(
                "Error de conexión. Verifica tu internet o el estado del servidor.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 py-4 font-sans">
            <div className="w-full max-w-md flex flex-col items-center [zoom:0.75] md:[zoom:1]">
                <div className="w-full text-center mb-10">
                    <img
                        src={logo}
                        alt="OJI"
                        className="hidden sm:block h-25  w-auto block mx-auto mb-4 object-contain"
                    />
                    <img
                        src={logo}
                        alt="OJI"
                        className="sm:hidden h-20  w-auto block mx-auto mb-4 object-contain"
                    />
                    <p className="text-[10px] sm:text-xs font-bold text-brand-400 uppercase tracking-[0.2em]">
                        Recuperación de Acceso
                    </p>
                </div>

                <div className="w-full bg-gray-800/50 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl text-center">
                    {!sent ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                ¿Olvidaste tu contraseña?
                            </h2>
                            <p className="text-gray-400 text-sm mb-8">
                                Ingresá tu email para recibir un enlace de
                                restablecimiento.
                            </p>

                            <form
                                onSubmit={handleRecover}
                                className="space-y-6"
                                noValidate
                            >
                                <div className="space-y-2 text-left">
                                    <div className="relative group flex items-center">
                                        <div className="absolute left-0 pl-3 flex items-center pointer-events-none translate-y-[1.5px]">
                                            <Mail
                                                className={`h-4 w-4 transition-colors ${error ? "text-red-400" : "text-gray-500 group-focus-within:text-brand-400"}`}
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="tu@correo.com"
                                            className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-3 text-sm outline-none transition-all
                                                ${error
                                                    ? "border-red-500/50 text-red-400 placeholder:text-red-400/60"
                                                    : "border-white/10 text-white placeholder:text-gray-500 focus:border-brand-500"
                                                }`}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-[10px] text-red-400 font-medium ml-1">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    <span>Enviar enlace</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                <Send className="h-5 w-5 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                ¡Correo enviado!
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 px-4 leading-relaxed">
                                Si el email coincide con una cuenta activa de{" "}
                                <strong>ElementAll</strong>, recibirás un enlace
                                de restablecimiento en breve.
                            </p>
                        </div>
                    )}

                    {/* 3. Reemplazamos window.history.back() por navigate a la ruta absoluta */}
                    <button
                        onClick={() => navigate("/auth/login")}
                        className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mx-auto cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" /> Volver al login
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    Desarrollado por{" "}
                    <span className="font-bold text-gray-400">OjiSoftware</span>{" "}
                    © 2026
                </p>
            </div>
        </div>
    );
}

