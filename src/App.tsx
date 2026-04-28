import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { auth, db } from './services/firebase';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const EyeModule = lazy(() => import('./components/EyeModule'));
const EarModule = lazy(() => import('./components/EarModule'));
const HearingModule = lazy(() => import('./components/HearingModule'));
const VisionModule = lazy(() => import('./components/VisionModule'));
const PatientHistory = lazy(() => import('./components/PatientHistory'));
const LabReports = lazy(() => import('./components/LabReports'));
const ClinicFinder = lazy(() => import('./components/ClinicFinder'));
const SafetyProtocols = lazy(() => import('./components/SafetyProtocols'));
const Technology = lazy(() => import('./components/Technology'));
const Assistant = lazy(() => import('./components/ARIA/Assistant').then(m => ({ default: m.Assistant })));
import { LogOut, Microscope, User as UserIcon, Bell, Hexagon, Activity, ShieldCheck, Radio, Clock as ClockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AbstractBlobs, DataStream } from './components/AestheticDecorations';

type AppState = 'landing' | 'auth' | 'dashboard' | 'history' | 'reports' | 'clinic' | 'protocols' | 'technology' | 'eye' | 'ear' | 'hearing' | 'vision';

function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-[10px] font-mono text-slate-400">
      {currentTime.toLocaleTimeString([], { hour12: false })}
    </span>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppState>('landing');
  const [hasNotifications, setHasNotifications] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          setScrollWidth(scrolled);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'auth') {
        setView('dashboard');
      }
      setLoading(false);
    });
    
    // Safety timeout for loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [view]);

  useEffect(() => {
    if (!user) {
      setHasNotifications(false);
      return;
    }

    const qScans = query(collection(db, 'scans'), where('userId', '==', user.uid), where('severity', '==', 'high'), limit(1));
    const qLabs = query(collection(db, 'labReports'), where('userId', '==', user.uid), where('status', '==', 'abnormal'), limit(1));
    
    const unsubScans = onSnapshot(qScans, {
      next: (snap) => {
        if (!snap.empty) setHasNotifications(true);
      },
      error: (err) => console.error("Notification scan error:", err)
    });
    const unsubLabs = onSnapshot(qLabs, {
      next: (snap) => {
        if (!snap.empty) setHasNotifications(true);
      },
      error: (err) => console.error("Notification lab error:", err)
    });

    return () => {
      unsubScans();
      unsubLabs();
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-2 border-medical-teal/20 border-t-medical-teal rounded-full"
          />
          <Hexagon className="absolute inset-0 m-auto w-10 h-10 text-medical-teal animate-pulse" />
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'System Hub' },
    { id: 'protocols', label: 'Safety Protocols' },
    { id: 'technology', label: 'Technology' },
    { id: 'reports', label: 'Lab Results' },
    { id: 'history', label: 'Health Records' },
    { id: 'clinic', label: 'Clinic Finder' },
  ];

  return (
    <div className="min-h-screen bg-navy text-white relative">
      <div id="scroll-progress" style={{ width: `${scrollWidth}%` }} />
      <div className="scanline-overlay" />
      <AbstractBlobs />
      <DataStream />
      
      <AnimatePresence mode="wait">
        <Suspense fallback={
          <div className="min-h-screen bg-navy flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-medical-teal/20 border-t-medical-teal rounded-full animate-spin" />
          </div>
        }>
          {view === 'landing' ? (

          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onGetStarted={() => setView(user ? 'dashboard' : 'auth')} />
          </motion.div>
        ) : view === 'auth' ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Auth onAuthSuccess={() => setView('dashboard')} />
          </motion.div>
        ) : (
          <div className="h-screen flex flex-col overflow-hidden bg-particle-grid">
            {/* Navigation Header */}
            <header className="h-20 border-b border-medical-border bg-navy/80 backdrop-blur-[20px] px-8 flex items-center justify-between z-50">
              <button onClick={() => setView('dashboard')} className="flex items-center gap-3 group relative">
                <div className="relative flex items-center justify-center">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute w-10 h-10 border border-medical-teal/20 rounded-lg group-hover:border-medical-teal/50"
                   />
                   <Hexagon className="w-6 h-6 text-medical-teal relative z-10 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-xl font-hero tracking-tighter uppercase text-gradient">
                  MEDISCAN <span className="opacity-70">AI</span>
                </span>
              </button>

              <nav className="hidden lg:flex items-center gap-10 relative h-full">
                {navItems.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={cn(
                      "relative h-full px-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-colors",
                      view === item.id ? "text-medical-teal" : "text-slate-500 hover:text-white"
                    )}
                  >
                    {item.label}
                    {view === item.id && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-medical-teal shadow-[0_0_10px_#00FFD1]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 px-4 py-2 bg-medical-teal/5 border border-medical-teal/20 rounded relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-medical-teal/40" />
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Digital RFID ID</span>
                    <span className="text-xs font-mono text-white/90 group-hover:text-medical-teal transition-colors">
                      PX-{user?.uid.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <ClockIcon className="w-3 h-3 text-slate-500" />
                    <Clock />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setView('history')}
                    className="w-10 h-10 glass-panel rounded-full flex items-center justify-center relative text-slate-400 hover:text-medical-teal transition-all hover:glow-border"
                  >
                    <Bell className="w-5 h-5" />
                    {hasNotifications && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-medical-red rounded-full border-2 border-navy animate-bounce" />
                    )}
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-medical-red/10 hover:border-medical-red/50 transition-all text-slate-400 hover:text-medical-red"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 overflow-auto bg-navy relative py-12 px-8">
               <div className="max-w-7xl mx-auto h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {view === 'dashboard' && <Dashboard onNavigate={(v) => setView(v)} />}
                    {view === 'eye' && <EyeModule onComplete={() => setView('dashboard')} />}
                    {view === 'ear' && <EarModule onComplete={() => setView('dashboard')} />}
                    {view === 'hearing' && <HearingModule onComplete={() => setView('dashboard')} />}
                    {view === 'vision' && <VisionModule onComplete={() => setView('dashboard')} />}
                    {view === 'protocols' && <SafetyProtocols />}
                    {view === 'technology' && <Technology />}
                    {view === 'history' && <PatientHistory />}
                    {view === 'reports' && <LabReports />}
                    {view === 'clinic' && <ClinicFinder />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* Status Bar */}
            <footer className="h-10 border-t border-medical-border bg-navy/90 backdrop-blur-md px-8 flex items-center justify-between z-50">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse" />
                     SYSTEM_CORE: <span className="text-medical-teal">ONLINE</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse" />
                     DATA_LINK: <span className="text-medical-teal">ENCRYPTED_AES256</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                 <span>INF_LATENCY: 14MS</span>
                 <span>PROT_VER: 5.2.0-TX</span>
               </div>
            </footer>
          </div>
        )}
        </Suspense>
      </AnimatePresence>
      <Suspense fallback={null}>
        <Assistant onNavigate={(v) => setView(v as AppState)} currentView={view} />
      </Suspense>
    </div>
  );
}
