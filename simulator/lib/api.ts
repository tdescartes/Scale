/**
 * API Utility
 * Lightweight fetch wrapper to replace axios dependency
 */

import { API_CONFIG } from './config';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T = any>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_CONFIG.apiUrl}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            throw new ApiError(response.status, errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Convenience methods
export const api = {
    get: <T = any>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: 'GET' }),

    post: <T = any>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T = any>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T = any>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: 'DELETE' }),
};
