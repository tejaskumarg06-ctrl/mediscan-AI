import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  X, 
  Minus, 
  Send, 
  Trash2, 
  Download, 
  Navigation,
  MessageSquare,
  Activity,
  User as UserIcon,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Waveform } from './Waveform';
import { getARIAFeedback } from '../../services/gemini';
import { cn } from '../../lib/utils';
import { auth, db } from '../../services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'aria';
  content: string;
  timestamp: Date;
  mode?: 'voice' | 'text';
}

interface AssistantProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Assistant: React.FC<AssistantProps> = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [inputText, setInputText] = useState('');
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'aria', content: "Hello, I'm ARIA, your MediScan AI assistant. How can I help you today?", timestamp: new Date(), mode: 'text' }
  ]);
  const [interimText, setInterimText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Settings
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [language, setLanguage] = useState('en-US');
  const [showTranscript, setShowTranscript] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText, state]);

  // Context-based initial suggestions
  useEffect(() => {
    const defaultSuggestions = [
      'What does my scan show?',
      'Find a doctor near me',
      'Explain my lab report',
      'Book an appointment'
    ];
    
    if (currentView === 'eye-scan') setSuggestions(['How to take eye photo?', 'Analyze my eye', 'Symptoms of cataract']);
    else if (currentView === 'reports') setSuggestions(['Summarize report', 'Normal glucose range', 'What is abnormal?']);
    else setSuggestions(defaultSuggestions);
  }, [currentView]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => setState('listening');
      recognition.onend = () => {
        if (state === 'listening') setState('idle');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        setInterimText(transcript);

        if (event.results[0].isFinal) {
          handleUserMessage(transcript, 'voice');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error', event.error);
        }
        setState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    if (isMuted || (!autoSpeak && inputMode === 'text')) return;
    
    synthRef.current.cancel();

    // Clean text: remove [NAV:...] and [SUG:...]
    const cleanText = text.replace(/\[NAV:.*?\]/g, '').replace(/\[SUG:.*?\]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha'));
    
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = speed;
    utterance.pitch = 1.05;
    utterance.volume = volume;

    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');

    synthRef.current.speak(utterance);
  }, [isMuted, speed, volume, autoSpeak, inputMode]);

  const handleUserMessage = async (text: string, mode: 'voice' | 'text') => {
    if (!text.trim()) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: text, 
      timestamp: new Date(),
      mode 
    };
    setMessages(prev => [...prev, userMsg]);
    setInterimText('');
    setInputText('');
    setState('processing');

    try {
      const user = auth.currentUser;
      let patientContext: any = { currentPage: currentView };

      if (user) {
        const scansSnap = await getDocs(query(collection(db, 'scans'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(1)));
        if (!scansSnap.empty) patientContext.lastScan = scansSnap.docs[0].data();
        
        const profileSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!profileSnap.empty) patientContext.profile = profileSnap.docs[0].data();
      }

      const response = await getARIAFeedback(text, patientContext, mode);
      
      // Parse for NAV command
      const navMatch = response.match(/\[NAV:(.*?)\]/);
      if (navMatch) {
        const targetView = navMatch[1].trim();
        setTimeout(() => onNavigate(targetView), 1000);
      }

      // Parse for SUGGESTIONS
      const sugMatch = response.match(/\[SUG:(.*?)\]/);
      if (sugMatch) {
         setSuggestions(sugMatch[1].split('|').map(s => s.trim()));
      }

      const ariaMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'aria', 
        content: response, 
        timestamp: new Date(),
        mode: 'text' 
      };
      setMessages(prev => [...prev, ariaMsg]);
      speak(response);
    } catch (error) {
       const errMsg: Message = { id: Date.now().toString(), role: 'aria', content: "I encountered a neural link failure.", timestamp: new Date() };
       setMessages(prev => [...prev, errMsg]);
       setState('idle');
    }
  };

  const clearChat = () => {
    setMessages([{ id: '1', role: 'aria', content: "System memory cleared. How can I assist?", timestamp: new Date() }]);
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      handleUserMessage(inputText, 'text');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 glass-panel rounded-full shadow-[0_0_30px_rgba(0,255,209,0.2)] border-medical-teal/30 group hover:scale-105 hover:bg-medical-teal/5 transition-all text-white",
          isOpen ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
        )}
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-medical-teal" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-hero leading-none tracking-widest uppercase">ARIA Assistant</p>
          <p className="text-[8px] font-mono text-medical-teal leading-none mt-1 uppercase tracking-widest">● Core Online</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[60] w-[450px] max-w-[calc(100vw-40px)] h-[700px] max-h-[calc(100vh-100px)] glass-panel overflow-hidden flex flex-col border-medical-teal/20 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_0_30px_rgba(0,255,209,0.1)] rounded-3xl"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-navy/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-5 h-5 text-medical-teal" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-hero text-white uppercase tracking-widest">ARIA Neural Core</h3>
                  <p className="text-[8px] font-mono text-medical-teal uppercase tracking-widest leading-none">Multimodal Radiological AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab(activeTab === 'chat' ? 'settings' : 'chat')} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                  <Settings className={cn("w-4 h-4 transition-transform", activeTab === 'settings' && "rotate-45 text-medical-teal")} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-navy/40">
              <AnimatePresence mode="wait">
                {activeTab === 'chat' ? (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0">
                    
                    {/* Top Mode Selection */}
                    <div className="p-4 flex justify-center">
                       <div className="inline-flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                          <button 
                            onClick={() => setInputMode('voice')}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-hero tracking-widest transition-all",
                              inputMode === 'voice' ? "bg-medical-teal/20 text-medical-teal" : "text-slate-500 hover:text-white"
                            )}
                          >
                            <Mic className="w-3 h-3" /> Voice
                          </button>
                          <button 
                            onClick={() => setInputMode('text')}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-hero tracking-widest transition-all",
                              inputMode === 'text' ? "bg-medical-teal/20 text-medical-teal" : "text-slate-500 hover:text-white"
                            )}
                          >
                            <MessageSquare className="w-3 h-3" /> Type
                          </button>
                       </div>
                    </div>

                    {/* Minimal Waveform when in Text mode or smaller */}
                    <div className={cn("px-8 transition-all duration-500 overflow-hidden", inputMode === 'voice' ? "h-24 opacity-100 py-2" : "h-0 opacity-0")}>
                       <Waveform state={state} isMuted={isMuted} />
                    </div>

                    {/* Chat Log */}
                    <div className="flex-1 overflow-hidden flex flex-col mx-4 mb-2 rounded-2xl bg-black/20 border border-white/10">
                      <div className="p-2 px-4 flex justify-between items-center bg-white/5 border-b border-white/5">
                         <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Encrypted Session Log</span>
                         <button onClick={clearChat} className="text-[9px] font-mono text-slate-600 hover:text-medical-red transition-colors flex items-center gap-1 uppercase">
                           <Trash2 className="w-3 h-3" /> Clear
                         </button>
                      </div>
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((m) => (
                          <div key={m.id} className={cn("flex flex-col group", m.role === 'user' ? "items-end" : "items-start")}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              {m.role === 'aria' && <Bot className="w-3 h-3 text-medical-teal/50" />}
                              <span className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-widest">
                                {m.role === 'user' ? 'You' : 'ARIA'}
                                {m.mode && <span className="ml-2 text-slate-700">{m.mode === 'voice' ? '🎙️' : '⌨️'}</span>}
                              </span>
                              <span className="text-[8px] font-mono text-slate-700">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={cn(
                              "max-w-[85%] p-3 text-[13px] leading-relaxed shadow-sm",
                              m.role === 'user' 
                                ? "bg-medical-blue/20 text-white rounded-2xl rounded-tr-none border border-medical-blue/30" 
                                : "bg-white/5 text-slate-300 rounded-2xl rounded-tl-none border border-white/10"
                            )}>
                              {m.content.replace(/\[NAV:.*?\]/g, '').replace(/\[SUG:.*?\]/g, '').trim()}
                              {m.role === 'aria' && (
                                <div className="mt-2 pt-2 border-t border-white/5 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => speak(m.content)}
                                     className="text-slate-500 hover:text-medical-teal transition-colors"
                                   >
                                      <Volume2 className="w-3 h-3" />
                                   </button>
                                   <button 
                                     onClick={() => navigator.clipboard.writeText(m.content)}
                                     className="text-slate-500 hover:text-medical-teal transition-colors"
                                   >
                                      <Download className="w-3 h-3" />
                                   </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {state === 'processing' && (
                          <div className="flex items-center gap-2 px-4 py-2">
                             <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <motion.div 
                                    key={i}
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                    className="w-1 h-1 bg-medical-teal rounded-full"
                                  />
                                ))}
                             </div>
                             <span className="text-[10px] text-medical-teal/60 font-mono italic">ARIA is thinking...</span>
                          </div>
                        )}
                        {interimText && (
                          <div className="flex flex-col items-end">
                             <div className="max-w-[85%] p-3 text-[13px] leading-relaxed bg-white/10 text-slate-500 italic rounded-2xl rounded-tr-none border border-dashed border-white/10">
                               {interimText}
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Suggestions Chips */}
                      {suggestions.length > 0 && inputMode === 'text' && (
                         <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-black/20">
                            {suggestions.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => handleUserMessage(s, 'text')}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] text-slate-400 hover:text-medical-teal hover:border-medical-teal/30 hover:bg-medical-teal/5 transition-all"
                              >
                                {s}
                              </button>
                            ))}
                         </div>
                      )}
                    </div>

                    {/* Bottom Input Area */}
                    <div className="p-4 bg-navy/60 border-t border-white/5 space-y-3">
                       {inputMode === 'text' ? (
                         <form onSubmit={handleTextSubmit} className="flex gap-2">
                           <div className="flex-1 relative">
                              <textarea 
                                ref={inputRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleTextSubmit();
                                  }
                                }}
                                placeholder="Type your health inquiry..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-medical-teal/40 transition-all resize-none max-h-32"
                                rows={1}
                              />
                              <button 
                                type="button"
                                onClick={() => setInputMode('voice')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-medical-teal"
                              >
                                <Mic className="w-4 h-4" />
                              </button>
                           </div>
                           <button 
                             type="submit"
                             disabled={!inputText.trim() || state === 'processing'}
                             className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                               inputText.trim() ? "bg-medical-teal text-navy shadow-[0_0_15px_rgba(0,255,209,0.3)]" : "bg-white/5 text-slate-600"
                             )}
                           >
                              <Send className="w-5 h-5" />
                           </button>
                         </form>
                       ) : (
                         <div className="flex items-center gap-3">
                            <button 
                              onMouseDown={() => {
                                synthRef.current.cancel();
                                recognitionRef.current?.start();
                              }}
                              onMouseUp={() => state === 'listening' && recognitionRef.current?.stop()}
                              onMouseLeave={() => state === 'listening' && recognitionRef.current?.stop()}
                              className={cn(
                                "flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95",
                                state === 'listening' ? "bg-medical-blue text-white shadow-[0_0_30px_#0066FF]" : "bg-medical-teal text-navy shadow-[0_0_20px_rgba(0,255,209,0.3)]"
                              )}
                            >
                               <Mic className={cn("w-6 h-6", state === 'listening' && "animate-pulse")} />
                               <span className="text-xs font-hero uppercase tracking-widest">{state === 'listening' ? 'Releasing to Matrix' : 'Hold to Sync Voice'}</span>
                            </button>
                            <button 
                              onClick={() => setInputMode('text')}
                              className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/10"
                            >
                               <MessageSquare className="w-5 h-5" />
                            </button>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 p-6 space-y-8 overflow-y-auto">
                    <h4 className="text-[10px] font-hero text-medical-teal uppercase tracking-[0.3em] border-b border-white/5 pb-4">Unified Configuration</h4>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">Audio Matrix</p>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Neural Volume</span>
                          <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-32 accent-medical-teal" />
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Auto-Speak Replies</span>
                          <button onClick={() => setAutoSpeak(!autoSpeak)} className={cn("px-4 py-2 rounded-lg text-[10px] font-bold transition-all", autoSpeak ? "bg-medical-teal/20 text-medical-teal" : "bg-white/5 text-slate-500")}>
                             {autoSpeak ? 'ACTIVE' : 'DEACTIVATED'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">Visual Interface</p>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Show Suggestions</span>
                          <div className="flex gap-2">
                             <div className="w-10 h-5 bg-black/40 rounded-full relative p-1 cursor-pointer border border-white/10" onClick={() => setShowTranscript(!showTranscript)}>
                                <motion.div animate={{ x: showTranscript ? 20 : 0 }} className="w-3 h-3 bg-medical-teal rounded-full" />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-medical-teal/5 border border-medical-teal/10 rounded-xl mt-auto">
                       <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
                         User: {auth.currentUser?.email}<br />
                         Environment: Secure Medical Cloud<br />
                         Version: 2.1.0 Neural-Flash
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
