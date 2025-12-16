import api from '@/api/axios';
import type { Initiative } from './initiativesService';

export interface PrioritizationData {
    id: number;
    sector_id: number;
    sector_name: string;
    year: number;
    is_locked: boolean;
    initiatives: Initiative[];
    created_by_user_id: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface ChangeRequest {
    id: number;
    prioritization_id: number;
    requested_by_user_id: number;
    requested_by_name: string;
    new_priority_order: number[];
    reason: string;
    status: 'Pendente' | 'Aprovado' | 'Recusado';
    created_at: string;
    sector_name?: string; // Optional helper
}

export interface AdminAllPrioritizations {
    year: number;
    sectors: PrioritizationData[];
}

export const prioritizationService = {
    // 1. Get My Sector Prioritization (User)
    getMyPrioritization: async (year: number) => {
        const response = await api.get(`/private/prioritization?year=${year}`);
        return response.data;
    },

    // 2. Save Prioritization (User/Admin)
    savePrioritization: async (year: number, priority_order: number[]) => {
        const response = await api.post('/private/prioritization', {
            year,
            priority_order
        });
        return response.data;
    },

    // 3. Request Change (User when locked)
    requestChange: async (year: number, new_priority_order: number[], reason: string) => {
        const response = await api.post(`/private/prioritization/request-change?year=${year}`, {
            new_priority_order,
            reason
        });
        return response.data;
    },

    // 4. Get All Sectors (Admin)
    getAllPrioritizations: async (year: number) => {
        const response = await api.get(`/private/prioritization/all?year=${year}`);
        return response.data;
    },

    // 5. List Pending Requests (Admin)
    getPendingRequests: async () => {
        const response = await api.get('/private/prioritization/change-requests');
        return response.data;
    },

    // 6. Review Request (Admin)
    reviewRequest: async (requestId: number, approved: boolean, reason?: string) => {
        const response = await api.post(`/private/prioritization/change-requests/${requestId}/review`, {
            approved,
            reason
        });
        return response.data;
    }
};
