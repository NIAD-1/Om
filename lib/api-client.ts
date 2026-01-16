/**
 * API client for Next.js API routes (works on both local dev and Vercel)
 */

// Always use Next.js API routes (works on Vercel and local dev)
const apiBase = '/api';

export async function generateCurriculum(field: string, subdomain?: string) {
    const response = await fetch(`${apiBase}/generate-curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, subdomain }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to generate curriculum');
    }

    return response.json();
}

export async function generateExam(lessonName: string, lessonSummary: string) {
    const response = await fetch(`${apiBase}/generate-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonName, lessonSummary }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate exam');
    }

    return response.json();
}

export async function askTutor(
    message: string,
    lessonContext?: string,
    chatHistory?: Array<{ role: string; content: string }>
) {
    const response = await fetch(`${apiBase}/ai-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, lessonContext, chatHistory }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to get tutor response');
    }

    const data = await response.json();
    return data.response;
}

export async function sendWeeklyReport(reportData: any) {
    const response = await fetch(`${apiBase}/send-weekly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send weekly report');
    }

    return response.json();
}
