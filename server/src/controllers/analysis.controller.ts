import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import type { Persona } from '@chill/shared';
import { AppError } from '../utils/app-error';
import { extractTextFromBuffer, MIN_TEXT_LENGTH } from '../utils/extract-text';
import axios from 'axios';

function inferTypeFromName(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  if (/\.pdf$/i.test(fileName)) return 'application/pdf';
  return undefined;
}

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    const { fileUrl, persona, fileName, fileType } = req.body as {
      fileUrl?: string;
      persona?: Persona;
      fileName?: string;
      fileType?: string;
    };
    const selectedPersona = persona || 'Chill Friend';

    if (!fileUrl) {
      throw new AppError(400, 'File URL is required');
    }

    let text = '';
    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      text = await extractTextFromBuffer(buffer, fileType || inferTypeFromName(fileName));
    } catch (err) {
      console.error('Document parse error:', err);
      throw new AppError(400, 'Gagal membaca dokumen. Pastikan PDF Anda tidak dikunci dengan password (terenkripsi) atau rusak.');
    }

    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      throw new AppError(400, 'Teks dokumen terlalu sedikit atau tidak terbaca (misalnya PDF berisi gambar hasil scan). Harap unggah dokumen yang teksnya bisa disalin.');
    }

    const analysis = await GeminiService.analyzeContract(text, selectedPersona);

    res.json({ ...analysis, fileUrl });
  }

  static async chat(req: Request, res: Response) {
    const { question, previousAnalysis, persona, fileUrl } = req.body;
    let contractText = req.body.contractText;

    if (!question) {
      throw new AppError(400, 'Question is required');
    }

    if (!contractText && fileUrl) {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const isPdf = /\.pdf(?:$|\?)/i.test(String(fileUrl));
      contractText = await extractTextFromBuffer(buffer, isPdf ? 'application/pdf' : 'text/plain');
    }

    if (!contractText) {
      throw new AppError(400, 'Contract context is missing');
    }

    const response = await GeminiService.chatWithAI(
      contractText,
      JSON.stringify(previousAnalysis),
      question,
      persona as Persona
    );

    res.json({ response });
  }

  static async generateScript(req: Request, res: Response) {
    const { clause, explanation, persona, tone } = req.body;

    if (!clause || !explanation) {
      throw new AppError(400, 'Clause and explanation are required');
    }

    const script = await GeminiService.generateNegotiationScript(
      clause,
      explanation,
      (persona as Persona) || 'Chill Friend',
      tone
    );

    res.json({ script });
  }

  static async generateContract(req: Request, res: Response) {
    const { clientName, myName, projectValue, contractType, specialConditions } = req.body;

    if (!clientName || !myName || !projectValue || !contractType) {
      throw new AppError(400, 'Missing required fields for contract generation');
    }

    const draft = await GeminiService.generateContractDraft(req.body);
    res.json({ draft });
  }
}
