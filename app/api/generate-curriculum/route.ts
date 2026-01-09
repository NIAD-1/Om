import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { field, subdomain } = await request.json();

    if (!field) {
      return NextResponse.json({ error: 'Field is required' }, { status: 400 });
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
2. Structure from foundational to advanced concepts
3. Create logical prerequisite chains
4. Each lesson should have 2-4 high-quality resources
5. Estimated times should be realistic
6. Return ONLY valid JSON, no markdown formatting`;

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
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error Details:', errorData);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const curriculumText = data.choices[0].message.content;

    // Parse the JSON response with robust cleaning
    let curriculum;
    try {
      // Remove markdown code fences
      let cleaned = curriculumText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to find JSON object boundaries
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      cleaned = cleaned.trim();

      // Auto-repair common JSON issues
      // Remove trailing commas before closing brackets/braces
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      // Fix missing commas between consecutive objects/arrays
      cleaned = cleaned.replace(/}(\s*){/g, '},{');
      cleaned = cleaned.replace(/](\s*)\[/g, '],$1[');

      curriculum = JSON.parse(cleaned);

      // Validate structure
      if (!curriculum.modules || !Array.isArray(curriculum.modules)) {
        throw new Error('Missing or invalid modules array');
      }
    } catch (parseError) {
      console.error('Failed to parse curriculum (first 500 chars):', curriculumText.substring(0, 500));
      console.error('Parse error:', parseError);
      throw new Error(`Invalid curriculum format from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error('Error generating curriculum:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate curriculum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
