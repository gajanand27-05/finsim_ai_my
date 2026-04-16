import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

export default function AIChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your FINSIM AI assistant. You can ask me things like 'How can I save money?' or 'Where did I spend most?'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
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
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the network right now.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
         <Sparkles className="text-blue-400" size={20} />
         <h3 className="font-semibold text-slate-100">FINSIM Intelligence Chat</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 min-h-[300px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
               m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
         <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..." 
            className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
         <button type="submit" disabled={loading} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50">
            <Send size={20} />
         </button>
      </form>
    </div>
  );
}
