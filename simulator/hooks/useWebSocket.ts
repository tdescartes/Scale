/**
 * WebSocket Hook
 * Manages WebSocket connection with automatic reconnection
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    data: any;
    send: (data: any) => void;
    reconnect: () => void;
}

export function useWebSocket(
    url: string,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn {
    const {
        reconnectInterval = 5000,
        maxReconnectAttempts = Infinity,
        onOpen,
        onClose,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [data, setData] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const shouldReconnectRef = useRef(true);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    setData(parsedData);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError?.(error);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                wsRef.current = null;
                onClose?.();

                // Attempt to reconnect if within limits
                if (
                    shouldReconnectRef.current &&
                    reconnectAttemptsRef.current < maxReconnectAttempts
                ) {
                    reconnectAttemptsRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log(
                            `Reconnecting... (attempt ${reconnectAttemptsRef.current})`
                        );
                        connect();
                    }, reconnectInterval);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Error creating WebSocket:', error);
        }
    }, [url, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onError]);

    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const send = useCallback((data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        shouldReconnectRef.current = true;
        reconnectAttemptsRef.current = 0;
        connect();
    }, [connect, disconnect]);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return { isConnected, data, send, reconnect };
}
