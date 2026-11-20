import { utils, writeFileXLSX } from "xlsx";

export type ExcelCell = string | number | boolean | Date | null;

export interface ExcelSheet {
    name: string;
    headers: string[];
    rows: Array<Record<string, ExcelCell>>;
}

interface ExportExcelOptions {
    fileName: string;
    sheets: ExcelSheet[];
}

export function exportExcel({
    fileName,
    sheets,
}: ExportExcelOptions): void {
    if (sheets.length === 0) {
        throw new Error("El archivo debe tener al menos una hoja.");
    }

    const workbook = utils.book_new();

    for (const sheet of sheets) {
        const dataRows = sheet.rows.map((row) =>
            sheet.headers.map((header) => row[header] ?? ""),
        );

        const worksheet = utils.aoa_to_sheet([
            sheet.headers,
            ...dataRows,
        ]);

        utils.book_append_sheet(workbook, worksheet, sheet.name);
    }

    const excelFileName = fileName.toLowerCase().endsWith(".xlsx")
        ? fileName
        : `${fileName}.xlsx`;

    writeFileXLSX(workbook, excelFileName);
}