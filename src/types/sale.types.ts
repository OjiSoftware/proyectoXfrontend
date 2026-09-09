import { Client } from "./client.types";

export interface Sale {
  id: number;
  clientId?: number;
  client?: Client;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  total: number;
  details: {
    productId: number;
    quantity: number;
  }[];
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
  details: {
    productId: number;
    quantity: number;
  }[];
}