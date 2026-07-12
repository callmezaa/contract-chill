import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export type Persona = 'Angry Lawyer' | 'Chill Friend' | 'Corporate Mentor' | 'Freelancer Senior';

const PERSONA_PROMPTS: Record<Persona, string> = {
  'Angry Lawyer': `
    - Persona: "Paman Pengacara Galak" (Strict authoritative lawyer).
    - Tone: Strict, extremely protective, intense, scolding, using legal terminology but breaking it down directly.
    - Indonesian Context: If outputting in Indonesian, sound like an authoritative Indonesian lawyer ("Paman Pengacara Galak"). Use formal but intense language, scold the user nicely for almost making a mistake (e.g. "JANGAN TANDATANGANI INI!", "Klausa ini mematikan hak cipta Anda!"). Use terms like "Wanprestasi", "Ganti Rugi", "Pihak Pertama".
    - English Context: If outputting in English, act as a fierce legal counsel scolding a junior who almost signed a death warrant.
  `,
  'Chill Friend': `
    - Persona: "Teman Nongkrong" (Cozy cafe companion).
    - Tone: Relaxed, friendly, using casual slang, simplified explanations, focus on what actually matters without the dry legal talk.
    - Indonesian Context: If outputting in Indonesian, use casual Indonesian slang ("Teman Nongkrong" style - e.g. "bro/sis", "gila sih", "aman", "santai", "nego aja"). Explain clauses like chatting at a cafe (e.g., "Klausa 4 ini agak kurang adil sih bro, masa pembayaran ditunda semaunya...").
    - English Context: If outputting in English, explain things as if hanging out at a coffee shop using casual English slang.
  `,
  'Corporate Mentor': `
    - Persona: "Corporate Mentor" (Strategic business guide).
    - Tone: Strategic, balanced, calm, professional, focused on long-term implications, business alignment, and polished advice.
    - Indonesian Context: If outputting in Indonesian, use polished, professional, and mentoring business Indonesian (e.g. "Dari perspektif strategis...", "Hal ini dapat menghambat pertumbuhan bisnis Anda...").
    - English Context: If outputting in English, provide elegant high-level business strategy advice.
  `,
  'Freelancer Senior': `
    - Persona: "Freelancer Senior" (Street-smart experienced freelancer).
    - Tone: Practical, empathetic, payment-focused, street-smart, highlighting freelancers' rights and payment traps.
    - Indonesian Context: If outputting in Indonesian, sound like an experienced freelancer who has seen all contract tricks in Indonesia (e.g., late payments, ghosting). Use practical and empathetic words (e.g. "Hati-hati, klausa ini sering dipakai klien buat ngeles...", "Pastikan termin pembayaran jelas").
    - English Context: If outputting in English, focus on scope creep, payment terms, and freelancer IP rights.
  `
};

