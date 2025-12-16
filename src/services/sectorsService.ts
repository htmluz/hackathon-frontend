import apiClient from "@/api/axios";

export interface Sector {
    id: number;
    name: string;
    description: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    user_count?: number; // Present in list view
}

export interface CreateSectorDTO {
    name: string;
    description?: string;
}

export interface UpdateSectorDTO {
    name?: string;
    description?: string;
    active?: boolean;
}

export const sectorsService = {
    getAll: async (activeOnly?: boolean) => {
        const params = activeOnly ? { active_only: true } : {};
        const response = await apiClient.get<{ success: boolean; data: Sector[] }>("/private/sectors", { params });
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<{ success: boolean; data: Sector }>(`/private/sectors/${id}`);
        return response.data.data;
    },

    create: async (data: CreateSectorDTO) => {
        const response = await apiClient.post<{ success: boolean; data: Sector }>("/private/sectors", data);
        return response.data;
    },

    update: async (id: number, data: UpdateSectorDTO) => {
        const response = await apiClient.put<{ success: boolean; data: Sector }>(`/private/sectors/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean; error?: string }>(`/private/sectors/${id}`);
        return response.data;
    }
};
