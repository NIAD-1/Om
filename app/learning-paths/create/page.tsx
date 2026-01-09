'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookOpen, Info } from 'lucide-react';

export default function CreateCurriculumPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');

    const exampleFormat = `{
  "modules": [
    {
      "id": "module-1",
      "name": "Module Name",
      "description": "Brief description",
      "prerequisites": [],
      "topics": [
        {
          "id": "topic-1",
          "name": "Topic Name",
          "description": "Topic description",
          "prerequisites": [],
          "lessons": [
            {
              "id": "lesson-1",
              "name": "Lesson Name",
              "prerequisites": [],
              "estimatedMinutes": 60,
              "content": {
                "summary": "**Your markdown content here**\\n\\nKey concepts:\\n- Point 1\\n- Point 2",
                "resources": [
                  {
                    "type": "video",
                    "title": "Resource Title",
                    "url": "https://youtube.com/watch?v=...",
                    "authority": "Channel Name",
                    "duration": "45min"
                  },
                  {
                    "type": "article",
                    "title": "Article Title",
                    "url": "https://example.com/article",
                    "authority": "Site Name"
                  }
                ]
              },
              "examId": "exam-1"
            }
          ]
        }
      ]
    }
  ]
}`;

    const handleSubmit = () => {
        setError('');

        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }

        try {
            const parsed = JSON.parse(jsonInput);

            if (!parsed.modules || !Array.isArray(parsed.modules)) {
                throw new Error('Invalid format: must have "modules" array');
            }

            const curriculumId = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            const savedCurriculum = {
                ...parsed,
                id: curriculumId,
                createdAt: timestamp,
                field: title,
            };

            const existing = JSON.parse(localStorage.getItem('curricula') || '[]');
            existing.push(savedCurriculum);
            localStorage.setItem('curricula', JSON.stringify(existing));

            router.push(`/learning-paths/${curriculumId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON format');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Custom Curriculum</h1>
                    <p className="text-slate-400">
                        Paste your structured curriculum in JSON format
                    </p>
                </div>

                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Curriculum Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Advanced Python Programming"
                        className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* JSON Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Curriculum JSON
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="w-full h-96 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}
                </div>

                {/* Format Guide */}
                <div className="card bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-2">Format Guide</h3>
                            <details className="text-sm text-slate-300">
                                <summary className="cursor-pointer hover:text-white mb-2">
                                    Click to see example format
                                </summary>
                                <pre className="mt-3 p-4 bg-slate-950 rounded-lg overflow-x-auto text-xs border border-slate-800">
                                    <code>{exampleFormat}</code>
                                </pre>
                            </details>
                            <div className="mt-3 space-y-1 text-sm">
                                <p><strong className="text-blue-400">Resource types:</strong> video, article, documentation, book</p>
                                <p><strong className="text-blue-400">Markdown:</strong> Use in lesson content.summary for formatting</p>
                                <p><strong className="text-blue-400">IDs:</strong> Must be unique within their scope</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                    >
                        Create Curriculum
                    </button>
                    <button
                        onClick={() => router.push('/learning-paths')}
                        className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setJsonInput(exampleFormat)}
                        className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                    >
                        Load Example
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
