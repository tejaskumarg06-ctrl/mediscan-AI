import React from 'react';
import { ShieldCheck, Lock, Eye, Server, Radio, Fingerprint, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function SafetyProtocols() {
  const protocols = [
    { title: 'Data Encryption', desc: 'All medical data is encrypted using AES-256 at rest and TLS 1.3 in transit.', icon: Lock },
    { title: 'Zero-Trust Access', desc: 'Multi-factor authentication and token-based session management for all clinical views.', icon: Fingerprint },
    { title: 'HIPAA Compliance', desc: 'Infrastructure engineered to meet rigorous international health data standards.', icon: ShieldCheck },
    { title: 'Anonymized Processing', desc: 'AI inference is performed on anonymized data streams to preserve patient privacy.', icon: Server },
    { title: 'Neural Integrity', desc: 'Diagnostic results are verified by a dual-check neural validation system.', icon: Eye },
    { title: 'Audit Logging', desc: 'Immutable logs track every access and modification to medical records.', icon: Radio },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-teal/10 border border-medical-teal/20 rounded text-[10px] font-mono text-medical-teal uppercase tracking-widest">
           <Zap className="w-3 h-3 animate-pulse" />
           Security Shield: Active
        </div>
        <h2 className="text-5xl font-hero text-gradient uppercase tracking-tight">Safety & Security Protocols</h2>
        <p className="text-slate-500 text-sm max-w-xl font-medium">Our platform utilizes defense-grade security measures to ensure the absolute integrity and privacy of patient information.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((p, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 rounded-2xl group hover:glow-border transition-all card-lift"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-medical-teal mb-8 group-hover:bg-medical-teal group-hover:text-navy transition-all">
              <p.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-hero text-white mb-3 uppercase tracking-tight">{p.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-2xl glow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-medical-teal/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-medical-teal flex items-center justify-center shrink-0 shadow-[0_0_20px_#00FFD1]">
            <Lock className="w-8 h-8 text-navy" />
          </div>
          <div className="space-y-4">
            <div>
               <h4 className="text-lg font-hero uppercase text-medical-teal">Encryption Certificate Verified</h4>
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol Version: AES_X_4096_GCM</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              Current Session: <span className="font-mono text-medical-teal bg-medical-teal/5 px-2 py-0.5 rounded">#SEC_PROT_882_VALID</span><br />
              All data transmitted via this neural-link is encapsulated in a secure tunnel with 4096-bit RSA keys and audited in real-time by the compliance engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
