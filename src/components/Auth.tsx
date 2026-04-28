import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, ArrowRight, Shield, Cpu, Zap, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { cn } from '../lib/utils';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemId, setSystemId] = useState('');

  useEffect(() => {
    setSystemId(Math.random().toString(36).substring(2, 10).toUpperCase());
  }, []);

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-navy selection:bg-medical-teal/30">
      {/* Advanced Cyber Background */}
      <div className="absolute inset-0 bg-particle-grid opacity-[0.15] pointer-events-none" />
      <div className="light-bloom -top-[20%] -left-[10%] opacity-20 bg-medical-teal/30 scale-150" />
      <div className="light-bloom -bottom-[20%] -right-[10%] opacity-15 bg-medical-blue/30 scale-150" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ y: ['-100%', '1000%'] }} 
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-medical-teal/20 to-transparent z-[1] pointer-events-none"
      />

      <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-2 font-mono text-[9px] text-slate-700 tracking-widest uppercase">
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse" /> SYSTEM_HASH: {systemId}</div>
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-medical-blue" /> NODE_STATUS: OPTIMAL</div>
      </div>

      <div className="absolute bottom-10 right-10 hidden xl:flex flex-col gap-2 font-mono text-[9px] text-slate-700 tracking-widest uppercase text-right">
        <div>SECURITY_LAYER: AES-256-GCM</div>
        <div className="text-medical-teal/40">INITIALIZING_BIOMETRIC_HANDSHAKE...</div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative group"
      >
        {/* Corner Brackets */}
        <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-medical-teal/50 rounded-tl-lg" />
        <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-medical-teal/50 rounded-tr-lg" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-medical-teal/50 rounded-bl-lg" />
        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-medical-teal/50 rounded-br-lg" />

        <div className="glass-panel w-full rounded-[40px] p-12 lg:p-20 relative overflow-hidden backdrop-blur-3xl border border-white/5 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-medical-teal/0 via-medical-teal/50 to-medical-teal/0" />
          
          <div className="space-y-14 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 glass-panel rounded-full text-[10px] font-mono font-bold text-medical-teal uppercase tracking-[0.4em] border-medical-teal/20 shadow-[0_0_20px_rgba(0,255,209,0.1)]">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                VERIFICATION PROTOCOL
              </div>
              <div className="space-y-3">
                <h2 className="text-7xl font-hero text-gradient leading-[0.9] uppercase tracking-tighter">
                  {isLogin ? 'Establish' : 'Construct'} <br />
                  <span className="opacity-50 text-[0.8em] font-light">{isLogin ? 'Neural Link' : 'Entity Identity'}</span>
                </h2>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-md">
                  Establish a secure cryptographic session with the decentralized medical node infrastructure.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Animated Google Button */}
              <motion.button 
                onClick={handleGoogleAuth}
                disabled={loading}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="w-full group h-20 glass-panel rounded-3xl relative flex items-center justify-center gap-6 transition-all duration-500 hover:bg-medical-teal/10 hover:border-medical-teal/30 hover:shadow-[0_0_40px_rgba(0,255,209,0.15)] active:scale-[0.98]"
              >
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-medical-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  {loading ? (
                    <Loader2 className="w-7 h-7 text-medical-teal animate-spin" />
                  ) : (
                    <>
                      <motion.div 
                        animate={{ opacity: [0.1, 0.4, 0.1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-medical-teal blur-xl rounded-full scale-150" 
                      />
                      <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </>
                  )}
                </div>
                
                <span className="text-xs font-hero uppercase tracking-[0.4em] text-white group-hover:text-medical-teal transition-colors relative z-10">
                  Google Identity Sync
                </span>

                <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-medical-teal/50" />
                </div>
              </motion.button>

              <div className="flex items-center gap-10 text-[10px] font-mono uppercase text-slate-700">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                OR_LOCAL_ARCHIVE_HANDSHAKE
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-10">
                <div className="grid md:grid-cols-1 gap-10">
                  <div className="space-y-4">
                    <label className="meta-label flex items-center gap-2">
                       <Cpu className="w-3 h-3 text-medical-teal/50" /> Identifier Hash
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 transition-all duration-300 group-focus-within:text-medical-teal group-focus-within:scale-110" />
                      <input 
                        type="email" 
                        required
                        placeholder="clinical_id@nexus.node"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[20px] h-20 pl-16 pr-6 focus:border-medical-teal/50 focus:bg-white/[0.05] outline-none transition-all text-white text-base font-medium placeholder:text-slate-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="meta-label flex items-center gap-2">
                       <Zap className="w-3 h-3 text-medical-teal/50" /> Cryptographic Key
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 transition-all duration-300 group-focus-within:text-medical-teal group-focus-within:scale-110" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[20px] h-20 pl-16 pr-6 focus:border-medical-teal/50 focus:bg-white/[0.05] outline-none transition-all text-white text-base font-medium placeholder:text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 glass-panel border-medical-red/30 bg-medical-red/5 rounded-2xl flex items-start gap-5 text-medical-red text-[11px] font-mono leading-relaxed overflow-hidden"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-1" />
                      <div>
                        <span className="font-bold block mb-1">AUTH_FAILURE:</span>
                        {error.toUpperCase()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  type="submit" 
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-medical w-full h-20 rounded-3xl relative overflow-hidden group/btn shadow-[0_0_50px_rgba(0,255,209,0.1)] active:shadow-none transition-all"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-gradient-to-r from-medical-teal/0 via-white/5 to-medical-teal/0 animate-shimmer" />
                  <span className="relative z-10 flex items-center justify-center gap-4 uppercase font-hero text-[12px] tracking-[0.4em] text-navy font-bold">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Engage Node Access' : 'Forge System Identity'}
                        <Activity className="w-4 h-4 opacity-50" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>

            <div className="flex justify-center flex-col gap-6 items-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[11px] font-hero uppercase tracking-[0.3em] text-slate-500 hover:text-medical-teal transition-all flex items-center gap-3 group"
              >
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full group-hover:bg-medical-teal group-hover:shadow-[0_0_10px_#00FFD1] transition-all" />
                {isLogin ? "Request Registration Link" : "Return to Access Terminal"}
              </button>
              
              <div className="flex gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-1.5 h-1.5 bg-white/5 rounded-full" />
                 ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-medical-teal/5 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </motion.div>

      <div className="mt-20 max-w-lg text-center space-y-6">
        <div className="flex justify-center gap-12 opacity-20 filter grayscale">
           <div className="h-6 w-24 bg-white/10 rounded-sm" />
           <div className="h-6 w-24 bg-white/10 rounded-sm" />
           <div className="h-6 w-24 bg-white/10 rounded-sm" />
        </div>
        <p className="text-[10px] text-slate-800 font-mono uppercase tracking-[0.5em] leading-loose">
          INFRASTRUCTURE SECURED BY AES-256 GCM ENCRYPTION. <br /> 
          UNA_ACCESS_LOG: 192.168.1.1 [REDIRECTED]
        </p>
      </div>
    </div>
  );
}
