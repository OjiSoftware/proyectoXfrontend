import type { ExcelSheet } from "@/helpers/excelExport";
import type { Product } from "@/types/product.types";

export function buildProductExportSheet(
    products: Product[],
): ExcelSheet {
    const headers = [
        "ID",
        "Nombre",
        "Código",
        "Marca",
        "Categoría",
        "Proveedor",
        "Descripción",
        "Unidad",
        "Stock",
        "Precio",
        "Costo",
        "Oferta",
        "Fecha de alta",
        "Estado en catálogo",
    ];

    return {
        name: "Productos",
        headers,
        rows: products.map((product) => ({
            "ID": product.id,
            "Nombre": product.name,
            "Código": product.barcode ?? "",
            "Marca": product.brand?.name ?? "",
            "Categoría": product.category?.name ?? "",
            "Proveedor":
                product.provider?.businessName ||
                product.provider?.name ||
                "",
            "Descripción": product.description ?? "",
            "Unidad": product.unit ?? "",
            "Stock": product.stock ?? null,
            "Precio": Number(product.price),
            "Costo":
                product.costPrice == null
                    ? null
                    : Number(product.costPrice),
            "Oferta": product.isOffer ? "Sí" : "No",
            "Fecha de alta": product.createdAt
                ? new Date(product.createdAt)
                : null,
            "Estado en catálogo": product.showingInCatalog
                ? "Visible"
                : "Oculto",
        })),
    };
}