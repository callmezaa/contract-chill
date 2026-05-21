import axios from 'axios';
import { auth } from '../lib/firebase';
import type { AnalysisResult, Persona } from '../types/analysis';

export const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Intercept all requests to attach the Firebase ID token
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const analyzeContract = async (file: File, persona: Persona): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('contract', file);
  formData.append('persona', persona);

  const response = await api.post(`/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateNegotiationScript = async (clause: string, explanation: string, persona: Persona, tone?: string): Promise<string> => {
  const response = await api.post(`/generate-script`, {
    clause,
    explanation,
    persona,
    tone
  });

  return response.data.script;
};

export interface GenerateContractParams {
  clientName: string;
  myName: string;
  projectValue: string;
  contractType: string;
  specialConditions?: string;
}

export const generateContractDraft = async (params: GenerateContractParams): Promise<string> => {
  const response = await api.post(`/generate-contract`, params);
  return response.data.draft;
};
