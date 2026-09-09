import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { LoginError } from "@/types/errors.types";
import { validateEmail } from "../../helpers/email.validator";
import { validatePassword } from "../../helpers/password.validator";
import logo from "../../assets/OJI_logo/OJI_logo_soft_color_v3.svg";

interface RegisterError extends LoginError {
    name?: string;
}

export default function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState<RegisterError>({});
    const [loading, setLoading] = useState(false);
    const [registerStatus, setRegisterStatus] = useState("Crear cuenta");

    // 🚩 Lógica para calcular la fuerza (Igual que en Reset)
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 6) strength += 25;
        if (pass.length >= 10) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) strength += 25;
        return strength;
    };

    const handleInputChange = (
        field: keyof RegisterError,
        value: string,
        setter: (v: string) => void,
    ) => {
        setter(value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailRes = validateEmail(email);
        const passRes = validatePassword(password);

        const freshErrors: RegisterError = {
            name: !name.trim() ? "El nombre es obligatorio." : undefined,
            email: emailRes.email || undefined,
            password1: passRes.password1 || undefined,
            api: undefined,
        };

        if (!confirmPassword) {
            freshErrors.password2 = "Por favor, repetí la contraseña.";
        } else if (password !== confirmPassword) {
            freshErrors.password2 = "Las contraseñas no coinciden.";
        }

        setErrors(freshErrors);

        if (Object.values(freshErrors).some((error) => error !== undefined)) {
            return;
        }

        setLoading(true);
        setRegisterStatus("Creando...");
        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        try {
            // const [res] = await Promise.all([
            //     fetch("http://localhost:3000/api/auth/register", {
            const [res] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/register`, {
                    method: "POST",
                    body: JSON.stringify({ name, email, password }),
                    headers: { "Content-Type": "application/json" },
                }),
                wait(1000),
            ]);

            const data = await res.json();

            if (res.ok) {
                setRegisterStatus("¡Éxito!");
                await wait(400);
                navigate("/auth/login?registered=true");
            } else {
                setErrors({
                    api:
                        data.error ||
                        data.message ||
                        "Error al crear la cuenta.",
                });
                setRegisterStatus("Crear cuenta");
            }
        } catch (error) {
            setErrors({ api: "Error de conexión." });
            setRegisterStatus("Crear cuenta");
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(password);

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
                        Gestión Empresarial Integral
                    </p>
                </div>

                <div className="w-full bg-gray-800/50 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Crear cuenta
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Completá tus datos para registrarte
                        </p>
                    </div>

                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                        noValidate
                    >
                        {errors.api && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 mb-6">
                                <p className="text-xs font-medium text-red-400 text-center">
                                    {errors.api}
                                </p>
                            </div>
                        )}

                        {/* Nombre */}
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Nombre completo *
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3 flex items-center pointer-events-none z-20 translate-y-[1.5px]">
                                    <User
                                        className={`h-4 w-4 transition-colors ${errors.name ? "text-red-400" : "text-gray-500 group-focus-within:text-brand-400"}`}
                                    />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "name",
                                            e.target.value,
                                            setName,
                                        )
                                    }
                                    placeholder="Juan Pérez"
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-3 text-sm outline-none transition-all ${errors.name ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-[10px] text-red-400 font-medium ml-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Correo electrónico *
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
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-3 text-sm outline-none transition-all ${errors.email ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[10px] text-red-400 font-medium ml-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Contraseña *
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
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password1",
                                            e.target.value,
                                            setPassword,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-10 text-sm outline-none transition-all ${errors.password1 ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-0 pr-3 flex items-center text-gray-500 hover:text-brand-400 z-30 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* 🚩 BARRA DE FUERZA VISUAL */}
                            {password.length > 0 && (
                                <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                            Seguridad
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold transition-colors ${strength <= 25 ? "text-red-400" : strength <= 50 ? "text-yellow-400" : "text-green-400"}`}
                                        >
                                            {strength <= 25
                                                ? "DÉBIL"
                                                : strength <= 50
                                                    ? "MEDIA"
                                                    : "FUERTE"}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full transition-all duration-500 ease-out ${strength <= 25 ? "bg-red-500" : strength <= 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                            style={{ width: `${strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {errors.password1 && (
                                <p className="text-[10px] text-red-400 font-medium ml-1">
                                    {errors.password1}
                                </p>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-200 ml-1"
                            >
                                Confirmar contraseña *
                            </label>
                            <div className="relative group flex items-center">
                                <div className="absolute left-0 pl-3 flex items-center pointer-events-none z-20 translate-y-[1px]">
                                    <Lock
                                        className={`h-4 w-4 transition-colors ${errors.password2 ? "text-red-400" : "text-gray-500 group-focus-within:text-brand-400"}`}
                                    />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password2",
                                            e.target.value,
                                            setConfirmPassword,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className={`block w-full h-11 bg-gray-900/50 border rounded-lg pl-10 pr-10 text-sm outline-none transition-all ${errors.password2 ? "border-red-500/50 focus:ring-1 focus:ring-red-500 text-red-400 placeholder:text-red-400/60" : "border-white/10 focus:border-brand-500 text-white placeholder:text-gray-500"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-0 pr-3 flex items-center text-gray-500 hover:text-brand-400 z-30 cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password2 && (
                                <p className="text-[10px] text-red-400 font-medium ml-1">
                                    {errors.password2}
                                </p>
                            )}
                        </div>

                        <p className="text-[12px] text-gray-500 text-right pr-1 italic">
                            <span className="font-black">*</span> Campos
                            requeridos
                        </p>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-500 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{registerStatus}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Crear cuenta</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center border-t border-white/5 pt-6">
                        <p className="text-sm text-gray-400">
                            ¿Ya tenés una cuenta?{" "}
                            <a
                                href="/auth/login"
                                className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                            >
                                Iniciá sesión
                            </a>
                        </p>
                    </div>
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

