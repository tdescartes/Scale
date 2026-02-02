import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ testId: string }> }
) {
    try {
        const { testId } = await params;

        // In a real implementation, we would stop the actual test
        // For now, just acknowledge the stop request
        return NextResponse.json({
            success: true,
            message: `Test ${testId} stopped`,
        });
    } catch (error) {
        console.error('Error stopping load test:', error);
        return NextResponse.json({ error: 'Failed to stop load test' }, { status: 500 });
    }
}
