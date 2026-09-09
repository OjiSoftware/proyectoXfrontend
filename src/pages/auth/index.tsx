import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { LoginError } from "../../types/errors.types";
import { validateEmail } from "../../helpers/email.validator";
import { validatePassword } from "../../helpers/password.validator";
import logo from "../../assets/OJI_logo/OJI_logo_soft_color_v3.svg";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginError>({});
    const [loading, setLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState("Iniciar sesión");
    const [searchParams, setSearchParams] = useSearchParams();
    const [showRegisteredMsg, setShowRegisteredMsg] = useState(
        searchParams.get("registered") === "true",
    );

    const handleInputChange = (
        field: keyof LoginError,
        value: string,
        setter: (v: string) => void,
    ) => {
        setter(value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (showRegisteredMsg) {
            setShowRegisteredMsg(false);
            searchParams.delete("registered");
            setSearchParams(searchParams);
        }

        const emailRes = validateEmail(email);
        const passRes = validatePassword(password, false);

        const freshErrors: LoginError = {
            email: emailRes.email || undefined,
            password1: passRes.password1 || undefined,
            api: undefined,
        };

        setErrors(freshErrors);

        if (freshErrors.email || freshErrors.password1) {
            return;
        }

        setLoading(true);
        setLoginStatus("Verificando...");
        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        try {
            // const [res] = await Promise.all([
            //     fetch("http://localhost:3000/api/auth/login", {
            const [res] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/login`, {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }),
                wait(1000),
            ]);

            const data = await res.json();
            if (res.ok) {
                setLoginStatus("Iniciando...");
                await wait(400);
                login(data.user);
                navigate("/management/products", {
                    state: {
                        welcome: true,
                        userName: data.user.name || "Usuario",
                    },
                });
            } else {
                setErrors({
                    api:
                        data.error ||
                        data.message ||
                        "Credenciales incorrectas.",
                });
                setLoginStatus("Iniciar sesión");
            }
        } catch (error) {
            setErrors({ api: "Error de conexión." });
            setLoginStatus("Iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 py-4 font-poppins ">
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
                        Gestión Empresarial Integral
                    </p>
                </div>

                <div className="w-full bg-gray-800/50 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Iniciar sesión
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Ingresa tus credenciales de acceso
                        </p>
                    </div>

                    {/* 👇 Usamos el estado en lugar de la variable cruda */}
                    {showRegisteredMsg && (
                        <div className="rounded-lg bg-green-500/10 border border-green-500/50 p-3 mb-6">
                            <p className="text-xs font-medium text-green-400 text-center">
                                ¡Cuenta creada con éxito! Ya podés iniciar
                                sesión.
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="space-y-6"
                        noValidate
                    >
                        {errors.api && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 mb-6">
                                <p className="text-xs font-medium text-red-400 text-center">
                                    {errors.api}
                                </p>
                            </div>
                        )}

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Correo electrónico
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3 flex items-center pointer-events-none z-20 translate-y-[1.5px]">
                                    <Mail
                                        className={`h-4 w-4 transition-colors ${errors.email ? "text-red-400" : "text-gray-500 group-focus-within:text-brand-400"}`}
                                    />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "email",
                                            e.target.value,
                                            setEmail,
                                        )
                                    }
                                    placeholder="tu@correo.com"
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-3 text-sm outline-none transition-all
                                        ${errors.email ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[10px] text-red-400 font-medium ml-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                title="password"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Contraseña
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3 flex items-center pointer-events-none z-20 translate-y-[1px]">
                                    <Lock
                                        className={`h-4 w-4 transition-colors ${errors.password1 ? "text-red-400" : "text-gray-500 group-focus-within:text-brand-400"}`}
                                    />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password1",
                                            e.target.value,
                                            setPassword,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-10 text-sm outline-none transition-all
                                        ${errors.password1 ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-0 pr-3 flex items-center text-gray-500 hover:text-brand-400 transition-colors z-30 cursor-pointer focus:outline-none"
                                    title={
                                        showPassword
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-1">
                                {errors.password1 ? (
                                    <p className="text-[10px] text-red-400 font-medium order-2 sm:order-1 ml-1">
                                        {errors.password1}
                                    </p>
                                ) : (
                                    <div className="hidden sm:block"></div>
                                )}
                                <a
                                    href="/auth/recover"
                                    className="text-sm font-semibold text-brand-400 hover:text-brand-300 order-1 sm:order-2 self-end sm:self-auto"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-500 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{loginStatus}</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    <span>Entrar al Sistema</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-white/5 pt-6">
                        <p className="text-sm text-gray-400">
                            ¿No tenés una cuenta?{" "}
                            <a
                                href="/auth/register"
                                className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                            >
                                Registrate acá
                            </a>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    Desarrollado por{" "}
                    <span className="font-bold text-gray-400">OjiSoftware</span>{" "}
                    © 2026 •{" "}
                    <a
                        href="mailto:soporte@ojisoftware.com"
                        className="font-semibold text-brand-400 hover:text-brand-300"
                    >
                        Soporte técnico
                    </a>
                </p>
            </div>
        </div>
    );
}

