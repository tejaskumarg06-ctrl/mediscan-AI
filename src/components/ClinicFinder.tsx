import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Globe, 
  Clock, 
  ChevronRight, 
  Calendar, 
  Video, 
  ShieldCheck,
  ChevronLeft,
  Navigation,
  CheckCircle2,
  Bell,
  X,
  User as UserIcon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Clinic, Appointment, DiagnosticScan, LabReport } from '../types';
import { cn } from '../lib/utils';
import { CircuitBoard, AbstractBlobs } from './AestheticDecorations';

// Custom Teal Marker Icon
const createCustomIcon = (isSelected: boolean) => {
  const size = isSelected ? 40 : 28;
  const color = isSelected ? '#00FFD1' : '#00A3FF';
  const glow = isSelected ? '0 0 15px rgba(0,255,209,0.6)' : '0 0 10px rgba(0,163,255,0.4)';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${glow};
        border: 2px solid rgba(255,255,255,0.3);
        transition: all 0.2s ease-out;
      ">
        <div style="
          width: ${size / 4}px;
          height: ${size / 4}px;
          background: #0F172A;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

function ChangeView({ center, zoom = 14 }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
      prevCenter.current = center;
    }
  }, [center, map, zoom]);

  return null;
}

const CLINICS_MOCK: Clinic[] = [
  {
    id: 'c1',
    name: 'Advanced Optical Center',
    specialty: ['Ophthalmologist', 'Optician'],
    rating: 4.8,
    address: '122 Clinical Ave, Medical District',
    phone: '+1 555-0102',
    website: 'https://advancedoptical.com',
    hours: { Monday: '09:00 - 18:00', Tuesday: '09:00 - 18:00', Wednesday: '09:00 - 18:00', Thursday: '09:00 - 18:00', Friday: '09:00 - 17:00' },
    doctors: [
      { name: 'Dr. Sarah Chen', photo: '', specialty: 'Corneal Specialist', qualification: 'MD, PhD' },
      { name: 'Dr. Mike Ross', photo: '', specialty: 'Optometrist', qualification: 'OD' }
    ],
    insuranceAccepted: ['BlueCross', 'Aetna', 'UnitedHealth'],
    coordinates: { lat: 51.505, lng: -0.09 },
    photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
    hasTelemedicine: true
  },
  {
    id: 'c2',
    name: 'ENT & Audiology Partners',
    specialty: ['ENT', 'Audiologist'],
    rating: 4.6,
    address: '88 Sound Shore Dr, Healthcare Plaza',
    phone: '+1 555-0199',
    website: 'https://entpartners.clinic',
    hours: { Monday: '08:00 - 17:00', Tuesday: '08:00 - 17:00', Wednesday: '08:00 - 17:00', Thursday: '08:00 - 17:00', Friday: '09:00 - 14:00' },
    doctors: [
      { name: 'Dr. Alan Grant', photo: '', specialty: 'Otology', qualification: 'MD' }
    ],
    insuranceAccepted: ['Cigna', 'Medicare', 'Aetna'],
    coordinates: { lat: 51.515, lng: -0.1 },
    photoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    hasTelemedicine: false
  },
  {
    id: 'c3',
    name: 'City General Physician Group',
    specialty: ['General Physician'],
    rating: 4.5,
    address: '10 Main St, Downtown',
    phone: '+1 555-0123',
    website: 'https://citygen.com',
    hours: { Monday: '00:00 - 24:00', Tuesday: '00:00 - 24:00', Wednesday: '00:00 - 24:00', Thursday: '00:00 - 24:00', Friday: '00:00 - 24:00' },
    doctors: [
      { name: 'Dr. Jane Doe', photo: '', specialty: 'Internal Medicine', qualification: 'MD' }
    ],
    insuranceAccepted: ['All Major Insurance'],
    coordinates: { lat: 51.495, lng: -0.08 },
    photoUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400',
    hasTelemedicine: true
  }
];

