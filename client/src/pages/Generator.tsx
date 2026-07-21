import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Wand2, Loader2, Copy, Download, CheckCircle2, PenTool } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { generateContractDraft } from '../services/api';
import type { GenerateContractParams } from '../services/api';
import { Button } from '@/components/motion/button';
import { toast } from 'sonner';
import { Loader } from '@/components/motion/loader';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export const Generator = () => {
  useDocumentTitle('Contract Generator - ContractChill');
  const { user } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Load draft from localStorage on startup
  const [draft, setDraft] = useState<string | null>(() => {
    return localStorage.getItem('contract_generator_result_draft') || null;
  });
  
  // Load form state from localStorage on startup
  const [formData, setFormData] = useState<GenerateContractParams>(() => {
    const saved = localStorage.getItem('contract_generator_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          myName: parsed.myName || user?.displayName || ''
        };
      } catch (e) {
        // Fallback on error
      }
    }
    return {
      clientName: '',
      myName: user?.displayName || '',
      projectValue: '',
      contractType: 'Freelance Services Agreement',
      specialConditions: ''
    };
  });

  // Sync formData changes to localStorage
  useEffect(() => {
    localStorage.setItem('contract_generator_draft', JSON.stringify(formData));
  }, [formData]);

  // Sync draft changes to localStorage
  useEffect(() => {
    if (draft) {
      localStorage.setItem('contract_generator_result_draft', draft);
    } else {
      localStorage.removeItem('contract_generator_result_draft');
    }
  }, [draft]);

  // Handle user object being loaded asynchronously
  useEffect(() => {
    if (user?.displayName && !formData.myName) {
      setFormData(prev => ({ ...prev, myName: user.displayName || '' }));
    }
  }, [user]);

  const handleClear = () => {
    setFormData({
      clientName: '',
      myName: user?.displayName || '',
      projectValue: '',
      contractType: 'Freelance Services Agreement',
      specialConditions: ''
    });
    setDraft(null);
    localStorage.removeItem('contract_generator_draft');
    localStorage.removeItem('contract_generator_result_draft');
    toast.success('Form cleared');
  };

  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.myName || !formData.projectValue) {
      toast.error('Missing fields', { description: 'Please fill in all required fields.' });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedDraft = await generateContractDraft(formData);
      setDraft(generatedDraft);
      toast.success('Contract Generated!', { description: 'Your pro-freelancer draft is ready.' });
    } catch (error: any) {
      toast.error('Generation Failed', { description: error.message || 'Something went wrong.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setIsCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!resultRef.current || !draft) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Failed to open print window', { description: 'Please allow pop-ups for this site.' });
      return;
    }

    const content = resultRef.current.innerHTML;
    const title = `Contract_${formData.clientName.replace(/\s+/g, '_')}`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.6; 
              color: #000;
              max-width: 21cm;
              margin: 0 auto;
              font-size: 12pt;
            }
            h1 { font-size: 18pt; text-align: center; margin-bottom: 24pt; font-weight: bold; text-transform: uppercase; }
            h2 { font-size: 14pt; margin-top: 18pt; margin-bottom: 12pt; font-weight: bold; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; }
            p { margin-bottom: 12pt; text-align: justify; }
            ul, ol { margin-bottom: 12pt; padding-left: 24pt; }
            li { margin-bottom: 6pt; text-align: justify; }
            strong { font-weight: bold; }
            em { font-style: italic; }
            
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
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
  };

  const contractTypes = [
    'Freelance Services Agreement',
    'Non-Disclosure Agreement (NDA)',
    'Software Development Contract',
    'Retainer Agreement',
    'Creative Agency Contract'
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
         <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.05em] text-text flex items-center gap-3">
          <Wand2 className="w-6 h-6 text-primary" />
          Contract Generator
        </h1>
        <p className="text-text-muted text-sm">Automatically draft professional, legally sound contracts powered by AI.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -12 }} 
          animate={{ opacity: 1, x: 0 }}
             className="lg:col-span-5 p-5 rounded-2xl border flex flex-col gap-5 bg-surface border-border"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                 <h3 className="font-semibold text-sm">Draft settings</h3>
                <p className="text-xs text-text-subtle">Fill in the details to generate</p>
              </div>
            </div>
            {(formData.clientName || formData.projectValue || formData.specialConditions || draft) && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClear}
                title="Clear Draft"
              >
                clear
              </Button>
            )}
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contractType" className="text-xs font-bold text-text-muted">Contract Type</label>
              <select 
                id="contractType"
                title="Select contract type"
                value={formData.contractType}
                onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                className="p-2.5 rounded-xl border text-sm outline-none transition-colors bg-surface-2 border-border focus:border-primary"
              >
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="clientName" className="text-xs font-bold text-text-muted">Client Name (Party A)</label>
              <input 
                id="clientName"
                type="text" 
                required
                title="Client Name"
                placeholder="e.g. Acme Corp"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="p-2.5 rounded-xl border text-sm outline-none transition-colors bg-surface-2 border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="myName" className="text-xs font-bold text-text-muted">Your Name / Agency (Party B)</label>
              <input 
                id="myName"
                type="text" 
                required
                title="Your Name"
                placeholder="e.g. John Doe"
                value={formData.myName}
                onChange={(e) => setFormData({...formData, myName: e.target.value})}
                className="p-2.5 rounded-xl border text-sm outline-none transition-colors bg-surface-2 border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectValue" className="text-xs font-bold text-text-muted">Project Value / Compensation</label>
              <input 
                id="projectValue"
                type="text" 
                required
                title="Project Value"
                placeholder="e.g. $5,000 USD or Rp 50.000.000"
                value={formData.projectValue}
                onChange={(e) => setFormData({...formData, projectValue: e.target.value})}
                className="p-2.5 rounded-xl border text-sm outline-none transition-colors bg-surface-2 border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="specialConditions" className="text-xs font-bold text-text-muted">Special Conditions (Optional)</label>
              <textarea 
                id="specialConditions"
                rows={3}
                title="Special Conditions"
                placeholder="e.g. 50% upfront payment, max 2 revisions..."
                value={formData.specialConditions}
                onChange={(e) => setFormData({...formData, specialConditions: e.target.value})}
                className="p-2.5 rounded-xl border text-sm outline-none transition-colors resize-none bg-surface-2 border-border focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isGenerating}
              className="mt-2 w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Contract
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Right: Result Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 12 }} 
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 flex flex-col rounded-3xl border overflow-hidden min-h-[600px] bg-surface border-border"
        >
          {/* Toolbar */}
          <div className="p-4 border-b flex items-center justify-between border-border bg-surface">
            <h3 className="font-bold text-sm text-text">Preview</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!draft}
                title="Copy to clipboard"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={!draft}
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <Loader variant="comet" size={64} />
                  <span className="text-[12px] font-bold text-text-muted animate-pulse">AI Drafting Iron-Clad Clauses...</span>
                </motion.div>
              ) : draft ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-surface text-text p-8 rounded-lg shadow-sm border border-border min-h-full"
                >
                  <div ref={resultRef} className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>{draft}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-text-subtle bg-grid-pattern"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 border bg-surface-2 border-border">
                      <Wand2 className="w-7 h-7 text-primary animate-bounce-slow" />
                    </div>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-sm font-semibold text-text mb-1">Drafting Arena Ready</p>
                    <p className="text-[12px] text-text-subtle max-w-[260px] mx-auto leading-relaxed">Fill out the generator details on the left, then click 'Generate Contract' to create your draft.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
