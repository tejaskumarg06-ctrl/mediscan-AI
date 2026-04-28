import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getARIAFeedback(userMessage: string, patientContext: any, inputMode: 'voice' | 'text' = 'voice') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `You are ARIA (Automated Radiological Intelligence Assistant), a medical AI assistant for MediScan AI.
        
        Personality: Calm, professional, empathetic.
        Current Input Mode: ${inputMode} (Adjust your response length and formatting accordingly).
        
        Guidelines:
        - VOICE MODE: Keep responses under 3 sentences. Use very simple, spoken-friendly language.
        - TEXT MODE: You can be more detailed. Use **bolding**, lists, and clear structure.
        - NEVER diagnose definitively. Always recommend consulting a professional for serious concerns.
        - If a navigation command is needed, include [NAV:page-id] at the end.
        - If useful, suggest 2-3 short follow-up questions at the very end as [SUG:question1|question2].
        
        Valid Page IDs: dashboard, eye-scan, ear-scan, hearing-test, reports, history, clinic, protocols, technology.
        
        Context: ${JSON.stringify(patientContext)}`,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini ARIA Error:", error);
    return "I'm having trouble connecting. Please try again.";
  }
}
