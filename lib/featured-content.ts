/**
 * Pre-created roadmaps and curricula with curated, real open-source resources
 * These are featured content available to all users
 */

export interface FeaturedResource {
    type: 'video' | 'article' | 'pdf' | 'course';
    title: string;
    url: string;
    source: string;
    duration?: string;
    description?: string;
}

export interface FeaturedLesson {
    id: string;
    name: string;
    estimatedMinutes: number;
    content: {
        summary: string;
        resources: FeaturedResource[];
    };
}

export interface FeaturedTopic {
    id: string;
    name: string;
    description: string;
    lessons: FeaturedLesson[];
}

export interface FeaturedModule {
    id: string;
    name: string;
    description: string;
    topics: FeaturedTopic[];
}

export interface FeaturedCurriculum {
    id: string;
    field: string;
    description: string;
    domain: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    modules: FeaturedModule[];
    isFeatured: true;
}

export interface FeaturedRoadmap {
    id: string;
    title: string;
    description: string;
    domain: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedWeeks: number;
    curricula: string[]; // IDs of featured curricula
    isFeatured: true;
}

// =========================================================
// FEATURED CURRICULA - Real open source resources
// =========================================================

export const FEATURED_CURRICULA: FeaturedCurriculum[] = [
    {
        id: 'featured-cs50-intro',
        field: 'Harvard CS50: Introduction to Computer Science',
        description: 'Harvard\'s legendary intro to CS. Learn C, Python, SQL, and web development.',
        domain: 'technology',
        difficulty: 'beginner',
        estimatedHours: 100,
        isFeatured: true,
        modules: [
            {
                id: 'cs50-mod-1',
                name: 'Computational Thinking',
                description: 'Introduction to programming concepts',
                topics: [
                    {
                        id: 'cs50-scratch',
                        name: 'Scratch & Binary',
                        description: 'Visual programming and binary basics',
                        lessons: [
                            {
                                id: 'cs50-week0',
                                name: 'Week 0: Scratch',
                                estimatedMinutes: 120,
                                content: {
                                    summary: 'Introduction to programming using Scratch. Learn about functions, conditions, loops, and events through visual programming.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CS50 2024 - Lecture 0 - Scratch',
                                            url: 'https://www.youtube.com/watch?v=3LPJfIKxwWc',
                                            source: 'Harvard CS50',
                                            duration: '2 hours'
                                        },
                                        {
                                            type: 'article',
                                            title: 'Week 0 Notes',
                                            url: 'https://cs50.harvard.edu/x/2024/notes/0/',
                                            source: 'CS50 Official'
                                        }
                                    ]
                                }
                            },
                            {
                                id: 'cs50-week1',
                                name: 'Week 1: C',
                                estimatedMinutes: 180,
                                content: {
                                    summary: 'Introduction to C programming. Variables, conditions, loops, and functions in a text-based language.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CS50 2024 - Lecture 1 - C',
                                            url: 'https://www.youtube.com/watch?v=cwtpLIWylAw',
                                            source: 'Harvard CS50',
                                            duration: '2.5 hours'
                                        },
                                        {
                                            type: 'article',
                                            title: 'Week 1 Notes',
                                            url: 'https://cs50.harvard.edu/x/2024/notes/1/',
                                            source: 'CS50 Official'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'cs50-mod-2',
                name: 'Data Structures & Algorithms',
                description: 'Arrays, algorithms, memory management',
                topics: [
                    {
                        id: 'cs50-arrays',
                        name: 'Arrays & Algorithms',
                        description: 'Working with data structures',
                        lessons: [
                            {
                                id: 'cs50-week2',
                                name: 'Week 2: Arrays',
                                estimatedMinutes: 150,
                                content: {
                                    summary: 'Arrays, strings, command-line arguments, and cryptography basics.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CS50 2024 - Lecture 2 - Arrays',
                                            url: 'https://www.youtube.com/watch?v=4vU4aEFmTSo',
                                            source: 'Harvard CS50',
                                            duration: '2 hours'
                                        }
                                    ]
                                }
                            },
                            {
                                id: 'cs50-week3',
                                name: 'Week 3: Algorithms',
                                estimatedMinutes: 150,
                                content: {
                                    summary: 'Searching, sorting, recursion, and Big O notation.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CS50 2024 - Lecture 3 - Algorithms',
                                            url: 'https://www.youtube.com/watch?v=jZzyERW7h1A',
                                            source: 'Harvard CS50',
                                            duration: '2 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'cs50-mod-3',
                name: 'Web Development',
                description: 'HTML, CSS, JavaScript, and Python',
                topics: [
                    {
                        id: 'cs50-web',
                        name: 'Full Stack Web',
                        description: 'Building web applications',
                        lessons: [
                            {
                                id: 'cs50-week8',
                                name: 'Week 8: HTML, CSS, JavaScript',
                                estimatedMinutes: 180,
                                content: {
                                    summary: 'Frontend web development fundamentals.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CS50 2024 - Lecture 8 - HTML, CSS, JavaScript',
                                            url: 'https://www.youtube.com/watch?v=alnzFK-4xMY',
                                            source: 'Harvard CS50',
                                            duration: '2.5 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'featured-mit-6006',
        field: 'MIT 6.006: Introduction to Algorithms',
        description: 'Classic MIT course on algorithms and data structures',
        domain: 'technology',
        difficulty: 'intermediate',
        estimatedHours: 80,
        isFeatured: true,
        modules: [
            {
                id: 'mit-mod-1',
                name: 'Algorithmic Thinking',
                description: 'Foundational algorithm concepts',
                topics: [
                    {
                        id: 'mit-intro',
                        name: 'Introduction & Analysis',
                        description: 'Algorithm analysis fundamentals',
                        lessons: [
                            {
                                id: 'mit-lecture1',
                                name: 'Introduction to Algorithms',
                                estimatedMinutes: 80,
                                content: {
                                    summary: 'Course overview, computational problems, and algorithm analysis.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'MIT 6.006 - Lecture 1',
                                            url: 'https://www.youtube.com/watch?v=HtSuA80QTyo',
                                            source: 'MIT OpenCourseWare',
                                            duration: '50 min'
                                        },
                                        {
                                            type: 'pdf',
                                            title: 'Lecture Notes',
                                            url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
                                            source: 'MIT OCW'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'featured-fcc-webdev',
        field: 'freeCodeCamp: Full Stack Web Development',
        description: 'Complete web development bootcamp - HTML, CSS, JS, React, Node',
        domain: 'technology',
        difficulty: 'beginner',
        estimatedHours: 300,
        isFeatured: true,
        modules: [
            {
                id: 'fcc-mod-1',
                name: 'Responsive Web Design',
                description: 'HTML and CSS fundamentals',
                topics: [
                    {
                        id: 'fcc-html-css',
                        name: 'HTML & CSS',
                        description: 'Building web pages',
                        lessons: [
                            {
                                id: 'fcc-html-basics',
                                name: 'HTML Full Course',
                                estimatedMinutes: 240,
                                content: {
                                    summary: 'Complete HTML tutorial from scratch.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'HTML Full Course - Build a Website Tutorial',
                                            url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
                                            source: 'freeCodeCamp',
                                            duration: '2 hours'
                                        },
                                        {
                                            type: 'course',
                                            title: 'Responsive Web Design Certification',
                                            url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
                                            source: 'freeCodeCamp'
                                        }
                                    ]
                                }
                            },
                            {
                                id: 'fcc-css-basics',
                                name: 'CSS Full Course',
                                estimatedMinutes: 600,
                                content: {
                                    summary: 'Master CSS from basics to advanced layouts.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'CSS Tutorial - Full Course for Beginners',
                                            url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA',
                                            source: 'freeCodeCamp',
                                            duration: '11 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'fcc-mod-2',
                name: 'JavaScript',
                description: 'Programming with JavaScript',
                topics: [
                    {
                        id: 'fcc-js',
                        name: 'JavaScript Fundamentals',
                        description: 'Learn to program with JS',
                        lessons: [
                            {
                                id: 'fcc-js-full',
                                name: 'JavaScript Full Course',
                                estimatedMinutes: 480,
                                content: {
                                    summary: 'Complete JavaScript course for beginners.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'JavaScript Programming - Full Course',
                                            url: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
                                            source: 'freeCodeCamp',
                                            duration: '8 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'fcc-mod-3',
                name: 'React',
                description: 'Frontend framework',
                topics: [
                    {
                        id: 'fcc-react',
                        name: 'React Development',
                        description: 'Building UIs with React',
                        lessons: [
                            {
                                id: 'fcc-react-full',
                                name: 'React Course for Beginners',
                                estimatedMinutes: 720,
                                content: {
                                    summary: 'Learn React by building projects.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'React Course - Beginners Tutorial',
                                            url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
                                            source: 'freeCodeCamp',
                                            duration: '12 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'featured-ml-basics',
        field: 'Machine Learning Fundamentals',
        description: 'Stanford/Google courses on ML and AI',
        domain: 'ai-ml',
        difficulty: 'intermediate',
        estimatedHours: 60,
        isFeatured: true,
        modules: [
            {
                id: 'ml-mod-1',
                name: 'Machine Learning Basics',
                description: 'Intro to ML concepts',
                topics: [
                    {
                        id: 'ml-intro',
                        name: 'Introduction to ML',
                        description: 'What is machine learning',
                        lessons: [
                            {
                                id: 'ml-andrew-ng',
                                name: 'Machine Learning Specialization',
                                estimatedMinutes: 300,
                                content: {
                                    summary: 'Andrew Ng\'s famous ML course covering supervised learning, neural networks, and more.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'Machine Learning Specialization (Playlist)',
                                            url: 'https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI',
                                            source: 'DeepLearning.AI',
                                            duration: '30+ hours'
                                        },
                                        {
                                            type: 'course',
                                            title: 'Google ML Crash Course',
                                            url: 'https://developers.google.com/machine-learning/crash-course',
                                            source: 'Google'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'featured-finance-101',
        field: 'Personal Finance & Investing',
        description: 'Learn to manage money and invest wisely',
        domain: 'finance',
        difficulty: 'beginner',
        estimatedHours: 20,
        isFeatured: true,
        modules: [
            {
                id: 'finance-mod-1',
                name: 'Personal Finance Basics',
                description: 'Budgeting, saving, and debt',
                topics: [
                    {
                        id: 'finance-basics',
                        name: 'Money Management',
                        description: 'Financial fundamentals',
                        lessons: [
                            {
                                id: 'finance-crash',
                                name: 'Personal Finance 101',
                                estimatedMinutes: 120,
                                content: {
                                    summary: 'Complete guide to personal finance - budgeting, saving, and building wealth.',
                                    resources: [
                                        {
                                            type: 'video',
                                            title: 'Personal Finance for Beginners',
                                            url: 'https://www.youtube.com/watch?v=HQzoZfc3GwQ',
                                            source: 'Two Cents',
                                            duration: '17 min'
                                        },
                                        {
                                            type: 'video',
                                            title: 'Yale: Financial Markets (Full Course)',
                                            url: 'https://www.youtube.com/playlist?list=PL8FB14A2200B87185',
                                            source: 'Yale University',
                                            duration: '25 hours'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// =========================================================
// FEATURED ROADMAPS - Combine curricula into career paths
// =========================================================

export const FEATURED_ROADMAPS: FeaturedRoadmap[] = [
    {
        id: 'featured-roadmap-webdev',
        title: 'Full Stack Web Developer',
        description: 'From zero to full stack developer with Harvard CS50 and freeCodeCamp',
        domain: 'technology',
        difficulty: 'beginner',
        estimatedWeeks: 24,
        isFeatured: true,
        curricula: ['featured-cs50-intro', 'featured-fcc-webdev']
    },
    {
        id: 'featured-roadmap-ml',
        title: 'Machine Learning Engineer',
        description: 'Master ML with Stanford and Google courses',
        domain: 'ai-ml',
        difficulty: 'intermediate',
        estimatedWeeks: 16,
        isFeatured: true,
        curricula: ['featured-ml-basics', 'featured-mit-6006']
    }
];

// Helper to get featured content by domain
export function getFeaturedByDomain(domain: string): {
    curricula: FeaturedCurriculum[];
    roadmaps: FeaturedRoadmap[];
} {
    return {
        curricula: FEATURED_CURRICULA.filter(c => c.domain === domain),
        roadmaps: FEATURED_ROADMAPS.filter(r => r.domain === domain)
    };
}

// Get all featured content
export function getAllFeatured(): {
    curricula: FeaturedCurriculum[];
    roadmaps: FeaturedRoadmap[];
} {
    return {
        curricula: FEATURED_CURRICULA,
        roadmaps: FEATURED_ROADMAPS
    };
}
