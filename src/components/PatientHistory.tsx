import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Activity, 
  ChevronRight,
  Save,
  Shield,
  Trash2,
  Clock,
  Zap,
  Dna,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { 
  UserProfile, 
  DiagnosticScan, 
  VitalRecord, 
  FamilyHistory, 
  Vaccination,
  Appointment
} from '../types';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { jsPDF } from 'jspdf';
import { CircuitBoard, DataStream } from './AestheticDecorations';

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(Number(latest.toFixed(decimals)))
    });
    return () => controls.stop();
  }, [value, decimals]);
  return <span>{displayValue}</span>;
}

export default function PatientHistory() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scans, setScans] = useState<DiagnosticScan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [family, setFamily] = useState<FamilyHistory[]>([]);
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'vitals'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    const unsubProfile = onSnapshot(doc(db, 'users', uid), {
      next: (docSnap) => {
        if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
        setLoading(false);
      },
      error: (err) => {
        console.error("Profile sync error:", err);
        setLoading(false);
      }
    });

    const unsubScans = onSnapshot(query(collection(db, 'scans'), where('userId', '==', uid), orderBy('timestamp', 'desc')), {
      next: (snap) => {
        setScans(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiagnosticScan)));
      },
      error: (err) => console.error("Scans sync error:", err)
    });

    const unsubVitals = onSnapshot(query(collection(db, 'vitals'), where('userId', '==', uid), orderBy('timestamp', 'asc')), {
      next: (snap) => {
        setVitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as VitalRecord)));
      },
      error: (err) => console.error("Vitals sync error:", err)
    });

    const unsubFamily = onSnapshot(query(collection(db, 'familyHistory'), where('userId', '==', uid)), {
      next: (snap) => {
        setFamily(snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyHistory)));
      },
      error: (err) => console.error("Family history sync error:", err)
    });

    const unsubVaccines = onSnapshot(query(collection(db, 'vaccinations'), where('userId', '==', uid), orderBy('date', 'desc')), {
      next: (snap) => {
        setVaccines(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vaccination)));
      },
      error: (err) => console.error("Vaccines sync error:", err)
    });

    const unsubApps = onSnapshot(query(collection(db, 'appointments'), where('userId', '==', uid), orderBy('date', 'desc')), {
      next: (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
      },
      error: (err) => console.error("Appointments sync error:", err)
    });

    return () => {
      unsubProfile(); unsubScans(); unsubVitals(); unsubFamily(); unsubVaccines(); unsubApps();
    };
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('MEDISCAN AI - HEALTH DOSSIER', 20, 20);
    doc.setFontSize(10);
    doc.text(`PATIENT_ID: #PX-${profile?.uid.slice(0, 8).toUpperCase()}`, 20, 30);
    doc.text(`NAME: ${profile?.name || 'N/A'}`, 20, 40);
    doc.text(`DIAGNOSTIC ARCHIVE: ${scans.length} ENTRIES`, 20, 50);
    doc.save(`health-archive-${profile?.uid.slice(0,8)}.pdf`);
  };

  const filteredTimeline = [
    ...scans.map(s => ({ ...s, timelineType: 'scan' as const, dateForSorting: s.timestamp })),
    ...appointments.map(a => ({ ...a, timelineType: 'appointment' as const, dateForSorting: a.date }))
  ]
  .sort((a, b) => new Date(b.dateForSorting).getTime() - new Date(a.dateForSorting).getTime())
  .filter(item => {
    const title = 'type' in item ? `${item.type} Analysis` : `Visit to ${item.clinicName}`;
    const summary = 'summary' in item ? item.summary : item.reason;
    return summary.toLowerCase().includes(searchTerm.toLowerCase()) || title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-16 pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <CircuitBoard className="w-64 h-64 text-medical-teal" />
      </div>
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-medical-border">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel rounded-full text-[10px] font-mono text-medical-teal uppercase tracking-[0.3em]">
            <Dna className="w-4 h-4 text-medical-teal" />
            Neural Archive Synced
          </div>
          <h1 className="text-7xl font-hero text-gradient uppercase tracking-tight leading-none">HEALTH RECORDS</h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium leading-relaxed">
            Multi-modal data ledger encompassing clinical biometry, diagnostic sequences, and longitudinal health markers across encrypted lattice networks.
          </p>
        </div>
        
        <div className="flex gap-6">
          <button onClick={exportPDF} className="btn-medical h-16 px-8 rounded-xl flex items-center gap-3">
             <Download className="w-5 h-5" /> EXPORT DOSSIER
          </button>
          <button className="btn-medical-outline h-16 px-8 rounded-xl flex items-center gap-3">
             <Share2 className="w-5 h-5" /> DISTRIBUTE ACCESS
          </button>
        </div>
      </div>

      {/* Futuristic Tabs */}
      <div className="flex gap-12 border-b border-white/5 pb-px relative">
        {[
          { id: 'profile', label: 'Biometric Profile', icon: UserIcon },
          { id: 'timeline', label: 'Scan Timeline', icon: Clock },
          { id: 'vitals', label: 'Neural Telemetry', icon: Activity }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 pb-6 text-[11px] font-hero uppercase tracking-[0.2em] transition-all relative group",
              activeTab === tab.id ? "text-medical-teal" : "text-slate-500 hover:text-white"
            )}
          >
            <tab.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-medical-teal" : "text-slate-500")} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-medical-teal shadow-[0_0_10px_#00FFD1]" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-12 gap-12"
            >
              <div className="col-span-12 lg:col-span-4 space-y-10">
                <div className="glass-panel p-10 rounded-3xl relative overflow-hidden group border-white/5 transition-all hover:bg-white/[0.07] hover:shadow-[0_0_50px_rgba(0,255,209,0.05)]">
                  <div className="absolute inset-0 bg-particle-grid opacity-10" />
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-medical-teal/5 blur-3xl rounded-full" />
                  
                  {/* Scanner Sweep Effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <motion.div 
                      animate={{ y: ['-100%', '300%'] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="h-1/2 w-full bg-gradient-to-b from-transparent via-medical-teal/5 to-transparent skew-y-12"
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 glass-panel border-medical-teal/30 rounded-2xl mb-10 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,255,209,0.1)] group-hover:scale-105 transition-all duration-500">
                       {profile?.photoUrl ? (
                         <img src={profile.photoUrl} className="w-full h-full object-cover" />
                       ) : (
                         <UserIcon className="w-12 h-12 text-medical-teal/30" />
                       )}
                       <div className="absolute inset-0 bg-navy/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-hero text-medical-teal">Update Handshake</div>
                       <div className="absolute bottom-0 left-0 w-full h-[2px] bg-medical-teal shadow-[0_0_10px_#00FFD1] animate-pulse" />
                    </div>
                    <h3 className="text-4xl font-hero uppercase tracking-tighter mb-2 text-white group-hover:text-medical-teal transition-colors duration-500">{profile?.name || 'Authorized Proxy'}</h3>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-medical-teal rounded-full animate-ping" />
                      PX_IDENTIFIER: # {profile?.uid.slice(0, 12).toUpperCase()}
                    </p>
                    
                    <div className="space-y-8 pt-10 border-t border-white/10">
                      {[
                        { label: 'BLOOD CLASS', val: profile?.bloodGroup || 'O+', color: 'text-medical-red' },
                        { label: 'NEURAL PHENOTYPE', val: profile?.gender || 'M-CLASS', color: 'text-white' },
                        { label: 'YOB_ARCHIVE', val: 2026 - (profile?.age || 0), color: 'text-medical-teal font-mono' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-end group/item">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest group-hover/item:text-slate-300 transition-colors border-b border-white/5 pb-1 flex-1 mr-4">{item.label}</span>
                          <span className={cn("text-base font-hero uppercase tracking-tighter", item.color)}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl border-medical-teal/20 bg-medical-teal/5 relative">
                   <div className="absolute top-0 right-0 w-2 h-full bg-medical-teal" />
                  <h4 className="text-[10px] font-hero text-medical-teal uppercase tracking-[0.3em] mb-6">Security Context</h4>
                  <div className="flex items-start gap-5">
                    <Shield className="w-6 h-6 text-medical-teal shrink-0 mt-1" />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                      Biometric record state: <span className="text-medical-teal">ENCRYPTED</span>. Longitudinal sovereignty maintained via decentralized node validation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-8 space-y-16">
                <section className="space-y-8">
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Biometric Constraints</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-panel p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden group transition-all duration-500 hover:bg-white/[0.04] hover:shadow-[inset_0_0_20px_rgba(0,255,209,0.02)]">
                      <div className="absolute -top-16 -left-16 w-48 h-48 bg-medical-teal/5 blur-[80px] rounded-full group-hover:bg-medical-teal/10 transition-colors" />
                      <div className="absolute top-10 right-10 text-medical-teal/10 group-hover:text-medical-teal/40 transition-all duration-700 group-hover:rotate-12 group-hover:scale-125"><Heart className="w-16 h-16" /></div>
                      
                      <h4 className="text-[12px] font-hero uppercase tracking-[0.5em] text-medical-teal mb-10 flex items-center gap-3">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Activity className="w-5 h-5 text-medical-teal shadow-glow shadow-medical-teal/50" />
                        </motion.div>
                        Pathological Background
                      </h4>

                      <div className="flex flex-wrap gap-4 relative z-10">
                         {profile?.existingConditions.map((c, i) => (
                           <motion.span 
                             key={c}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             whileHover={{ scale: 1.05, y: -2 }}
                             className="px-5 py-2.5 glass-panel border-medical-teal/30 text-[11px] uppercase font-hero text-white tracking-[0.1em] rounded-2xl bg-medical-teal/[0.03] hover:bg-medical-teal/10 hover:border-medical-teal hover:shadow-[0_0_15px_rgba(0,255,209,0.1)] transition-all cursor-default flex items-center gap-3"
                           >
                             <div className="w-1.5 h-1.5 bg-medical-teal rounded-full shadow-[0_0_8px_#00FFD1] animate-pulse" />
                             {c}
                           </motion.span>
                         ))}
                         <motion.button 
                           whileHover={{ scale: 1.1, rotate: 90 }}
                           whileTap={{ scale: 0.9 }}
                           className="w-11 h-11 glass-panel border-medical-teal/40 text-medical-teal flex items-center justify-center hover:bg-medical-teal hover:text-navy transition-all duration-300 rounded-2xl shadow-lg border-2"
                         >
                           <Plus className="w-6 h-6" />
                         </motion.button>
                      </div>
                    </div>

                    <div className="glass-panel p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden group transition-all duration-500 hover:bg-white/[0.04] hover:shadow-[inset_0_0_20px_rgba(255,82,82,0.02)]">
                       <div className="absolute -top-16 -left-16 w-48 h-48 bg-medical-red/5 blur-[80px] rounded-full group-hover:bg-medical-red/10 transition-colors" />
                       <div className="absolute top-10 right-10 text-medical-red/10 group-hover:text-medical-red/40 transition-all duration-700 group-hover:-rotate-12 group-hover:scale-125"><Zap className="w-16 h-16" /></div>
                       
                       <h4 className="text-[12px] font-hero uppercase tracking-[0.5em] text-medical-red mb-10 flex items-center gap-3">
                        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                          <Shield className="w-5 h-5 text-medical-red shadow-glow shadow-medical-red/50" />
                        </motion.div>
                        Immunological Alerts
                      </h4>

                      <div className="flex flex-wrap gap-4 relative z-10">
                         {profile?.allergies?.map((a, i) => (
                           <motion.span 
                             key={a}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             whileHover={{ scale: 1.05, y: -2 }}
                             className="px-5 py-2.5 glass-panel border-medical-red/30 text-medical-red text-[11px] uppercase font-hero tracking-[0.1em] rounded-2xl bg-medical-red/[0.03] hover:bg-medical-red/10 hover:border-medical-red hover:shadow-[0_0_15px_rgba(255,82,82,0.1)] transition-all cursor-default flex items-center gap-3"
                           >
                             <div className="w-1.5 h-1.5 bg-medical-red rounded-full shadow-[0_0_8px_#FF5252] animate-pulse" />
                             {a}
                           </motion.span>
                         )) || <span className="text-[11px] text-slate-700 italic font-hero uppercase tracking-widest pl-2">Zero antibody conflicts recorded.</span>}
                         <motion.button 
                           whileHover={{ scale: 1.1, rotate: 90 }}
                           whileTap={{ scale: 0.9 }}
                           className="w-11 h-11 glass-panel border-medical-red/40 text-medical-red flex items-center justify-center hover:bg-medical-red hover:text-white transition-all duration-300 rounded-2xl shadow-lg border-2"
                         >
                           <Plus className="w-6 h-6" />
                         </motion.button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Ancestral Health Matrix</h2>
                  <div className="glass-panel rounded-3xl overflow-hidden border-medical-border">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-white/5 uppercase tracking-[0.2em] text-slate-500">
                        <tr>
                          <th className="p-6">RELATION</th>
                          <th className="p-6">BIO-CONDITION</th>
                          <th className="p-6 text-right">PROTOCOL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {family.length > 0 ? family.map((f, i) => (
                          <tr key={i} className="group hover:bg-medical-teal/5 transition-colors">
                            <td className="p-6 font-bold text-white uppercase">{f.relative}</td>
                            <td className="p-6 text-slate-400 font-medium">{f.condition}</td>
                            <td className="p-6 text-right">
                               <button className="text-medical-red/40 hover:text-medical-red transition-all uppercase text-[9px] font-bold">TERMINATE</button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="p-12 text-center text-slate-700 italic font-medium tracking-widest uppercase">No verified lineage records synced.</td></tr>
                        )}
                      </tbody>
                    </table>
                    <button className="w-full py-6 bg-medical-teal/5 text-medical-teal text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-medical-teal/10 transition-all border-t border-white/5">+ INTEGRATE DATA POINT</button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div 
              key="timeline" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between glass-panel p-8 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search diagnostic sequence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-navy/50 border border-medical-border py-3 pl-12 pr-4 text-sm font-medium focus:border-medical-teal outline-none rounded-xl text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-navy/50 border border-medical-border px-6 h-12 text-[10px] font-hero uppercase text-medical-teal focus:border-medical-teal outline-none rounded-xl cursor-pointer"
                  >
                    <option value="all">ALL_SEQUENCES</option>
                    <option value="eye">EYE_SCANS</option>
                    <option value="ear">EAR_SCANS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTimeline.length > 0 ? filteredTimeline.map((item, i) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel grid grid-cols-12 group hover:glow-border transition-all rounded-2xl overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-medical-teal/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="col-span-12 md:col-span-2 p-10 border-r border-medical-border hidden md:flex flex-col justify-center items-center relative z-10 bg-white/5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2 font-bold">
                         {new Date(item.dateForSorting).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-5xl font-hero text-gradient leading-none">
                         {new Date(item.dateForSorting).getDate()}
                      </span>
                      <span className="text-[10px] font-mono text-medical-teal mt-3 font-bold opacity-50 uppercase tracking-widest">
                         {new Date(item.dateForSorting).getFullYear()}
                      </span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-10 p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                      <div className="flex items-start gap-8">
                        <div className="w-16 h-16 rounded-2xl glass-panel bg-white/5 flex items-center justify-center text-medical-teal border-medical-teal/10 shadow-[0_0_20px_rgba(0,255,209,0.05)] transition-all group-hover:scale-110">
                           {item.timelineType === 'scan' ? <FileText className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <h3 className="text-2xl font-hero uppercase tracking-tighter text-white">
                                {item.timelineType === 'scan' ? `${(item as DiagnosticScan).type} Neural Analysis` : `Facility Visit: ${(item as Appointment).clinicName}`}
                             </h3>
                             {item.timelineType === 'scan' && (item as DiagnosticScan).severity && (
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                                 (item as DiagnosticScan).severity === 'high' ? "bg-medical-red/20 text-medical-red border border-medical-red/30" : 
                                 (item as DiagnosticScan).severity === 'medium' ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" : "bg-medical-teal/20 text-medical-teal border border-medical-teal/30"
                               )}>
                                 {(item as DiagnosticScan).severity} PRIORITY
                               </span>
                             )}
                          </div>
                          <p className="text-base text-slate-400 max-w-2xl leading-relaxed italic pr-12 font-medium">
                             {item.timelineType === 'scan' ? (item as DiagnosticScan).summary : (item as Appointment).reason}
                          </p>
                          <div className="flex gap-6 pt-4 border-t border-white/5">
                             <span className="text-[10px] text-slate-600 font-mono tracking-widest">SYSTEM_HASH: {item.id?.slice(-12).toUpperCase()}</span>
                             {item.timelineType === 'scan' && (
                               <span className="text-[10px] text-medical-teal font-mono tracking-widest font-bold">CONF_IDX: {Math.round(((item as DiagnosticScan).confidenceScore || 0) * 100)}%</span>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <button className="btn-medical h-14 px-10 rounded-xl relative overflow-hidden group/btn">
                         <span className="relative z-10 uppercase text-[10px] font-bold tracking-[0.2em]">{item.timelineType === 'scan' ? 'VERIFY PROTOCOL' : 'MANAGE LOGISTICS'}</span>
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="glass-panel py-40 text-center rounded-3xl border-dashed">
                    <Search className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <p className="meta-label">Null records in diagnostic repository.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'vitals' && (
            <motion.div 
               key="vitals" 
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 1.02 }}
               className="grid grid-cols-12 gap-12"
            >
               <div className="col-span-12 lg:col-span-8 space-y-12">
                  <div className="glass-panel p-10 rounded-3xl h-[450px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-particle-grid opacity-10" />
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div className="space-y-1">
                           <h4 className="text-xl font-hero uppercase text-white tracking-widest">NEURAL TELEMETRY TREND</h4>
                           <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Longitudinal Lattice Synchronization</p>
                        </div>
                        <div className="flex gap-6">
                          <span className="flex items-center gap-3 text-[10px] font-mono text-medical-teal font-bold uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-medical-teal animate-pulse" /> CLOUD_SYNC_OK
                          </span>
                        </div>
                    </div>
                    <div className="h-[300px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={vitals.filter(v => v.type === 'heart_rate').slice(-20).map(v => ({
                            time: new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                            value: v.value
                          }))}
                        >
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#040D1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#00FFD1' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#00FFD1" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { label: 'BLOOD_PRESSURE', val: '118/74', unit: 'mmHg', icon: Activity, color: 'text-medical-blue' },
                      { label: 'GLUCOSE_FLUX', val: '92', unit: 'mg/dL', icon: Zap, color: 'text-medical-teal' },
                      { label: 'MASS_IDENTIFIER', val: '71.4', unit: 'KG', icon: Shield, color: 'text-purple-400' },
                      { label: 'BIO_INDEX_SCORE', val: '23.1', unit: 'BMI', icon: Heart, color: 'text-medical-red' }
                    ].map((v, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-8 rounded-3xl flex justify-between items-center group hover:glow-border transition-all card-lift"
                      >
                         <div className="space-y-4">
                           <p className="meta-label tracking-[0.3em]">{v.label}</p>
                           <div className="flex items-baseline gap-3">
                             <span className="text-4xl font-hero text-white tracking-tighter"><Counter value={parseFloat(v.val)} decimals={v.val.includes('.') ? 1 : 0} /></span>
                             <span className="text-[10px] text-slate-500 font-mono tracking-widest font-bold">{v.unit}</span>
                           </div>
                         </div>
                         <div className={cn("h-14 w-14 rounded-2xl glass-panel flex items-center justify-center transition-transform group-hover:rotate-12", v.color)}>
                            <v.icon className="w-7 h-7" />
                         </div>
                      </motion.div>
                    ))}
                  </div>
               </div>

               <aside className="col-span-12 lg:col-span-4 space-y-12">
                  <div className="glass-panel p-10 rounded-3xl border-medical-teal/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-medical-teal/5 blur-3xl rounded-full" />
                    <h4 className="meta-label tracking-[0.3em] mb-10 text-medical-teal">Telemetry Ingestion</h4>
                    <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Lattice Metric Class</label>
                        <select className="w-full bg-navy/50 border border-medical-border p-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-medical-teal rounded-xl cursor-pointer transition-all">
                          <option value="heart_rate">HEART_RATE (BPM)</option>
                          <option value="blood_sugar">GLUCOSE_FLUX (mg/dL)</option>
                          <option value="bp_systolic">SYSTOLIC_PRESSURE (mmHg)</option>
                          <option value="weight">MASS_VAL (KG)</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Observed Magnitude</label>
                        <div className="relative">
                           <input type="number" className="w-full bg-navy/50 border border-medical-border p-4 text-xl font-hero outline-none focus:border-medical-teal rounded-xl text-white pl-6" placeholder="0.0" />
                        </div>
                      </div>
                      <button className="btn-medical w-full h-16 rounded-xl flex items-center justify-center gap-3 group">
                         <Save className="w-5 h-5 transition-transform group-hover:scale-110" /> 
                         <span className="uppercase font-bold tracking-[0.2em] text-xs">SYNCHRONIZE TELEMETRY</span>
                      </button>
                    </form>
                  </div>

                  <div className="glass-panel p-10 rounded-3xl border-white/5 space-y-8 bg-navy/20">
                    <h4 className="meta-label tracking-[0.4em] mb-4">Boundary Reference</h4>
                    <div className="space-y-5">
                      {[
                        { label: 'CORE_BPM_RANGE', range: '60 - 100' },
                        { label: 'GLUCOSE_STABILITY', range: '70 - 100' },
                        { label: 'BMI_CLASS_IDX', range: '18.5 - 24.9' }
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-3 group">
                           <span className="text-slate-500 font-mono tracking-widest group-hover:text-medical-teal transition-colors font-bold uppercase">{r.label}</span>
                           <span className="text-white font-hero tracking-widest">{r.range}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
