/**
 * API Configuration
 * Returns API and WebSocket URLs from environment variables with fallback to localhost
 */

export const API_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
};
