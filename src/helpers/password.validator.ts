import { PasswordError } from "../types/errors.types";

export const validatePassword = (
  password: string,
  checkLength = true,
): PasswordError => {
    const tempErrors: PasswordError = {};

    // 1. Validamos si está vacío o solo contiene espacios
    if (!password || password.trim().length === 0) {
        tempErrors.password1 = "La contraseña es obligatoria.";
        return tempErrors;
    }

    // 2. Validamos longitud mínima (ignorando espacios al inicio/final si preferís)
    if (checkLength && password.length < 6) {
        tempErrors.password1 = "Debe tener al menos 6 caracteres.";
        return tempErrors;
    }

    // 3. Validaciones de complejidad (Mantenemos el bloque comentado por si decidís activarlo luego)
    /*
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (!hasNumber || !hasUpper) {
        tempErrors.password1 = "Usa al menos una mayúscula y un número.";
    }
    */

    return tempErrors;
};
