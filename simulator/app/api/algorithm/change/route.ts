import { NextRequest, NextResponse } from 'next/server';
import { setAlgorithm } from '@/lib/metricsService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { algorithm } = body;

        if (!algorithm) {
            return NextResponse.json({ success: false, error: 'Algorithm is required' }, { status: 400 });
        }

        const result = setAlgorithm(algorithm);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error changing algorithm:', error);
        return NextResponse.json({ success: false, error: 'Failed to change algorithm' }, { status: 500 });
    }
}
