import { NextRequest, NextResponse } from 'next/server';
import { injectFailure } from '@/lib/metricsService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, severity, duration, target } = body;

        if (!type || !severity || !duration) {
            return NextResponse.json({ success: false, error: 'type, severity, and duration are required' }, { status: 400 });
        }

        const result = injectFailure({ type, severity, duration, target });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error injecting failure:', error);
        return NextResponse.json({ success: false, error: 'Failed to inject failure' }, { status: 500 });
    }
}
