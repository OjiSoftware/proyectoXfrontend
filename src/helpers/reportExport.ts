import type { ExcelSheet } from "@/helpers/excelExport";
import type { SalesReportItem, SalesReportKpis } from "@/types/report.types";

export function buildSalesReportSheets(
    items: SalesReportItem[],
    kpis: SalesReportKpis,
): ExcelSheet[] {
    const detailHeaders = [
        "Comprobante",
        "Fecha",
        // "Cliente",
        // "DNI",
        "Producto",
        "Categoría",
        "Proveedor",
        // "Marca",
        "Medio de pago",
        "Cantidad",
        "Precio costo",
        "Precio unitario",
        "Subtotal",
        "Margen",
    ];

    const detail: ExcelSheet = {
        name: "Detalle",
        headers: detailHeaders,
        rows: items.map((item) => ({
            "Comprobante": `#${item.saleId}`,
            "Fecha": item.date ? new Date(item.date) : null,
            // "Cliente": item.clientName,
            // "DNI": item.clientDni ?? "-",
            "Producto": item.productName,
            "Categoría": item.categoryName,
            "Proveedor": item.providerName,
            // "Marca": item.brandName,
            "Medio de pago": item.paymentMethod,
            "Cantidad": item.quantity,
            "Precio costo": item.costPrice,
            "Precio unitario": item.unitaryPrice,
            "Subtotal": item.subtotal,
            "Margen": item.margin,
        })),
    };

    const summary: ExcelSheet = {
        name: "Resumen",
        headers: ["Indicador", "Valor"],
        rows: [
            { "Indicador": "Total vendido", "Valor": kpis.totalSold },
            { "Indicador": "Cantidad de ventas", "Valor": kpis.salesCount },
            { "Indicador": "Ticket promedio", "Valor": kpis.averageTicket },
            { "Indicador": "Unidades vendidas", "Valor": kpis.unitsSold },
            { "Indicador": "Margen", "Valor": kpis.totalMargin },
        ],
    };

    return [summary, detail];
}
