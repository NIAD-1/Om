import { NextRequest, NextResponse } from 'next/server';

// Use NewsData.io free tier - 200 requests/day
// Or fallback to AI-generated news summaries
const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
    'technology': ['technology', 'software', 'programming', 'tech industry'],
    'ai-ml': ['artificial intelligence', 'machine learning', 'AI', 'deep learning'],
    'finance': ['finance', 'investment', 'stock market', 'cryptocurrency'],
    'design': ['design', 'UI UX', 'graphic design', 'web design'],
    'science': ['science', 'research', 'physics', 'biology', 'chemistry'],
    'engineering': ['engineering', 'mechanical', 'electrical', 'civil engineering'],
    'health': ['health', 'medicine', 'medical research', 'healthcare'],
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'technology';

    try {
        // Get keywords for domain
        const keywords = DOMAIN_KEYWORDS[domain] || DOMAIN_KEYWORDS['technology'];
        const query = keywords[0];

        // Try NewsData.io if API key is set
        if (NEWS_API_KEY) {
            const response = await fetch(
                `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&size=5`,
                { next: { revalidate: 3600 } } // Cache for 1 hour
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

        // Fallback: Return curated/simulated news for now
        const fallbackNews: NewsArticle[] = [
            {
                title: `Latest ${domain.replace('-', ' ')} Trends in 2024`,
                description: 'Discover the most impactful developments shaping the industry this year.',
                url: 'https://news.ycombinator.com',
                source: 'Hacker News',
                publishedAt: new Date().toISOString()
            },
            {
                title: `How AI is Transforming ${domain.replace('-', ' ')}`,
                description: 'Artificial intelligence continues to revolutionize every sector with new innovations.',
                url: 'https://techcrunch.com',
                source: 'TechCrunch',
                publishedAt: new Date().toISOString()
            },
            {
                title: `Top Skills to Learn for ${domain.replace('-', ' ')} in 2024`,
                description: 'Stay competitive with these essential skills employers are looking for.',
                url: 'https://dev.to',
                source: 'Dev.to',
                publishedAt: new Date().toISOString()
            },
            {
                title: `Research Breakthroughs in ${domain.replace('-', ' ')}`,
                description: 'New studies reveal exciting possibilities for the future of the field.',
                url: 'https://arxiv.org',
                source: 'arXiv',
                publishedAt: new Date().toISOString()
            }
        ];

        return NextResponse.json({ articles: fallbackNews, source: 'fallback' });

    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json({
            articles: [],
            error: 'Failed to fetch news'
        }, { status: 500 });
    }
}
