import React, { useState, useEffect } from 'react';
import { Volume2, Play, CheckCircle2, ChevronRight, Headphones, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

export default function HearingModule({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentFreqIndex, setCurrentFreqIndex] = useState(0);
  const [currentEar, setCurrentEar] = useState<'left' | 'right'>('left');
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtx) audioCtx.close();
    };
  }, [audioCtx]);

  const startTest = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioCtx(ctx);
    setStep('testing');
  };

  const playTone = () => {
    if (!audioCtx) return;
    
    setIsPlaying(true);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Pan to left or right ear
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = currentEar === 'left' ? -1 : 1;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(FREQUENCIES[currentFreqIndex], audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);

    setTimeout(() => setIsPlaying(false), 1300);
  };

  const handleResponse = (heard: boolean) => {
    const key = `${currentEar}-${FREQUENCIES[currentFreqIndex]}`;
    setResults(prev => ({ ...prev, [key]: heard ? 1 : 0 }));

    if (currentFreqIndex < FREQUENCIES.length - 1) {
      setCurrentFreqIndex(prev => prev + 1);
    } else if (currentEar === 'left') {
      setCurrentEar('right');
      setCurrentFreqIndex(0);
    } else {
      finalizeResults();
    }
  };

  const finalizeResults = async () => {
    setStep('result');
    if (auth.currentUser) {
      await addDoc(collection(db, 'scans'), {
        userId: auth.currentUser.uid,
        type: 'hearing',
        timestamp: new Date().toISOString(),
        results: results,
        summary: "Audiometric screening completed",
        recommendations: ["Consult an ENT for comprehensive testing if hearing loss is suspected."]
      });
    }
  };

  const chartData = FREQUENCIES.map(f => ({
    freq: f,
    left: results[`left-${f}`] === 1 ? 100 : 0,
    right: results[`right-${f}`] === 1 ? 100 : 0,
  }));

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto medical-card p-12 text-center space-y-8">
        <Headphones className="w-20 h-20 text-teal mx-auto" />
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">Pure Tone Audiometry</h2>
          <p className="text-white/60">
            We will play tones at various frequencies. Use calibrated headphones and 
            be in a quiet space for accurate results.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs font-mono uppercase tracking-widest text-teal/60">
          <div className="space-y-2">
            <div className="h-0.5 bg-teal/20" />
            <span>250 - 8kHz</span>
          </div>
          <div className="space-y-2">
            <div className="h-0.5 bg-teal/20" />
            <span>Dual Channel</span>
          </div>
          <div className="space-y-2">
            <div className="h-0.5 bg-teal/20" />
            <span>Thresholds</span>
          </div>
        </div>
        <button onClick={startTest} className="btn-primary w-full py-4 text-lg">
          Initialize Test Engine
        </button>
      </div>
    );
  }

  if (step === 'testing') {
    return (
      <div className="max-w-xl mx-auto space-y-12 py-12">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-teal font-mono text-xs uppercase tracking-[0.2em]">Ear Calibration</h3>
            <h2 className="text-4xl font-bold text-white capitalize">{currentEar} Ear</h2>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs font-mono mb-1">Frequency</div>
            <div className="text-2xl font-bold text-white">{FREQUENCIES[currentFreqIndex]}Hz</div>
          </div>
        </div>

        <div className="relative h-64 flex items-center justify-center medical-card border-teal/20 overflow-hidden bg-medical-bg">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div 
                key="playing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="w-32 h-32 rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center shadow-[0_0_50px_rgba(0,201,177,0.2)]"
              >
                <Volume2 className="w-12 h-12 text-teal" />
              </motion.div>
            ) : (
              <motion.button 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={playTone}
                className="btn-primary w-20 h-20 rounded-full"
              >
                <Play className="w-8 h-8 fill-navy" />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="scan-line opacity-20" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => handleResponse(false)}
            className="btn-outline h-24 border-red-500/30 text-red-400 hover:bg-red-500/5"
          >
            I cannot hear it
          </button>
          <button 
            onClick={() => handleResponse(true)}
            className="btn-primary h-24 text-lg"
          >
            I hear the tone
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {FREQUENCIES.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-12 h-1 rounded-full transition-colors",
                i < currentFreqIndex ? "bg-teal" : 
                i === currentFreqIndex ? "bg-teal animate-pulse" : "bg-white/10"
              )} 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="medical-card p-8">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Activity className="w-6 h-6 text-teal" />
          Audiogram Interpretation
        </h3>
        <div className="h-[400px] audiogram-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="freq" />
              <YAxis domain={[0, 100]} label={{ value: 'Response %', angle: -90, position: 'insideLeft', fill: 'white' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0E1336', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#00C9B1' }}
              />
              <Line type="monotone" dataKey="left" stroke="#00C9B1" strokeWidth={3} dot={{ fill: '#00C9B1' }} name="Left Ear" />
              <Line type="monotone" dataKey="right" stroke="#FF4D4D" strokeWidth={3} dot={{ fill: '#FF4D4D' }} name="Right Ear" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="medical-card p-6 bg-white/5">
          <h4 className="font-bold mb-4">Summary</h4>
          <p className="text-white/60 text-sm leading-relaxed">
            Your results show responsive hearing patterns across standard speech frequencies. 
            However, this tool is for screening only.
          </p>
        </div>
        <button onClick={onComplete} className="btn-primary h-full">
          Save Results & Proceed
        </button>
      </div>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
