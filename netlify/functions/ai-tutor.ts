import { Handler, HandlerEvent } from '@netlify/functions';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface TutorRequest {
    message: string;
    lessonContext?: string;
    chatHistory?: Array<{ role: string; content: string }>;
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { message, lessonContext, chatHistory = [] }: TutorRequest = JSON.parse(event.body || '{}');

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' }),
            };
        }

        const systemPrompt = `You are a Socratic tutor helping a student achieve mastery in their chosen field.

TEACHING PHILOSOPHY:
1. Guide, don't tell - ask questions that lead to understanding
2. Build on prerequisite knowledge systematically
3. Use concrete examples and analogies
4. Encourage the student to think through problems
5. Provide hints before giving direct answers
6. Break complex topics into digestible parts

FORMATTING:
- Use LaTeX for math (wrapped in $$): $$E = mc^2$$
- Use code blocks for code: \`\`\`python\n...\n\`\`\`
- Be concise but thorough
- Use bullet points for clarity

${lessonContext ? `CURRENT LESSON CONTEXT: ${lessonContext}` : ''}

Remember: Your goal is deep understanding, not just correct answers.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: message },
        ];

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
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const tutorResponse = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ response: tutorResponse }),
        };
    } catch (error) {
        console.error('Error in AI tutor:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to get tutor response',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
        };
    }
};
