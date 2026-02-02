import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metricsService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const encoder = new TextEncoder();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
        start(controller) {
            const sendMetrics = () => {
                try {
                    const metrics = getMetrics();
                    const data = `data: ${JSON.stringify(metrics)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch {
                    // Silently ignore errors when controller is closed
                }
            };

            // Send initial metrics
            sendMetrics();

            // Set up interval
            intervalId = setInterval(sendMetrics, 1000);
        },
        cancel() {
            if (intervalId) {
                clearInterval(intervalId);
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
