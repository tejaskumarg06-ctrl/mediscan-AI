import React from 'react';
import { Cpu, Zap, Microscope, Brain, Database, Globe } from 'lucide-react';
import { motion, animate } from 'motion/react';
import { cn } from '../lib/utils';

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  React.useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(Number(latest.toFixed(decimals)))
    });
    return () => controls.stop();
  }, [value, decimals]);
  return <span>{displayValue}</span>;
}

export default function Technology() {
  const techStack = [
    { title: 'Neural Engine V6', desc: 'Custom ML models trained on over 500k clinical datasets for high-accuracy diagnostics.', icon: Brain, color: 'text-medical-teal' },
    { title: 'OCR Intelligence', desc: 'Advanced optical character recognition for digitizing legacy medical paper reports.', icon: Microscope, color: 'text-medical-blue' },
    { title: 'Distributed Edge', desc: 'Low-latency inference processing across a global edge network for instant results.', icon: Globe, color: 'text-purple-400' },
    { title: 'Quantum Encryption', desc: 'Future-proof cryptographic foundations for long-term health record security.', icon: Zap, color: 'text-medical-teal' },
    { title: 'Vector DB Sync', desc: 'Real-time synchronization across medical institutions using high-dimensional vector databases.', icon: Database, color: 'text-medical-blue' },
    { title: 'AI Orchestration', desc: 'Automated referral generation based on multi-modal health indicators.', icon: Cpu, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-blue/10 border border-medical-blue/20 rounded text-[10px] font-mono text-medical-blue uppercase tracking-widest">
           <Cpu className="w-3 h-3 animate-spin-slow" />
           Engine: V6.1.0-TS
        </div>
        <h2 className="text-5xl font-hero text-gradient uppercase tracking-tight">Technological Infrastructure</h2>
        <p className="text-slate-500 text-sm max-w-xl font-medium">MediScan AI leverages the absolute frontier of computational medicine to deliver laboratory-grade insights at scale.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techStack.map((t, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 rounded-2xl group hover:glow-border transition-all card-lift relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={cn("w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-all", t.color)}>
              <t.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-hero text-white mb-3 uppercase tracking-tight">{t.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">{t.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="glass-panel p-10 rounded-2xl border-medical-blue/30 relative">
          <div className="absolute top-4 right-6">
             <div className="flex gap-1 items-end h-8">
                {[0.2, 0.5, 0.8, 0.4, 0.9].map((h, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }} 
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-medical-blue" 
                  />
                ))}
             </div>
          </div>
          <h4 className="meta-label">Signal Latency</h4>
          <div className="flex items-end gap-3 mt-6 text-white">
            <span className="text-6xl font-hero text-gradient-blue"><Counter value={14.2} decimals={1} /></span>
            <span className="text-xs font-mono text-slate-500 mb-4 tracking-widest">MS</span>
          </div>
          <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '80%' }}
               className="h-full bg-medical-blue shadow-[0_0_10px_#0066FF]" 
             />
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Critical Target {'<'} 20ms</span>
            <span>Current: Valid</span>
          </div>
        </div>
        
        <div className="glass-panel p-10 rounded-2xl border-medical-teal/30 relative">
          <div className="absolute top-4 right-6">
             <div className="w-10 h-10 border border-medical-teal/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-medical-teal rounded-full animate-ping opacity-20" />
                <Zap className="w-4 h-4 text-medical-teal animate-pulse" />
             </div>
          </div>
          <h4 className="meta-label">Inference Accuracy</h4>
          <div className="flex items-end gap-3 mt-6 text-white">
            <span className="text-6xl font-hero text-gradient"><Counter value={99.8} decimals={1} /></span>
            <span className="text-xs font-mono text-slate-500 mb-4 tracking-widest">%</span>
          </div>
          <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '99.8%' }}
               className="h-full bg-medical-teal shadow-[0_0_10px_#00FFD1]" 
             />
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Threshold: 0.95</span>
            <span>Delta: +0.02%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
