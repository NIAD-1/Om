import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { goal, domain } = await request.json();

    const systemPrompt = `You are an expert career advisor and curriculum designer. Generate a complete career roadmap.

CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanations.

Structure:
{
  "title": "Career Goal Roadmap",
  "description": "Path description",
  "domain": "technology",
  "curricula": [
    {
      "title": "Step 1 Title",
      "order": 1,
      "modules": [
        {
          "id": "module-1",
          "name": "Module Name",
          "topics": [
            {
              "id": "topic-1",
              "name": "Topic Name",
              "lessons": [
                {
                  "id": "lesson-1",
                  "name": "Lesson Name",
                  "estimatedMinutes": 45,
                  "prerequisites": [],
                  "content": {
                    "summary": "Lesson description with **bold** text",
                    "resources": [
                      {
                        "type": "video",
                        "title": "Resource Title",
                        "url": "https://youtube.com/watch?v=...",
                        "duration": "15 min",
                        "authority": "Channel/Author"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ],
      "projects": []
    }
  ]
}

Generate 3-5 curricula (steps) in logical order for achieving the goal.`;

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
          { role: 'user', content: `Generate a complete roadmap for: ${goal}\nDomain: ${domain}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const roadmapText = data.choices[0].message.content;

    // Parse JSON
    let roadmap;
    try {
      let cleaned = roadmapText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      cleaned = cleaned.trim().replace(/,(\s*[}\]])/g, '$1');
      roadmap = JSON.parse(cleaned);

      if (!roadmap.title || !roadmap.curricula) {
        throw new Error('Invalid roadmap format');
      }
    } catch (parseError) {
      console.error('Failed to parse roadmap:', roadmapText.substring(0, 500));
      throw new Error(`Invalid roadmap format from AI`);
    }

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
