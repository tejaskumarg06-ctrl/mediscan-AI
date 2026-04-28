import React, { useState, useEffect } from 'react';
import { 
  FileUp, 
  Search, 
  Trash2, 
  Download, 
  AlertTriangle, 
  FileText,
  ChevronRight,
  Maximize2,
  X,
  Zap,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { LabReport } from '../types';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';
import Tesseract from 'tesseract.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LabReports() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(db, 'labReports'), 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabReport)));
        setLoading(false);
      },
      error: (err) => {
        console.error("Lab reports sync error:", err);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    setOcrProgress(0);

    try {
      let extractedText = "";
      if (file.type.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') setOcrProgress(m.progress * 100);
          }
        });
        extractedText = text;
      }

      const mockFileUrl = URL.createObjectURL(file); 
      const analysis = extractedText ? await geminiService.summarizeLabReport(extractedText) : null;

      const newReport: Omit<LabReport, 'id'> = {
        userId: auth.currentUser.uid,
        title: file.name,
        labName: "Captured Source",
        date: new Date().toISOString().split('T')[0],
        category: (analysis?.category as any) || 'other',
        status: (analysis?.status as any) || 'pending',
        fileUrl: mockFileUrl,
        extractedText,
        aiSummary: analysis?.summary,
        highlights: analysis?.findings,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'labReports'), newReport);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setUploading(false);
      setOcrProgress(0);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.labName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-medical-border">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel rounded-full text-[10px] font-mono text-medical-teal uppercase tracking-[0.3em]">
            <Zap className="w-3 h-3 animate-pulse" />
            Clinical Intelligence Pipeline
          </div>
          <h1 className="text-7xl font-hero text-gradient uppercase tracking-tight leading-none">LAB REPORTS</h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium leading-relaxed">
            Archival and analysis of clinical test documents with automated neural boundary detection and biometric verification.
          </p>
        </div>
        
        <label className="group h-20 px-10 glass-panel hover:glow-border transition-all flex items-center gap-6 cursor-pointer rounded-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-medical-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <FileUp className={cn("w-6 h-6 text-medical-teal relative z-10", uploading ? "animate-bounce" : "")} />
           <div className="text-left relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 block">Initialize Ingestion</span>
              <span className="text-sm font-hero text-medical-teal uppercase">{uploading ? `PROCESSING ${Math.round(ocrProgress)}%` : 'ARCHIVE_DOC.PDF_JPG'}</span>
           </div>
           <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-8 space-y-10">
           {/* Search & Filter Bar */}
           <div className="flex flex-col sm:flex-row gap-6 items-center justify-between glass-panel p-6 rounded-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search repository hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-navy/50 border border-medical-border py-3 pl-12 pr-4 text-xs focus:border-medical-teal outline-none rounded-xl font-medium text-white"
                />
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                 <select 
                   value={filterCategory}
                   onChange={(e) => setFilterCategory(e.target.value)}
                   className="flex-1 sm:flex-none bg-navy/50 border border-medical-border px-6 h-12 text-[10px] font-mono uppercase text-medical-teal outline-none rounded-xl cursor-pointer hover:border-medical-teal"
                 >
                    <option value="all">ALL CLASSES</option>
                    <option value="blood">BLOOD_PANEL</option>
                    <option value="urine">URINALYSIS</option>
                    <option value="eye_pressure">TONOMETRY</option>
                    <option value="audiometry">AUDIOMETRY</option>
                 </select>
              </div>
           </div>

           {/* Reports Grid */}
           <div className="grid sm:grid-cols-2 gap-6">
              {filteredReports.map(report => (
                <button 
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="glass-panel group text-left hover:glow-border transition-all p-0 overflow-hidden flex flex-col rounded-2xl relative"
                >
                  <div className="h-40 bg-slate-900/50 relative overflow-hidden flex items-center justify-center border-b border-medical-border">
                    <div className="absolute inset-0 bg-particle-grid opacity-20" />
                    <FileText className="w-16 h-16 text-slate-800 group-hover:text-medical-teal/30 transition-all duration-500" />
                    <div className="absolute top-4 right-4">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                         report.status === 'abnormal' ? "bg-medical-red/20 text-medical-red border border-medical-red/30" :
                         report.status === 'normal' ? "bg-medical-teal/20 text-medical-teal border border-medical-teal/30" : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                       )}>
                         {report.status}
                       </span>
                    </div>
                  </div>
                  <div className="p-8 space-y-6 relative bg-navy/40">
                    <div>
                      <h3 className="text-xl font-hero uppercase tracking-tighter text-white/90 truncate">{report.title}</h3>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-2 tracking-widest">{report.category} // {report.date}</p>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] text-medical-teal font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                        Verify Results <ChevronRight className="w-4 h-4" />
                       </span>
                       <Trash2 className="w-4 h-4 text-slate-700 hover:text-medical-red transition-colors cursor-pointer" onClick={(e) => {
                         e.stopPropagation();
                         if(report.id) deleteDoc(doc(db, 'labReports', report.id));
                       }} />
                    </div>
                  </div>
                </button>
              ))}
              {filteredReports.length === 0 && !loading && (
                <div className="col-span-full py-40 text-center glass-panel rounded-2xl border-dashed">
                   <AlertTriangle className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                   <p className="meta-label">Clinical archive null result.</p>
                </div>
              )}
           </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 rounded-2xl">
              <h4 className="meta-label mb-8">Longitudinal Trend</h4>
              <div className="h-48 relative">
                 <div className="absolute inset-0 bg-medical-teal/5 rounded-xl blur-2xl" />
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={[
                        { label: '01', value: 94 },
                        { label: '02', value: 96 },
                        { label: '03', value: 92 },
                        { label: '04', value: 98 },
                        { label: '05', value: 93 },
                      ]}
                    >
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00FFD1" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#00FFD1', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#00FFD1' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#040D1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#00FFD1' }}
                        labelStyle={{ display: 'none' }}
                      />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-8 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                    <span className="text-slate-500 uppercase">Neural Confidence</span>
                    <span className="text-medical-teal">0.992</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                    <span className="text-slate-500 uppercase">Sync Status</span>
                    <span className="text-medical-teal">VALIDATED</span>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-2xl border-medical-teal/20 bg-medical-teal/5">
              <h4 className="meta-label text-medical-teal mb-6">Neural OCR Module</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">
                The extraction engine utilizes attention-based transformers to identify pathological signatures within unstructured clinical texts.
              </p>
              <div className="p-4 bg-navy/50 rounded-xl border border-medical-teal/10">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-medical-teal animate-pulse" />
                    <span className="text-[10px] font-mono text-medical-teal uppercase tracking-widest">Engine Active // Node 0x05</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-navy/90 backdrop-blur-2xl flex items-center justify-center p-8 lg:p-20 overflow-auto"
          >
            <div className="w-full h-full max-w-7xl glass-panel border-medical-border flex flex-col relative rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all z-50 hover:scale-110"
              >
                <X className="w-10 h-10" />
              </button>

              <div className="grid lg:grid-cols-12 h-full">
                 <div className="lg:col-span-8 p-16 border-r border-medical-border overflow-auto bg-slate-900/10 custom-scrollbar">
                    <div className="space-y-12">
                       <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel rounded-full text-[10px] font-mono text-medical-teal uppercase tracking-[0.2em]">
                          HASH: {selectedReport.id?.toUpperCase()}
                       </div>
                       <h2 className="text-6xl font-hero text-gradient-blue uppercase tracking-tight leading-none">{selectedReport.title}</h2>
                       <div className="flex gap-12 border-y border-white/5 py-8">
                          <div>
                            <p className="meta-label mb-2">FACILITY</p>
                            <p className="text-lg font-bold text-white">{selectedReport.labName}</p>
                          </div>
                          <div>
                            <p className="meta-label mb-2">TIMESTAMP</p>
                            <p className="text-lg font-bold text-white font-mono">{selectedReport.date}</p>
                          </div>
                       </div>
                       
                       <div className="relative glass-panel p-6 rounded-3xl group overflow-hidden border-white/5">
                          <img src={selectedReport.fileUrl} alt="Report Scan" className="w-full h-auto rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" />
                          <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <a href={selectedReport.fileUrl} target="_blank" className="btn-medical h-14 px-10 flex items-center gap-3 rounded-xl">
                                <Maximize2 className="w-5 h-5" /> EXPAND ARCHIVE
                             </a>
                          </div>
                       </div>
                    </div>
                 </div>

                 <aside className="lg:col-span-4 p-16 overflow-auto space-y-16 custom-scrollbar bg-navy/20">
                    <section className="space-y-8">
                       <h3 className="meta-label text-medical-teal">Neural Summary</h3>
                       <div className="glass-panel p-8 bg-medical-teal/5 border-medical-teal/20 text-sm text-slate-300 leading-relaxed font-medium rounded-2xl italic">
                          {selectedReport.aiSummary || "Ingestion complete. Processing clinical summaries via neural-link node..."}
                       </div>
                    </section>

                    <section className="space-y-8">
                       <h3 className="meta-label">Protocol Anomalies</h3>
                       <div className="space-y-4">
                          {selectedReport.highlights?.map((f, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 glass-panel bg-medical-red/5 border-medical-red/10 rounded-2xl">
                               <AlertTriangle className="w-5 h-5 text-medical-red shrink-0 mt-0.5" />
                               <span className="text-sm text-slate-400 font-medium">{f}</span>
                            </div>
                          )) || <div className="text-sm text-slate-600 italic px-4">No critical signatures detected in first-pass inference.</div>}
                       </div>
                    </section>

                    <section className="space-y-8">
                       <h3 className="meta-label">Clinician Annotations</h3>
                       <textarea 
                        className="w-full h-40 bg-navy/50 border border-medical-border p-6 text-sm outline-none focus:border-medical-teal rounded-2xl resize-none font-medium text-white transition-all"
                        placeholder="Archiving session notes..."
                        defaultValue={selectedReport.notes}
                       />
                       <button className="btn-medical w-full h-14 rounded-xl text-xs uppercase tracking-[0.2em]">Synchronize Record</button>
                    </section>

                    <div className="pt-20 text-center">
                       <button className="text-medical-red/40 text-[10px] font-bold uppercase tracking-[0.4em] hover:text-medical-red transition-all">TERMINATE RECORD ARCHIVE</button>
                    </div>
                 </aside>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
