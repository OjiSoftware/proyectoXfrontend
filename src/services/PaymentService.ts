// Usamos la URL de tu backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const paymentApi = {
    createPreference: async (saleId: number) => {
        try {
            const response = await fetch(
                `${API_URL}/payments/create-preference`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // Si usás token de sesión para el resto de la app, agregalo acá:
                        // "Authorization": `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ saleId }),
                },
            );

            if (!response.ok) {
                throw new Error("Error al crear la preferencia de pago");
            }

            return await response.json(); // Devuelve { preferenceId, initPoint }
        } catch (error) {
            console.error("Error en PaymentService:", error);
            throw error;
        }
    },
};
