import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Upload, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ScannerProps {
  onCapture: (imageBuffer: string) => void;
  title: string;
  description: string;
  isProcessing?: boolean;
  processingTitle?: string;
  processingDescription?: string;
}

export default function Scanner({ 
  onCapture, 
  title, 
  description, 
  isProcessing,
  processingTitle = "AI NEURAL ANALYSIS",
  processingDescription = "Pattern Match & Diagnosis Logic"
}: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera access denied. Please enable permissions and refresh.");
      }
    }
    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureFrame = () => {
    if (!videoRef.current || isProcessing) return;
    setCapturing(true);
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setLastCapturedImage(dataUrl);
      onCapture(dataUrl);
    }
    setCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLastCapturedImage(event.target.result as string);
        onCapture(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="flex-1 viewport-container group relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 z-20">
            <ShieldAlert className="w-12 h-12 text-red-500" />
            <p className="text-red-400 font-medium text-xs uppercase tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-outline scale-90">
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover scale-x-[-1] opacity-60 transition-opacity duration-700",
                isProcessing && "opacity-20 grayscale"
              )}
            />
            <div className="scan-line" />
            
            {/* HUD Overlays */}
            <div className="absolute top-12 left-12 z-20">
              <p className="text-[10px] font-mono text-teal mb-1 italic uppercase tracking-widest">LIVE_SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
              <h2 className="text-4xl font-light tracking-tighter text-white uppercase">{title}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">{description}</p>
            </div>

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-12 lg:p-24 pointer-events-none">
              <div className="w-full h-full relative max-w-2xl max-h-[500px]">
                {/* Visual Glow Layer */}
                <div className="absolute inset-0 bg-teal/5 blur-3xl rounded-full" />
                
                <motion.div 
                  animate={{ 
                    scale: isProcessing ? 0.95 : [1, 1.02, 1],
                    opacity: isProcessing ? 0.2 : 1
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border border-teal/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.05)]"
                >
                  <div className="w-3/4 h-3/4 border border-teal/10 rounded-full"></div>
                  <div className="w-[120%] h-[1px] bg-teal/20 absolute top-1/2 -left-[10%]"></div>
                </motion.div>

                {/* Animated Corners */}
                {[
                  { pos: "-top-4 -left-4", border: "border-t-2 border-l-2" },
                  { pos: "-top-4 -right-4", border: "border-t-2 border-r-2" },
                  { pos: "-bottom-4 -left-4", border: "border-b-2 border-l-2" },
                  { pos: "-bottom-4 -right-4", border: "border-b-2 border-r-2" },
                ].map((corner, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      scale: isProcessing ? 0.8 : [1, 1.1, 1],
                      opacity: isProcessing ? 0.3 : 1
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className={cn("absolute w-10 h-10 border-teal shadow-[0_0_15px_#2dd4bf33]", corner.pos, corner.border)} 
                  />
                ))}
              </div>
            </div>

            {/* Processing Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-navy/60 backdrop-blur-sm"
                >
                  {lastCapturedImage && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative mb-12"
                    >
                      <img src={lastCapturedImage} className="w-64 h-64 object-cover rounded-full border-4 border-teal shadow-[0_0_50px_rgba(45,212,191,0.3)] animate-pulse" />
                      <div className="absolute inset-0 border-4 border-teal rounded-full animate-ping opacity-25" />
                    </motion.div>
                  )}

                  <div className="w-80 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono text-teal uppercase tracking-widest animate-pulse">Processing Frame...</p>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{processingTitle}</h3>
                      </div>
                      <span className="text-2xl font-mono text-teal">
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          _
                        </motion.span>
                      </span>
                    </div>

                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="h-full bg-teal shadow-[0_0_15px_#2dd4bf]"
                      />
                    </div>

                    <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-widest">
                      <span>{processingDescription}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
              <button 
                onClick={captureFrame}
                disabled={capturing || isProcessing}
                className={cn(
                  "w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group/btn",
                  isProcessing && "opacity-0 pointer-events-none"
                )}
              >
                <div className="w-16 h-16 rounded-full border border-navy/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-navy/5 group-hover/btn:bg-teal/20 transition-colors" />
                </div>
              </button>
            </div>

            <div className="absolute bottom-12 right-12 z-20 hidden md:block">
              <div className="h-12 w-56 border border-teal-500/30 flex items-center px-4 bg-navy/80 backdrop-blur rounded-sm">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                    className="h-full bg-teal"
                  />
                </div>
                <span className="ml-4 font-mono text-[10px] text-teal">SYNCING</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-14 border-t border-medical-border px-8 flex items-center justify-between bg-navy/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-[10px] font-mono text-teal uppercase tracking-widest">Biometric isolation active</span>
        </div>
        <label className={cn(
          "flex items-center gap-2 text-slate-500 hover:text-white cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-widest",
          isProcessing && "opacity-50 pointer-events-none"
        )}>
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Archive</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} />
        </label>
      </div>
    </div>
  );
}
