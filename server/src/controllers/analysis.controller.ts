import { Request, Response } from 'express';
import { GeminiService, Persona } from '../services/gemini.service';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
const pdf = require('pdf-parse');

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    try {
      const file = req.file;
      const persona = (req.body.persona as Persona) || 'Chill Friend';

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Extract text from PDF
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
        return res.status(400).json({ error: 'Gagal membaca dokumen. Pastikan PDF Anda tidak dikunci dengan password (terenkripsi) atau rusak.' });
      }

      if (!text || text.trim().length < 50) {
        return res.status(400).json({ error: 'Teks dokumen terlalu sedikit atau tidak terbaca (misalnya PDF berisi gambar hasil scan). Harap unggah dokumen yang teksnya bisa disalin.' });
      }

      // Save file to local disk (bypasses Firebase Storage quota)
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(file.originalname);
      const safeName = `${crypto.randomUUID()}${ext}`;
      fs.writeFileSync(path.join(uploadsDir, safeName), file.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/${safeName}`;

      console.log(`Starting analysis for persona: ${persona}. Text length: ${text.length} chars.`);
      const analysis = await GeminiService.analyzeContract(text, persona);

      res.json({ ...analysis, fileUrl });
    } catch (error: any) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: error.message || 'Gagal menganalisis kontrak' });
    }
  }

  static async chat(req: Request, res: Response) {
    try {
      const { question, previousAnalysis, persona, fileUrl } = req.body;
      let contractText = req.body.contractText;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      if (!contractText && fileUrl) {
        console.log('Fetching contract text from URL for chat...');
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const data = await pdf(Buffer.from(response.data));
        contractText = data.text;
      }

      if (!contractText) {
        return res.status(400).json({ error: 'Contract context is missing' });
      }

      const response = await GeminiService.chatWithAI(
        contractText,
        JSON.stringify(previousAnalysis),
        question,
        persona as Persona
      );

      res.json({ response });
    } catch (error) {
      console.error('Chat Controller Error:', error);
      res.status(500).json({ error: 'Chat failed' });
    }
  }

  static async generateScript(req: Request, res: Response) {
    try {
      const { clause, explanation, persona, tone } = req.body;
      if (!clause || !explanation) {
        return res.status(400).json({ error: 'Clause and explanation are required' });
      }

      const script = await GeminiService.generateNegotiationScript(
        clause,
        explanation,
        (persona as Persona) || 'Chill Friend',
        tone
      );

      res.json({ script });
    } catch (error) {
      console.error('Generate Script Controller Error:', error);
      res.status(500).json({ error: 'Failed to generate script' });
    }
  }

  static async generateContract(req: Request, res: Response) {
    try {
      const { clientName, myName, projectValue, contractType, specialConditions } = req.body;
      
      if (!clientName || !myName || !projectValue || !contractType) {
        return res.status(400).json({ error: 'Missing required fields for contract generation' });
      }

      const draft = await GeminiService.generateContractDraft(req.body);
      res.json({ draft });
    } catch (error: any) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: error.message || 'Gagal membuat draf kontrak' });
    }
  }
}