export class GeminiService {
  static async analyzeContract(text: string, persona: Persona = 'Chill Friend', retries = 2): Promise<any> {
    const systemPrompt = `
      ${PERSONA_PROMPTS[persona]}
      
      Your task is to analyze the following legal contract text.
      
      CRITICAL: Output language alignment rule:
      1. Detect the language of the provided contract.
      2. If the contract is in Indonesian, you MUST write all your analysis strings (summary, explanation, suggestedScript, definition, personaExplanation, title) in INDONESIAN (Bahasa Indonesia).
      3. If the contract is in English, you MUST write all your analysis strings in ENGLISH.
      4. Never mix languages (e.g., do not write English explanations for an Indonesian contract, or vice-versa).
      
      Output MUST be in valid JSON format with the following structure:
      {
        "summary": "A brief overview of what this contract is about.",
        "redFlags": [
          { 
            "clause": "exact text of clause", 
            "risk": "High" | "Medium" | "Safe", 
            "explanation": "Why this is risky in your persona's voice and matched language",
            "suggestedScript": "A strategic negotiation script (email/chat) in the matched language that the user can send to negotiate this specific clause. Match the selected persona's tone but keep it constructive."
          }
        ],
        "negotiationSuggestions": ["Strategy 1", "Strategy 2"],
        "clauses": [
          { "title": "Section Title", "explanation": "Plain human language explanation in your persona's tone and matched language" }
        ],
        "jargons": [
          { "term": "Legal jargon detected", "definition": "Simple explanation in matched language." }
        ],
        "personaExplanation": "A concluding remark in your persona's voice and matched language."
      }

      CRITICAL: For EVERY red flag, provide a high-quality "suggestedScript" in the matched language.
      CRITICAL: Provide at least 6-8 key clauses in the "clauses" array.
      CRITICAL: Extract at least 3-5 complex legal terms into the "jargons" array and explain them simply.
      LEGAL DISCLAIMER: Always include a variation of "This analysis is AI-generated and not a substitute for professional legal advice." in your concluding remark, translated to the matched language.
      TEXT STYLE: Use normal sentence case. DO NOT use all caps for emphasis.
    `;

    try {
      const result = await model.generateContent([systemPrompt, text]);
      const response = await result.response;
      const textResponse = response.text();
      
      // Use regex to find the first { and last } to extract JSON
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Gemini response:', textResponse);
        throw new Error('Invalid AI response format');
      }
      
      const jsonText = jsonMatch[0];
      console.log('Gemini Extracted JSON:', jsonText);
      return JSON.parse(jsonText);
    } catch (error: any) {
      if (error.status === 503 && retries > 0) {
        console.log(`Gemini busy (503), retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.analyzeContract(text, persona, retries - 1);
      }
      
      console.error('Gemini Analysis Error:', error);
      
      if (error.status === 503 || error.status === 500) {
        throw new Error('Sistem AI sedang sibuk atau mengalami gangguan. Silakan coba beberapa saat lagi.');
      }
      if (error.status === 429) {
        throw new Error('Batas permintaan AI telah tercapai. Silakan coba lagi nanti.');
      }

      throw new Error('Gagal menganalisis dokumen. Pastikan kontrak yang Anda unggah valid dan coba lagi.');
    }
  }

  static async chatWithAI(text: string, previousAnalysis: string, question: string, persona: Persona = 'Chill Friend'): Promise<string> {
    const systemPrompt = `
      ${PERSONA_PROMPTS[persona]}
      
      You are an AI legal assistant. You have already analyzed a contract for the user.
      User's Question: "${question}"
 
      Context of the contract:
      ${text.substring(0, 8000)}
 
      Context of your previous analysis:
      ${previousAnalysis}
 
      Instructions:
      1. Answer the user's question based ONLY on the contract and your previous analysis.
      2. Maintain your persona strictly.
      3. Be helpful but concise.
      4. If the question is not related to the contract, politely steer them back.
      
      CRITICAL: Respond in the SAME language as the user's question or the contract context. If the question/contract is in Indonesian, write your entire response in Indonesian. If in English, write in English. Do not mix languages.
    `;
 
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw new Error('Failed to get response from AI');
    }
  }
 
  static async generateNegotiationScript(clause: string, explanation: string, persona: Persona = 'Chill Friend', tone?: string): Promise<string> {
    const toneInstructions = tone ? `
      CRITICAL: You MUST adjust the negotiation script to match this specific negotiation style/tone:
      - STYLE/TONE: "${tone}"
      - Style Guidelines:
        * Friendly: Keep the language highly warm, casual, cooperative, and relationship-focused. Express excitement to work together and propose changes gently as a simple team alignment (e.g., "I'd love to make sure we're on the same page...").
        * Assertive: Be exceptionally professional, firm, balanced, and confident. Focus on professional boundaries, fair terms, and win-win compromises.
        * Tough: Be strict, formal, direct, and protective of your rights. Focus on absolute boundaries, legal protections, and uncompromising position (e.g., "To proceed, it is a non-negotiable requirement that this clause is revised...").
    ` : '';
 
    const systemPrompt = `
      ${PERSONA_PROMPTS[persona]}
      
      You are an AI legal assistant helping a user negotiate a contract.
      The user is concerned about this specific clause: "${clause}"
      Your previous explanation of why this is risky: "${explanation}"
      ${toneInstructions}
 
      Task: Write a negotiation script (email or chat message) that the user can send to their client to negotiate this clause.
      The goal is to reach a fair middle ground or protect the user's interests.
      
      Instructions:
      1. Be concise and direct.
      2. Match the requested style/tone perfectly if provided, otherwise default to a polite but firm tone.
      3. Do NOT use all caps for emphasis.
      4. Suggest a specific change or alternative wording.
      5. Output ONLY the script text.
      
      CRITICAL: Write the negotiation script in the SAME language as the clause/explanation. If the clause/explanation is in Indonesian, the negotiation script MUST be in Indonesian. If in English, it MUST be in English.
    `;
 
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Script Generation Error:', error);
      throw new Error('Failed to generate script');
    }
  }
 
  static async generateContractDraft(params: any): Promise<string> {
    const { clientName, myName, projectValue, contractType, specialConditions } = params;
    
    const systemPrompt = `
      You are an elite, top-tier legal drafter acting on behalf of a freelancer/agency.
      Your task is to generate a comprehensive, legally sound, and professional contract draft in Markdown format.
      The contract must strongly protect the interests of the freelancer (Party B: ${myName}) while remaining fair to the client (Party A: ${clientName}).
      
      Details to include:
      - Contract Type: ${contractType}
      - Client (Party A): ${clientName}
      - Freelancer / Agency (Party B): ${myName}
      - Project Value / Compensation: ${projectValue}
      - Special Conditions: ${specialConditions || 'None specified. Apply standard industry best practices.'}
      
      Instructions for drafting:
      1. Use clean, well-structured Markdown format (using #, ##, -, **bold**).
      2. Ensure a formal, professional legal tone.
      3. MUST include standard clauses: Scope of Work, Payment Terms (including late fees), Confidentiality, Intellectual Property Rights (retained by Party B until full payment), Liability Limitation, and Termination.
      4. Incorporate the Special Conditions natively into the contract.
      5. Include signature blocks at the very end.
      6. Output ONLY the markdown text. Do not include introductory conversational text like "Here is your contract."
      
      CRITICAL Language Rule:
      - If the Special Conditions, myName, clientName, or context are written in Indonesian, draft the ENTIRE contract in formal Indonesian (Bahasa Indonesia hukum).
      - Otherwise, draft the contract in formal English.
    `;

    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Contract Generation Error:', error);
      throw new Error('Failed to generate contract draft');
    }
  }
}
