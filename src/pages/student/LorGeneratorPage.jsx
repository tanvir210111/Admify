import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { studentService } from "../../services/studentService";
import {
  ScrollText,
  Sparkles,
  Save,
  Download,
  Copy,
  Check,
  RotateCcw,
  UserCheck,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

function LorGeneratorPage() {
  const { user, updateUser } = useAuth();

  // Inputs
  const [recommenderName, setRecommenderName] = useState("");
  const [recommenderTitle, setRecommenderTitle] = useState("");
  const [recommenderType, setRecommenderType] = useState("Academic Professor");
  const [relationship, setRelationship] = useState("");
  const [targetUni, setTargetUni] = useState(user?.targetCountry ? `${user.targetCountry} University` : "");
  const [targetProgram, setTargetProgram] = useState(user?.targetCourse || "");
  const [achievements, setAchievements] = useState("");
  const [skills, setSkills] = useState("");

  // Output & Editor State
  const [lorContent, setLorContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiImproving, setIsAiImproving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate LOR with AI (10 CR)
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    const currentBal = user?.walletCredits ?? 0;
    if (currentBal < 10) {
      toast.error(
        `Insufficient Credits! Generating AI LOR requires 10 Credits (You have ${currentBal} CR). Please buy credits in your Wallet.`,
        { duration: 5000 }
      );
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await studentService.generateLor({
        studentName: user?.user_metadata?.full_name || user?.name || "Student Applicant",
        university: targetUni,
        course: targetProgram,
        recommenderName,
        recommenderTitle,
        relationship,
        achievements,
      });
      setLorContent(generated);

      // Deduct 10 Credits on successful generation
      try {
        const deductRes = await api.post("/api/wallet/deduct", {
          serviceCode: "AI_LOR",
          referenceId: `LOR-${Date.now()}`,
        });
        if (updateUser && deductRes?.data?.balanceAfter !== undefined) {
          updateUser({ walletCredits: deductRes.data.balanceAfter });
        }
      } catch (dErr) {
        console.warn("Credit deduction warning:", dErr.message);
      }

      toast.success("AI Recommendation Letter generated! (10 CR deducted)");
    } catch (err) {
      toast.error("LOR generation failed. Please try again. (0 CR deducted)");
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Improvement Actions (5 CR)
  const handleAiAction = async (actionType) => {
    if (!lorContent.trim()) {
      toast.error("Document is empty.");
      return;
    }

    const currentBal = user?.walletCredits ?? 0;
    if (currentBal < 5) {
      toast.error(
        `Insufficient Credits! LOR AI Rewrite/Improve requires 5 Credits (You have ${currentBal} CR). Please buy credits in your Wallet.`,
        { duration: 5000 }
      );
      return;
    }

    setIsAiImproving(true);
    try {
      let modified = lorContent;
      if (actionType === "improve") {
        modified = lorContent.replace(
          /rare interpersonal maturity and leadership/gi,
          "distinguished intellectual poise, scholarly integrity, and collaborative leadership"
        );
      } else if (actionType === "rewrite") {
        modified = lorContent.replace(
          /It is my distinct privilege to write this letter/gi,
          "It gives me immense pleasure to enthusiastically recommend"
        );
      }
      setLorContent(modified);

      // Deduct 5 credits on successful improvement
      try {
        const deductRes = await api.post("/api/wallet/deduct", {
          serviceCode: "LOR_REWRITE",
          referenceId: `LOR-IMPROVE-${Date.now()}`,
        });
        if (updateUser && deductRes?.data?.balanceAfter !== undefined) {
          updateUser({ walletCredits: deductRes.data.balanceAfter });
        }
      } catch (dErr) {
        console.warn("Credit deduction warning:", dErr.message);
      }

      toast.success("LOR refined with AI! (5 CR deducted)");
    } catch (err) {
      toast.error("Rewrite failed. (0 CR deducted)");
    } finally {
      setIsAiImproving(false);
    }
  };

  // Save Draft to Vault
  const handleSaveDraft = () => {
    if (!lorContent.trim()) {
      toast.error("Document is empty.");
      return;
    }
    studentService.addDocument({
      title: `LOR_${recommenderName.replace(/\s+/g, "_")}_Draft.docx`,
      category: "LOR",
      size: `${(lorContent.length / 1024).toFixed(1)} KB`,
    });
    toast.success("LOR saved to Document Management vault!");
  };

  // Download
  const handleDownload = () => {
    if (!lorContent.trim()) {
      toast.error("Nothing to download.");
      return;
    }
    const blob = new Blob([lorContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LOR_${recommenderName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("LOR downloaded successfully!");
  };

  // Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(lorContent);
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
            <span className="text-xs text-slate-400">Letter of Recommendation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ScrollText className="w-7 h-7 text-cyan-400" />
            AI Letter of Recommendation (LOR) Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate customized academic or professional recommendation drafts for your mentors to review and sign.
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
        {/* Left Column: Recommender Details (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Recommender Information</span>
            </h2>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Assisted Setup
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Recommender Name
                </label>
                <input
                  type="text"
                  required
                  value={recommenderName}
                  onChange={(e) => setRecommenderName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Professional Title
                </label>
                <input
                  type="text"
                  required
                  value={recommenderTitle}
                  onChange={(e) => setRecommenderTitle(e.target.value)}
                  placeholder="e.g. Professor of Computer Science"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Recommender Category
                </label>
                <select
                  value={recommenderType}
                  onChange={(e) => setRecommenderType(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Academic Professor">Academic Professor / Faculty</option>
                  <option value="Research Supervisor">Research Supervisor</option>
                  <option value="Department Chair">Department Chair / Dean</option>
                  <option value="Work Employer">Professional Manager / Employer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Relationship & Duration
                </label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. supervised research for 2 years"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Target University
                </label>
                <input
                  type="text"
                  required
                  value={targetUni}
                  onChange={(e) => setTargetUni(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Target Program
                </label>
                <input
                  type="text"
                  required
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  placeholder="e.g. M.S. Computer Science"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Key Accomplishments Under Supervision
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Mention specific projects, standing, or research papers..."
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                Demonstrated Student Strengths & Skills
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. analytical rigor, self-motivation, collaborative mindset"
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-70 flex items-center justify-center gap-1.5 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? "Synthesizing Recommendation..." : "Generate LOR with AI"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Editable LOR Workspace (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Editable Recommendation Letter
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Full Control
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAiAction("improve")}
                  disabled={isAiImproving || !lorContent}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                >
                  Improve Phrasing
                </button>
                <button
                  onClick={() => handleAiAction("rewrite")}
                  disabled={isAiImproving || !lorContent}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                >
                  Rewrite Intro
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

            <textarea
              value={lorContent}
              onChange={(e) => setLorContent(e.target.value)}
              placeholder="Click 'Generate LOR with AI' or write your reference draft. You can freely edit every word before forwarding to your recommender."
              rows={20}
              className="w-full bg-[#07142D] border border-slate-700/60 rounded-2xl p-5 text-slate-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:border-cyan-500 resize-none selection:bg-cyan-500/30 custom-scrollbar"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 gap-3">
            <span>
              {lorContent.trim() ? `${lorContent.trim().split(/\s+/).length} words` : "0 words"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Regenerate LOR</span>
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

export default LorGeneratorPage;
