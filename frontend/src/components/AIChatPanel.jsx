import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User } from 'lucide-react';

const SUGGESTIONS = [
  "How can I save more?",
  "Analyze my food spend",
  "Predict next month",
  "Identify ghost charges"
];

export default function AIChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm FINSIM, your AI financial strategist. I've analyzed your recent transactions—ask me anything about your spending or how to optimize your savings." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm experiencing a brief synchronization issue. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
               <Sparkles className="text-blue-400" size={18} />
            </div>
            <h3 className="font-bold text-slate-100 text-sm tracking-tight">Financial Intelligence</h3>
         </div>
         <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            ONLINE
         </span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
            {m.role === 'ai' && (
               <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={12} className="text-blue-400" />
               </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
               m.role === 'user' 
                ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-lg shadow-blue-500/10' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-sm'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
               <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User size={12} className="text-slate-300" />
               </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex justify-start items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot size={12} className="text-blue-400" />
             </div>
             <div className="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
         {!loading && messages.length < 5 && (
            <div className="flex flex-wrap gap-2 mb-4">
               {SUGGESTIONS.map(s => (
                  <button 
                     key={s} 
                     onClick={() => handleSend(s)}
                     className="text-[10px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 px-3 py-1.5 rounded-lg transition-all"
                  >
                     {s}
                  </button>
               ))}
            </div>
         )}
         <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-2"
         >
            <div className="flex-1 relative">
               <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your AI assistant..." 
                  className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 transition-all"
               />
               <MessageSquare size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
            </div>
            <button 
               type="submit" 
               disabled={loading || !input.trim()} 
               className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-500/20"
            >
               <Send size={18} />
            </button>
         </form>
      </div>
    </div>
  );
}
