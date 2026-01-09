import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', errorData);
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const message = data.choices[0].message.content;

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error in AI tutor:', error);
        return NextResponse.json(
            {
                error: 'Failed to get AI response',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
