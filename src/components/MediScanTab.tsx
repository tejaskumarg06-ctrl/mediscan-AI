import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, Upload, Activity, Shield, AlertCircle, CheckCircle2, Microscope, Dna } from 'lucide-react';

export const MediScanTab: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<null | { status: string, diagnosis: string, confidence: number }>(null);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setResult(null);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setResult({
            status: 'COMPLETED',
            diagnosis: 'No significant abnormalities detected in the provided imaging data. AI recommends routine follow-up in 6 months.',
            confidence: 98.4
          });
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto no-scrollbar bg-[#050505]">
      {/* Header section */}
      <div className="flex justify-between items-start border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Microscope className="text-blue-500" /> MEDISCAN AI <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono uppercase">Core_v2</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Autonomous Diagnostic Neural Network // Patient_ID: #882-991</p>
        </div>
        <div className="flex gap-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center min-w-[100px]">
            <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">System Status</div>
            <div className="text-emerald-500 text-xs font-mono font-bold mt-1">READY</div>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center min-w-[100px]">
            <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Network Load</div>
            <div className="text-blue-400 text-xs font-mono font-bold mt-1">12.4%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scanner Visualization */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden group">
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] z-20"
                />
              )}
            </AnimatePresence>

            {!isScanning && !result && (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500" size={32} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Upload Diagnostic Data</h3>
                <p className="text-white/40 text-sm max-w-[200px] mx-auto">Drop MRI, CT, or Ultrasound files here to begin neural scan.</p>
                <button 
                  onClick={startScan}
                  className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  START ANALYSIS
                </button>
              </div>
            )}

            {isScanning && (
              <div className="text-center z-10">
                <Dna className="text-blue-500 mx-auto mb-4 animate-spin-slow" size={48} />
                <div className="text-4xl font-mono font-bold text-white mb-2">{scanProgress}%</div>
                <div className="text-xs text-blue-400 font-mono tracking-widest uppercase">Scanning Tissues...</div>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center p-8">
                <CheckCircle2 className="text-emerald-500 mb-4" size={64} />
                <h3 className="text-emerald-400 font-bold text-xl mb-4 uppercase tracking-tighter">Analysis Complete</h3>
                <div className="w-full bg-white/5 p-4 rounded-xl border border-emerald-500/20 text-white/80 text-sm leading-relaxed text-center italic">
                   "{result.diagnosis}"
                </div>
                <button 
                  onClick={() => setResult(null)}
                  className="mt-6 px-6 py-2 border border-white/20 text-white/60 hover:text-white rounded-full text-xs font-bold transition-all"
                >
                  RESET SCANNER
                </button>
              </motion.div>
            )}
          </div>

          {/* Real-time Telemetry Mock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Neural Sync</span>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-mono font-bold text-white">0.992</div>
                <div className="text-[10px] text-emerald-500 font-bold mb-1">STABLE</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-mono font-bold text-white">L4</div>
                <div className="text-[10px] text-amber-500 font-bold mb-1">PROTECTED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & History */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-500" /> AI DIAGNOSTIC INSIGHTS
              </h3>
              <span className="text-[10px] font-mono text-white/30">REF_ID: AX-77</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {[
                { title: "Anomaly Detection", value: "Normal", color: "text-emerald-500" },
                { title: "Symmetry Match", value: "94.2%", color: "text-blue-400" },
                { title: "Cellular Density", value: "Optimal", color: "text-emerald-500" },
                { title: "Pathogen Scan", value: "Negative", color: "text-emerald-500" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/60 text-xs font-medium">{item.title}</span>
                  <span className={`text-xs font-mono font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
               <p className="text-[11px] text-blue-400 leading-relaxed font-medium">
                 <span className="font-bold">SYSTEM_NOTE:</span> The AI has correlated current scan with historical data from Patient #882. No significant drift in metrics observed.
               </p>
            </div>
          </div>

          <div className="h-[200px] bg-[#0d0d0d] rounded-2xl border border-white/10 p-6">
             <h3 className="text-white/40 font-bold text-[10px] tracking-widest uppercase mb-4">DIAGNOSTIC LOGS</h3>
             <div className="font-mono text-[10px] space-y-1 text-white/20">
                <div>[15:42:01] BOOT_SEQUENCE: INITIALIZING_NEURAL_CORES...</div>
                <div>[15:42:04] AUTH: BIOMETRIC_VERIFIED (DIRECTOR_LEVEL)</div>
                <div>[15:42:10] SYSTEM: READY_FOR_INPUT</div>
                <div className="text-blue-500/50">[15:44:12] APP: CONNECTED_TO_GOOGLE_GENAI_V1.5</div>
                <div className="animate-pulse">_</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
