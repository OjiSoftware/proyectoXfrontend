import type { ExcelSheet } from "@/helpers/excelExport";
import type { Sale } from "@/types/sale.types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export function isPosGenericClient(client?: Sale["client"] | null): boolean {
  if (!client) return true;
  if (client.dni === "99999999") return true;
  const full = `${client.name || ""} ${client.surname || ""}`.trim().toLowerCase();
  return full === "consumidor final";
}

export function getSaleChannelLabel(sale: Sale): string {
  if (sale.transaction?.mpId || sale.transaction?.paymentMethod) {
    return "Tienda Web";
  }
  if (isPosGenericClient(sale.client)) {
    return "Mostrador (POS)";
  }
  return "Tienda Web";
}

export function getSalePaymentLabel(sale: Sale): string {
  if (sale.transaction?.paymentMethod) {
    return sale.transaction.paymentMethod;
  }
  const notes = (sale.notes || "").toLowerCase();
  if (notes.includes("pago con tarjeta") || notes.includes("recargo en pañales")) {
    return "Tarjeta";
  }
  if (isPosGenericClient(sale.client)) {
    return "Efectivo";
  }
  return "Mercado Pago";
}

export function getSaleUnitsCount(sale: Sale): number {
  if (!Array.isArray(sale.details)) return 0;
  return sale.details.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
}

export function buildSaleExportSheet(sales: Sale[]): ExcelSheet {
  const headers = [
    "Comprobante",
    "Fecha",
    "Canal",
    "Cliente",
    "DNI",
    "Medio de pago",
    "Artículos (Unidades)",
    "Estado",
    "Total",
    "Notas",
  ];

  return {
    name: "Ventas",
    headers,
    rows: sales.map((sale) => {
      const isGeneric = isPosGenericClient(sale.client);
      const clientLabel = isGeneric
        ? "Consumidor Final"
        : sale.client
          ? `${sale.client.surname || ""}, ${sale.client.name || ""}`.replace(/^,\s*/, "").trim()
          : "Consumidor Final";

      const units = getSaleUnitsCount(sale);
      const itemsCount = Array.isArray(sale.details) ? sale.details.length : 0;

      return {
        "Comprobante": `#${sale.id}`,
        "Fecha": sale.createdAt ? new Date(sale.createdAt) : null,
        "Canal": getSaleChannelLabel(sale),
        "Cliente": clientLabel,
        "DNI": !isGeneric && sale.client?.dni ? sale.client.dni : "-",
        "Medio de pago": getSalePaymentLabel(sale),
        "Artículos (Unidades)": units > 0 ? `${units} u. (${itemsCount} ítems)` : `${itemsCount} ítems`,
        "Estado": STATUS_LABELS[sale.status] || sale.status,
        "Total": Number(sale.total) || 0,
        "Notas": sale.notes ?? "",
      };
    }),
  };
}
