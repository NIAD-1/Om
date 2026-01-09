import { Handler, HandlerEvent } from '@netlify/functions';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ExamRequest {
    lessonName: string;
    lessonSummary: string;
    difficulty?: 'mixed' | 'hard';
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { lessonName, lessonSummary, difficulty = 'mixed' }: ExamRequest = JSON.parse(event.body || '{}');

        if (!lessonName || !lessonSummary) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Lesson name and summary are required' }),
            };
        }

        const systemPrompt = `You are an expert exam designer creating rigorous assessments for mastery-based learning.

Generate exactly 10-12 challenging questions that test deep understanding, not just memorization.

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text (use $$LaTeX$$ for math)",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "hard"
    }
  ],
  "passingScore": 85,
  "timeLimit": 45
}

REQUIREMENTS:
1. Questions should test APPLICATION and ANALYSIS, not just recall
2. Use LaTeX (wrapped in $$) for mathematical notation
3. Use code blocks with \`\`\` for programming questions
4. Wrong answers should be plausible (test common misconceptions)
5. Mix difficulty: 30% hard, 50% medium, 20% easy
6. No markdown formatting around the JSON`;

        const userPrompt = `Generate a rigorous exam for this lesson:
Lesson: ${lessonName}
Content: ${lessonSummary}
Difficulty focus: ${difficulty}`;

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
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.8,
                max_tokens: 2500,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const examText = data.choices[0].message.content;

        // Parse the JSON response
        let exam;
        try {
            const cleaned = examText.replace(/```json\n?|\n?```/g, '').trim();
            exam = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Failed to parse exam:', examText);
            throw new Error('Invalid exam format from AI');
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exam),
        };
    } catch (error) {
        console.error('Error generating exam:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to generate exam',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
        };
    }
};
