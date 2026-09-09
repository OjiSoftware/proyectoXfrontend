export interface User {
    id: number | string;
    email: string;
    name?: string;
    // role?: string; <-- Ideal para un ERP más adelante (admin, vendedor, etc.)
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}
