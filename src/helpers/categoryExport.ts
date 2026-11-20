import type { ExcelSheet } from "@/helpers/excelExport";
import type { Category } from "@/types/category.types";

export function buildCategoryExportSheet(
    categories: Category[],
): ExcelSheet {
    const headers = [
        "ID",
        "Nombre",
        "Fecha de alta",
        "Estado",
    ];

    return {
        name: "Categorías",
        headers,
        rows: categories.map((category) => ({
            "ID": category.id,
            "Nombre": category.name,
            "Fecha de alta": category.createdAt
                ? new Date(category.createdAt)
                : null,
            "Estado":
                category.status === undefined
                    ? ""
                    : category.status
                        ? "Activa"
                        : "Inactiva",
        })),
    };
}