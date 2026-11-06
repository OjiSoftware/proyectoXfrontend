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
        <div className="h-screen w-full bg-[#07050C] flex flex-col justify-center items-center px-4 overflow-hidden font-poppins relative selection:bg-indigo-500 selection:text-white">
            {/* Glows de fondo para profundidad ambiental (contenidos sin desbordar el viewport) */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center relative z-10 my-auto">
                <div className="w-full text-center mb-5 sm:mb-6">
                    <img
                        src={logo}
                        alt="OJI"
                        className="h-16 sm:h-20 w-auto mx-auto mb-2 sm:mb-3 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    />
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-widest">
                        Gestión Empresarial Integral
                    </p>
                </div>

                <div className="w-full bg-[#0C0A15]/95 border border-white/10 p-5 sm:p-7 rounded-[22px] shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl ring-1 ring-white/5">
                    <div className="mb-5 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Iniciar sesión
                        </h2>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1">
                            Ingresa tus credenciales de acceso
                        </p>
                    </div>

                    {/* 👇 Usamos el estado en lugar de la variable cruda */}
                    {showRegisteredMsg && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 mb-4">
                            <p className="text-xs font-medium text-emerald-400 text-center">
                                ¡Cuenta creada con éxito! Ya podés iniciar sesión.
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                        noValidate
                    >
                        {errors.api && (
                            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 mb-4">
                                <p className="text-xs font-medium text-rose-400 text-center">
                                    {errors.api}
                                </p>
                            </div>
                        )}

                        {/* Campo Email */}
                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1"
                            >
                                Correo electrónico
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3.5 flex items-center pointer-events-none z-20">
                                    <Mail
                                        className={`h-4 w-4 transition-colors ${errors.email ? "text-rose-400" : "text-slate-400 group-focus-within:text-indigo-400"}`}
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
                                    className={`block w-full h-10 sm:h-11 bg-[#151320] border rounded-xl pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500
                                        ${errors.email ? "border-rose-500/50 focus:ring-2 focus:ring-rose-500/40 text-rose-300" : "border-white/10 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/30"}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-rose-400 font-medium ml-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                title="password"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1"
                            >
                                Contraseña
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3.5 flex items-center pointer-events-none z-20">
                                    <Lock
                                        className={`h-4 w-4 transition-colors ${errors.password1 ? "text-rose-400" : "text-slate-400 group-focus-within:text-indigo-400"}`}
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
                                    className={`block w-full h-10 sm:h-11 bg-[#151320] border rounded-xl pl-10 pr-10 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500
                                        ${errors.password1 ? "border-rose-500/50 focus:ring-2 focus:ring-rose-500/40 text-rose-300" : "border-white/10 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/30"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-400 transition-colors z-30 cursor-pointer focus:outline-none"
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

                            {/* Enlace de recuperación comentado temporalmente */}
                            {/* <div className="flex flex-col sm:flex-row justify-between gap-2 pt-1">
                                {errors.password1 ? (
                                    <p className="text-xs text-rose-400 font-medium order-2 sm:order-1 ml-1">
                                        {errors.password1}
                                    </p>
                                ) : (
                                    <div className="hidden sm:block"></div>
                                )}
                                <a
                                    href="/auth/recover"
                                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 order-1 sm:order-2 self-end sm:self-auto transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div> */}

                            {errors.password1 && (
                                <p className="text-xs text-rose-400 font-medium ml-1">
                                    {errors.password1}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 h-10 sm:h-11 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(79,70,229,0.35)] transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer border border-indigo-400/30"
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

                    {/* Enlace de registro comentado temporalmente */}
                    {/* <div className="mt-6 text-center border-t border-white/5 pt-5">
                        <p className="text-sm text-slate-300">
                            ¿No tenés una cuenta?{" "}
                            <a
                                href="/auth/register"
                                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Registrate acá
                            </a>
                        </p>
                    </div> */}
                </div>

                <p className="mt-4 sm:mt-5 text-center text-xs text-slate-400">
                    Desarrollado por{" "}
                    <span className="font-semibold text-slate-200">OjiSoftware</span>{" "}
                    © 2026 •{" "}
                    <a
                        href="mailto:soporte@ojisoftware.com"
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Soporte técnico
                    </a>
                </p>
            </div>
        </div>
    );
}

