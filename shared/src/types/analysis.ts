export type RiskLevel = 'High' | 'Medium' | 'Safe';

export interface RedFlag {
  clause: string;
  risk: RiskLevel;
  explanation: string;
  suggestedScript?: string;
}

export interface AnalysisResult {
  summary: string;
  redFlags: RedFlag[];
  negotiationSuggestions: string[];
  clauses: { title: string; explanation: string }[];
  jargons?: { term: string; definition: string }[];
  personaExplanation: string;
}

export type Persona = 'Angry Lawyer' | 'Chill Friend' | 'Corporate Mentor' | 'Freelancer Senior';