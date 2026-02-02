import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory load test state
const activeTests: Map<string, { status: string; config: any; startTime: number }> = new Map();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { target_url, users, duration, spawn_rate } = body;

        // Generate a unique test ID
        const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store the test configuration
        activeTests.set(testId, {
            status: 'running',
            config: { target_url, users, duration, spawn_rate },
            startTime: Date.now(),
        });

        // Simulate test completion after duration
        setTimeout(() => {
            const test = activeTests.get(testId);
            if (test && test.status === 'running') {
                test.status = 'completed';
            }
        }, duration * 1000);

        return NextResponse.json({
            test_id: testId,
            status: 'running',
            message: `Load test started with ${users} users`,
        });
    } catch (error) {
        console.error('Error starting load test:', error);
        return NextResponse.json({ error: 'Failed to start load test' }, { status: 500 });
    }
}
