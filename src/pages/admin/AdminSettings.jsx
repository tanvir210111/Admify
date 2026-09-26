import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  Coins,
  CreditCard,
  Mail,
  ShieldCheck,
  Save,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      platformName: "Admify Global Education",
      supportEmail: "support@admify.world",
      contactPhone: "+880 1800-000000",
      companyAddress: "Gulshan-2, Dhaka 1212, Bangladesh",
      currency: "BDT",
    },
    credits: {
      creditValueBdt: 100,
      welcomeCredits: 20,
      sopCost: 5,
      lorCost: 5,
      probabilityCost: 10,
      recommendationCost: 10,
    },
    payment: {
      bkashMerchantNumber: "01700000000",
      nagadMerchantNumber: "01800000000",
      bankAccountDetails: "Bank: City Bank | Branch: Gulshan | Acc: 110293847501",
      paymentInstructions: "Please send exact amount and submit the TrxID & receipt screenshot for manual verification.",
    },
    email: {
      senderName: "Admify System",
      senderEmail: "no-reply@admify.world",
      enableEmailAlerts: true,
    },
    security: {
      sessionTimeoutMinutes: 120,
      requireEmailVerification: true,
      maxFailedLogins: 5,
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/settings");
      if (res?.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/api/admin/settings", settings);
      if (res?.data?.settings) {
        setSettings(res.data.settings);
      }
      toast.success("Platform settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update platform settings");
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 max-w-[1200px] mx-auto text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-400" /> Platform Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global governance parameters, payment methods, credit valuations, email dispatch, and security policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettings}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition"
            title="Reload from server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: "general", label: "General & Identity", icon: Globe },
          { id: "credits", label: "Credits & Pricing", icon: Coins },
          { id: "payment", label: "Payment Gateways", icon: CreditCard },
          { id: "email", label: "Email Dispatch", icon: Mail },
          { id: "security", label: "Security & Sessions", icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === t.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings Form Container */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
            Loading system configurations from database...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 text-sm">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-base border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-400" /> General Platform Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Platform Brand Name</label>
                    <input
                      type="text"
                      value={settings.general?.platformName || ""}
                      onChange={(e) => updateNested("general", "platformName", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Support Email</label>
                    <input
                      type="email"
                      value={settings.general?.supportEmail || ""}
                      onChange={(e) => updateNested("general", "supportEmail", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Support Hotline Phone</label>
                    <input
                      type="text"
                      value={settings.general?.contactPhone || ""}
                      onChange={(e) => updateNested("general", "contactPhone", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Corporate Headquarters Address</label>
                    <input
                      type="text"
                      value={settings.general?.companyAddress || ""}
                      onChange={(e) => updateNested("general", "companyAddress", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Credits & Pricing Tab */}
            {activeTab === "credits" && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-base border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" /> Credit Engine & AI Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      1 Credit Value in BDT (৳)
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.creditValueBdt || 100}
                      onChange={(e) => updateNested("credits", "creditValueBdt", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Free Welcome Credits for New Students
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.welcomeCredits || 20}
                      onChange={(e) => updateNested("credits", "welcomeCredits", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      SOP Generator Run Cost (Credits)
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.sopCost || 5}
                      onChange={(e) => updateNested("credits", "sopCost", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      LOR Generator Run Cost (Credits)
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.lorCost || 5}
                      onChange={(e) => updateNested("credits", "lorCost", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Admission Probability Assessment Cost
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.probabilityCost || 10}
                      onChange={(e) => updateNested("credits", "probabilityCost", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Deep AI Recommendation Run Cost
                    </label>
                    <input
                      type="number"
                      value={settings.credits?.recommendationCost || 10}
                      onChange={(e) => updateNested("credits", "recommendationCost", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Gateways Tab */}
            {activeTab === "payment" && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-base border-b border-slate-800 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Manual Payment Gateways & Accounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">bKash Merchant / Personal Number</label>
                    <input
                      type="text"
                      value={settings.payment?.bkashMerchantNumber || ""}
                      onChange={(e) => updateNested("payment", "bkashMerchantNumber", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Nagad Merchant / Personal Number</label>
                    <input
                      type="text"
                      value={settings.payment?.nagadMerchantNumber || ""}
                      onChange={(e) => updateNested("payment", "nagadMerchantNumber", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Bank Wire Account Details</label>
                    <input
                      type="text"
                      value={settings.payment?.bankAccountDetails || ""}
                      onChange={(e) => updateNested("payment", "bankAccountDetails", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">User Payment Instructions</label>
                    <textarea
                      rows={3}
                      value={settings.payment?.paymentInstructions || ""}
                      onChange={(e) => updateNested("payment", "paymentInstructions", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Dispatch Tab */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-base border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" /> Transactional Email Dispatcher
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Sender Display Name</label>
                    <input
                      type="text"
                      value={settings.email?.senderName || ""}
                      onChange={(e) => updateNested("email", "senderName", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Outbound Sender Email Address</label>
                    <input
                      type="email"
                      value={settings.email?.senderEmail || ""}
                      onChange={(e) => updateNested("email", "senderEmail", e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email?.enableEmailAlerts !== false}
                        onChange={(e) => updateNested("email", "enableEmailAlerts", e.target.checked)}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        Dispatch automatic notification emails on verification approval and payment verification
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-base border-b border-slate-800 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Security & Policies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Session Inactivity Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security?.sessionTimeoutMinutes || 120}
                      onChange={(e) => updateNested("security", "sessionTimeoutMinutes", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Max Failed Login Attempts Before Lockout
                    </label>
                    <input
                      type="number"
                      value={settings.security?.maxFailedLogins || 5}
                      onChange={(e) => updateNested("security", "maxFailedLogins", Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes to Database
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
