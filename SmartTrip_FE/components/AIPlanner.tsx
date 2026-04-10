import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from '../icons';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Page } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIPlannerProps {
  userProfile: UserProfile | null;
  onNavigate: (page: Page, id?: string) => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export function AIPlanner({ userProfile, onNavigate }: AIPlannerProps) {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setPrompt('');
    setHistory(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `You are Azure Voyage Concierge, a world-class AI travel planner. 
          Your goal is to help ${userProfile?.fullName || 'the user'} plan an extraordinary journey.
          
          Guidelines:
          - Be professional, inspiring, and highly detailed.
          - Provide specific itineraries, hotel names, and restaurant suggestions.
          - Consider budget, preferences, and seasonal factors.
          - Use Markdown for formatting (bold, lists, headings).
          - If the user asks for something outside of travel, politely redirect them to travel planning.
          - Always end with an inspiring travel quote or a helpful tip.`,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that request.";
      setHistory(prev => [...prev, { role: 'ai', text: aiText, timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Planner Error:", error);
      setHistory(prev => [...prev, { 
        role: 'ai', 
        text: "I encountered a technical turbulence. Please try again in a moment.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icons.Sparkles className="w-5 h-5 text-blue-600" />
              AI Travel Concierge
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Azure AI</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{userProfile?.fullName}</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{userProfile?.travelTier || 'Explorer'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Icons.User className="w-5 h-5 text-blue-600" />
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 pb-32 scroll-smooth"
        >
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
                <Icons.Bot className="w-10 h-10 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Where shall we voyage today?</h2>
                <p className="text-slate-500 max-w-md">
                  Tell me about your dream destination, budget, or interests, and I'll craft a personalized itinerary just for you.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "Plan a 5-day luxury trip to Kyoto",
                  "Budget-friendly weekend in Paris",
                  "Adventure itinerary for New Zealand",
                  "Family-friendly spots in Da Nang"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setPrompt(suggestion);
                    }}
                    className="p-4 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-2xl text-sm font-medium text-slate-700 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-100'
                }`}>
                  {msg.role === 'user' ? (
                    <Icons.User className="w-4 h-4 text-white" />
                  ) : (
                    <Icons.Bot className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.role === 'ai' && i === history.length - 1 && (
                      <div className="mt-6 pt-6 border-t border-slate-200/50 flex justify-end">
                        <button 
                          onClick={() => onNavigate('checkout')}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                          <Icons.CreditCard className="w-4 h-4" />
                          Book This Itinerary
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icons.Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition duration-500" />
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl flex items-end p-2 gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your dream trip..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-3 min-h-[56px] max-h-32 resize-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || loading}
                className={`p-3 rounded-xl transition-all ${
                  prompt.trim() && !loading
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Icons.Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
            AI can make mistakes. Verify important travel details.
          </p>
        </div>
      </div>
    </div>
  );
}
