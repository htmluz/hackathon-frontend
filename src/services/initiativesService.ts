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
    cancellation_request?: CancellationRequest;
    owner_name?: string;
    date?: string;
    owner?: string;
}


export interface CancellationRequest {
    id: number;
    initiative_id?: number;
    initiative_title?: string;
    requested_by_user_id: number;
    requested_by_name: string;
    reason: string;
    status: string;
    reviewed_by_name?: string;
    review_reason?: string;
    created_at: string;
    reviewed_at?: string;
    time_ago?: string;
}

export interface InitiativeHistory {
    id: number;
    initiative_id: number;
    action: string;
    old_status?: string;
    new_status?: string;
    created_at: string;
    user_name?: string; // Optional, depends on backend
    reason?: string;
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

    requestCancellation: async (id: string | number, reason: string) => {
        const response = await api.post(`/private/initiatives/${id}/request-cancellation`, { reason });
        return response.data;
    },

    getCancellationRequests: async () => {
        const response = await api.get('/private/cancellation-requests');
        return response.data;
    },

    reviewCancellation: async (id: number, approved: boolean, reason: string) => {
        const response = await api.post(`/private/cancellation-requests/${id}/review`, { approved, reason });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get(`/private/initiatives/${id}`);
        return response.data;
    },

    getSubmitted: async () => {
        const response = await api.get('/private/initiatives/submitted');
        return response.data.data;
    },

    reviewInitiative: async (id: number, approved: boolean, reason: string) => {
        const response = await api.post(`/private/initiatives/${id}/review`, { approved, reason });
        return response.data;
    },
};
