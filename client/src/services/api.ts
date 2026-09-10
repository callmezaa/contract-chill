import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { upload } from '@vercel/blob/client';
import type { AnalysisResult, Persona } from '@chill/shared';

const devApiUrl = 'http://localhost:5000/api';
const prodApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const API_URL = (import.meta.env.DEV ? devApiUrl : prodApiUrl).replace(/\/$/, '');

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

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!auth.currentUser) return {};
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const uploadToBlob = async (file: File, type: 'contract' | 'photo'): Promise<string> => {
  const headers = await getAuthHeaders();
  try {
    const result = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: `${API_URL}/upload-token`,
      headers,
      clientPayload: JSON.stringify({ type }),
    });
    return result.url;
  } catch (err) {
    // @vercel/blob/client throws a vague "Failed to retrieve the client token"
    // whenever /upload-token returns non-OK (401 auth, 429 rate-limit, 500
    // missing BLOB_READ_WRITE_TOKEN). Log a hint so Network tab inspection
    // points straight at the cause.
    console.error(
      `[uploadToBlob] Failed. Check Network tab -> POST ${API_URL}/upload-token status: ` +
      `401 = login expired, 429 = rate-limited, 500 = server misconfigured (likely missing BLOB_READ_WRITE_TOKEN).`,
      err,
    );
    throw err;
  }
};

export const analyzeContract = async (file: File, persona: Persona): Promise<AnalysisResult & { fileUrl: string }> => {
  const fileUrl = await uploadToBlob(file, 'contract');
  const response = await api.post(`/analyze`, {
    fileUrl,
    fileName: file.name,
    fileType: file.type,
    persona,
  });

  return response.data;
};

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  return uploadToBlob(file, 'photo');
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
