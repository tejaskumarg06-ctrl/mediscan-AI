import React, { useState } from 'react';
import { Eye, ChevronRight, Activity, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Scanner from './Scanner';
import { geminiService, ScanResult } from '../services/geminiService';
import { db, auth, handleFirestoreError } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function EyeModule({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'scan' | 'processing' | 'result'>('scan');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setStep('processing');
    try {
      const diagResult = await geminiService.analyzeEyeScan(image);
      setResult(diagResult);
      
      // Save to Firebase
      if (auth.currentUser) {
        await addDoc(collection(db, 'scans'), {
          userId: auth.currentUser.uid,
          type: 'eye',
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
      setStep('scan'); // Back to scan on error for now
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
            <h3 className="meta-label text-teal">Analysis Results</h3>
            <div className="clinical-card mt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Primary Condition Match</p>
              <h4 className="text-2xl font-bold mb-4">{result.diagnosis}</h4>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-light text-teal leading-none">{Math.round(result.confidence * 100)}</span>
                <span className="text-sm text-teal/40 font-mono pb-1">% confidence</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="meta-label">Detected Indicators</p>
              <div className="space-y-1 mt-3">
                {result.findings.map((finding, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 group hover:bg-white/5 transition-colors">
                    <span className="text-xs text-slate-300 italic">{finding}</span>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter",
                      result.severity === 'high' ? "bg-red-500/20 text-red-400" : 
                      result.severity === 'medium' ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                    )}>
                      {result.severity === 'high' ? 'CRITICAL' : 'DETECTED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button onClick={onComplete} className="btn-primary">
                Save & Export Report
              </button>
              <p className="text-center text-[10px] text-slate-500 font-mono tracking-widest">
                OR <a href="#" className="text-white underline underline-offset-4 decoration-teal/40">FIND NEAREST CLINIC</a>
              </p>
            </div>
          </div>
        </aside>

        {/* Target Viewport for Result */}
        <div className="md:col-span-8 lg:col-span-9 viewport-container flex-col p-12 overflow-auto">
          <div className="absolute top-12 left-12">
            <p className="text-[10px] font-mono text-teal mb-1 italic uppercase tracking-widest">POST_ANALYSIS_VIEW_042</p>
            <h2 className="text-4xl font-light tracking-tighter text-white uppercase">Reference Capture</h2>
          </div>
          
          <div className="w-full max-w-4xl space-y-12 py-20">
            <div className="relative group">
              <img 
                src={capturedImage!} 
                alt="Captured eye scan" 
                className="w-full h-auto rounded-lg border border-teal/20 filter saturate-[0.8] brightness-[0.9]" 
              />
              <div className="absolute inset-0 border-[20px] border-navy/40 pointer-events-none rounded-lg" />
              {/* Markers */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-teal/40 rounded-full animate-pulse" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="clinical-card">
                <h5 className="meta-label">Clinical Impression</h5>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  Visual markers suggest early indications as listed in findings. High quality capture allowed for {Math.round(result.confidence * 100)}% accuracy on neural classification.
                </p>
              </div>
              <div className="clinical-card border-teal/20 bg-teal/5">
                <h5 className="meta-label text-teal">Mandatory Recommendations</h5>
                <ul className="space-y-4 mt-4">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-white/80 leading-relaxed flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-teal mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
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
      title="Eye Diagnostic Scan"
      description="Align your eye within the frame. Ensure good lighting for highest diagnostic accuracy."
      isProcessing={step === 'processing'}
      processingTitle="Analyzing Ocular Data"
      processingDescription="Cross-referencing with clinical database..."
    />
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