export default function ClinicFinder() {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<DiagnosticScan | null>(null);
  const [abnormalReport, setAbnormalReport] = useState<LabReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [bookingClinic, setBookingClinic] = useState<Clinic | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    const fetchLatestData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const qScans = query(
          collection(db, 'scans'), 
          where('userId', '==', user.uid), 
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const scanSnap = await getDocs(qScans);
        if (!scanSnap.empty) setLatestScan(scanSnap.docs[0].data() as DiagnosticScan);

        const qLabs = query(
          collection(db, 'labReports'),
          where('userId', '==', user.uid),
          where('status', '==', 'abnormal'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const labSnap = await getDocs(qLabs);
        if (!labSnap.empty) setAbnormalReport(labSnap.docs[0].data() as LabReport);
      } catch (e) {
        console.error("Geospatial Fetch Error:", e);
      }
    };
    fetchLatestData();
  }, []);

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser || !bookingClinic) return;

    const formData = new FormData(e.currentTarget);
    const appointment: Omit<Appointment, 'id'> = {
      userId: auth.currentUser.uid,
      clinicId: bookingClinic.id,
      clinicName: bookingClinic.name,
      doctorName: formData.get('doctor') as string,
      date: formData.get('date') as string,
      timeSlot: formData.get('time') as string,
      reason: formData.get('reason') as string,
      status: 'scheduled',
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'appointments'), appointment);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingClinic(null);
      }, 2000);
    } catch (e) {
      console.error("Booking Error:", e);
    }
  };

  const filteredClinics = useMemo(() => {
    return CLINICS_MOCK.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = filterSpecialty === 'all' || c.specialty.includes(filterSpecialty);
      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, filterSpecialty]);

  const referralSpecialty = useMemo(() => {
    if (latestScan) {
      if (latestScan.type === 'eye' && latestScan.severity === 'high') return "Ophthalmologist";
      if (latestScan.type === 'ear') return "ENT";
      if (latestScan.type === 'hearing') return "Audiologist";
    }
    if (abnormalReport) {
      if (abnormalReport.category === 'blood' || abnormalReport.category === 'mri_ct') return "General Physician";
      if (abnormalReport.category === 'eye_pressure') return "Ophthalmologist";
    }
    return null;
  }, [latestScan, abnormalReport]);

  const viewedClinic = useMemo(() => 
    CLINICS_MOCK.find(c => c.id === selectedClinicId) || null
  , [selectedClinicId]);

  const onSelectClinic = useCallback((clinic: Clinic) => {
    setSelectedClinicId(clinic.id);
    setMapCenter([clinic.coordinates.lat, clinic.coordinates.lng]);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6 pb-6 animate-fade-in relative z-10 overflow-hidden">
      <AbstractBlobs />
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel rounded-full text-[9px] font-mono text-medical-teal uppercase tracking-[0.4em] bg-medical-teal/5 border-medical-teal/20">
            <span className="w-1.5 h-1.5 bg-medical-teal rounded-full animate-pulse" />
            Active Surveillance Node v3.0
          </div>
          <h1 className="text-5xl font-hero text-gradient uppercase tracking-tight leading-none">CLINIC FINDER</h1>
          <p className="text-slate-500 text-sm max-w-lg font-medium leading-relaxed">
            AI-optimized medical facility mapping. Real-time path tracing and practitioner availability sync.
          </p>
        </div>
        
        <AnimatePresence>
          {referralSpecialty && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex items-center gap-4 glass-panel border-medical-teal/30 bg-medical-teal/5 p-5 rounded-2xl relative overflow-hidden group border-l-4 border-l-medical-teal"
            >
              <div className="w-10 h-10 rounded-xl bg-medical-teal flex items-center justify-center shrink-0 shadow-lg">
                <Bell className="w-5 h-5 text-navy group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-hero uppercase text-medical-teal tracking-[0.2em] font-bold">Priority Scan Outcome</p>
                <p className="text-xs font-medium text-white/90 truncate max-w-[200px]">Node Referral: <span className="text-medical-teal font-bold">{referralSpecialty.toUpperCase()}</span></p>
                <button 
                  onClick={() => setFilterSpecialty(referralSpecialty)}
                  className="text-[9px] font-bold uppercase underline hover:text-medical-teal transition-all tracking-widest block"
                >
                  SET SYSTEM FILTER
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-[550px] overflow-hidden">
        {/* Sidebar: Clinical Feed */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
           <div className="grid grid-cols-1 gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-medical-teal transition-colors" />
                <input 
                  type="text" 
                  placeholder="Clinical ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/5 h-12 pl-12 pr-4 text-xs font-medium focus:border-medical-teal/40 outline-none rounded-xl text-white transition-all backdrop-blur-md"
                />
              </div>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <select 
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="w-full bg-black/30 border border-white/5 h-10 px-4 text-[9px] font-hero uppercase text-medical-teal outline-none rounded-lg cursor-pointer hover:border-medical-teal/30 transition-all appearance-none"
                    >
                       <option value="all">ALL DEPARTMENTS</option>
                       <option value="Ophthalmologist">OPHTHALMOLOGY</option>
                       <option value="ENT">ENT SPECIALIST</option>
                       <option value="Audiologist">AUDIOLOGY</option>
                       <option value="General Physician">GP / INTERNAL</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-medical-teal rotate-90 pointer-events-none" />
                 </div>
                 <button className="w-10 h-10 glass-panel border-white/10 flex items-center justify-center rounded-lg hover:bg-medical-teal/10 group transition-all">
                   <Filter className="w-3.5 h-3.5 text-slate-500 group-hover:text-medical-teal" />
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-4">
              {filteredClinics.map(clinic => (
                <button 
                  key={clinic.id}
                  onClick={() => onSelectClinic(clinic)}
                  className={cn(
                    "w-full glass-panel group text-left transition-all rounded-2xl overflow-hidden relative border-white/5 flex flex-col",
                    selectedClinicId === clinic.id ? "border-medical-teal/40 ring-1 ring-medical-teal/30 bg-white/5" : "hover:border-white/10"
                  )}
                >
                   <div className="relative h-32 w-full overflow-hidden">
                      <img 
                        src={clinic.photoUrl} 
                        alt={clinic.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                         <div className="px-2 py-0.5 bg-medical-teal text-navy text-[7px] font-bold uppercase rounded">
                            {clinic.rating} ★
                         </div>
                         {clinic.hasTelemedicine && (
                           <div className="px-2 py-0.5 bg-medical-blue text-white text-[7px] font-bold uppercase rounded flex items-center gap-1">
                              <Video className="w-2 h-2" /> TELE
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                         <h3 className="text-sm font-hero uppercase tracking-tighter text-white group-hover:text-medical-teal transition-colors truncate">{clinic.name}</h3>
                         <ChevronRight className={cn("w-4 h-4 transition-all", selectedClinicId === clinic.id ? "text-medical-teal translate-x-1" : "text-slate-600")} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                         {clinic.specialty.map(s => (
                           <span key={s} className="text-[7px] text-medical-teal font-medium uppercase tracking-widest">{s}</span>
                         ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        <p className="text-[9px] text-slate-500 font-medium truncate leading-relaxed">{clinic.address}</p>
                      </div>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {/* Main Interface: Map Node */}
        <div className="col-span-12 lg:col-span-8 glass-panel border-white/5 relative rounded-2xl overflow-hidden bg-navy-light shadow-2xl group">
           <MapContainer 
             center={mapCenter} 
             zoom={13} 
             style={{ height: '100%', width: '100%' }}
             zoomControl={false}
             className="z-0"
           >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              <ChangeView center={mapCenter} />
              <ZoomControl position="topright" />
              {filteredClinics.map(clinic => (
                <Marker 
                  key={clinic.id} 
                  position={[clinic.coordinates.lat, clinic.coordinates.lng]}
                  icon={createCustomIcon(selectedClinicId === clinic.id)}
                  eventHandlers={{
                    click: () => setSelectedClinicId(clinic.id)
                  }}
                >
                  <Popup className="medical-popup">
                    <div className="p-2 text-navy min-w-[120px] text-center">
                      <p className="font-hero uppercase text-[9px] mb-2 text-navy">{clinic.name}</p>
                      <button 
                        onClick={() => setSelectedClinicId(clinic.id)}
                        className="w-full py-1 bg-medical-blue text-white text-[7px] font-bold uppercase tracking-widest rounded hover:bg-navy transition-colors"
                      >
                        OPEN NODE
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
           </MapContainer>

           {/* Detail Overlay */}
           <AnimatePresence>
              {viewedClinic && !bookingClinic && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 z-[1001] glass-panel border-medical-teal/30 bg-navy/95 backdrop-blur-2xl shadow-3xl rounded-xl overflow-hidden"
                >
                   <div className="h-0.5 bg-gradient-to-r from-medical-teal via-medical-blue to-medical-teal animate-shimmer" />
                   <div className="p-6 flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                         <div className="flex justify-between items-start gap-4">
                            <div>
                               <h2 className="text-2xl font-hero text-gradient leading-tight uppercase tracking-tighter">{viewedClinic.name}</h2>
                               <p className="text-[8px] font-hero text-medical-teal/50 uppercase tracking-[0.4em] mt-1">STATUS: OPERATIONAL_NODE_SECURE</p>
                            </div>
                            <button onClick={() => setSelectedClinicId(null)} className="p-1 hover:bg-white/5 rounded-full text-slate-600 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                               <h4 className="text-[8px] font-hero text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1">COORDINATES</h4>
                               <p className="text-[10px] text-slate-400 font-medium leading-tight">{viewedClinic.address}</p>
                               <p className="text-[10px] text-medical-teal font-bold">{viewedClinic.phone}</p>
                            </div>
                            <div className="space-y-2">
                               <h4 className="text-[8px] font-hero text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1">PERSONNEL</h4>
                               <div className="space-y-1">
                                  {viewedClinic.doctors.map((doc, idx) => (
                                    <p key={idx} className="text-[10px] font-bold text-white uppercase truncate flex items-center gap-2">
                                       <span className="w-1 h-1 bg-medical-teal rounded-full" /> {doc.name}
                                    </p>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-2">
                               <h4 className="text-[8px] font-hero text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1">LATTICE_SYNC</h4>
                               <div className="px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-lg flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-[8px] font-hero uppercase text-green-500">Node Reachable</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="md:w-56 flex flex-col gap-2 justify-center">
                         <button 
                           onClick={() => setBookingClinic(viewedClinic)}
                           className="btn-medical w-full h-12 rounded-lg text-[9px] flex items-center justify-center gap-2 group"
                         >
                           <Calendar className="w-4 h-4" /> 
                           <span className="font-hero tracking-[0.2em]">SYNC_RESERVATION</span>
                         </button>
                         <div className="grid grid-cols-2 gap-2">
                            <button className="btn-medical-outline h-10 rounded-lg text-[8px] font-hero tracking-widest flex items-center justify-center gap-1.5 uppercase hover:bg-white/5">Map</button>
                            {viewedClinic.hasTelemedicine && (
                              <button className="btn-medical-outline h-10 rounded-lg text-[8px] font-hero tracking-widest flex items-center justify-center gap-1.5 uppercase text-medical-teal border-medical-teal/20 bg-medical-teal/5">Tele</button>
                            )}
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           {/* Full Reservation Overlay */}
           <AnimatePresence>
             {bookingClinic && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[2000] bg-navy/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto"
               >
                  <motion.div 
                    initial={{ scale: 0.98, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-xl glass-panel border-white/10 shadow-3xl bg-navy-light rounded-2xl overflow-hidden"
                  >
                     <div className="h-1 bg-gradient-to-r from-medical-teal via-medical-blue to-medical-teal" />
                     <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
                        <div className="space-y-1">
                          <h3 className="text-[8px] font-hero text-medical-teal tracking-[0.4em] uppercase font-bold">Clinical Reservation Matrix</h3>
                          <h2 className="text-2xl font-hero text-white tracking-tighter uppercase leading-none">{bookingClinic.name}</h2>
                        </div>
                        <button onClick={() => setBookingClinic(null)} className="p-2 glass-panel border-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                     </div>
                     <form className="p-8 space-y-6" onSubmit={handleBookAppointment}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <label className="meta-label">Node Specialist</label>
                              <select name="doctor" className="w-full bg-black/40 border border-white/5 h-12 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-medical-teal/40 rounded-lg text-white appearance-none cursor-pointer">
                                 {bookingClinic.doctors.map(d => <option key={d.name} value={d.name}>{d.name.toUpperCase()}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="meta-label">Insurance Provider</label>
                              <select className="w-full bg-black/40 border border-white/5 h-12 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-medical-teal/40 rounded-lg text-white appearance-none cursor-pointer">
                                 {bookingClinic.insuranceAccepted.map(i => <option key={i} value={i}>{i.toUpperCase()}</option>)}
                              </select>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <label className="meta-label">Temporal Window (Date)</label>
                              <input 
                                type="date" 
                                name="date" 
                                min={new Date().toISOString().split('T')[0]} 
                                required 
                                className="w-full bg-black/40 border border-white/5 h-12 px-4 text-xs font-mono text-white outline-none focus:border-medical-teal/40 rounded-lg" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="meta-label">Time Coordinate</label>
                              <select name="time" className="w-full bg-black/40 border border-white/5 h-12 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-medical-teal/40 rounded-lg text-white appearance-none cursor-pointer">
                                 <option>09:30 AM</option>
                                 <option>11:00 AM</option>
                                 <option>02:15 PM</option>
                                 <option>04:30 PM</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="meta-label">Handshake Manifest</label>
                           <textarea name="reason" required placeholder="Describe clinical symptoms..." className="w-full h-20 bg-black/40 border border-white/5 p-4 text-[10px] font-medium outline-none focus:border-medical-teal/40 rounded-lg resize-none text-white placeholder:text-slate-700" />
                        </div>
                        <div className="p-4 bg-medical-teal/5 border border-medical-teal/10 rounded-xl flex items-start gap-3">
                           <ShieldCheck className="w-5 h-5 text-medical-teal shrink-0 mt-0.5" />
                           <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-widest italic">
                             Sync verified. Zero-fee reservation secured via <span className="text-white font-bold italic">MediScan Lattice</span> encryption.
                           </p>
                        </div>
                        <div className="flex gap-4 pt-2">
                           <button type="button" onClick={() => setBookingClinic(null)} className="btn-medical-outline flex-1 h-14 rounded-lg text-[9px] font-hero tracking-widest uppercase hover:bg-white/5 transition-all">ABORT_SYNC</button>
                           <button type="submit" className="btn-medical flex-1 h-14 rounded-lg text-[9px] font-hero tracking-widest uppercase group transition-all">INIT_RESERVATION</button>
                        </div>
                     </form>
                     <AnimatePresence>
                        {bookingSuccess && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-medical-teal flex flex-col items-center justify-center text-navy z-[2100]">
                             <CheckCircle2 className="w-16 h-16 mb-4 animate-bounce" />
                             <h2 className="text-3xl font-hero uppercase tracking-tighter">RESERVATION_SECURED</h2>
                             <p className="text-[8px] font-bold uppercase tracking-widest mt-2 opacity-60">Digital Signature: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </motion.div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
