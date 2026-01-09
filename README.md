# 🧠 Mastery Engine - Personal Knowledge System

A production-ready mastery-based learning platform that generates AI-powered curricula, tracks prerequisite-locked progression, and ensures deep understanding through rigorous assessments.

## ✨ Features

- **AI Curriculum Generation**: Llama 3.1 70B automatically creates hierarchical learning paths for any field
- **Mastery Gatekeeping**: Progress locked until >85% exam score achieved
- **Multi-Domain Support**: Tech, Finance, Business, History, Politics, Philosophy, Theology
- **AI Socratic Tutor**: Context-aware teaching assistant for every lesson
- **Rigorous Exams**: LaTeX math + code rendering, designed to test deep understanding
- **Weekly Email Reports**: Automatic progress audits sent to your email
- **Beautiful Dark UI**: Glassmorphism design with Framer Motion animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project (Spark plan compatible)
- Together AI API key (free tier available)
- EmailJS account (free tier: 200 emails/month)

### Installation

```bash
# Clone and navigate
cd /Users/work/Desktop/OM

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq (for Llama 3.1 70B - FREE!)
GROQ_API_KEY=your_groq_api_key

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_USER_EMAIL=enilamaoshoriamhe687@gmail.com
```

### Getting API Keys

**Groq** (Llama 3.1 70B - FREE!):
1. Visit: https://console.groq.com
2. Sign up (no credit card needed)
3. Go to API Keys and create new key
4. Completely free with generous rate limits!

**EmailJS** (Weekly Reports):
1. Visit: https://www.emailjs.com
2. Create account and email service
3. Create template for weekly reports
4. Copy Service ID, Template ID, and Public Key

**Firebase** (Auth + Firestore):
1. Visit: https://console.firebase.google.com
2. Create new project
3. Enable Authentication and Firestore
4. Copy config from Project Settings

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## 📦 Deployment to Netlify

1. Push code to GitHub repository
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

## 🏗️ Architecture

```
mastery-engine/
├── app/                      # Next.js 14 App Router
│   ├── dashboard/           # Main dashboard page
│   ├── page.tsx            # Home (redirects to dashboard)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── loading-ai.tsx
│   │   └── progress-ring.tsx
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── domain-card.tsx
│   │   ├── progress-overview.tsx
│   │   └── new-track-input.tsx
│   ├── learning-map/       # TODO: Learning graph visualization
│   ├── ai-tutor/          # TODO: Chat sidebar
│   └── exam/              # TODO: Exam portal
├── netlify/functions/      # Serverless AI endpoints
│   ├── generate-curriculum.ts
│   ├── generate-exam.ts
│   ├── ai-tutor.ts
│   └── send-weekly-report.ts
├── lib/
│   ├── firebase.ts        # Firebase initialization
│   ├── mastery-engine.ts  # Core business logic
│   ├── domains-config.ts  # 7 knowledge domains
│   └── api-client.ts      # Netlify Functions wrapper
└── types/
    └── curriculum.ts      # TypeScript interfaces
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth + Firestore)
- **Serverless**: Netlify Functions
- **AI**: Llama 3.1 70B via Together AI
- **Email**: EmailJS
- **Icons**: Lucide React
- **Rendering**: KaTeX (LaTeX) + Prism (Code)

## 🧪 Current Status

### ✅ Completed
- ✅ Project setup with Next.js 14 + TypeScript
- ✅ Tailwind CSS v4 dark mode design system
- ✅ Firebase Auth + Firestore setup
- ✅ 4 Netlify serverless functions (curriculum, exam, tutor, email)
- ✅ Dashboard with 7 knowledge domains
- ✅ Progress tracking components
- ✅ AI curriculum generator interface
- ✅ Production build successful

### 🚧 TODO
- [ ] Firebase Authentication implementation
- [ ] Learning map with React Flow graph
- [ ] AI tutor chat sidebar
- [ ] Exam portal with zen mode
- [ ] User progress persistence to Firestore
- [ ] Weekly email automation trigger
- [ ] Mobile responsive optimization

## 🎯 Usage

### Generate Curriculum

1. Navigate to dashboard
2. Enter field of interest (e.g., "Machine Learning in Healthcare")
3. AI generates hierarchical curriculum with:
   - Modules > Topics > Lessons
   - Real resources from MIT OCW, 3Blue1Brown, etc.
   - Prerequisite chains
   - Rigorous exams for each lesson

### Mastery Flow

1. Start with unlocked foundational lesson
2. Study resources (videos, articles, documentation)
3. Ask AI tutor questions for clarification
4. Take exam (must score >85% to pass)
5. Next lesson unlocks automatically
6. Repeat until domain mastered

## 📧 Weekly Reports

The system sends weekly "Mastery Audit" emails including:
- Current streak
- Lessons completed this week
- Topics mastered
- Next recommended lessons
- Progress percentages per domain

## 🤝 Contributing

This is a personal knowledge system. Feel free to fork and customize for your own use!

## 📝 License

MIT License - Built for personal mastery-based learning

## 🙏 Acknowledgments

- Powered by Meta's Llama 3.1 70B
- Inspired by mastery-based learning principles
- Built with modern web technologies

---

**Built with mastery-based learning principles • Powered by Llama 3.1 70B**
