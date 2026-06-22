import React, { useState } from 'react';
import { FileText, Sparkles, Send, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function DocumentsPage() {
  const [docType, setDocType] = useState('sop');
  const [university, setUniversity] = useState('Stanford University');
  const [course, setCourse] = useState('M.S. Computer Science');
  const [tone, setTone] = useState('academic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [copied, setCopied] = useState(false);

  const mockSop = `STATEMENT OF PURPOSE\n\nTarget Institution: Stanford University\nProgram: M.S. in Computer Science\n\nMy passion for computer science was ignited during my undergraduate studies, where I discovered the profound capability of artificial intelligence to revolutionize global systems. Graduating with a 3.8 GPA, I consolidated a solid academic foundation in advanced algorithms, machine learning models, and complex distributed networks.\n\nStanford's Master of Science program offers the perfect academic convergence for my research ambitions. The pioneering research conducted at the Stanford Artificial Intelligence Laboratory (SAIL) aligns precisely with my career trajectory to engineer highly scalable, ethical AI agents that empower study-abroad counseling systems. I look forward to contributing my technical rigor and cross-cultural perspectives to the vibrant graduate cohort at Stanford.`;

  const mockLor = `LETTER OF RECOMMENDATION\n\nTo Whom It May Concern,\n\nIt is my privilege to recommend Alex Doe for admission to Stanford University's graduate Computer Science program. As a Professor of Computer Science with over 15 years of academic experience, I have supervised Alex during two advanced research seminars in Machine Learning, where they secured a top 1% standing.\n\nAlex possesses an exceptional capacity for algorithmic conceptualization and experimental design. Their research project, which investigated multi-agent recommendation systems, demonstrated a level of intellectual curiosity and technical proficiency typically reserved for doctoral candidates. I recommend them without reservation and with the utmost enthusiasm.`;

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedDoc('');
    
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedDoc(docType === 'sop' ? mockSop : mockLor);
      toast.success("Document generated successfully using AI!", {
        style: {
          borderRadius: "10px",
          background: "#1e293b",
          color: "#fff",
          border: "1px solid rgba(51, 65, 85, 0.5)"
        }
      });
    }, 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-400" /> SOP & LOR Generator
          </h1>
          <p className="text-slate-400">
            Generate custom, university-aligned Statements of Purpose and Letters of Recommendation with advanced AI modeling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Settings Panel */}
        <div className="xl:col-span-2 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" /> Generation Settings
          </h2>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-500 uppercase font-black mb-2">Document Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDocType('sop')}
                  className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                    docType === 'sop'
                      ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  SOP Draft
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('lor')}
                  className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                    docType === 'lor'
                      ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  LOR Draft
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase font-black mb-2">Target University</label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase font-black mb-2">Target Program / Course</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase font-black mb-2">AI Tone Style</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-300 focus:outline-none focus:border-primary-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="academic" className="bg-slate-900 text-white">Academic & Sophisticated</option>
                <option value="professional" className="bg-slate-900 text-white">Professional & Career-focused</option>
                <option value="storytelling" className="bg-slate-900 text-white">Narrative & Creative</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 mt-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Synthesizing Draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Document
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Output */}
        <div className="xl:col-span-3 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl flex flex-col h-[600px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">AI Document Output</h2>
            {generatedDoc && (
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 flex items-center gap-2 text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-850 p-6 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-line relative shadow-inner">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 z-10"
                >
                  <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-400 font-sans">Engineering custom {docType.toUpperCase()} draft using academic datasets...</p>
                </motion.div>
              ) : generatedDoc ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {generatedDoc}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600 font-sans">
                  <FileText className="w-12 h-12 mb-3 text-slate-700" />
                  <p className="text-sm font-bold">No Document Generated Yet</p>
                  <p className="text-xs text-slate-700 mt-1">Configure your generation settings on the left and click "Generate Document".</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
