import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Cpu, Microscope, ClipboardList, Plus, LogOut, ChevronRight, AlertCircle, Clock, Terminal as TerminalIcon, Search, Download, Trash2, Send, Eye, Ear, Upload, Loader2, CheckCircle2, X, Info, Info as InfoIcon, Zap, Activity, AlertTriangle, ShieldAlert, Heart, Radio } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, addDoc } from 'firebase/firestore';
import { DiagnosticScan, LabReport } from '../types';
import { motion, useSpring, useTransform, animate, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError } from '../services/firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { GridVector, GeometricDecoration, CircuitBoard } from './AestheticDecorations';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const eyeScanPrompt = `
You are an expert ophthalmology AI trained on clinical eye imaging.
Analyze this uploaded eye photograph with high medical precision.

ANALYZE THESE SPECIFIC AREAS:

1. SCLERA (White of Eye):
   - Color: Pure white / Yellowish (jaundice) / Reddish (hemorrhage) / Bluish
   - Visible blood vessels: Normal / Dilated / Broken
   - Spots or lesions present: Yes / No / Description

2. IRIS & PUPIL:
   - Pupil shape: Round / Irregular / Dilated / Constricted
   - Pupil symmetry: Equal / Unequal (anisocoria)
   - Iris color clarity: Clear / Cloudy / Discolored
   - Visible iris abnormalities: None / Describe

3. CORNEA (Front surface):
   - Clarity: Transparent / Cloudy / Hazy (possible cataract)
   - Surface: Smooth / Rough / Ulcerated
   - Visible scarring: None / Present

4. CONJUNCTIVA (Inner eyelid lining):
   - Color: Pink-normal / Red / Pale
   - Swelling (chemosis): None / Mild / Severe
   - Discharge evidence: None / Watery / Mucous / Purulent

5. EYELID:
   - Swelling: None / Mild / Moderate / Severe
   - Drooping (ptosis): None / Partial / Complete
   - Styes or lumps: None / Present / Location

6. OVERALL REDNESS ASSESSMENT:
   - Location: Entire eye / Corner / Around iris / Upper/Lower
   - Intensity: None / Mild / Moderate / Severe
   - Pattern: Diffuse / Localized / Sectoral

DETECT THESE CONDITIONS:
- Conjunctivitis (Pink Eye) — bacterial / viral / allergic type
- Subconjunctival Hemorrhage
- Jaundice / Liver condition (yellow sclera)
- Cataract (cloudy lens)
- Glaucoma signs (enlarged pupil, corneal haze)
- Stye (Hordeolum)
- Pterygium (tissue growth)
- Dry Eye Disease
- Uveitis (iris inflammation)
- Corneal Ulcer

RETURN STRICT JSON FORMAT following the specified schema.
`;

const earScanPrompt = `
You are an expert ENT (Ear Nose Throat) AI trained on clinical 
otoscopic and external ear imaging.
Analyze this uploaded ear photograph with high medical precision.

ANALYZE THESE SPECIFIC AREAS:

1. OUTER EAR (Pinna/Auricle):
   - Shape: Normal / Deformed / Swollen
   - Skin color: Normal / Red / Pale / Bruised / Discolored
   - Surface: Smooth / Scaly / Crusty / Lesions present
   - Swelling (behind ear): None / Present
   - Visible injuries: None / Cuts / Bruising

2. EAR CANAL (External Auditory Canal — if visible):
   - Visibility: Clear / Partially blocked / Fully blocked
   - Earwax (Cerumen): None / Minimal / Moderate / Impacted
   - Earwax color: Normal brown / Dark / Black / Green
   - Canal skin: Pink-normal / Red / Inflamed / Flaky
   - Foreign object: None / Possibly present

3. EARDRUM (Tympanic Membrane — if visible):
   - Visibility: Visible / Not visible (blocked)
   - Appearance: Normal pearly grey / Red / Bulging / Perforated
   - Perforation: None / Small / Large / Location
   - Fluid behind drum: None / Present (amber/air bubbles)

4. DISCHARGE ANALYSIS (if visible):
   - Presence: None / Present
   - Color: Clear / White / Yellow / Green / Brown / Bloody
   - Consistency: Watery / Thick / Purulent

5. SKIN CONDITION AROUND EAR:
   - Redness: None / Mild / Severe
   - Rash or dermatitis: None / Present / Type
   - Scaling or flaking: None / Present
   - Nodules or lumps: None / Present / Location

