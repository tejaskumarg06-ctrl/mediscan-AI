import React, { useState, useRef, useEffect } from 'react';
import { Eye, Ruler, User, ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const SNELLEN_ROWS = [
  { letters: 'E', size: '20/200' },
  { letters: 'FP', size: '20/100' },
  { letters: 'TOZ', size: '20/70' },
  { letters: 'LPED', size: '20/50' },
  { letters: 'PECFD', size: '20/40' },
  { letters: 'EDFCZP', size: '20/30' },
  { letters: 'FELOPZD', size: '20/25' },
  { letters: 'DEFPOTEC', size: '20/20' },
];

export default function VisionModule({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'calibrate' | 'testing' | 'result'>('calibrate');
  const [currentRow, setCurrentRow] = useState(0);
  const [currentEar, setCurrentEar] = useState<'left' | 'right'>('left');
  const [errorsInRow, setErrorsInRow] = useState(0);
  const [results, setResults] = useState<{ left: string; right: string }>({ left: '20/200', right: '20/200' });
  const [distance, setDistance] = useState(0); // in hypothetical units
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === 'calibrate') {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    }
  }, [step]);

  const handleValidation = (correct: boolean) => {
    if (!correct) {
      setErrorsInRow(prev => prev + 1);
    }

    if (currentRow < SNELLEN_ROWS.length - 1 && (correct || errorsInRow < 1)) {
      setCurrentRow(prev => prev + 1);
      setResults(prev => ({ ...prev, [currentEar]: SNELLEN_ROWS[currentRow].size }));
    } else {
      if (currentEar === 'left') {
        setCurrentEar('right');
        setCurrentRow(0);
        setErrorsInRow(0);
      } else {
        finalize();
      }
    }
  };

  const finalize = async () => {
    setStep('result');
    if (auth.currentUser) {
      await addDoc(collection(db, 'scans'), {
        userId: auth.currentUser.uid,
        type: 'vision',
        timestamp: new Date().toISOString(),
        results: results,
        summary: `Visual acuity: L:${results.left} R:${results.right}`,
        recommendations: ["Comprehensive eye exam recommended annually."]
      });
    }
  };

  if (step === 'calibrate') {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <div className="medical-card p-8 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
               <Ruler className="text-teal" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Calibration</h3>
               <p className="text-white/40 text-sm">Step back roughly 3 feet (1 meter) from the screen.</p>
             </div>
          </div>
          
          <div className="aspect-video relative rounded-lg overflow-hidden bg-black/40">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-48 h-64 border-2 border-teal/50 rounded-full border-dashed animate-pulse text-teal/40 flex items-end justify-center pb-8 text-xs font-mono">
                 HEAD POSITION
               </div>
             </div>
          </div>

          <button onClick={() => setStep('testing')} className="btn-primary w-full">I am at required distance</button>
        </div>
      </div>
    );
  }

  if (step === 'testing') {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center space-y-12 py-8">
        <div className="text-center space-y-2">
            <span className="text-teal/40 font-mono text-xs uppercase tracking-widest">Acuity Test</span>
            <h2 className="text-3xl font-bold">Cover your {currentEar === 'left' ? 'right' : 'left'} eye</h2>
            <p className="text-white/40">Read the letters below from left to right</p>
        </div>

        <div className="flex flex-col items-center justify-center h-80 w-full medical-card bg-white p-12 text-black">
           <AnimatePresence mode="wait">
             <motion.div 
               key={currentRow}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="font-serif font-black tracking-[0.4em] text-center"
               style={{ 
                 fontSize: `${(10 - currentRow) * 1.5}rem`,
                 lineHeight: 1
               }}
             >
               {SNELLEN_ROWS[currentRow].letters}
             </motion.div>
           </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
           <button onClick={() => handleValidation(false)} className="btn-outline border-white/20 text-white/60">
             <X className="w-5 h-5 mr-2" /> Incorrect
           </button>
           <button onClick={() => handleValidation(true)} className="btn-primary">
             <Check className="w-5 h-5 mr-2" /> Correct
           </button>
        </div>

        <div className="font-mono text-xs text-white/40">
          ROW {currentRow + 1} OF 8 | CURRENT LEVEL: {SNELLEN_ROWS[currentRow].size}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="medical-card p-12 text-center space-y-8">
        <div className="w-20 h-20 rounded-full border-4 border-teal flex items-center justify-center mx-auto text-teal">
          <Eye className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Vision Assessment Finalized</h2>
          <p className="text-white/60">Your estimated visual acuity based on digital Snellen standards:</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8">
           <div className="space-y-1">
             <div className="text-white/40 text-xs font-mono uppercase tracking-widest">Left Eye</div>
             <div className="text-4xl font-bold text-teal">{results.left}</div>
           </div>
           <div className="space-y-1">
             <div className="text-white/40 text-xs font-mono uppercase tracking-widest">Right Eye</div>
             <div className="text-4xl font-bold text-teal">{results.right}</div>
           </div>
        </div>

        <button onClick={onComplete} className="btn-primary w-full">Back to Dashboard</button>
      </div>
    </div>
  );
}
