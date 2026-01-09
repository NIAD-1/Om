'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AITutorSidebarProps {
    lessonName: string;
    lessonContext: string; // Summary + resources info
}

export default function AITutorSidebar({ lessonName, lessonContext }: AITutorSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful AI tutor helping the student learn "${lessonName}". 
              
Lesson Context:
${lessonContext}

Teaching Guidelines:
- Be patient and encouraging
- Break down complex concepts
- Use analogies and examples
- Ask guiding questions
- Reference the lesson materials when helpful`
                        },
                        ...messages,
                        { role: 'user', content: userMessage }
                    ]
                })
            });

            if (!response.ok) throw new Error('AI tutor error');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (error) {
            console.error('AI Tutor error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white z-50"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </button>

            {/* Sidebar */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-white">AI Tutor</h3>
                                <p className="text-xs text-slate-400">Ask me anything about {lessonName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 mt-8">
                                <Bot className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                                <p className="text-sm">Ask me questions about this lesson!</p>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => setInput("Explain the key concepts")}
                                        className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 block mx-auto"
                                    >
                                        Explain the key concepts
                                    </button>
                                    <button
                                        onClick={() => setInput("Can you give me an example?")}
                                        className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 block mx-auto"
                                    >
                                        Can you give me an example?
                                    </button>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask a question..."
                                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
