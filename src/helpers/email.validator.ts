import { EmailError } from "../types/errors.types";

export const validateEmail = (email: string): EmailError => {
    const tempErrors: EmailError = {};
    if (!email) {
        tempErrors.email = "El email es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        tempErrors.email = "El formato del email no es válido.";
    }
    return tempErrors;
};
