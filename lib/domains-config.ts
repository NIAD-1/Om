import { Domain } from '@/types/curriculum';
import {
    Brain,
    DollarSign,
    Briefcase,
    BookOpen,
    Landmark,
    Church,
    Code2
} from 'lucide-react';

export const DOMAINS: Omit<Domain, 'modules'>[] = [
    {
        id: 'tech',
        name: 'Technology',
        description: 'Machine Learning, Backend Systems, Data Analysis, IoT, and Embedded Systems',
        icon: 'Code2',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'finance',
        name: 'Finance',
        description: 'Personal Finance, Corporate Finance, and Economics',
        icon: 'DollarSign',
        color: 'from-green-500 to-emerald-500',
    },
    {
        id: 'business',
        name: 'Business',
        description: 'Strategy, Operations, and Management',
        icon: 'Briefcase',
        color: 'from-purple-500 to-pink-500',
    },
    {
        id: 'history',
        name: 'History',
        description: 'World History, Civilizations, and Historical Events',
        icon: 'BookOpen',
        color: 'from-amber-500 to-orange-500',
    },
    {
        id: 'politics',
        name: 'Politics',
        description: 'Political Theory, Systems, and International Relations',
        icon: 'Landmark',
        color: 'from-red-500 to-rose-500',
    },
    {
        id: 'philosophy',
        name: 'Philosophy',
        description: 'Existentialism, Nihilism, Phenomenology, and more',
        icon: 'Brain',
        color: 'from-indigo-500 to-violet-500',
    },
    {
        id: 'theology',
        name: 'Theology',
        description: 'Religious Studies and Theological Concepts',
        icon: 'Church',
        color: 'from-slate-500 to-zinc-500',
    },
];

// Sub-domain configurations for detailed tracking
export const TECH_SUBDOMAINS = [
    'Machine Learning - Healthcare',
    'Machine Learning - Pharmaceutical',
    'Machine Learning - Finance',
    'Machine Learning - Business',
    'Machine Learning - Regulatory Systems',
    'Machine Learning - Agriculture',
    'Backend Systems - Rust',
    'Data Analysis - R',
    'Data Science - Python',
    'Data Analysis - Python',
    'Data Engineering',
    'IoT',
    'Embedded Systems',
    'Quantitative Finance',
];

export const FINANCE_SUBDOMAINS = [
    'Personal Finance',
    'Corporate Finance',
    'Economics',
];

export const ICON_MAP = {
    Code2,
    DollarSign,
    Briefcase,
    BookOpen,
    Landmark,
    Brain,
    Church,
};
