import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
    try {
        if (!GROQ_API_KEY) {
            return NextResponse.json({
                error: 'API key not configured'
            }, { status: 500 });
        }

        const { topic, domain, difficulty, questionCount } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const systemPrompt = `You are an expert educator creating assessment questions. Generate ${questionCount || 5} multiple-choice questions about "${topic}" in the ${domain || 'technology'} domain at ${difficulty || 'intermediate'} difficulty level.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "The question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

REQUIREMENTS:
1. Each question must have exactly 4 options
2. correctAnswer is the index (0-3) of the correct option
3. Questions should progressively test understanding
4. For ${difficulty} level:
   - beginner: Basic concepts and definitions
   - intermediate: Application and analysis
   - advanced: Complex scenarios and synthesis
5. Return ONLY valid JSON, no markdown`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Generate ${questionCount} questions about: ${topic}` },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', errorData);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON
        let assessmentData;
        try {
            let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            assessmentData = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Failed to parse assessment JSON:', content);
            throw new Error('Failed to parse AI response');
        }

        return NextResponse.json(assessmentData);

    } catch (error) {
        console.error('Assessment generation error:', error);
        return NextResponse.json({
            error: 'Failed to generate assessment',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
