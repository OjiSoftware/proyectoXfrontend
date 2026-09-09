/**
 * Convierte un link de Google Drive (view/edit) en un link directo 
 * para ser utilizado en etiquetas <img>.
 * 
 * @param url URL original de Google Drive o cualquier otra URL
 * @returns URL procesada para visualización directa
 */
export const getDriveDirectLink = (url: string) => {
    if (!url || typeof url !== 'string' || !url.trim()) return url;
    
    // Solo procesamos si detectamos que es un link de Google Drive
    if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) {
        return url;
    }

    try {
        // Caso 1: Formato estándar /d/ID/ o /file/d/ID
        // Captura el ID que está después de /d/ (suelen tener entre 25 y 45 caracteres)
        const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
        if (dMatch && dMatch[1]) {
            // Usamos el endpoint lh3 que es más directo para imágenes
            return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
        }

        // Caso 2: Formato de query parameter ?id=ID o open?id=ID
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
    } catch (e) {
        console.error("Error al procesar URL de Drive:", e);
    }
    
    return url;
};
