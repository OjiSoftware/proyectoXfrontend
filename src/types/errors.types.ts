export interface EmailError {
    email?: string;
}

export interface PasswordError {
    password1?: string;
    password2?: string;
}

export interface LoginError extends EmailError, PasswordError {
    api?: string;
}
