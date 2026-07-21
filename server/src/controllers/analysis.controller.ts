import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import type { Persona } from '../types/analysis';
import { AppError } from '../utils/app-error';
import { saveFile } from '../utils/file-helpers';
import axios from 'axios';
import path from 'path';
const pdf = require('pdf-parse');

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    const file = req.file;
    const persona = (req.body.persona as Persona) || 'Chill Friend';

    if (!file) {
      throw new AppError(400, 'No file uploaded');
    }

    let text = '';
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdf(file.buffer);
        text = data.text;
      } else {
        text = file.buffer.toString('utf-8');
      }
    } catch (err) {
      console.error('PDF Parse Error:', err);
      throw new AppError(400, 'Gagal membaca dokumen. Pastikan PDF Anda tidak dikunci dengan password (terenkripsi) atau rusak.');
    }

    if (!text || text.trim().length < 50) {
      throw new AppError(400, 'Teks dokumen terlalu sedikit atau tidak terbaca (misalnya PDF berisi gambar hasil scan). Harap unggah dokumen yang teksnya bisa disalin.');
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    const { fileName } = saveFile(file.buffer, file.originalname, uploadsDir);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    console.log(`Starting analysis for persona: ${persona}. Text length: ${text.length} chars.`);
    const analysis = await GeminiService.analyzeContract(text, persona);

    res.json({ ...analysis, fileUrl });
  }

  static async chat(req: Request, res: Response) {
    const { question, previousAnalysis, persona, fileUrl } = req.body;
    let contractText = req.body.contractText;

    if (!question) {
      throw new AppError(400, 'Question is required');
    }

    if (!contractText && fileUrl) {
      console.log('Fetching contract text from URL for chat...');
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = await pdf(Buffer.from(response.data));
      contractText = data.text;
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
