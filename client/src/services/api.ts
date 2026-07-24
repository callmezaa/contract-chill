import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import type { AnalysisResult, Persona } from '@chill/shared';

export const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error', {
        description: 'Check your internet connection and try again.',
      });
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      toast.error('Session expired', {
        description: 'Please sign in again.',
      });
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 429) {
      toast.error('Too many requests', {
        description: 'Please wait a moment and try again.',
      });
      return Promise.reject(error);
    }

    if (status >= 500) {
      toast.error('Server error', {
        description: 'Something went wrong on our end. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

export const analyzeContract = async (file: File, persona: Persona): Promise<AnalysisResult & { fileUrl: string }> => {
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
