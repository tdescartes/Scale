import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metricsService';

export async function GET() {
    try {
        const metrics = getMetrics();
        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Error getting metrics:', error);
        return NextResponse.json({ error: 'Failed to get metrics' }, { status: 500 });
    }
}
