export interface Provider {
    id: number;
    name?: string | null;
    businessName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    createdAt?: string;
}

export interface CreateProviderDto {
    name?: string | null;
    businessName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
}

export interface UpdateProviderDto {
    name?: string | null;
    businessName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
}
