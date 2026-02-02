/**
 * Server-Sent Events Hook
 * Manages SSE connection for real-time metrics streaming
 * Replaces WebSocket for simpler Next.js integration
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSSEOptions {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onOpen?: () => void;
    onError?: (error: Event) => void;
}

interface UseSSEReturn {
    isConnected: boolean;
    data: any;
    reconnect: () => void;
}

export function useSSE(
    url: string,
    options: UseSSEOptions = {}
): UseSSEReturn {
    const {
        reconnectInterval = 3000,
        maxReconnectAttempts = Infinity,
        onOpen,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [data, setData] = useState<any>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('SSE connected to:', url);
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                onOpen?.();
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    setData(parsedData);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                setIsConnected(false);
                onError?.(error);

                eventSource.close();
                eventSourceRef.current = null;

                // Attempt reconnection
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current += 1;
                    console.log(`SSE reconnecting... attempt ${reconnectAttemptsRef.current}`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };
        } catch (error) {
            console.error('Error creating EventSource:', error);
        }
    }, [url, reconnectInterval, maxReconnectAttempts, onOpen, onError]);

    const reconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        connect();
    }, [connect]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [connect]);

    return { isConnected, data, reconnect };
}
