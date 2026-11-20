import type { ExcelSheet } from "@/helpers/excelExport";
import type { Provider } from "@/types/provider.types";

export function buildProviderExportSheet(
    providers: Provider[],
): ExcelSheet {
    const headers = [
        "ID",
        "Razón social",
        "Nombre",
        "Teléfono",
        "Email",
    ];

    return {
        name: "Proveedores",
        headers,
        rows: providers.map((provider) => ({
            "ID": provider.id,
            "Razón social": provider.businessName ?? "",
            "Nombre": provider.name ?? "",
            "Teléfono": provider.phoneNumber ?? "",
            "Email": provider.email ?? "",
        })),
    };
}