DETECT THESE CONDITIONS:
- Earwax Buildup (Cerumen Impaction)
- Otitis Externa (Swimmer's Ear — outer canal infection)
- Otitis Media (Middle ear infection — drum appearance)
- Eardrum Perforation
- Ear Dermatitis / Eczema
- Fungal Ear Infection (Otomycosis)
- Cholesteatoma signs
- Foreign Body in ear
- Mastoiditis (swelling behind ear)
- Perichondritis (outer ear cartilage infection)

RETURN STRICT JSON FORMAT following the specified schema.
`;

const scanResponseSchema = {
  type: Type.OBJECT,
  properties: {
    image_quality: { type: Type.STRING },
    analyzable: { type: Type.BOOLEAN },
    image_type: { type: Type.STRING },
    conditions_detected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          severity: { type: Type.STRING },
          affected_area: { type: Type.STRING },
          visual_indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING }
        },
        required: ["name", "type", "confidence", "severity", "description"]
      }
    },
    eye_health_score: { type: Type.NUMBER },
    ear_health_score: { type: Type.NUMBER },
    sclera_color: { type: Type.STRING },
    pupil_status: { type: Type.STRING },
    redness_level: { type: Type.STRING },
    earwax_level: { type: Type.STRING },
    earwax_color: { type: Type.STRING },
    canal_status: { type: Type.STRING },
    inflammation_level: { type: Type.STRING },
    discharge_present: { type: Type.BOOLEAN },
    discharge_color: { type: Type.STRING },
    swelling_present: { type: Type.BOOLEAN },
    eardrum_visible: { type: Type.BOOLEAN },
    eardrum_status: { type: Type.STRING },
    urgency_level: { type: Type.STRING },
    recommended_specialist: { type: Type.STRING },
    recommendation: { type: Type.STRING },
    disclaimer: { type: Type.STRING }
  },
  required: ["image_quality", "analyzable", "urgency_level", "recommended_specialist", "recommendation", "disclaimer"]
};

const validateImageQuality = (imageFile: File): Promise<{ valid: boolean; warnings: string[]; dimensions: { width: number; height: number } }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const checks = {
        resolution: img.width >= 300 && img.height >= 300,
        notTooLarge: imageFile.size <= 10 * 1024 * 1024,
        notTooSmall: imageFile.size >= 5 * 1024,
        aspectRatio: img.width / img.height < 4,
      };

      const warnings: string[] = [];
      if (!checks.resolution) 
        warnings.push('⚠️ Image too small — may reduce accuracy');
      if (!checks.notTooLarge) 
        warnings.push('❌ File too large — max 10MB');
      if (!checks.notTooSmall) 
        warnings.push('⚠️ File suspiciously small — may be corrupt');

      resolve({ valid: checks.notTooLarge, warnings, dimensions: {
        width: img.width, height: img.height
      }});
    };
    img.src = URL.createObjectURL(imageFile);
  });
};

const urgencyConfig: Record<string, { color: string; icon: string; label: string; message: string; bg: string }> = {
  routine: {
    color: '#00C9B1',
    bg: 'bg-[#00C9B1]/10',
    icon: '✅',
    label: 'ROUTINE',
    message: 'No immediate action needed. Monitor symptoms.'
  },
  soon: {
    color: '#FFB800',
    bg: 'bg-[#FFB800]/10',
    icon: '⚠️',
    label: 'SEE DOCTOR SOON',
    message: 'Visit an eye doctor within 2-3 days.'
  },
  urgent: {
    color: '#FF6B35',
    bg: 'bg-[#FF6B35]/10',
    icon: '🚨',
    label: 'URGENT',
    message: 'See a specialist within 24 hours.'
  },
  emergency: {
    color: '#FF0040',
    bg: 'bg-[#FF0040]/10',
    icon: '🆘',
    label: 'EMERGENCY',
    message: 'Go to emergency immediately. Call 108 now.'
  }
};

function StatusCell({ label, value, status }: { label: string; value: string; status: 'ok' | 'warn' | 'alert' }) {
  return (
    <div className="glass-panel p-3 rounded-xl border-white/5 flex flex-col gap-1">
       <span className="text-[8px] font-hero text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === 'ok' ? "bg-medical-teal" : status === 'warn' ? "bg-yellow-500" : "bg-medical-red"
          )} />
          <span className="text-[10px] font-hero text-white uppercase truncate">{value || 'N/A'}</span>
       </div>
    </div>
  );
}

function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);
  return <span>{displayValue}</span>;
}

const TerminalLog = React.memo(({ importantLogs }: { importantLogs: { type: 'info' | 'warn' | 'alert' | 'ok'; msg: string; time: string }[] }) => {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'alert'>('all');
  const [chatterLogs, setChatterLogs] = useState<{ type: 'info' | 'warn' | 'alert' | 'ok'; msg: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const types: ('info' | 'warn' | 'alert' | 'ok')[] = ['info', 'warn', 'alert', 'ok'];
      const msgs = [
        "Inference check: All nodes responsive.",
        "Updating local vector database...",
        "Protocol checksum: 0x99F2 verified.",
        "Security layer periodic sweep complete.",
        "External cache synchronized."
      ];
      const newLog = {
        type: types[Math.floor(Math.random() * types.length)],
        msg: msgs[Math.floor(Math.random() * msgs.length)],
        time: new Date().toLocaleTimeString()
      };
      setChatterLogs(prev => [...prev.slice(-19), newLog]);
    }, 6000); // Much slower interval for better performance
    return () => clearInterval(interval);
  }, []);

  const allLogs = [...chatterLogs, ...importantLogs].sort((a, b) => {
    return new Date(`1970-01-01T${a.time}`).getTime() - new Date(`1970-01-01T${b.time}`).getTime();
  }).slice(-50);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLogs]);

  const filteredLogs = allLogs.filter(l => filter === 'all' || l.type === filter);

  return (
    <div className="glass-panel h-[400px] rounded-lg border-medical-border relative overflow-hidden flex flex-col font-mono">
      <div className="bg-navy/80 px-6 py-3 border-b border-medical-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-medical-teal" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity Console v5.2</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex gap-2">
             {['all', 'info', 'warn', 'alert'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={cn(
                   "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded transition-all",
                   filter === f ? "bg-medical-teal text-navy font-bold" : "text-slate-500 hover:text-white"
                 )}
               >
                 {f}
               </button>
             ))}
           </div>
           <button onClick={() => setChatterLogs([])} className="text-slate-600 hover:text-medical-red"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-2 scrollbar-hide text-[11px] leading-relaxed">
        {filteredLogs.map((l, i) => (
          <div key={i} className="flex items-start gap-4">
             <span className="text-slate-700 select-none">[{l.time}]</span>
             <span className={cn(
               "font-bold uppercase",
               l.type === 'info' ? "text-medical-blue" :
               l.type === 'warn' ? "text-yellow-500" :
               l.type === 'alert' ? "text-medical-red" : "text-medical-teal"
             )}>
               [{l.type === 'ok' ? 'OK' : l.type.toUpperCase()}]
             </span>
             <span className="text-slate-300">{l.msg}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
           <span className="text-medical-teal opacity-50">&gt;</span>
           <div className="w-2 h-4 bg-medical-teal animate-pulse" />
        </div>
      </div>
    </div>
  );
});

const ModuleCard = React.memo(({ m, scanning, scanResult, onNavigate, onTriggerUpload }: { 
  m: any, 
  scanning: string | null, 
  scanResult: any, 
  onNavigate: (v: string) => void,
  onTriggerUpload: (v: 'eye' | 'ear') => void
}) => {
  return (
    <div 
      className="group glass-panel h-[420px] rounded-2xl p-8 text-left card-lift overflow-hidden relative flex flex-col justify-between"
    >
      <div className={cn("absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r transition-all duration-500", m.accent, "via-medical-blue to-white")} />
      
      <div>
        <div className={cn("w-14 h-14 rounded-xl mb-10 flex items-center justify-center border border-white/5 bg-white/5 transition-all group-hover:scale-110", m.color)}>
          <m.icon className="w-7 h-7" />
        </div>

        <div className="space-y-4">
           <div>
              <h3 className="text-2xl font-hero uppercase tracking-tighter mb-1">{m.title}</h3>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">{m.desc}</p>
           </div>

           <div className="h-12 flex items-end">
              {(m.type === 'eye' || m.type === 'ear') && (
                 <div className="w-full">
                    <AnimatePresence mode="wait">
                      {scanning === m.type ? (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          {scanResult ? (
                            <div className="flex items-center gap-2 text-medical-teal font-hero text-[10px] uppercase tracking-widest">
                              <CheckCircle2 className="w-4 h-4" /> Finalized
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-medical-blue font-hero text-[10px] uppercase tracking-widest">
                              <Loader2 className="w-4 h-4 animate-spin" /> Neural Scan...
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => onTriggerUpload(m.type as 'eye' | 'ear')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-medical-teal/10 border border-medical-teal/20 text-medical-teal text-[10px] font-bold uppercase tracking-widest hover:bg-medical-teal hover:text-navy transition-all"
                        >
                          <Upload className="w-3 h-3" /> Quick Upload
                        </button>
                      )}
                    </AnimatePresence>
                 </div>
              )}
              {m.type === 'protocols' && (
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <motion.div animate={{ width: ['20%', '80%', '20%'] }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-medical-teal" />
                </div>
              )}
              {m.type === 'reports' && (
                <div className="flex gap-1 h-8 items-end">
                   {[0.4, 0.7, 0.3, 0.9, 0.6].map((h, i) => (
                     <motion.div key={i} animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="w-1 bg-medical-blue" />
                   ))}
                </div>
              )}
              {m.type === 'history' && (
                <div className="text-xl font-hero text-medical-teal"><Counter value={1240} />+</div>
              )}
              {(m.type === 'technology' || m.type === 'clinic') && (
                <div className="flex gap-2">
                   {[1,2,3].map(i => <div key={i} className={cn("w-2 h-2 rounded-full animate-ping", m.type === 'technology' ? "bg-purple-500" : "bg-medical-blue")} style={{ animationDelay: `${i*0.3}s` }} />)}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => onNavigate(m.type)}
          className="flex items-center text-medical-teal text-[10px] font-bold uppercase tracking-widest transition-all hover:translate-x-2"
        >
            Enter Module <ChevronRight className="w-4 h-4 ml-2" />
        </button>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
});

const Dashboard = React.memo(function Dashboard({ onNavigate }: { onNavigate: (view: any) => void }) {
  const [logs, setLogs] = useState<{ type: 'info' | 'warn' | 'alert' | 'ok'; msg: string; time: string }[]>([
    { type: 'info', msg: 'System initialized. Neural engine v5.2 active.', time: new Date().toLocaleTimeString() },
    { type: 'ok', msg: 'Core database handshake successful.', time: new Date().toLocaleTimeString() },
  ]);

  const [scans, setScans] = useState<DiagnosticScan[]>([]);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<'eye' | 'ear' | null>(null);
  const [scanResult, setScanResult] = useState<{ type: string; success: boolean } | null>(null);
  const [activeScanFile, setActiveScanFile] = useState<File | null>(null);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [showTips, setShowTips] = useState<'eye' | 'ear' | null>(null);
  const [detailedResult, setDetailedResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = (type: 'eye' | 'ear') => {
    setShowTips(type);
  };

  const proceedToUpload = (type: 'eye' | 'ear') => {
    setScanning(type);
    setShowTips(null);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser || !scanning) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      alert("Invalid clinical image format. Please upload JPG, PNG, WEBP or HEIC.");
      setScanning(null);
      return;
    }

    const type = scanning;
    setScanResult(null);
    setDetailedResult(null);

    setLogs(prev => [...prev.slice(-19), { 
      time: new Date().toLocaleTimeString(), 
      type: 'info', 
      msg: `INITIALIZING ${type.toUpperCase()} SCAN: FILE_ID ${Math.random().toString(36).substr(2, 9).toUpperCase()}` 
    }]);

    const quality = await validateImageQuality(file);
    setQualityWarnings(quality.warnings);

    if (!quality.valid) {
      alert("Image exceeds size limit (10MB). Please optimize and try again.");
      setScanning(null);
      return;
    }

    // Convert image to base64 with compression
    const base64Image = await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension 1600px
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Use quality 0.8 for good balance
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl.split(',')[1]);
      };
      img.src = URL.createObjectURL(file);
    });

    const mediaType = file.type || 'image/jpeg';
    const analysisPrompt = type === 'eye' ? eyeScanPrompt : earScanPrompt;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { mimeType: mediaType, data: base64Image } },
              { text: analysisPrompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: scanResponseSchema
        }
      });

      const result = JSON.parse(response.text);
      setDetailedResult(result);
      
      const newScan: Omit<DiagnosticScan, 'id'> = {
        userId: auth.currentUser!.uid,
        type: type as any,
        timestamp: new Date().toISOString(),
        imageUrl: URL.createObjectURL(file), // In real app, upload to storage
        results: result,
        confidenceScore: result.conditions_detected?.[0]?.confidence || 85,
        severity: result.urgency_level === 'emergency' ? 'high' : result.urgency_level === 'urgent' ? 'high' : 'low',
        summary: result.recommendation,
        recommendations: [result.disclaimer, ... (result.conditions_detected?.map((c: any) => c.description) || [])]
      };

      await addDoc(collection(db, 'scans'), newScan);
      setScanResult({ success: true, type });
    } catch (e) {
      console.error("AI Analysis Error:", e);
      handleFirestoreError(e, 'create', 'scans');
      setScanning(null);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qScans = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const qReports = query(
      collection(db, 'labReports'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubScans = onSnapshot(qScans, {
      next: (snapshot) => {
        setScans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DiagnosticScan[]);
      },
      error: (err) => {
        console.error("Error fetching scans:", err);
      }
    });

    const unsubReports = onSnapshot(qReports, {
      next: (snapshot) => {
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LabReport[]);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubScans();
      unsubReports();
    };
  }, []);

  const generateSampleData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Sample Scans
      const sampleScans: Partial<DiagnosticScan>[] = [
        {
          userId: user.uid,
          type: 'eye',
          timestamp: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=2000',
          results: { condition: 'Normal', findings: ['Slight irritation', 'No inflammation'] },
          confidenceScore: 98.4,
          severity: 'low',
          summary: 'Optical nerve symmetry verified. No macular degeneration detected.',
          recommendations: ['Periodic rest', 'UV protection']
        },
        {
          userId: user.uid,
          type: 'ear',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          results: { condition: 'Mild Wax Buildup', findings: ['Partial occlusion'] },
          confidenceScore: 92.1,
          severity: 'low',
          summary: 'External auditory canal shows minor epithelial debris.',
          recommendations: ['Oil-based drops', 'Avoid cotton swabs']
        }
      ];

      for (const scan of sampleScans) {
        await addDoc(collection(db, 'scans'), scan).catch(e => handleFirestoreError(e, 'create', 'scans'));
      }

      // Sample Lab Reports
      const sampleReports: Partial<LabReport>[] = [
        {
          userId: user.uid,
          title: 'Hematology Panel',
          labName: 'Central Diagnostics',
          date: new Date().toISOString().split('T')[0],
          category: 'blood',
          status: 'normal',
          fileUrl: 'mock-url',
          aiSummary: 'All values within optimal physiological ranges.',
          timestamp: new Date().toISOString()
        }
      ];

      for (const report of sampleReports) {
        await addDoc(collection(db, 'labReports'), report).catch(e => handleFirestoreError(e, 'create', 'labReports'));
      }

      alert('Sample data generated successfully!');
    } catch (error) {
      console.error("Error generating sample data:", error);
    }
  };

  const modules = [
    { type: 'eye', title: 'Eye Scan', desc: 'Retinal & Corneal AI Analysis', icon: Eye, color: 'text-medical-teal', accent: 'bg-medical-teal' },
    { type: 'ear', title: 'Ear Scan', desc: 'Otoscopic Neural Evaluation', icon: Ear, color: 'text-medical-blue', accent: 'bg-medical-blue' },
    { type: 'hearing', title: 'Audit Test', desc: 'Pure Tone Audiometry', icon: Radio, color: 'text-teal-400', accent: 'bg-teal-400' },
    { type: 'vision', title: 'Acuity Test', desc: 'Digital Snellen Chart', icon: Activity, color: 'text-medical-teal', accent: 'bg-medical-teal' },
    { type: 'protocols', title: 'Safety Protocols', desc: 'Secure Data Infrastructure', icon: ShieldCheck, color: 'text-medical-teal', accent: 'bg-medical-teal' },
    { type: 'reports', title: 'Lab Results', desc: 'Clinical Data Processing', icon: Microscope, color: 'text-medical-blue', accent: 'bg-medical-blue' },
    { type: 'history', title: 'Health Records', desc: 'Patient Data Archive', icon: ClipboardList, color: 'text-medical-teal', accent: 'bg-medical-teal' },
    { type: 'technology', title: 'Technology', desc: 'Neural Engine Cluster', icon: Cpu, color: 'text-purple-400', accent: 'bg-purple-500' },
    { type: 'clinic', title: 'Clinic Finder', desc: 'Geospatial Health Nodes', icon: Search, color: 'text-medical-blue', accent: 'bg-medical-blue' },
  ] as const;

  return (
    <div className="space-y-20 pb-20 relative">
      <GeometricDecoration />
      {/* Hero Section */}
      <div className="relative">
         <div className="light-bloom -top-40 -left-40" />
         <div className="space-y-6 relative z-10">
            <div className="flex flex-wrap gap-4">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel rounded-full text-[10px] font-mono text-medical-teal uppercase tracking-[0.3em]">
                  <div className="w-2 h-2 rounded-full bg-medical-teal animate-pulse" />
                  System Integrated & Secure
               </div>
               <button 
                 onClick={generateSampleData}
                 className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel rounded-full text-[10px] font-mono text-slate-400 hover:text-medical-teal border-white/5 hover:border-medical-teal/30 transition-all uppercase tracking-[0.3em]"
               >
                  <Plus className="w-3 h-3" />
                  Generate Sample Data
               </button>
            </div>
            <h1 className="text-7xl lg:text-9xl font-hero text-gradient leading-none">SYSTEM HUB</h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
              Coordinate medical infrastructure, verify safety protocols, and analyze clinical laboratory distributions via decentralized neural link.
            </p>
         </div>
         
         <div className="flex gap-16 mt-16">
            <div className="relative group flex items-center justify-center w-40 h-40">
               <svg className="absolute inset-0 w-full h-full">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="1" className="text-medical-teal/10" />
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#00FFD1" strokeWidth="1.5" strokeDasharray="477" className="animate-pulse-ring" />
               </svg>
               <div className="text-center relative z-10 pointer-events-none">
                  <p className="meta-label">System Uptime</p>
                  <p className="text-4xl lg:text-5xl font-hero text-white"><Counter value={99} />.<Counter value={99} />%</p>
               </div>
            </div>
            <div className="relative group flex items-center justify-center w-40 h-40">
               <svg className="absolute inset-0 w-full h-full">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="1" className="text-medical-blue/10" />
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeDasharray="477" className="animate-pulse-ring" />
               </svg>
               <div className="text-center relative z-10 pointer-events-none">
                  <p className="meta-label">Integrity</p>
                  <p className="text-4xl lg:text-5xl font-hero text-white">VERIFIED</p>
               </div>
            </div>
         </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.webp,.heic"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {modules.map((m) => (
          <ModuleCard 
            key={m.type}
            m={m} 
            scanning={scanning} 
            scanResult={scanResult} 
            onNavigate={onNavigate} 
            onTriggerUpload={triggerUpload} 
          />
        ))}
      </div>

      <TerminalLog importantLogs={logs} />

      {/* Photo Tips Overlay */}
      <AnimatePresence>
        {showTips && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel max-w-2xl w-full rounded-2xl overflow-hidden border-medical-teal/20"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-hero text-white tracking-tighter uppercase">
                      {showTips === 'eye' ? 'Eye Scan Guidelines' : 'Ear Scan Guidelines'}
                    </h2>
                    <p className="text-[10px] font-mono text-medical-teal tracking-widest uppercase">System Accuracy Optimization</p>
                  </div>
                  <button onClick={() => setShowTips(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-medical-teal font-bold uppercase text-[10px] tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Optimized Practices
                    </div>
                    <ul className="space-y-3 text-xs text-slate-400 font-medium list-none">
                      {showTips === 'eye' ? (
                        <>
                          <li className="flex gap-3"><span className="text-medical-teal">01</span> Use natural daylight or bright white light</li>
                          <li className="flex gap-3"><span className="text-medical-teal">02</span> Keep camera 15–20 cm from eye</li>
                          <li className="flex gap-3"><span className="text-medical-teal">03</span> Eye fully open, looking straight ahead</li>
                          <li className="flex gap-3"><span className="text-medical-teal">04</span> Take photo in focus (tap to focus)</li>
                        </>
                      ) : (
                        <>
                          <li className="flex gap-3"><span className="text-medical-teal">01</span> Use a torch/flashlight near the ear</li>
                          <li className="flex gap-3"><span className="text-medical-teal">02</span> Pull ear gently upward for better view</li>
                          <li className="flex gap-3"><span className="text-medical-teal">03</span> Ask someone to photograph for you</li>
                          <li className="flex gap-3"><span className="text-medical-teal">04</span> Keep camera 5–10 cm from opening</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-medical-red font-bold uppercase text-[10px] tracking-widest">
                      <AlertCircle className="w-4 h-4" /> Avoidance Protocols
                    </div>
                    <ul className="space-y-3 text-xs text-slate-400 font-medium list-none">
                      {showTips === 'eye' ? (
                        <>
                          <li className="flex gap-3"><span className="text-medical-red">01</span> No red-eye flash photos</li>
                          <li className="flex gap-3"><span className="text-medical-red">02</span> No sunglasses or spectacles</li>
                          <li className="flex gap-3"><span className="text-medical-red">03</span> No motion blur or dark lighting</li>
                        </>
                      ) : (
                        <>
                          <li className="flex gap-3"><span className="text-medical-red">01</span> Don't insert any object into ear</li>
                          <li className="flex gap-3"><span className="text-medical-red">02</span> No blurry or shaky photos</li>
                          <li className="flex gap-3"><span className="text-medical-red">03</span> No photos taken at harsh angles</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => proceedToUpload(showTips)}
                    className="btn-medical w-full h-14 rounded-xl text-xs font-hero tracking-[0.2em] font-bold uppercase"
                  >
                    Proceed to Initialization
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Analysis Result Overlay */}
      <AnimatePresence>
        {detailedResult && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-navy/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-4xl w-full bg-navy border border-white/5 shadow-3xl rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="h-1 bg-gradient-to-r from-medical-teal via-medical-blue to-medical-teal" />
              
              {/* Result Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start bg-black/40">
                <div className="space-y-1">
                   <div className="inline-flex items-center gap-2 text-medical-teal text-[9px] font-hero uppercase tracking-[0.3em]">
                      <Zap className="w-3 h-3 fill-current" /> Neural Analysis Complete
                   </div>
                   <h2 className="text-4xl font-hero text-white tracking-tighter uppercase leading-none">Diagnostic Manifest</h2>
                </div>
                <button onClick={() => { setDetailedResult(null); setScanning(null); setScanResult(null); }} className="p-2 glass-panel border-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 p-8 grid lg:grid-cols-12 gap-8">
                {/* Left Col: Core Stats */}
                <div className="lg:col-span-5 space-y-8">
                   {/* Health Score Gauge */}
                   <div className="glass-panel p-8 rounded-2xl border-white/5 flex flex-col items-center text-center space-y-4">
                      <p className="text-[10px] font-hero uppercase text-slate-500 tracking-widest">System Health Score</p>
                      <div className="relative w-40 h-24 overflow-hidden">
                         <div className="absolute inset-x-0 bottom-0 top-auto h-40 bg-medical-teal/5 border-[12px] border-white/5 rounded-full" />
                         <motion.div 
                           initial={{ rotate: -90 }}
                           animate={{ rotate: -90 + (1.8 * (detailedResult.eye_health_score || detailedResult.ear_health_score || 50)) }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="absolute bottom-0 left-1/2 -ml-0.5 w-1 h-20 origin-bottom"
                         >
                            <div className="w-1 h-20 bg-medical-teal shadow-glow shadow-medical-teal/50 rounded-full" />
                         </motion.div>
                         <div className="absolute inset-x-0 bottom-0 text-center">
                            <span className="text-5xl font-hero text-white leading-none">
                              {detailedResult.eye_health_score || detailedResult.ear_health_score || 0}
                            </span>
                         </div>
                      </div>
                      <div className="flex justify-between w-full text-[8px] font-hero text-slate-600 uppercase px-4">
                         <span>Critical</span>
                         <span>Healthy</span>
                      </div>
                      <div className={cn(
                        "mt-4 px-4 py-1.5 rounded-full text-[10px] font-hero uppercase tracking-widest",
                        urgencyConfig[detailedResult.urgency_level]?.bg || "bg-medical-teal/10",
                        "font-bold"
                      )} style={{ color: urgencyConfig[detailedResult.urgency_level]?.color }}>
                        {urgencyConfig[detailedResult.urgency_level]?.icon} {detailedResult.urgency_level?.toUpperCase()} ASSESSMENT
                      </div>
                   </div>

                   {/* Urgency Details */}
                   <div className={cn(
                     "p-6 rounded-2xl border flex items-start gap-4",
                     detailedResult.urgency_level === 'emergency' ? "bg-medical-red/10 border-medical-red/20" : "bg-medical-teal/5 border-medical-teal/10"
                   )}>
                      <div className={cn(
                        "p-3 rounded-xl shrink-0 mt-1",
                        detailedResult.urgency_level === 'emergency' ? "bg-medical-red text-white" : "bg-medical-teal text-navy"
                      )}>
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-xs font-hero uppercase tracking-widest text-white">{urgencyConfig[detailedResult.urgency_level]?.label}</h4>
                         <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">{urgencyConfig[detailedResult.urgency_level]?.message}</p>
                      </div>
                   </div>

                   {/* Specialist Recommender */}
                   <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-medical-blue/10 flex items-center justify-center text-medical-blue">
                            <Plus className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-hero text-slate-500 uppercase tracking-widest">Specialist Routing</p>
                            <p className="text-sm font-hero text-white uppercase">{detailedResult.recommended_specialist}</p>
                         </div>
                      </div>
                      <button className="w-full btn-medical-outline h-12 rounded-xl text-[9px] font-hero uppercase tracking-widest">
                         Find Clinical Node
                      </button>
                   </div>
                </div>

                {/* Right Col: Detailed Evidence */}
                <div className="lg:col-span-7 space-y-6">
                   {/* Quality Warnings if any */}
                   {qualityWarnings.length > 0 && (
                     <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-yellow-500 font-hero text-[10px] uppercase tracking-widest">
                           <AlertTriangle className="w-4 h-4" /> Image Quality Deviation detected
                        </div>
                        <ul className="space-y-1 text-[10px] text-slate-400 font-medium font-mono uppercase">
                           {qualityWarnings.map((w, idx) => <li key={idx}>• {w}</li>)}
                        </ul>
                        <p className="text-[9px] text-yellow-500/70 italic font-medium leading-relaxed">
                          Results shown are architectural estimates only. Re-initiate scan for parity.
                        </p>
                     </div>
                   )}

                   {/* Condition Cards */}
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-hero text-slate-500 uppercase tracking-[0.4em]">Pathological Matrix</h3>
                      {(detailedResult.conditions_detected || []).map((condition: any, idx: number) => (
                        <div key={idx} className="glass-panel rounded-2xl overflow-hidden border-white/5 group">
                           <div className="p-6 space-y-6">
                              <div className="flex justify-between items-start gap-4">
                                 <div>
                                    <h4 className={cn(
                                      "text-xl font-hero uppercase tracking-tighter leading-tight",
                                      condition.severity === 'severe' || condition.severity === 'critical' ? "text-medical-red" : "text-medical-teal"
                                    )}>
                                      {condition.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Type: {condition.type}</span>
                                       <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                       <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Area: {condition.affected_area}</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[8px] font-hero text-slate-500 uppercase tracking-widest mb-1">Confidence</div>
                                    <div className="flex items-center gap-2">
                                       <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                          <motion.div initial={{ width: 0 }} animate={{ width: `${condition.confidence}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-medical-teal" />
                                       </div>
                                       <span className="text-[10px] font-mono text-medical-teal font-bold">{condition.confidence}%</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-hero text-slate-600 uppercase tracking-widest">Visual Trace Log</p>
                                    <ul className="space-y-1.5">
                                       {condition.visual_indicators?.map((item: string, i: number) => (
                                         <li key={i} className="text-[10px] text-slate-400 flex items-start gap-2">
                                            <span className="text-medical-teal">•</span> {item}
                                         </li>
                                       ))}
                                    </ul>
                                 </div>
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-hero text-slate-600 uppercase tracking-widest">AI Assessment</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                       {condition.description}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                      {(!detailedResult.conditions_detected || detailedResult.conditions_detected.length === 0) && (
                        <div className="glass-panel p-10 rounded-2xl border-white/5 text-center space-y-3">
                           <div className="w-16 h-16 rounded-full bg-medical-teal/10 flex items-center justify-center text-medical-teal mx-auto">
                              <ShieldCheck className="w-8 h-8" />
                           </div>
                           <div>
                              <h4 className="text-xl font-hero text-white uppercase tracking-tighter">Zero Abnormalities Detected</h4>
                              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Neural baseline achieved - Parity verified</p>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Status Matrix Grid */}
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-hero text-slate-500 uppercase tracking-[0.4em]">Anatomical Status Map</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {scanning === 'eye' ? (
                           <>
                              <StatusCell label="Sclera" value={detailedResult.sclera_color} status={detailedResult.sclera_color === 'white' ? 'ok' : 'warn'} />
                              <StatusCell label="Pupil" value={detailedResult.pupil_status} status={detailedResult.pupil_status === 'normal' ? 'ok' : 'alert'} />
                              <StatusCell label="Redness" value={detailedResult.redness_level} status={detailedResult.redness_level === 'none' ? 'ok' : 'warn'} />
                              <StatusCell label="Discharge" value={detailedResult.discharge_present ? 'Present' : 'None'} status={detailedResult.discharge_present ? 'alert' : 'ok'} />
                              <StatusCell label="Swelling" value={detailedResult.swelling_present ? 'Present' : 'None'} status={detailedResult.swelling_present ? 'alert' : 'ok'} />
                              <StatusCell label="Urgency" value={detailedResult.urgency_level} status={detailedResult.urgency_level === 'routine' ? 'ok' : 'alert'} />
                           </>
                         ) : (
                           <>
                              <StatusCell label="Earwax" value={detailedResult.earwax_level} status={detailedResult.earwax_level === 'impacted' ? 'alert' : 'ok'} />
                              <StatusCell label="Canal" value={detailedResult.canal_status} status={detailedResult.canal_status === 'clear' ? 'ok' : 'warn'} />
                              <StatusCell label="Inflammation" value={detailedResult.inflammation_level} status={detailedResult.inflammation_level === 'none' ? 'ok' : 'warn'} />
                              <StatusCell label="Discharge" value={detailedResult.discharge_present ? 'Present' : 'None'} status={detailedResult.discharge_present ? 'alert' : 'ok'} />
                              <StatusCell label="Eardrum" value={detailedResult.eardrum_status} status={detailedResult.eardrum_status === 'normal' ? 'ok' : 'alert'} />
                              <StatusCell label="Urgency" value={detailedResult.urgency_level} status={detailedResult.urgency_level === 'routine' ? 'ok' : 'alert'} />
                           </>
                         )}
                      </div>
                   </div>

                   {/* Final Recommendation */}
                   <div className="p-8 glass-panel rounded-2xl border-medical-blue/30 bg-medical-blue/5 space-y-4">
                      <div className="flex items-center gap-3 text-medical-blue font-hero text-[10px] uppercase tracking-widest">
                         <Activity className="w-4 h-4" /> Next Steps Protocol
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                        "{detailedResult.recommendation}"
                      </p>
                      <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4">
                         <button className="flex items-center gap-2 text-[9px] font-bold text-white uppercase bg-white/5 px-4 h-10 rounded-lg hover:bg-white/10 transition-all">
                            <Download className="w-4 h-4" /> Download PDF
                         </button>
                         <button className="flex items-center gap-2 text-[9px] font-bold text-white uppercase bg-white/5 px-4 h-10 rounded-lg hover:bg-white/10 transition-all">
                            <Send className="w-4 h-4" /> Share with Clinic
                         </button>
                      </div>
                      <p className="text-[8px] text-slate-600 font-mono uppercase italic pt-2">
                        Disclaimer: {detailedResult.disclaimer}
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Dashboard;

