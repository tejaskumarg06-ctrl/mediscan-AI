import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Cpu, Sparkles, Terminal as TerminalIcon, Send, ShieldCheck } from 'lucide-react';

const MOCK_INSIGHTS = [
  "DEEP SCAN: Yield curve inversion deepening. Probability of recession within 12 months increased to 68%.",
  "SIGNAL DETECTED: Systematic selling in Mega-cap tech detected during FOMC blackout period.",
  "SENTIMENT ANALYSIS: Retail sentiment shifting from 'Greed' to 'Fear' as DXY breaks above 104.50.",
  "CORRELATION ALERT: Crypto-Equity correlation hitting 0.92. Systemic risk localized in high-beta assets.",
  "QUANT MODEL: Recommended positioning: Rotate into Defensive/Value. Increase cash allocation to 15%."
];

export const AIAnalystTab: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'system' | 'ai' | 'user', content: string}[]>([
    { role: 'system', content: 'APEX AI ANALYST v4.0.2 - NEURAL LINK ESTABLISHED' },
    { role: 'ai', content: 'Welcome, Director. I have scanned the global markets and synthesized latest macro datasets. How can I assist your strategy today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);
    setTimeout(() => {
      const randomInsight = MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)];
      setMessages(prev => [...prev, { role: 'ai', content: randomInsight }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-6 bg-[#050505] font-mono relative overflow-hidden"
    >
      {/* Background Neural Grid Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full bg-[radial-gradient(#00ff41_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 border-b border-[#00ff41]/20 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00ff41]/10 rounded-lg border border-[#00ff41]/30">
            <Brain className="text-[#00ff41] animate-pulse" size={20} />
          </div>
          <div>
            <h2 className="text-[#00ff41] font-bold text-lg tracking-tighter">AI STRATEGY ENGINE</h2>
            <div className="flex items-center gap-2 text-[10px] text-[#00ff41]/40">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#00ff41]" />
              ONLINE // CORE_TEMP: 32Â°C // COGNITIVE_LOAD: 12%
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] text-[#00ff41]/40 uppercase">Trust Level</div>
            <div className="text-xs font-bold text-[#00ff41]">ULTIMATE_AUTH</div>
          </div>
          <div className="text-right border-l border-[#00ff41]/20 pl-4">
            <div className="text-[10px] text-[#00ff41]/40 uppercase">Protocol</div>
            <div className="text-xs font-bold text-[#ffaa00]">BRAVO-9-OMEGA</div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-4 custom-scrollbar z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded border ${
              msg.role === 'system' ? 'bg-[#00ff41]/5 border-[#00ff41]/20 text-[#00ff41]/60 text-[10px] w-full text-center' :
              msg.role === 'ai' ? 'bg-[#0a0a0a] border-[#00ff41]/30 text-[#00ff41]' :
              'bg-[#00ff41]/10 border-[#00ff41]/50 text-white'
            }`}>
              {msg.role === 'ai' && <div className="text-[8px] font-bold text-[#00ff41]/40 mb-1 uppercase tracking-widest">APEX_COGNITION</div>}
              {msg.role === 'user' && <div className="text-[8px] font-bold text-[#00ff41]/40 mb-1 text-right uppercase tracking-widest">DIRECTOR_AUTH</div>}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#0a0a0a] border border-[#00ff41]/30 p-3 rounded flex gap-1">
              <span className="w-1 h-1 bg-[#00ff41] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-[#00ff41] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-[#00ff41] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff41]/50">
          <TerminalIcon size={16} />
        </div>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ENTER STRATEGY QUERY OR COMMAND..."
          className="w-full bg-[#0a0a0a] border border-[#00ff41]/30 rounded-lg py-4 pl-12 pr-16 text-[#00ff41] placeholder-[#00ff41]/20 focus:outline-none focus:border-[#00ff41] focus:ring-1 focus:ring-[#00ff41] transition-all text-sm"
        />
        <button 
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00ff41]/10 text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all rounded-md"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-[8px] text-[#00ff41]/20 uppercase tracking-[0.3em]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={10} />
          ENCRYPTION: AES-256-QUANTUM
        </div>
        <div>
          CORE_LATENCY: 4.2ms // GPT-ANALYSIS: ENABLED
        </div>
      </div>
    </motion.div>
  );
};
