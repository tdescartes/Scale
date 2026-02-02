import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalMetrics } from '@/lib/metricsService';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const minutes = parseInt(searchParams.get('minutes') || '5', 10);

        const history = getHistoricalMetrics(minutes);
        // Return in the format expected by HistoricalChart
        return NextResponse.json({ historical_metrics: history });
    } catch (error) {
        console.error('Error getting historical metrics:', error);
        return NextResponse.json({ error: 'Failed to get historical metrics' }, { status: 500 });
    }
}
