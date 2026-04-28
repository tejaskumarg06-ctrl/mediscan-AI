import React, { useState } from 'react';
import { Activity, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Scanner from './Scanner';
import { geminiService, ScanResult } from '../services/geminiService';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function EarModule({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'scan' | 'processing' | 'result'>('scan');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setStep('processing');
    try {
      const diagResult = await geminiService.analyzeEarScan(image);
      setResult(diagResult);
      
      if (auth.currentUser) {
        await addDoc(collection(db, 'scans'), {
          userId: auth.currentUser.uid,
          type: 'ear',
          timestamp: new Date().toISOString(),
          results: diagResult,
          confidenceScore: diagResult.confidence,
          severity: diagResult.severity,
          summary: diagResult.diagnosis,
          recommendations: diagResult.recommendations
        });
      }
      
      setStep('result');
    } catch (error) {
      console.error(error);
      setStep('scan');
    }
  };

  if (step === 'result' && result) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full grid grid-cols-1 md:grid-cols-12 overflow-hidden"
      >
        {/* Results Panel */}
        <aside className="md:col-span-4 lg:col-span-3 p-10 bg-slate-900/20 border-r border-medical-border overflow-auto flex flex-col gap-8">
          <div>
            <h3 className="meta-label text-teal">ENT Clinical Report</h3>
            <div className="clinical-card mt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Primary Observation</p>
              <h4 className="text-2xl font-bold mb-4">{result.diagnosis}</h4>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-light text-teal leading-none">{Math.round(result.confidence * 100)}</span>
                <span className="text-sm text-teal/40 font-mono pb-1">% confidence</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="meta-label">Pathological Markers</p>
              <div className="space-y-1 mt-3">
                {result.findings.map((finding, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 group hover:bg-white/5 transition-colors">
                    <span className="text-xs text-slate-300 italic">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4">
               <div className={cn(
                "p-4 rounded border-l-4 bg-white/5",
                result.severity === 'high' ? "border-l-red-500" : 
                result.severity === 'medium' ? "border-l-amber-500" : "border-l-green-500"
              )}>
                <p className="meta-label">Severity Level</p>
                <p className="text-xs font-mono uppercase text-white/80">{result.severity} Priority</p>
              </div>

              <button onClick={onComplete} className="btn-primary">
                Archive Diagnostic
              </button>
            </div>
          </div>
        </aside>

        {/* Viewport for Result image */}
        <div className="md:col-span-8 lg:col-span-9 viewport-container flex-col p-12 overflow-auto">
          <div className="absolute top-12 left-12">
            <p className="text-[10px] font-mono text-teal mb-1 italic uppercase tracking-widest">OTOLOGIC_RECORD_099</p>
            <h2 className="text-4xl font-light tracking-tighter text-white uppercase">Canal Reference</h2>
          </div>
          
          <div className="w-full max-w-4xl space-y-12 py-20">
             <div className="relative rounded-lg overflow-hidden border border-white/5">
                <img src={capturedImage!} alt="Ear scan" className="w-full h-auto opacity-80" />
                <div className="scan-line opacity-20" />
             </div>

             <div className="clinical-card bg-teal/5 border-teal/20">
                <h5 className="meta-label text-teal">Actionable recommendations</h5>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-navy/40 border border-white/5 rounded text-xs text-slate-300 leading-relaxed italic">
                      {rec}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Scanner 
      onCapture={handleCapture}
      title="Ear Canal Analysis"
      description="Use a close-up macro photo of the ear canal. Ensure the area is well lit and focused."
      isProcessing={step === 'processing'}
      processingTitle="Analyzing Otological Data"
      processingDescription="Cross-referencing tympanic membrane markers..."
    />
  );
}
