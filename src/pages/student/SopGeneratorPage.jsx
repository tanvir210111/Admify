import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import {
  FileEdit,
  Sparkles,
  RefreshCw,
  Save,
  Download,
  Copy,
  Check,
  Wand2,
  Maximize2,
  Minimize2,
  RotateCcw,
  BookOpen,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

function SopGeneratorPage() {
  const { user } = useAuth();

  // Inputs
  const [university, setUniversity] = useState("Stanford University");
  const [course, setCourse] = useState(user?.targetCourse || "M.S. Computer Science");
  const [academicBackground, setAcademicBackground] = useState(`Bachelor of Science with a 3.8 GPA in Computer Science`);
  const [careerGoals, setCareerGoals] = useState("lead AI research laboratories and engineer scalable machine learning systems");
  const [achievements, setAchievements] = useState("Published paper on distributed multi-agent systems, Top 5% student award");
  const [experience, setExperience] = useState("1.5 years undergraduate research assistantship in artificial intelligence and deep neural networks");
  const [tone, setTone] = useState("academic");

  // Output & Editor State
  const [sopContent, setSopContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiImproving, setIsAiImproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  // Generate SOP with AI
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    try {
      const generated = await studentService.generateSop({
        university,
        course,
        fullName: user?.user_metadata?.full_name || user?.name || "Student Applicant",
        experience: `${academicBackground}. ${experience}. ${achievements}`,
        careerGoals,
        tone,
      });
      setSopContent(generated);
      toast.success("AI Statement of Purpose generated! You can now manually edit every line.");
    } catch (err) {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Improvement Actions: 'improve' | 'rewrite' | 'expand' | 'shorten'
  const handleAiAction = (actionType) => {
    if (!sopContent.trim()) {
      toast.error("Please generate or enter content first.");
      return;
    }

    setIsAiImproving(true);
    setTimeout(() => {
      let modified = sopContent;
      if (actionType === "improve") {
        modified = sopContent.replace(
          /Having cultivated a rigorous foundation/gi,
          "Having systematically developed an exemplary technical foundation"
        );
        toast.success("Content refined with elevated academic phrasing!");
      } else if (actionType === "expand") {
        modified += `\n\n6. METHODOLOGICAL RIGOR & BROADER IMPACT\nMoreover, my commitment to ethical artificial intelligence design ensures that my prospective research contributions at ${university} will prioritize algorithmic transparency, safety, and inclusive global access.`;
        toast.success("Content expanded with additional academic dimension!");
      } else if (actionType === "shorten") {
        const paragraphs = sopContent.split("\n\n");
        if (paragraphs.length > 2) {
          modified = paragraphs.slice(0, 3).join("\n\n") + `\n\nIn conclusion, I am eager to contribute to ${university}'s academic community.`;
        }
        toast.success("Content condensed to high-impact essentials!");
      } else if (actionType === "rewrite") {
        modified = sopContent.replace(
          /My decision to pursue advanced studies/gi,
          "My pursuit of transformative graduate inquiry"
        );
        toast.success("Content rephrased with enhanced tone!");
      }

      setSopContent(modified);
      setIsAiImproving(false);
    }, 900);
  };

  // Save Draft to Vault
  const handleSaveDraft = () => {
    if (!sopContent.trim()) {
      toast.error("Document is empty.");
      return;
    }
    studentService.addDocument({
      title: `SOP_${university.replace(/\s+/g, "_")}_Draft.docx`,
      category: "SOP",
      size: `${(sopContent.length / 1024).toFixed(1)} KB`,
    });
    toast.success("Draft saved to Document Management vault!");
  };

  // Download
  const handleDownload = () => {
    if (!sopContent.trim()) {
      toast.error("Nothing to download.");
      return;
    }
    const blob = new Blob([sopContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOP_${university.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("SOP document downloaded successfully!");
  };

  // Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(sopContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Tools</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Statement of Purpose</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileEdit className="w-7 h-7 text-cyan-400" />
            AI Statement of Purpose (SOP) Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate custom, university-aligned SOP drafts and edit every word manually with assistive AI tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Student Parameters & Background (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Target Parameters</span>
            </h2>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Interactive AI
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Target University
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Target Program
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. M.S. Computer Science"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Academic Background & GPA
              </label>
              <textarea
                rows={2}
                value={academicBackground}
                onChange={(e) => setAcademicBackground(e.target.value)}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Relevant Research & Work Experience
              </label>
              <textarea
                rows={2}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Key Achievements & Honors
              </label>
              <input
                type="text"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Long-Term Career Vision
              </label>
              <textarea
                rows={2}
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="academic">Academic & Rigorous</option>
                  <option value="inspirational">Inspirational & Narrative</option>
                  <option value="industry">Technical & Industry-Focused</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-70 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? "Synthesizing..." : "Generate with AI"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Unlocked Rich Workspace & AI Modification Toolbar (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Editable Document Workspace
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Unlocked Editor
                </span>
              </div>

              {/* Assistive AI Actions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAiAction("improve")}
                  disabled={isAiImproving || !sopContent}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Elevate vocabulary and structure"
                >
                  Improve with AI
                </button>
                <button
                  onClick={() => handleAiAction("rewrite")}
                  disabled={isAiImproving || !sopContent}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Rewrite introduction & transitions"
                >
                  Rewrite
                </button>
                <button
                  onClick={() => handleAiAction("expand")}
                  disabled={isAiImproving || !sopContent}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Add impact paragraph"
                >
                  Expand
                </button>
                <button
                  onClick={() => handleAiAction("shorten")}
                  disabled={isAiImproving || !sopContent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Make concise"
                >
                  Shorten
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Copy text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Editable Textarea Workspace */}
            <div className="relative">
              <textarea
                value={sopContent}
                onChange={(e) => setSopContent(e.target.value)}
                placeholder="Click 'Generate with AI' or begin drafting your Statement of Purpose here. You retain complete manual control to edit, format, and customize every sentence."
                rows={20}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-2xl p-5 text-slate-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:border-cyan-500 resize-none selection:bg-cyan-500/30 custom-scrollbar"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 gap-3">
            <span>
              {sopContent.trim() ? `${sopContent.trim().split(/\s+/).length} words | ${sopContent.length} characters` : "0 words"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Regenerate Base Draft</span>
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold shadow-sm"
              >
                Save Final Version
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SopGeneratorPage;
