export interface Provider {
    id: number;
    name: string;
    contact?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    status?: boolean;
    createdAt?: string;
}

export interface CreateProviderDto {
    name: string;
    contact?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface UpdateProviderDto {
    name?: string;
    contact?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    status?: boolean;
}
