/**
 * API Request Hook
 * Simplifies API calls with loading, error, and success states
 */

import { useState, useCallback } from 'react';
import { apiRequest, ApiError } from '../lib/api';

interface UseApiRequestState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

interface UseApiRequestReturn<T> extends UseApiRequestState<T> {
    execute: (endpoint: string, options?: RequestInit) => Promise<T | null>;
    reset: () => void;
    setSuccess: (message: string) => void;
    setError: (message: string) => void;
}

export function useApiRequest<T = any>(): UseApiRequestReturn<T> {
    const [state, setState] = useState<UseApiRequestState<T>>({
        data: null,
        loading: false,
        error: null,
        success: null,
    });

    const execute = useCallback(async (endpoint: string, options?: RequestInit) => {
        setState(prev => ({ ...prev, loading: true, error: null, success: null }));

        try {
            const data = await apiRequest<T>(endpoint, options);
            setState({ data, loading: false, error: null, success: null });
            return data;
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : error instanceof Error
                    ? error.message
                    : 'An unknown error occurred';

            setState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null, success: null });
    }, []);

    const setSuccess = useCallback((message: string) => {
        setState(prev => ({ ...prev, success: message, error: null }));
    }, []);

    const setError = useCallback((message: string) => {
        setState(prev => ({ ...prev, error: message, success: null }));
    }, []);

    return {
        ...state,
        execute,
        reset,
        setSuccess,
        setError,
    };
}
