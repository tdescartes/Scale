import { NextRequest, NextResponse } from 'next/server';
import { toggleAutoScaling } from '@/lib/metricsService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { enabled } = body;

        if (typeof enabled !== 'boolean') {
            return NextResponse.json({ success: false, error: 'enabled (boolean) is required' }, { status: 400 });
        }

        const result = toggleAutoScaling(enabled);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error toggling autoscaling:', error);
        return NextResponse.json({ success: false, error: 'Failed to toggle autoscaling' }, { status: 500 });
    }
}
