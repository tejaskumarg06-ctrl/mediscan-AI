export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  bloodGroup?: string;
  dob?: string;
  gender?: string;
  photoUrl?: string;
  existingConditions: string[];
  allergies?: string[];
  medications?: string[];
  pastSurgeries?: string[];
  createdAt: string;
}

export interface FamilyHistory {
  id?: string;
  userId: string;
  relative: string;
  condition: string;
}

export interface Vaccination {
  id?: string;
  userId: string;
  vaccineName: string;
  date: string;
  nextDue: string;
}

export interface VitalRecord {
  id?: string;
  userId: string;
  type: 'bp_systolic' | 'bp_diastolic' | 'heart_rate' | 'blood_sugar' | 'weight' | 'bmi';
  value: number;
  timestamp: string;
}

export interface LabReport {
  id?: string;
  userId: string;
  title: string;
  labName: string;
  date: string;
  category: 'blood' | 'urine' | 'mri_ct' | 'eye_pressure' | 'audiometry' | 'allergy' | 'other';
  status: 'normal' | 'abnormal' | 'pending';
  fileUrl: string;
  extractedText?: string;
  aiSummary?: string;
  highlights?: string[];
  notes?: string;
  timestamp: string;
}

export interface Clinic {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  address: string;
  phone: string;
  website: string;
  hours: Record<string, string>;
  doctors: Array<{
    name: string;
    photo: string;
    specialty: string;
    qualification: string;
  }>;
  insuranceAccepted: string[];
  coordinates: { lat: number; lng: number };
  photoUrl: string;
  hasTelemedicine: boolean;
}

export interface Appointment {
  id?: string;
  userId: string;
  clinicId: string;
  clinicName: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  timestamp: string;
}

export type ScanType = 'eye' | 'ear' | 'hearing' | 'vision';
export type Severity = 'low' | 'medium' | 'high';

export interface DiagnosticScan {
  id?: string;
  userId: string;
  type: ScanType;
  timestamp: string;
  imageUrl?: string;
  results: any;
  confidenceScore?: number;
  severity?: Severity;
  summary: string;
  recommendations: string[];
}

export interface AudiogramData {
  frequency: number;
  dB: number;
  ear: 'left' | 'right';
}
