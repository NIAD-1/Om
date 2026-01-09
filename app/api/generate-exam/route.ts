import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
    try {
        const { lessonContent, lessonName } = await request.json();

        const systemPrompt = `You are an expert exam generator. Generate a COMPREHENSIVE and CHALLENGING exam.

CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanations.

The JSON must have this EXACT structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "points": 10,
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "type": "code",
      "question": "Write a function that...",
      "starterCode": "function solution() {\\n  // Your code here\\n}",
      "testCases": [
        {"input": "test input", "expected": "expected output"}
      ],
      "explanation": "Solution explanation",
      "points": 20,
      "difficulty": "hard"
    }
  ],
  "passingScore": 85,
  "totalPoints": 100
}

IMPORTANT: Generate 10-15 questions with varying difficulty:
- 3-4 easy questions (basic concepts)
- 5-6 medium questions (application)
- 3-4 hard questions (analysis/synthesis)
- Mix of multiple-choice AND code problems
- Include real-world scenarios
- Questions should thoroughly test understanding`;

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
                    { role: 'user', content: `Generate a comprehensive exam for: ${lessonName}\n\nLesson Content:\n${lessonContent}` }
                ],
                temperature: 0.7,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', response.status, response.statusText, errorData);
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const examText = data.choices[0].message.content;

        // Parse with robust cleaning
        let exam;
        try {
            let cleaned = examText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }

            cleaned = cleaned.trim();
            cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

            exam = JSON.parse(cleaned);

            if (!exam.questions || !Array.isArray(exam.questions)) {
                throw new Error('Invalid exam format');
            }
        } catch (parseError) {
            console.error('Failed to parse exam:', examText.substring(0, 500));
            throw new Error(`Invalid exam format from AI`);
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Error generating exam:', error);
        return NextResponse.json(
            { error: 'Failed to generate exam', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
