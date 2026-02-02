/**
 * Shared Utility Functions
 * Common helpers used across components
 */

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

export function formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        healthy: 'green',
        degraded: 'yellow',
        unhealthy: 'red',
        completed: 'green',
        running: 'blue',
        failed: 'red',
    };
    return colors[status] || 'gray';
}

export function calculateBalanceScore(pods: any[]): number {
    if (!pods || pods.length === 0) return 1;

    const requests = pods.map(p => p.requests || 0);
    const avg = requests.reduce((a, b) => a + b, 0) / requests.length;

    if (avg === 0) return 1;

    const variance = requests.reduce((sum, req) => {
        return sum + Math.pow(req - avg, 2);
    }, 0) / requests.length;

    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg; // Coefficient of variation

    // Score from 0 to 1, where 1 is perfectly balanced
    return Math.max(0, 1 - cv);
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function getPercentageColor(value: number, thresholds = { low: 60, high: 80 }): string {
    if (value > thresholds.high) return 'text-red-600';
    if (value > thresholds.low) return 'text-yellow-600';
    return 'text-green-600';
}

export function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
}

export function parseScenarioType(scenario: string): string {
    return scenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
