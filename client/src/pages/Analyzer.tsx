import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageSquare,
  ArrowLeft,
  UserCircle,
  Loader2,
  FileText,
  ChevronRight,
  BookOpen,
  Compass,
  Eye
} from 'lucide-react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { KeyClauses } from '../components/KeyClauses';
import { AnalysisChat } from '../components/AnalysisChat';
import { Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState, useEffect, useRef } from 'react';
import { NegotiationScriptModal } from '../components/NegotiationScriptModal';
import type { AnalysisResult, Persona, RedFlag } from '../types/analysis';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useTheme } from '../context/ThemeContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const Analyzer = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { result: AnalysisResult; persona: Persona; fileUrl?: string } | null;

  const [data, setData] = useState<{ result: AnalysisResult; persona: Persona; fileUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<RedFlag | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  
  const isDark = theme === 'dark';

  useDocumentTitle(isLoading ? 'Analyzing Contract...' : 'Analysis Result - ContractChill');

  const handleCopySummary = async () => {
    if (!data?.result?.summary) return;
    try {
      const textToCopy = `ContractChill Analysis Summary:\n\n${data.result.summary}\n\nKey Red Flags:\n${data.result.redFlags?.map(rf => `- [${rf.risk}] ${rf.clause}: ${rf.explanation}`).join('\n') || 'None detected.'}`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleExportPDF = () => {
    if (!data?.result) return;
    
    setIsExporting(true);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Gagal membuka pop-up cetak (mungkin diblokir browser)');
      setIsExporting(false);
      return;
    }

    const { result, persona } = data;
    const title = `ContractChill_Analysis_${id || 'Report'}`;
    
    // Formatting Jargons
    const jargonsHtml = result.jargons && result.jargons.length > 0 
      ? `
        <div class="section">
          <h2>Jargon Translator</h2>
          <div class="grid">
            ${result.jargons.map(j => `
              <div class="jargon-card">
                <div class="jargon-term">"${j.term}"</div>
                <p>${j.definition}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

    // Formatting Red Flags
    const redFlagsHtml = result.redFlags && result.redFlags.length > 0 
      ? `
        <div class="section">
          <h2>Critical Risks & Red Flags</h2>
          <div class="grid">
            ${result.redFlags.map((flag, idx) => `
              <div class="flag-card ${flag.risk.toLowerCase()}">
                <div class="flag-header">
                  <span class="flag-badge ${flag.risk.toLowerCase()}">${flag.risk} Risk</span>
                  <span class="flag-number">#${idx + 1}</span>
                </div>
                <div class="clause-quote">"${flag.clause}"</div>
                <p><strong>Verdict / Explanation:</strong> ${flag.explanation}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

    // Formatting Negotiation Suggestions
    const suggestionsHtml = result.negotiationSuggestions && result.negotiationSuggestions.length > 0 
      ? `
        <div class="section">
          <h2>Strategic Negotiation Suggestions</h2>
          <ul>
            ${result.negotiationSuggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : '';

    // Formatting Key Clauses
    const clausesHtml = result.clauses && result.clauses.length > 0 
      ? `
        <div class="section">
          <h2>Key Clauses Checked</h2>
          <div class="grid">
            ${result.clauses.map(c => `
              <div class="clause-card">
                <h3>${c.title}</h3>
                <p>${c.explanation}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page { 
              margin: 2cm 1.8cm; 
            }
            body { 
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1E293B;
              max-width: 21cm;
              margin: 0 auto;
              font-size: 10pt;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .top-bar {
              height: 4px;
              background: linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%);
              margin-bottom: 25px;
            }
            .header {
              border-bottom: 1.5px solid #F1F5F9;
              padding-bottom: 18px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-hexagon {
              width: 22px;
              height: 22px;
              background: #4F46E5;
              clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            }
            .logo-text {
              font-size: 15pt;
              font-weight: 800;
              color: #1E1B4B;
              letter-spacing: -0.5px;
            }
            .report-title {
              font-size: 8.5pt;
              font-weight: 700;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              background-color: #F8FAFC;
              padding: 18px;
              border-radius: 14px;
              border: 1px solid #F1F5F9;
              margin-bottom: 28px;
            }
            .meta-item {
              display: flex;
              flex-col: column;
              flex-direction: column;
              gap: 4px;
            }
            .meta-label {
              font-size: 7.5pt;
              font-weight: 700;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-value {
              font-size: 10pt;
              font-weight: 600;
              color: #0F172A;
            }
            .score-badge {
              display: inline-flex;
              align-items: center;
              font-size: 9pt;
              font-weight: 800;
              padding: 3px 10px;
              border-radius: 9999px;
              width: fit-content;
            }
            .score-badge.high {
              background-color: #FEF2F2;
              color: #DC2626;
              border: 1px solid #FCA5A5;
            }
            .score-badge.medium {
              background-color: #FFFBEB;
              color: #D97706;
              border: 1px solid #FDE68A;
            }
            .score-badge.safe {
              background-color: #ECFDF5;
              color: #059669;
              border: 1px solid #A7F3D0;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            h2 { 
              font-size: 12pt; 
              color: #0F172A; 
              border-left: 4px solid #4F46E5;
              padding-left: 10px;
              margin-bottom: 14px;
              font-weight: 800; 
              letter-spacing: -0.3px;
            }
            h3 { 
              font-size: 10pt; 
              font-weight: 700; 
              margin-top: 0; 
              margin-bottom: 6px; 
              color: #0F172A; 
            }
            p { 
              margin-top: 0;
              margin-bottom: 10px; 
              text-align: justify; 
              color: #334155;
            }
            ul { 
              margin-top: 0;
              margin-bottom: 10px; 
              padding-left: 20px; 
              color: #334155;
            }
            li { 
              margin-bottom: 6px; 
              text-align: justify; 
            }
            
            .verdict-callout {
              background: #EEF2FF;
              border-left: 4px solid #4F46E5;
              border-radius: 4px 12px 12px 4px;
              padding: 16px 20px;
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .verdict-callout p {
              color: #3730A3;
              font-weight: 500;
              font-style: italic;
              margin: 0;
              font-size: 10.5pt;
            }
            
            .jargon-card, .clause-card {
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 12px;
              padding: 14px 18px;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .jargon-term {
              font-family: monospace;
              font-weight: 700;
              color: #4F46E5;
              margin-bottom: 4px;
              font-size: 9.5pt;
            }
            
            .flag-card {
              border-radius: 12px;
              padding: 16px 20px;
              margin-bottom: 14px;
              page-break-inside: avoid;
              border-left: 4px solid;
              border-top: 1px solid #F1F5F9;
              border-right: 1px solid #F1F5F9;
              border-bottom: 1px solid #F1F5F9;
            }
            .flag-card.high {
              background-color: #FFF5F5;
              border-left-color: #EF4444;
            }
            .flag-card.medium {
              background-color: #FFFDF5;
              border-left-color: #F59E0B;
            }
            .flag-card.safe {
              background-color: #F0FFF4;
              border-left-color: #10B981;
            }
            .flag-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .flag-badge {
              font-size: 7.5pt;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 6px;
              letter-spacing: 0.5px;
            }
            .flag-badge.high { background: #FEE2E2; color: #991B1B; }
            .flag-badge.medium { background: #FEF3C7; color: #92400E; }
            .flag-badge.safe { background: #D1FAE5; color: #065F46; }
            .flag-number { font-weight: 800; color: #94A3B8; font-size: 9.5pt; }
            .clause-quote {
              font-family: monospace;
              background: rgba(15, 23, 42, 0.04);
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 10px;
              font-style: italic;
              font-size: 8.5pt;
              color: #475569;
            }

            @media print {
              body { padding: 0; }
              .top-bar { background: linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%) !important; }
              .metadata-grid { background-color: #F8FAFC !important; }
              .verdict-callout { background: #EEF2FF !important; }
              .flag-card.high { background-color: #FFF5F5 !important; }
              .flag-card.medium { background-color: #FFFDF5 !important; }
              .flag-card.safe { background-color: #F0FFF4 !important; }
              .flag-badge.high { background: #FEE2E2 !important; }
              .flag-badge.medium { background: #FEF3C7 !important; }
              .flag-badge.safe { background: #D1FAE5 !important; }
            }
          </style>
        </head>
        <body>
          <div class="top-bar"></div>
          <div class="header">
            <div class="logo-area">
              <div class="logo-hexagon"></div>
              <span class="logo-text">ContractChill</span>
            </div>
            <div class="report-title">AI Legal Analysis Report</div>
          </div>

          <div class="metadata-grid">
            <div class="meta-item">
              <span class="meta-label">Date analyzed</span>
              <span class="meta-value">${new Date().toLocaleDateString('id-ID')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">AI Analyst Persona</span>
              <span class="meta-value">${persona}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Overall Risk Score</span>
              <div>
                <span class="score-badge ${riskScore >= 70 ? 'high' : riskScore >= 30 ? 'medium' : 'safe'}">
                  ${riskScore}% ${riskScore >= 70 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low'} Risk
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>The Verdict</h2>
            <div class="verdict-callout">
              <p>"${result.personaExplanation}"</p>
            </div>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <p>${result.summary}</p>
          </div>

          ${redFlagsHtml}
          ${suggestionsHtml}
          ${clausesHtml}
          ${jargonsHtml}

          <script>
            setTimeout(() => {
              document.title = "${title}";
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setIsExporting(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (state && state.fileUrl) {
          setData(state);
          setIsLoading(false);
          return;
        }
        if (!id) throw new Error('No ID provided');
        const docSnap = await getDoc(doc(db, 'analyses', id));
        if (!docSnap.exists()) throw new Error('Not found');
        const d = docSnap.data();
        setData({ 
          result: d.result as AnalysisResult, 
          persona: d.persona as Persona, 
          fileUrl: d.fileUrl as string 
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, state]);

  useEffect(() => {
    if (data?.persona) {
      setActivePersona(data.persona);
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading && (error || !data)) {
      navigate('/dashboard', { replace: true });
    }
  }, [error, data, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-8 bg-transparent lg:overflow-hidden pb-4">
        {/* Skeleton Left Panel */}
        <div className={`w-full lg:flex-[1.5] h-[60vh] min-h-[400px] lg:h-full rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 overflow-hidden ${isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-2 animate-pulse flex items-center justify-center">
                <FileText className="w-4 h-4 text-text-subtle/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="w-32 h-3.5 rounded bg-surface-2 animate-pulse" />
                <div className="w-24 h-2 rounded bg-surface-2 animate-pulse opacity-50" />
              </div>
            </div>
            <div className="w-28 h-8 rounded-xl bg-surface-2 animate-pulse" />
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden mt-2 select-none">
            {/* Title Line */}
            <div className="w-2/5 h-4 bg-surface-2 rounded-md animate-pulse" />
            
            {/* Paragraph 1 */}
            <div className="flex flex-col gap-3">
              <div className="w-full h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[95%] h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[92%] h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[85%] h-3 bg-surface-2 rounded-md animate-pulse" />
            </div>

            {/* Paragraph 2 */}
            <div className="flex flex-col gap-3">
              <div className="w-full h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[98%] h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[90%] h-3 bg-surface-2 rounded-md animate-pulse" />
              <div className="w-[60%] h-3 bg-surface-2 rounded-md animate-pulse" />
            </div>

            {/* Signature block */}
            <div className="flex justify-between mt-auto border-t border-dashed pt-6">
              <div className="flex flex-col gap-2.5">
                <div className="w-32 h-3 bg-surface-2 rounded-md animate-pulse" />
                <div className="w-20 h-2 bg-surface-2 rounded-md animate-pulse" />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="w-32 h-3 bg-surface-2 rounded-md animate-pulse" />
                <div className="w-20 h-2 bg-surface-2 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Right Panel */}
        <div className="w-full lg:w-[480px] shrink-0 flex flex-col gap-5 lg:overflow-y-auto pb-10 lg:pr-2 select-none">
          {/* Scanning status banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between animate-pulse ${
            isDark ? 'bg-primary/5 border-primary/10' : 'bg-primary/3 border-primary/10'
          }`}>
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-[12px] font-bold text-primary">Running AI Threat Scan...</span>
            </div>
            <div className="w-12 h-4 rounded-full bg-primary/20" />
          </div>
          
          {/* Risk Gauge Skeleton */}
          <div className={`p-6 rounded-3xl border flex flex-col items-center gap-4 ${isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary/20 animate-spin-slow flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 animate-pulse" />
            </div>
            <div className="w-36 h-3 bg-surface-2 rounded-md animate-pulse" />
            <div className="w-24 h-2.5 bg-surface-2 rounded-md animate-pulse opacity-50" />
          </div>

          {/* Key Red Flags Skeleton */}
          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-28 h-3.5 bg-surface-2 rounded-md animate-pulse" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500/20 animate-pulse shrink-0" />
                <div className="flex-1 h-3 bg-surface-2 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-500/20 animate-pulse shrink-0" />
                <div className="flex-1 h-3 bg-surface-2 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const { result, fileUrl } = data;

  const calculateRiskScore = (redFlags: any[]) => {
    if (!redFlags || redFlags.length === 0) return 0;
    const highRiskCount = redFlags.filter(f => f.risk === 'High').length;
    const mediumRiskCount = redFlags.filter(f => f.risk === 'Medium').length;
    
    let score = (highRiskCount * 35) + (mediumRiskCount * 15);
    return Math.min(score, 100);
  };

  const riskScore = calculateRiskScore(result?.redFlags || []);

  const scrollToAndHighlightClause = (clause: string) => {
    if (!clause) return;

    // Get the left preview panel container to strictly restrict the search area
    const leftPanel = document.getElementById('document-preview-left-panel');
    if (!leftPanel) return;

    // Find text elements inside the left panel container
    // We prioritize PDF text spans (.rpv-core__text-span) for high-fidelity matching inside PDFs
    let textElements = leftPanel.querySelectorAll('.rpv-core__text-span');
    
    // Fallback for non-PDF files (e.g., standard text/markdown previews)
    if (textElements.length === 0) {
      // Find deepest text nodes only (elements with no child elements)
      const allElements = leftPanel.querySelectorAll('p, pre, span, div');
      const leaves: Element[] = [];
      allElements.forEach(el => {
        if (el.children.length === 0 && el.textContent?.trim()) {
          leaves.push(el);
        }
      });
      textElements = leaves as any;
    }

    // Normalize clause for searching (strip whitespace and punctuation)
    const cleanClause = clause.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    // Split the clause into words, clean them, and filter out short words
    const words = clause.split(/\s+/)
                        .map(w => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
                        .filter(w => w.length >= 4);

    // We try multiple matching strategies from strongest to loosest:
    // 1. Long chunk of 30 characters (very specific)
    // 2. First two words joined (e.g. "seluruhbiaya") - robust against end-of-line breaks
    // 3. The single longest and most unique word in the clause (e.g. "tanggung") - robust against heavy fragmentation
    // 4. First 15 characters
    const searchStrategies: string[] = [];
    
    if (cleanClause.length > 5) {
      searchStrategies.push(cleanClause.substring(0, 30));
    }
    
    if (words.length >= 2) {
      searchStrategies.push(words[0] + words[1]);
    }
    
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    if (sortedWords.length > 0) {
      searchStrategies.push(sortedWords[0]);
    }
    
    if (cleanClause.length > 15) {
      searchStrategies.push(cleanClause.substring(0, 15));
    }

    let targetElement: HTMLElement | null = null;

    // Run matching strategies
    for (const searchStr of searchStrategies) {
      if (targetElement) break;
      if (!searchStr) continue;
      
      for (let i = 0; i < textElements.length; i++) {
        const el = textElements[i] as HTMLElement;
        const cleanElText = el.textContent?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') || '';
        
        if (cleanElText.includes(searchStr)) {
          targetElement = el;
          break;
        }
      }
    }

    if (targetElement) {
      // Find the scrollable parent container of the target text element
      const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
        if (!node) return null;
        
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
        const isPdfScrollContainer = node.classList.contains('rpv-core__inner-container') || 
                                     node.classList.contains('rpv-core__inner-pages') ||
                                     node.style.overflow === 'auto';

        if ((isScrollable && node.scrollHeight > node.clientHeight) || isPdfScrollContainer) {
          return node;
        }
        return getScrollParent(node.parentElement);
      };

      const scrollParent = getScrollParent(targetElement);

      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        
        // Calculate the center scroll position:
        // Current scroll + relative element position from top of parent - half of parent height (to center it)
        const targetScrollTop = scrollParent.scrollTop + (elementRect.top - parentRect.top) - (parentRect.height / 2) + (elementRect.height / 2);
        
        scrollParent.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      } else {
        // Fallback to standard scrollIntoView if no scroll parent is identified
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Backup original styles
      const originalBg = targetElement.style.backgroundColor;
      const originalTransition = targetElement.style.transition;
      const originalBoxShadow = targetElement.style.boxShadow;
      const originalBorderRadius = targetElement.style.borderRadius;
      const originalPadding = targetElement.style.padding;

      // Apply dynamic neon glowing animation styles
      targetElement.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      targetElement.style.backgroundColor = 'rgba(239, 68, 68, 0.35)'; // Muted red glow
      targetElement.style.boxShadow = '0 0 18px rgba(239, 68, 68, 0.7), inset 0 0 6px rgba(239, 68, 68, 0.3)';
      targetElement.style.borderRadius = '6px';
      targetElement.style.padding = '3px 6px';

      // Slight delay pulse effect
      setTimeout(() => {
        if (targetElement) {
          targetElement.style.backgroundColor = 'rgba(239, 68, 68, 0.55)';
        }
      }, 200);

      // Restore style after 3.5 seconds
      setTimeout(() => {
        if (targetElement) {
          targetElement.style.backgroundColor = originalBg;
          targetElement.style.boxShadow = originalBoxShadow;
          targetElement.style.transition = originalTransition;
          targetElement.style.borderRadius = originalBorderRadius;
          targetElement.style.padding = originalPadding;
        }
      }, 3500);

      toast.success('Clausa ditemukan & disorot di dokumen! 🗺️');
    } else {
      toast.info('Clausa terdeteksi, silakan cari di panel pratinjau dokumen.', {
        description: `"${clause.length > 50 ? clause.substring(0, 50) + '...' : clause}"`
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 bg-transparent lg:overflow-hidden pb-4">
      {/* Left Panel: PDF Viewer */}
      <div id="document-preview-left-panel" className={`w-full lg:flex-[1.5] h-[60vh] min-h-[400px] lg:h-full rounded-2xl border overflow-hidden flex flex-col shadow-sm transition-colors duration-300 ${
        isDark ? 'bg-surface border-white/10' : 'bg-surface border-border'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
          isDark ? 'bg-surface border-white/10' : 'bg-surface border-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-display font-semibold text-text">Document preview</h2>
              <p className="text-[10px] text-text-subtle font-medium">Full contract visualization</p>
            </div>
          </div>
          {fileUrl && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
               className={`group flex items-center gap-2 px-4 py-2 rounded-xl border transition-[background-color,border-color,transform] duration-150 ${
                 isDark ? 'bg-surface border-white/10 hover:bg-white/5' : 'bg-surface-2 border-border hover:bg-surface'
              }`}>
              <span className="text-xs font-semibold text-text-muted group-hover:text-primary">Open Original</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </div>
        <div className="flex-1 overflow-hidden relative bg-transparent">
          {fileUrl ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <div className="h-full">
                <Viewer fileUrl={fileUrl} />
              </div>
            </Worker>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-text-subtle p-12">
              <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center border border-border border-dashed">
                <FileText className="w-8 h-8 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-base font-display font-bold text-text">Document not found</p>
                <p className="text-sm opacity-60 mt-1">Please try re-uploading the file</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Analysis */}
      <div 
        ref={analysisRef}
        className="w-full lg:w-[480px] shrink-0 flex flex-col gap-6 lg:overflow-y-auto pb-10 lg:pr-2 custom-scrollbar bg-transparent"
      >
        {/* Navigation & Status */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 py-3 sm:py-4 z-30 border-b mb-2 px-2 transition-colors backdrop-blur-md ${
          isDark ? 'bg-surface/80 border-white/10' : 'bg-background/80 border-border shadow-sm'
        }`} data-html2canvas-ignore="true">
          {/* Top row on mobile, left on desktop */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link to="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              back
            </Link>
            {/* Ready badge shown on mobile here */}
            <div className="flex sm:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-600 lowercase">ready</span>
            </div>
          </div>

          {/* Bottom row on mobile, right on desktop */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border shadow-sm transition-all group active:scale-95 ${
                isDark ? 'bg-background/50 border-white/10 hover:border-primary/50 backdrop-blur-sm' : 'bg-white/50 border-slate-200 hover:border-primary/50 backdrop-blur-sm'
              }`}
              title="copy summary"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-text-subtle group-hover:text-primary transition-colors" />}
              <span className={`text-xs font-bold transition-colors lowercase ${isCopied ? 'text-green-500' : 'text-text-muted group-hover:text-primary'}`}>
                {isCopied ? 'copied!' : 'copy'}
              </span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border shadow-sm transition-all group active:scale-95 ${
                isDark ? 'bg-background/50 border-white/10 hover:border-primary/50 backdrop-blur-sm' : 'bg-white/50 border-slate-200 hover:border-primary/50 backdrop-blur-sm'
              }`}
              title="export to pdf"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Download className="w-4 h-4 text-text-subtle group-hover:text-primary transition-colors" />}
              <span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors lowercase">export pdf</span>
            </button>
            {/* Ready badge shown on desktop here */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-600 lowercase">ready</span>
            </div>
          </div>
        </div>

        {/* PDF Header (Hidden in Web, Visible in PDF) */}
        <div className="hidden pdf-only flex-col gap-2 mb-8 border-b-2 border-primary/10 pb-6 bg-white">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-2xl font-display font-bold text-text">Contract Analysis</h1>
              <p className="text-xs text-text-subtle">Generated by ContractChill AI • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Risk Score Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`card p-6 ${isDark ? 'bg-surface border-white/10' : 'bg-surface border-border shadow-sm'}`}
        >
          <RiskScoreMeter score={riskScore} />
        </motion.div>

        {/* Key Clauses Summary */}
        <div className={`card p-6 ${isDark ? 'bg-surface border-white/10' : 'bg-surface border-border shadow-sm'}`}>
          <KeyClauses clauses={result?.clauses || []} />
        </div>

        {/* Persona Verdict Chat Bubble */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-start gap-3.5 w-full mb-2"
        >
          {/* Avatar */}
          <div className="relative shrink-0 mt-1 cursor-default group">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm border transition-transform duration-300 group-hover:scale-105 ${
              isDark ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-primary/20' : 'bg-gradient-to-b from-primary/10 to-primary/5 border-primary/10'
            }`}>
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            {/* Online Indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 shadow-sm ${
              isDark ? 'ring-background' : 'ring-white'
            }`} />
          </div>

          {/* Message Content */}
          <div className="flex flex-col gap-1.5 flex-1 max-w-[85%]">
            {/* Sender Info */}
            <div className="flex items-center gap-2.5 px-1">
              <span className="text-[13px] font-display font-bold text-text">{activePersona || 'AI Analyst'}</span>
              <span className="text-[9px] font-bold text-primary tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">The Verdict</span>
            </div>
            
            {/* Chat Bubble */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={`relative px-5 py-4 shadow-sm transition-all group ${
                isDark 
                  ? 'bg-surface/90 border border-white/5 backdrop-blur-md' 
                  : 'bg-white border border-slate-200'
              }`}
              style={{
                borderRadius: '20px',
                borderTopLeftRadius: '4px'
              }}
            >
              <p className="text-[13.5px] text-text-muted leading-relaxed font-medium">
                {result?.personaExplanation || "I've analyzed the document. Here are my findings."}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`card p-7 ${isDark ? 'bg-surface border-white/10' : 'bg-surface border-border shadow-sm'}`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-display font-semibold text-text">Executive summary</h3>
          </div>
          <p className="text-[14px] text-text-muted leading-relaxed font-medium">
            {result?.summary}
          </p>
        </motion.div>

        {/* Jargon Glossary */}
        {result?.jargons && result.jargons.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`card p-7 backdrop-blur-md ${isDark ? 'bg-surface/40 border-primary/10 shadow-primary/5' : 'bg-primary/5 border-primary/10 shadow-sm'}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-text">Jargon Translator</h3>
                <p className="text-[10px] text-text-subtle font-medium">Complex legal terms, simplified.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {result.jargons.map((jargon, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${isDark ? 'bg-surface border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h4 className="text-[13px] font-bold text-primary mb-1 font-mono">"{jargon.term}"</h4>
                  <p className="text-[12px] text-text-muted leading-relaxed font-medium">
                    {jargon.definition}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Red Flags Section */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-display font-bold text-text flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Critical Risks
            </h3>
            <span className="text-[11px] font-bold bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">
              {result?.redFlags?.length || 0} issues detected
            </span>
          </div>

          <div className="grid gap-4">
            {result?.redFlags?.map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                 className={`p-6 rounded-2xl border flex flex-col gap-4 transition-[background-color,border-color,box-shadow,transform] duration-150 group ${
                  flag.risk === 'High' 
                    ? isDark ? 'bg-red-500/10 border-red-500/20 shadow-sm shadow-red-500/5' : 'bg-red-50/80 border-red-100 shadow-sm'
                    : isDark ? 'bg-amber-500/10 border-amber-500/20 shadow-sm shadow-amber-500/5' : 'bg-amber-50/80 border-amber-100 shadow-sm'
                } hover:translate-y-[-2px]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${flag.risk === 'High' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={`text-[10px] font-bold tracking-wider ${
                      flag.risk === 'High' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {flag.risk} risk
                    </span>
                  </div>
                  <button
                    onClick={() => scrollToAndHighlightClause(flag.clause)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isDark 
                        ? 'bg-black/20 border-white/5 text-primary hover:bg-primary/10 hover:border-primary/20' 
                        : 'bg-white border-slate-200 text-primary hover:bg-primary/5 hover:border-primary/20'
                    }`}
                    title="Temukan klausul ini di dokumen"
                  >
                    <Compass className="w-3 h-3 text-primary animate-spin-slow" />
                    Locate Clause
                  </button>
                </div>
                
                <div className={`p-4 rounded-2xl border text-[12px] font-mono leading-relaxed italic shadow-inner ${
                  isDark ? 'bg-black/20 border-white/5 text-text-muted' : 'bg-white/40 border-slate-200 text-slate-600'
                }`}>
                  "{flag.clause}"
                </div>
                
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5 opacity-60" />
                  <p className="text-[13px] text-text font-medium leading-relaxed">
                    {flag.explanation}
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setSelectedFlag(flag);
                      setIsScriptModalOpen(true);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 ${
                      isDark 
                        ? 'text-text-muted hover:text-primary hover:bg-primary/10' 
                        : 'text-slate-500 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    generate negotiation script
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>



        {/* Negotiation Suggestions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card p-7 shadow-lg backdrop-blur-md ${
            isDark ? 'bg-surface/40 border-green-500/10 shadow-green-500/5' : 'bg-white/80 border-green-500/20 shadow-green-500/5'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-base font-display font-bold text-text">Negotiation Strategy</h3>
          </div>
          <div className="space-y-4">
            {result?.negotiationSuggestions?.map((tip, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-green-500/20">
                  <span className="text-[10px] font-bold text-green-500">{i + 1}</span>
                </div>
                <p className="text-[13px] text-text-muted font-medium leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnalysisChat 
        fileUrl={fileUrl} 
        previousAnalysis={result} 
        persona={activePersona || 'Chill Friend'} 
      />

      {/* Negotiation Script Modal */}
      <NegotiationScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        script={selectedFlag?.suggestedScript || ''}
        clause={selectedFlag?.clause || ''}
        explanation={selectedFlag?.explanation || ''}
        persona={activePersona || 'Chill Friend'}
      />
    </div>
  );
};
