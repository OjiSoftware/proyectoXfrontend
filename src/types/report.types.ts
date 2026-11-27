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

export type KpiGroupBy = "day" | "week" | "month";

export interface SalesKpiFilters {
    from?: string;
    to?: string;
    groupBy?: KpiGroupBy;
}

export interface TransactionPeriodPoint {
    period: string;
    count: number;
    totalSales: number;
}

export interface SalesKpisResult {
    period: {
        from: string;
        to: string;
        previousFrom: string;
        previousTo: string;
        groupBy: KpiGroupBy;
    };
    totalSales: number;
    transactionsCount: number;
    averageTicket: number;
    unitsSold: number;
    unitsPerTransaction: number;
    previousPeriodTotalSales: number;
    salesGrowthPercentage: number | null;
    previousPeriodAverageTicket: number;
    ticketGrowthPercentage: number | null;
    previousPeriodTransactionsCount: number;
    transactionsGrowthPercentage: number | null;
    previousPeriodUnitsPerTransaction: number;
    unitsPerTransactionGrowthPercentage: number | null;
    transactionsByPeriod: TransactionPeriodPoint[];
}

export interface ProfitabilityFilters {
    from?: string;
    to?: string;
}

export interface ProductMarginItem {
    productId: number;
    productName: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    marginPercentage: number | null;
    hasCost: boolean;
}

export interface ProfitabilityKpis {
    totalSales: number;
    totalCost: number;
    grossProfit: number;
    grossMarginPercentage: number;
    previousPeriodGrossMarginPercentage: number | null;
    grossMarginChange: number | null;
    expenses: number;
    expensesLoaded: boolean;
    netProfit: number;
    productsWithoutCost: number;
}

export interface ProfitabilityResult {
    period: {
        from: string;
        to: string;
        previousFrom: string;
        previousTo: string;
    };
    kpis: ProfitabilityKpis;
    products: ProductMarginItem[];
}
