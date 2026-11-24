import { Client } from "./client.types";

export interface SaleDetail {
  id?: number;
  productId: number;
  quantity: number;
  unitaryPrice?: number;
  product?: {
    id?: number;
    name?: string;
    barcode?: string;
    price?: number;
  };
}

export interface Sale {
  id: number;
  clientId?: number;
  client?: Client;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  total: number;
  notes?: string | null;
  details: SaleDetail[];
  createdAt: string;
  transaction?: {
    status: string;
    mpId?: string;
    paymentMethod?: string;
    paymentType?: string;
    cardLastFour?: string;
  };
}

export interface EditSale {
  clientId?: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  details: {
    productId: number;
    quantity: number;
  }[];
}
