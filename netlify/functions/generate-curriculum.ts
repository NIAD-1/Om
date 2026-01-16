import { Handler, HandlerEvent } from '@netlify/functions';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface CurriculumRequest {
  field: string;
  subdomain?: string;
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { field, subdomain }: CurriculumRequest = JSON.parse(event.body || '{}');

    if (!field) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Field is required' }),
      };
    }

    const systemPrompt = `You are an expert curriculum designer. Generate a comprehensive, hierarchical curriculum for mastery-based learning.

The curriculum must follow this exact structure:
{
  "modules": [
    {
      "id": "unique-id",
      "name": "Module Name",
      "description": "Brief description",
      "prerequisites": [],
      "topics": [
        {
          "id": "unique-id",
          "name": "Topic Name",
          "description": "Brief description",
          "prerequisites": [],
          "lessons": [
            {
              "id": "unique-id",
              "name": "Lesson Name",
              "prerequisites": [],
              "estimatedMinutes": 60,
              "content": {
                "summary": "Markdown summary of key concepts",
                "resources": [
                  {
                    "type": "video",
                    "title": "Resource title",
                    "url": "https://actual-url.com",
                    "authority": "MIT OCW",
                    "duration": "45min"
                  }
                ]
              },
              "examId": "exam-id"
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Use REAL, AUTHORITATIVE resources (MIT OCW, 3Blue1Brown, Khan Academy, official documentation)
2. PREFER RECENT CONTENT: Prioritize resources from 2022-2024 when available for up-to-date information
3. Structure from foundational to advanced concepts
4. Create logical prerequisite chains
5. Each lesson should have 2-4 high-quality resources
6. Estimated times should be realistic
7. For videos, include "startTime" and "endTime" (in seconds) if only a portion is relevant
8. Include "chapters" array with {title, time} for key video sections when applicable
9. Return ONLY valid JSON, no markdown formatting`;

    const userPrompt = subdomain
      ? `Generate a mastery-based curriculum for: ${field} - ${subdomain}`
      : `Generate a mastery-based curriculum for: ${field}`;

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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const curriculumText = data.choices[0].message.content;

    // Parse the JSON response
    let curriculum;
    try {
      // Remove markdown code blocks if present
      const cleaned = curriculumText.replace(/```json\n?|\n?```/g, '').trim();
      curriculum = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse curriculum:', curriculumText);
      throw new Error('Invalid curriculum format from AI');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(curriculum),
    };
  } catch (error) {
    console.error('Error generating curriculum:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
