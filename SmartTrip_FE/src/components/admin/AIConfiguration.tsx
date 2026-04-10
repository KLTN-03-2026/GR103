import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from '../../icons';

export function AIConfiguration() {
  const [prompt, setPrompt] = useState(`{
  "identity": "The Intelligent Voyager Concierge",
  "persona": {
    "tone": "Sophisticated, calm, authoritative yet welcoming",
    "language": "Professional English with editorial flair",
    "trait": "Predictive and detail-oriented"
  },
  "constraints": [
    "Never use generic templates",
    "Prioritize flight safety and premium comfort over cost",
    "Maintain 20px visual whitespace in itinerary descriptions"
  ],
  "knowledge_cutoff": "2024-01-01"
}`);

  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    // Giả lập quá trình deploy
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 2000);
  };

  const handleRunSimulation = async () => {
    if (!testInput.trim()) return;
    setIsSimulating(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: `System Prompt: ${prompt}` },
          { text: `User Input: ${testInput}` }
        ],
        config: {
          systemInstruction: "You are simulating an AI response based on the provided System Prompt and User Input. Respond as the AI would."
        }
      });
      
      setTestOutput(response.text || "No response generated.");
    } catch (error) {
      console.error('Simulation error:', error);
      setTestOutput("Error: Failed to simulate AI response. Please check your API key.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">AI Configuration</h2>
        <p className="text-slate-500">Define the core intelligence, tone, and behavioral logic of the Voyager agent.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Icons.Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Core System Prompt</h3>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Draft v2.4.1</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="p-8 bg-[#001B3D] font-mono text-sm text-blue-100 min-h-[400px]">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed min-h-[350px]"
                spellCheck={false}
              />
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-4">
              <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
                  deploySuccess 
                    ? 'bg-green-500 text-white shadow-green-500/20' 
                    : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                }`}
              >
                {isDeploying ? (
                  <Icons.RefreshCw className="w-4 h-4 animate-spin" />
                ) : deploySuccess ? (
                  <Icons.ShieldCheck className="w-4 h-4" />
                ) : null}
                {isDeploying ? 'Deploying...' : deploySuccess ? 'Deployed' : 'Deploy to Production'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-8">
          {/* Testing Playground */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Testing Playground</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">USER INPUT</label>
                <input 
                  type="text"
                  placeholder="e.g., Suggest a trip to Tokyo"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <button 
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSimulating ? <Icons.RefreshCw className="w-4 h-4 animate-spin" /> : <Icons.Play className="w-4 h-4" />}
                Run Simulation
              </button>

              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Live Output</span>
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  {testOutput || 'No output yet. Run a simulation to see the AI response.'}
                </p>
              </div>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Icons.History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Version History</h3>
              </div>
              <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
            </div>

            <div className="space-y-6">
              {[
                { version: 'v2.4.1 (Current)', desc: 'Modified identity constraints for better luxury alignment.', date: 'APR 12, 14:30 · BY SARAH K.', active: true },
                { version: 'v2.4.0', desc: 'Initial migration to GPT-4 Turbo logic.', date: 'APR 10, 09:12 · BY MIKE R.', active: false },
                { version: 'v2.3.8', desc: 'Reverted tone from \'Casual\' back to \'Professional\'.', date: 'APR 08, 16:45 · BY SARAH K.', active: false },
              ].map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${v.active ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-slate-200'}`} />
                    {i !== 2 && <div className="w-px h-full bg-slate-100 my-2" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${v.active ? 'text-slate-900' : 'text-slate-500'}`}>{v.version}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{v.desc}</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">{v.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
        {[
          { label: 'LATENCY', value: '1.2s', color: 'bg-green-500', progress: 70 },
          { label: 'TOKEN EFFICIENCY', value: '94%', color: 'bg-blue-600', progress: 94 },
          { label: 'ERROR RATE', value: '0.02%', color: 'bg-indigo-400', progress: 10 },
          { label: 'ACTIVE USERS', value: '12.4k', color: 'bg-blue-500', progress: 85 },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <h4 className="text-3xl font-bold text-slate-900 mb-4">{stat.value}</h4>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                className={`h-full ${stat.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
