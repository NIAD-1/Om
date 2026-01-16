import { NextRequest, NextResponse } from 'next/server';

// Use NewsData.io free tier - 200 requests/day
const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
}

// Domain-specific configurations with real news sources
const DOMAIN_CONFIG: Record<string, { keywords: string[], sources: NewsArticle[] }> = {
    'technology': {
        keywords: ['technology', 'software', 'programming'],
        sources: [
            { title: 'Hacker News - Tech News', description: 'Latest tech discussions from the developer community', url: 'https://news.ycombinator.com', source: 'Hacker News', publishedAt: new Date().toISOString() },
            { title: 'TechCrunch - Startup & Tech', description: 'Breaking news on startups, technology, and venture capital', url: 'https://techcrunch.com', source: 'TechCrunch', publishedAt: new Date().toISOString() },
            { title: 'The Verge - Tech News', description: 'Technology, science, art, and culture', url: 'https://theverge.com', source: 'The Verge', publishedAt: new Date().toISOString() },
            { title: 'Ars Technica', description: 'Technology news and analysis', url: 'https://arstechnica.com', source: 'Ars Technica', publishedAt: new Date().toISOString() },
        ]
    },
    'ai-ml': {
        keywords: ['artificial intelligence', 'machine learning', 'AI'],
        sources: [
            { title: 'AI Research Papers - arXiv', description: 'Latest AI and ML research papers', url: 'https://arxiv.org/list/cs.AI/recent', source: 'arXiv', publishedAt: new Date().toISOString() },
            { title: 'Google AI Blog', description: 'Latest updates from Google AI research', url: 'https://ai.googleblog.com', source: 'Google AI', publishedAt: new Date().toISOString() },
            { title: 'OpenAI Blog', description: 'Research and announcements from OpenAI', url: 'https://openai.com/blog', source: 'OpenAI', publishedAt: new Date().toISOString() },
            { title: 'Hugging Face Blog', description: 'ML tutorials and model updates', url: 'https://huggingface.co/blog', source: 'Hugging Face', publishedAt: new Date().toISOString() },
        ]
    },
    'finance': {
        keywords: ['finance', 'stock market', 'investment'],
        sources: [
            { title: 'CNBC Markets', description: 'Stock market news, data and analysis', url: 'https://cnbc.com/markets/', source: 'CNBC', publishedAt: new Date().toISOString() },
            { title: 'Bloomberg Markets', description: 'Financial news and market data', url: 'https://bloomberg.com/markets', source: 'Bloomberg', publishedAt: new Date().toISOString() },
            { title: 'Investopedia', description: 'Financial education and investment guides', url: 'https://investopedia.com', source: 'Investopedia', publishedAt: new Date().toISOString() },
            { title: 'Yahoo Finance', description: 'Stock quotes and financial news', url: 'https://finance.yahoo.com', source: 'Yahoo Finance', publishedAt: new Date().toISOString() },
        ]
    },
    'business': {
        keywords: ['business', 'entrepreneurship', 'startup'],
        sources: [
            { title: 'Harvard Business Review', description: 'Business insights and management strategies', url: 'https://hbr.org', source: 'HBR', publishedAt: new Date().toISOString() },
            { title: 'Forbes', description: 'Business news and financial information', url: 'https://forbes.com', source: 'Forbes', publishedAt: new Date().toISOString() },
            { title: 'Business Insider', description: 'Business, celebrity, and tech news', url: 'https://businessinsider.com', source: 'Business Insider', publishedAt: new Date().toISOString() },
            { title: 'Entrepreneur', description: 'Entrepreneurship and small business advice', url: 'https://entrepreneur.com', source: 'Entrepreneur', publishedAt: new Date().toISOString() },
        ]
    },
    'science': {
        keywords: ['science', 'research', 'physics', 'biology'],
        sources: [
            { title: 'Nature', description: 'International weekly journal of science', url: 'https://nature.com', source: 'Nature', publishedAt: new Date().toISOString() },
            { title: 'Science Magazine', description: 'Latest scientific discoveries', url: 'https://science.org', source: 'Science', publishedAt: new Date().toISOString() },
            { title: 'arXiv', description: 'Open access research papers', url: 'https://arxiv.org', source: 'arXiv', publishedAt: new Date().toISOString() },
            { title: 'ScienceDaily', description: 'Breaking science news', url: 'https://sciencedaily.com', source: 'ScienceDaily', publishedAt: new Date().toISOString() },
        ]
    },
    'health': {
        keywords: ['health', 'medicine', 'healthcare'],
        sources: [
            { title: 'WebMD', description: 'Health information and medical news', url: 'https://webmd.com', source: 'WebMD', publishedAt: new Date().toISOString() },
            { title: 'Mayo Clinic', description: 'Medical information and healthy living', url: 'https://mayoclinic.org', source: 'Mayo Clinic', publishedAt: new Date().toISOString() },
            { title: 'NIH News', description: 'National Institutes of Health updates', url: 'https://nih.gov/news-events', source: 'NIH', publishedAt: new Date().toISOString() },
        ]
    },
    'design': {
        keywords: ['design', 'UI UX', 'graphic design'],
        sources: [
            { title: 'Dribbble', description: 'Design inspiration and community', url: 'https://dribbble.com', source: 'Dribbble', publishedAt: new Date().toISOString() },
            { title: 'Behance', description: 'Creative portfolios and projects', url: 'https://behance.net', source: 'Behance', publishedAt: new Date().toISOString() },
            { title: 'Smashing Magazine', description: 'Web design and development articles', url: 'https://smashingmagazine.com', source: 'Smashing Magazine', publishedAt: new Date().toISOString() },
        ]
    }
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'technology';

    try {
        const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG['technology'];

        // Try NewsData.io if API key is set
        if (NEWS_API_KEY) {
            const query = config.keywords[0];
            const response = await fetch(
                `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&size=5`,
                { next: { revalidate: 3600 } }
            );

            if (response.ok) {
                const data = await response.json();
                const articles: NewsArticle[] = data.results?.map((item: any) => ({
                    title: item.title,
                    description: item.description || 'No description available',
                    url: item.link,
                    source: item.source_id || 'News',
                    publishedAt: item.pubDate,
                    imageUrl: item.image_url
                })) || [];

                return NextResponse.json({ articles, source: 'newsdata' });
            }
        }

        // Fallback: Return domain-specific curated sources
        return NextResponse.json({ articles: config.sources, source: 'curated' });

    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json({
            articles: [],
            error: 'Failed to fetch news'
        }, { status: 500 });
    }
}
