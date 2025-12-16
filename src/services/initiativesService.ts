import api from '@/api/axios';

export interface Initiative {
    id: number;
    title: string;
    description: string;
    benefits: string;
    type: string;
    priority: string;
    status: string;
    sector: string;
    deadline?: string;
    responsible?: string; // Might come from user relation
    created_at?: string;
}

export interface InitiativeHistory {
    id: number;
    initiative_id: number;
    action: string;
    old_status?: string;
    new_status?: string;
    created_at: string;
    user_name?: string; // Optional, depends on backend
}

export interface Comment {
    id: number;
    initiative_id: number;
    user_id: number;
    user_name: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface CreateInitiativeDTO {
    title: string;
    description: string;
    benefits: string;
    type: string;
    priority: string;
    sector: string;
    deadline?: string;
}

export const initiativesService = {
    getAll: async (filters?: Record<string, string>) => {
        let url = '/private/initiatives';
        if (filters && Object.keys(filters).length > 0) {
            const params = new URLSearchParams(filters);
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data.data; // Unwrapping pagination object
    },

    // getFiltered removed as it is now integrated into getAll

    create: async (data: CreateInitiativeDTO) => {
        const response = await api.post('/private/initiatives', data);
        return response.data;
    },

    update: async (id: string | number, data: Partial<CreateInitiativeDTO>) => {
        const response = await api.put(`/private/initiatives/${id}`, data);
        return response.data;
    },

    getHistory: async (id: string | number) => {
        const response = await api.get(`/private/initiatives/${id}/history`);
        return response.data;
    },

    getComments: async (id: string | number) => {
        const response = await api.get(`/private/initiatives/${id}/comments`);
        return response.data;
    },

    createComment: async (id: string | number, content: string) => {
        const response = await api.post(`/private/initiatives/${id}/comments`, { content });
        return response.data;
    },

    // Add other methods as needed based on hackaton.json
};
