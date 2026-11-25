export interface SalesReportFilters {
    from?: string;
    to?: string;
    categoryId?: number;
    providerId?: number;
    // brandId?: number;
    paymentMethod?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface SalesReportItem {
    id: number;
    saleId: number;
    date: string;
    // clientName: string;
    // clientDni: string | null;
    productName: string;
    categoryName: string;
    providerName: string;
    // brandName: string;
    paymentMethod: string;
    quantity: number;
    unitaryPrice: number;
    costPrice: number;
    subtotal: number;
    margin: number | null;
}

export interface SalesReportKpis {
    totalSold: number;
    salesCount: number;
    averageTicket: number;
    unitsSold: number;
    totalMargin: number;
}

export interface SalesReportResult {
    kpis: SalesReportKpis;
    items: SalesReportItem[];
    totalItems: number;
    page: number;
    pageSize: number;
    paymentMethods: string[];
}
