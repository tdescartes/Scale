import { NextRequest, NextResponse } from 'next/server';

// Scenario configurations
const scenarioConfigs: Record<string, (duration: number) => { users: number; spawn_rate: number; duration: number; description: string }> = {
    high_traffic: (duration) => ({
        users: 500,
        spawn_rate: 50,
        duration,
        description: 'High traffic load testing scenario with 500 concurrent users',
    }),
    spike: (duration) => ({
        users: 1000,
        spawn_rate: 200,
        duration: Math.max(30, duration),
        description: 'Traffic spike scenario with rapid user increase',
    }),
    sustained: (duration) => ({
        users: 200,
        spawn_rate: 20,
        duration: Math.max(120, duration),
        description: 'Sustained load testing for stability analysis',
    }),
    gradual_ramp: (duration) => ({
        users: 300,
        spawn_rate: 5,
        duration,
        description: 'Gradual ramp-up to identify capacity limits',
    }),
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type = 'high_traffic', duration = 60 } = body;

        const configGenerator = scenarioConfigs[type] || scenarioConfigs.high_traffic;
        const config = configGenerator(duration);

        return NextResponse.json({
            success: true,
            scenario: {
                type,
                config,
            },
        });
    } catch (error) {
        console.error('Error generating scenario:', error);
        return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
    }
}
