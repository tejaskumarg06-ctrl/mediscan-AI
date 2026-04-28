import React from 'react';
import { motion } from 'motion/react';
import { Shield, Brain, Activity, ArrowRight, Hexagon, Zap, ShieldCheck, Microscope, Cpu, BriefcaseMedical } from 'lucide-react';
import { cn } from '../lib/utils';
import { CircuitBoard, GridVector, GeometricDecoration } from './AestheticDecorations';

const LandingPage = React.memo(function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-navy text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <GridVector />
      <div className="absolute inset-0 bg-particle-grid opacity-20 pointer-events-none" />
      <div className="light-bloom -top-96 -left-96 opacity-30" />
      <div className="light-bloom top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="scanline-overlay" />

      <GeometricDecoration />

      {/* Decorative Circuit Paths */}
      <CircuitBoard className="absolute top-0 left-0 w-80 h-80 pointer-events-none text-medical-teal" />
      <CircuitBoard className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none text-medical-blue rotate-180" />

      {/* Header / Nav */}
      <nav className="relative z-50 h-24 px-12 flex items-center justify-between bg-navy/50 backdrop-blur-md border-b border-medical-border">
        <div className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute w-10 h-10 border border-medical-teal/30 rounded-lg group-hover:border-medical-teal"
            />
            <Hexagon className="w-6 h-6 text-medical-teal relative z-10 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-2xl font-hero tracking-tighter uppercase text-gradient">MEDISCAN <span className="opacity-50 font-sans">AI</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-12 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500">
           {['Safety', 'Technology', 'Network', 'Compliance'].map(item => (
             <button key={item} className="hover:text-medical-teal transition-colors focus:outline-none">{item}</button>
           ))}
        </div>

        <button 
          onClick={onGetStarted}
          className="btn-aesthetic-login scale-75 lg:scale-100"
        >
          AUTHENTICATE SYSTEM <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-6">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="inline-flex items-center gap-3 px-4 py-2 glass-panel rounded-full text-[10px] font-mono text-medical-teal uppercase tracking-[0.4em]"
               >
                  <Zap className="w-3 h-3 animate-pulse" />
                  Next-Gen Neural Diagnostics
               </motion.div>
               <h1 className="text-7xl lg:text-[110px] font-hero leading-[0.9] text-gradient">
                 FUTURE OF <br /> 
                 <span className="opacity-80">MED-TECH</span>
               </h1>
               <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
                 Deploying a decentralized healthcare infrastructure powered by neural-linked computer vision and encrypted diagnostic clusters.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={onGetStarted} className="btn-medical text-xs h-16 px-10 rounded-lg">
                 Initialize System Node <ArrowRight className="w-5 h-5 ml-4" />
              </button>
              <button className="btn-medical-outline text-xs h-16 px-10 rounded-lg">
                 View Whitepaper
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-medical-border">
               {[
                 { val: '124K', label: 'Neural Nodes' },
                 { val: '14MS', label: 'Latency' },
                 { val: 'AES-256', label: 'Security' }
               ].map((stat, i) => (
                 <div key={i}>
                    <p className="text-3xl font-hero text-white tracking-tighter">{stat.val}</p>
                    <p className="meta-label">{stat.label}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
             <div className="aspect-square glass-panel rounded-full p-12 relative flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-medical-teal/10 to-medical-blue/10 animate-pulse" />
                <div className="absolute inset-0 bg-particle-grid opacity-30" />
                
                {/* Rotating Hub UI */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-full h-full p-4"
                >
                   <div className="w-full h-full rounded-full border border-medical-teal/10 border-dashed" />
                </motion.div>

                <div className="relative text-center space-y-4">
                   <div className="w-32 h-32 glass-panel rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(0,102,255,0.2)] border-medical-blue/30 group-hover:scale-105 transition-transform duration-500">
                      <ShieldCheck className="w-16 h-16 text-medical-blue" />
                   </div>
                   <div>
                      <p className="text-2xl font-hero uppercase tracking-tighter text-gradient-blue text-medical-blue">Secure Protocol</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Network Synced</p>
                   </div>
                </div>

                {/* Floating Elements */}
                {[ShieldCheck, Brain, Cpu, Activity].map((Icon, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -15, 0],
                      x: [0, i % 2 === 0 ? 10 : -10, 0]
                    }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                      "absolute p-4 glass-panel rounded-xl text-medical-teal",
                      i === 0 ? "top-10 left-10" : i === 1 ? "top-10 right-10" : i === 2 ? "bottom-10 left-10" : "bottom-10 right-10"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                ))}
             </div>

             {/* Background glow behind image */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-medical-teal/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Feature Grid with staggering */}
      <section className="relative z-10 px-12 py-32 bg-black/20">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <p className="meta-label">Protocol Deployment</p>
               <h2 className="text-5xl font-hero text-gradient uppercase">Advanced Clinical Stack</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {[
                 { title: 'Safety Protocols', desc: 'Secure medical data infrastructure with biometric key validation and neural link verification.', icon: ShieldCheck },
                 { title: 'Lab Results', desc: 'Automated clinical data processing engines for hyper-accurate laboratory analysis.', icon: Microscope },
                 { title: 'Technology', desc: 'Processing occurs on local edge nodes ensuring zero-latency data orchestration.', icon: Cpu }
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="glass-panel p-12 space-y-8 rounded-2xl group transition-all hover:glow-border"
                 >
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-medical-teal group-hover:bg-medical-teal group-hover:text-navy transition-all">
                       <feature.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-xl font-hero uppercase tracking-tight">{feature.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-12 py-20 border-t border-medical-border bg-navy">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3 opacity-80">
              <Hexagon className="w-8 h-8 text-medical-teal" />
              <span className="text-xl font-hero uppercase tracking-tighter">MEDISCAN <span className="opacity-50">AI</span></span>
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-none">© 2026 NEURAL INFRASTRUCTURE GROUP // AES-256 SECURED</p>
         </div>
      </footer>
    </div>
  );
});

export default LandingPage;
