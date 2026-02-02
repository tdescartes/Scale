/**
 * Metrics Service (Singleton State)
 * Manages all load balancer metrics, autoscaling, and algorithm state
 */

// Constants
const MIN_PODS = 2;
const MAX_PODS = 10;
const SCALE_UP_THRESHOLD = 1200;
const SCALE_DOWN_THRESHOLD = 800;
const SCALE_COOLDOWN_SECONDS = 30;
const MAX_HISTORY_SIZE = 100;

export interface Pod {
    name: string;
    requests: number;
    successful_requests: number;
    errors_4xx: number;
    errors_5xx: number;
    total_errors: number;
    response_time_ms: number;
    response_time_p50: number;
    response_time_p90: number;
    response_time_p95: number;
    response_time_p99: number;
    cpu_usage: number;
    memory_usage: number;
    error_rate: number;
    active_connections: number;
    health_status: string;
    health_check_failures: number;
    last_health_check: number;
    throughput_rps: number;
}

export interface ScalingStatus {
    current_pods: number;
    min_pods: number;
    max_pods: number;
    avg_load_per_pod: number;
    auto_scaling_enabled: boolean;
}

export interface FailureInjection {
    type: string;
    severity: string;
    duration: number;
    target?: string;
    start_time: number;
    end_time: number;
}

export interface Metrics {
    pods: Pod[];
    total_requests: number;
    total_errors_4xx: number;
    total_errors_5xx: number;
    timestamp: number;
    algorithm: string;
    health_check_interval: number;
    pod_count: number;
    scaling_status: ScalingStatus;
    failure_injection: FailureInjection | null;
}

export interface HistoricalSnapshot {
    timestamp: number;
    pod_count: number;
    total_requests: number;
    pods: {
        name: string;
        requests: number;
        response_time_ms: number;
        error_rate: number;
        cpu_usage: number;
        memory_usage: number;
    }[];
}

// Singleton state
class MetricsState {
    currentPodCount = 3;
    historicalMetrics: HistoricalSnapshot[] = [];
    lastScaleTime = Date.now() / 1000;
    currentAlgorithm = 'round_robin';
    failureInjection: FailureInjection | null = null;
    autoScalingEnabled = true;
}

// Global singleton instance
const state = new MetricsState();

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function handleAutoscaling(totalRequests: number): void {
    const currentTime = Date.now() / 1000;
    if (!state.autoScalingEnabled || currentTime - state.lastScaleTime < SCALE_COOLDOWN_SECONDS) {
        return;
    }

    const avgLoad = state.currentPodCount > 0 ? totalRequests / state.currentPodCount : 0;

    if (avgLoad > SCALE_UP_THRESHOLD && state.currentPodCount < MAX_PODS) {
        state.currentPodCount += 1;
        state.lastScaleTime = currentTime;
        console.log(`Scaling UP: ${state.currentPodCount - 1} -> ${state.currentPodCount} pods (avg: ${avgLoad.toFixed(1)})`);
    } else if (avgLoad < SCALE_DOWN_THRESHOLD && state.currentPodCount > MIN_PODS) {
        state.currentPodCount -= 1;
        state.lastScaleTime = currentTime;
        console.log(`Scaling DOWN: ${state.currentPodCount + 1} -> ${state.currentPodCount} pods (avg: ${avgLoad.toFixed(1)})`);
    }
}

function storeHistoricalSnapshot(metrics: Metrics): void {
    const snapshot: HistoricalSnapshot = {
        timestamp: metrics.timestamp,
        pod_count: metrics.pod_count,
        total_requests: metrics.total_requests,
        pods: metrics.pods.map(pod => ({
            name: pod.name,
            requests: pod.requests,
            response_time_ms: pod.response_time_ms,
            error_rate: pod.error_rate,
            cpu_usage: pod.cpu_usage,
            memory_usage: pod.memory_usage,
        })),
    };

    state.historicalMetrics.push(snapshot);

    if (state.historicalMetrics.length > MAX_HISTORY_SIZE) {
        state.historicalMetrics.shift();
    }
}

function clearExpiredFailure(): void {
    if (state.failureInjection && Date.now() / 1000 > state.failureInjection.end_time) {
        console.log(`Failure injection expired: ${state.failureInjection.type}`);
        state.failureInjection = null;
    }
}

