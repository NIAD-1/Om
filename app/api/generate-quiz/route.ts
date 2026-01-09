import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
    try {
        const { lessonContent, lessonName } = await request.json();

        const systemPrompt = `You are an expert quiz generator. Generate a QUICK quiz (3-5 questions only).

CRITICAL: Return ONLY valid JSON, no markdown.

Format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ]
}

Generate 3-5 simple multiple-choice questions to test basic understanding.`;

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
                    { role: 'user', content: `Generate a quick quiz for: ${lessonName}\n\nContent: ${lessonContent}` }
                ],
                temperature: 0.7,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) throw new Error('Groq API error');

        const data = await response.json();
        const quizText = data.choices[0].message.content;

        let quiz;
        try {
            let cleaned = quizText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }
            quiz = JSON.parse(cleaned.trim().replace(/,(\s*[}\]])/g, '$1'));
        } catch {
            throw new Error('Invalid quiz format');
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error generating quiz:', error);
        return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
}
