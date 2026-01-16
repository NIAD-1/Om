import { NextRequest, NextResponse } from 'next/server';

interface Paper {
    id: string;
    title: string;
    authors: string[];
    summary: string;
    url: string;
    pdfUrl: string;
    published: string;
    categories: string[];
}

// arXiv category mappings for domains
const DOMAIN_CATEGORIES: Record<string, string[]> = {
    'technology': ['cs.SE', 'cs.PL', 'cs.DC', 'cs.NI'],
    'ai-ml': ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'stat.ML'],
    'science': ['physics', 'q-bio', 'cond-mat'],
    'finance': ['q-fin', 'econ'],
    'health': ['q-bio', 'cs.CE'],
    'engineering': ['eess', 'cs.RO', 'cs.SY'],
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'technology';
    const maxResults = parseInt(searchParams.get('max') || '5');

    try {
        const categories = DOMAIN_CATEGORIES[domain] || DOMAIN_CATEGORIES['technology'];
        const category = categories[0]; // Use primary category

        // Fetch from arXiv API
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

        const response = await fetch(arxivUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error('arXiv API error');
        }

        const xmlText = await response.text();

        // Parse XML response (simple regex parsing for arXiv format)
        const papers: Paper[] = [];
        const entries = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

        for (const entry of entries) {
            const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || '';
            const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() || '';
            const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim().slice(0, 300) || '';
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';

            // Extract authors
            const authorMatches = entry.match(/<name>(.*?)<\/name>/g) || [];
            const authors = authorMatches.map(a => a.replace(/<\/?name>/g, '')).slice(0, 3);

            // Extract categories
            const catMatches = entry.match(/term="([^"]+)"/g) || [];
            const cats = catMatches.map(c => c.replace(/term="|"/g, ''));

            if (title && id) {
                papers.push({
                    id,
                    title,
                    authors,
                    summary: summary + '...',
                    url: `https://arxiv.org/abs/${id}`,
                    pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
                    published,
                    categories: cats
                });
            }
        }

        return NextResponse.json({ papers, source: 'arxiv' });

    } catch (error) {
        console.error('Research papers API error:', error);

        // Fallback with curated papers
        const fallbackPapers: Paper[] = [
            {
                id: 'placeholder-1',
                title: 'Attention Is All You Need (Transformer Paper)',
                authors: ['Vaswani et al.'],
                summary: 'The landmark paper introducing the Transformer architecture that revolutionized NLP and AI.',
                url: 'https://arxiv.org/abs/1706.03762',
                pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
                published: '2017-06-12',
                categories: ['cs.CL', 'cs.LG']
            },
            {
                id: 'placeholder-2',
                title: 'Deep Residual Learning for Image Recognition',
                authors: ['He et al.'],
                summary: 'Introduces ResNet, enabling training of very deep neural networks through residual connections.',
                url: 'https://arxiv.org/abs/1512.03385',
                pdfUrl: 'https://arxiv.org/pdf/1512.03385.pdf',
                published: '2015-12-10',
                categories: ['cs.CV']
            }
        ];

        return NextResponse.json({ papers: fallbackPapers, source: 'fallback' });
    }
}