// Exported service functions
export function getMetrics(): Metrics {
    const pods: Pod[] = [];
    let totalRequests = 0;
    let totalErrors4xx = 0;
    let totalErrors5xx = 0;

    const baseRequestsPerPod = randomInt(800, 1400);

    for (let i = 0; i < state.currentPodCount; i++) {
        const variance = i === state.currentPodCount - 1 ? randomInt(-100, 150) : randomInt(-50, 50);
        const requests = baseRequestsPerPod + variance;

        const healthCheckFailures = randomInt(0, 2);
        const isHealthy = healthCheckFailures < 2;

        const error4xx = randomInt(5, 20);
        const error5xx = randomInt(0, 5);
        const totalErrors = error4xx + error5xx;

        totalRequests += requests;
        totalErrors4xx += error4xx;
        totalErrors5xx += error5xx;

        pods.push({
            name: `backend-pod-${i}`,
            requests,
            successful_requests: requests - totalErrors,
            errors_4xx: error4xx,
            errors_5xx: error5xx,
            total_errors: totalErrors,
            response_time_ms: randomFloat(40, 60),
            response_time_p50: randomFloat(35, 45),
            response_time_p90: randomFloat(55, 75),
            response_time_p95: randomFloat(70, 95),
            response_time_p99: randomFloat(100, 150),
            cpu_usage: randomFloat(30, 70),
            memory_usage: randomFloat(40, 60),
            error_rate: requests > 0 ? totalErrors / requests : 0,
            active_connections: randomInt(50, 150),
            health_status: isHealthy ? 'healthy' : 'degraded',
            health_check_failures: healthCheckFailures,
            last_health_check: Date.now() / 1000 - randomFloat(0, 10),
            throughput_rps: requests / 60,
        });
    }

    // Auto-scaling logic
    handleAutoscaling(totalRequests);

    const metricsSnapshot: Metrics = {
        pods,
        total_requests: totalRequests,
        total_errors_4xx: totalErrors4xx,
        total_errors_5xx: totalErrors5xx,
        timestamp: Date.now() / 1000,
        algorithm: state.currentAlgorithm,
        health_check_interval: 5,
        pod_count: state.currentPodCount,
        scaling_status: {
            current_pods: state.currentPodCount,
            min_pods: MIN_PODS,
            max_pods: MAX_PODS,
            avg_load_per_pod: state.currentPodCount > 0 ? totalRequests / state.currentPodCount : 0,
            auto_scaling_enabled: state.autoScalingEnabled,
        },
        failure_injection: state.failureInjection,
    };

    clearExpiredFailure();
    storeHistoricalSnapshot(metricsSnapshot);

    return metricsSnapshot;
}

export function getHistoricalMetrics(minutes: number = 5): HistoricalSnapshot[] {
    if (state.historicalMetrics.length === 0) {
        return [];
    }

    const currentTime = Date.now() / 1000;
    const cutoffTime = currentTime - minutes * 60;

    return state.historicalMetrics.filter(m => m.timestamp >= cutoffTime);
}

export function setAlgorithm(algorithm: string): { success: boolean; algorithm?: string; message?: string; error?: string } {
    const validAlgorithms = ['round_robin', 'least_connections', 'ip_hash', 'weighted_round_robin', 'least_response_time'];

    if (!validAlgorithms.includes(algorithm)) {
        return { success: false, error: 'Invalid algorithm' };
    }

    state.currentAlgorithm = algorithm;
    console.log(`Algorithm changed to: ${algorithm}`);
    return { success: true, algorithm, message: `Load balancing algorithm changed to ${algorithm}` };
}

export function toggleAutoScaling(enabled: boolean): { success: boolean; enabled: boolean; config: { min_pods: number; max_pods: number; current_pods: number }; message: string } {
    state.autoScalingEnabled = enabled;
    const status = enabled ? 'enabled' : 'disabled';
    console.log(`Auto-scaling ${status}`);

    return {
        success: true,
        enabled,
        config: {
            min_pods: MIN_PODS,
            max_pods: MAX_PODS,
            current_pods: state.currentPodCount,
        },
        message: `Dynamic pod scaling ${status}`,
    };
}

export function injectFailure(config: { type: string; severity: string; duration: number; target?: string }): { success: boolean; message: string } {
    state.failureInjection = {
        ...config,
        start_time: Date.now() / 1000,
        end_time: Date.now() / 1000 + (config.duration || 60),
    };

    console.log(`Injecting ${config.type} failure for ${config.duration}s`);
    return {
        success: true,
        message: `${config.type} failure injected for ${config.duration}s`,
    };
}

export function getHealthCheckEvents(): { pod: string; status: string; timestamp: number }[] {
    const statuses = ['passed', 'passed', 'passed', 'failed'];
    return Array.from({ length: Math.min(5, state.currentPodCount) }, (_, i) => ({
        pod: `backend-pod-${i}`,
        status: statuses[randomInt(0, statuses.length - 1)],
        timestamp: Date.now() / 1000 - randomFloat(0, 60),
    }));
}

export function getFailoverEvents(): { failed_pod: string; reason: string; requests_redirected: number; timestamp: number }[] {
    const reasons = ['health_check_failed', 'high_error_rate', 'timeout'];
    const count = randomInt(0, 2);
    return Array.from({ length: count }, () => ({
        failed_pod: `backend-pod-${randomInt(0, 2)}`,
        reason: reasons[randomInt(0, reasons.length - 1)],
        requests_redirected: randomInt(100, 500),
        timestamp: Date.now() / 1000 - randomFloat(0, 120),
    }));
}
