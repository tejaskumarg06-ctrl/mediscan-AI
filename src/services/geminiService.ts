import firebaseConfig from '../../firebase-applet-config.json';

const apiKey = process.env.GEMINI_API_KEY || firebaseConfig.apiKey;
const ai = new GoogleGenAI({ apiKey });

export interface ScanResult {
  diagnosis: string;
  confidence: number;
  findings: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const geminiService = {
  async analyzeEyeScan(imageBuffer: string): Promise<ScanResult> {
    const prompt = `
      You are a specialized ophthalmology AI assistant. Analyze this eye image for preliminary screening.
      Focus on detecting:
      - Scleral icterus (jaundice/yellowing)
      - Conjunctival injection (redness/inflammation)
      - Pupil irregularities
      - Signs of cataracts or clouding
      
      Provide a structured JSON response with:
      - diagnosis: Primary observation
      - confidence: Confidence score (0-1)
      - findings: List of specific visual markers found
      - severity: 'low', 'medium', or 'high' based on urgency
      - recommendations: Next steps (e.g., "See an optometrist", "Monitor for changes")
      
      Important: This is a preliminary screening, not a definitive diagnosis.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: imageBuffer.split(',')[1], mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      return JSON.parse(response.text || '{}') as ScanResult;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Diagnostic engine failure. Please try again.");
    }
  },

  async analyzeEarScan(imageBuffer: string): Promise<ScanResult> {
    const prompt = `
      You are a specialized ENT (Ear, Nose, Throat) AI assistant. Analyze this ear canal/otoscopy image.
      Focus on detecting:
      - Cerumen (earwax) buildup levels
      - Erythema (redness) of the canal or tympanic membrane
      - Signs of discharge or inflammation
      - Structural irregularities
      
      Provide a structured JSON response with:
      - diagnosis: Primary observation
      - confidence: Confidence score (0-1)
      - findings: List of specific visual markers found
      - severity: 'low', 'medium', or 'high' based on urgency
      - recommendations: Next steps (e.g., "Manual removal required", "Avoid cotton swabs", "Urgent referral required")
      
      Important: This is a preliminary screening, not a definitive diagnosis.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: imageBuffer.split(',')[1], mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      return JSON.parse(response.text || '{}') as ScanResult;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Diagnostic engine failure. Please try again.");
    }
  },

  async summarizeLabReport(ocrText: string): Promise<{ summary: string; findings: string[]; category: string; status: string }> {
    const prompt = `
      You are a clinical laboratory analyst. Analyze the following OCR text extracted from a medical lab report.
      1. Categorize the report (e.g., "blood", "urine", "mri_ct", "eye_pressure", "audiometry", "allergy").
      2. Determine the status ("normal" if all values in range, "abnormal" if any critical values found).
      3. Provide a concise, plain-English summary of the overall result.
      4. List specific findings or values that are out of the normal range.
      
      OCR TEXT:
      ${ocrText}
      
      Provide a structured JSON response with:
      - category: string
      - status: 'normal' | 'abnormal'
      - summary: string
      - findings: string[]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Gemini mapping failed", e);
      return { 
        summary: "Automated analysis failed. Potential anomalies may exist.",
        findings: [],
        category: "other",
        status: "pending"
      };
    }
  }
};
