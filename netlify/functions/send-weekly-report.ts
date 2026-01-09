import { Handler, HandlerEvent } from '@netlify/functions';
import emailjs from '@emailjs/nodejs';

interface WeeklyReportRequest {
    userId: string;
    userEmail: string;
    progress: {
        totalDomains: number;
        activeDomains: number;
        completedLessons: number;
        masteredTopics: number;
        currentStreak: number;
        weeklyActivity: number;
    };
    nextRecommendations: Array<{
        domain: string;
        lesson: string;
    }>;
}

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const reportData: WeeklyReportRequest = JSON.parse(event.body || '{}');

        const {
            userEmail,
            progress,
            nextRecommendations
        } = reportData;

        // EmailJS configuration
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

        const emailParams = {
            to_email: userEmail,
            subject: `📊 Your Weekly Mastery Audit - Week of ${new Date().toLocaleDateString()}`,
            total_domains: progress.totalDomains,
            active_domains: progress.activeDomains,
            completed_lessons: progress.completedLessons,
            mastered_topics: progress.masteredTopics,
            current_streak: progress.currentStreak,
            weekly_activity: progress.weeklyActivity,
            recommendations: nextRecommendations
                .map((rec, index) => `${index + 1}. ${rec.domain}: ${rec.lesson}`)
                .join('\n'),
            report_date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        };

        // Send email via EmailJS
        await emailjs.send(serviceId, templateId, emailParams, {
            publicKey: publicKey,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ success: true, message: 'Weekly report sent successfully' }),
        };
    } catch (error) {
        console.error('Error sending weekly report:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to send weekly report',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
