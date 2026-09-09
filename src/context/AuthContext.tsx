// src/context/AuthContext.tsx
import { createContext, ReactNode, useState, useEffect, useMemo } from "react";
import { User, AuthContextType } from "../types/auth.types";

// 1. Creación del Contexto
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);

// 2. Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // const res = await fetch("http://localhost:3000/api/auth/me", {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/me`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    },
                );

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("Error verificando la sesión:", error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            // await fetch("http://localhost:3000/api/auth/logout", {
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = useMemo(
        () => ({
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
        }),
        [user, isAuthenticated, isLoading],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
