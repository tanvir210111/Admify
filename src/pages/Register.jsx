import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Building2,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import AgencyVerificationModal from "../components/agency/AgencyVerificationModal";
import AgentVerificationModal from "../components/agent/AgentVerificationModal";
import UniversityRepresentativeVerificationModal from "../components/unirep/UniversityRepresentativeVerificationModal";
import toast from "react-hot-toast";

function Register() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Form State
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Agent Verification Modal State
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [pendingAgentData, setPendingAgentData] = useState(null);
  const [isAgentSubmitting, setIsAgentSubmitting] = useState(false);

  // Agency Verification Modal State
  const [pendingAppId, setPendingAppId] = useState(() => {
    try {
      return sessionStorage.getItem("admify_pending_agency_app_id") || "";
    } catch {
      return "";
    }
  });
  const [pendingRegToken, setPendingRegToken] = useState(() => {
    try {
      return sessionStorage.getItem("admify_pending_agency_reg_token") || "";
    } catch {
      return "";
    }
  });
  const [registeredAgencyData, setRegisteredAgencyData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("admify_pending_agency_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(() => {
    try {
      const token = sessionStorage.getItem("admify_pending_agency_reg_token");
      return Boolean(token && token.trim() !== "");
    } catch {
      return false;
    }
  });

  // University Representative Verification Modal State
  const [pendingUniRepAppId, setPendingUniRepAppId] = useState(() => {
    try {
      return sessionStorage.getItem("admify_pending_unirep_app_id") || "";
    } catch {
      return "";
    }
  });
  const [pendingUniRepRegToken, setPendingUniRepRegToken] = useState(() => {
    try {
      return sessionStorage.getItem("admify_pending_unirep_reg_token") || "";
    } catch {
      return "";
    }
  });
  const [registeredUniRepData, setRegisteredUniRepData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("admify_pending_unirep_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isUniRepModalOpen, setIsUniRepModalOpen] = useState(() => {
    try {
      const token = sessionStorage.getItem("admify_pending_unirep_reg_token");
      return Boolean(token && token.trim() !== "");
    } catch {
      return false;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      if (sessionStorage.getItem("admify_pending_agency_reg_token")) {
        return "agency";
      }
      if (sessionStorage.getItem("admify_pending_unirep_reg_token")) {
        return "university";
      }
    } catch {}
    return "student";
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Restore pending registration modal if user refreshed during verification
  React.useEffect(() => {
    try {
      const token = sessionStorage.getItem("admify_pending_agency_reg_token");
      const appData = sessionStorage.getItem("admify_pending_agency_data");
      if (token && appData) {
        setRole("agency");
        setIsVerificationModalOpen(true);
      }
      const unirepToken = sessionStorage.getItem("admify_pending_unirep_reg_token");
      const unirepData = sessionStorage.getItem("admify_pending_unirep_data");
      if (unirepToken && unirepData) {
        setRole("university");
        setIsUniRepModalOpen(true);
      }
    } catch {}
  }, []);

  const handleRegister = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!termsAccepted) {
      toast.error("Please agree to Admify's Terms of Service and Privacy Policy.");
      return;
    }

    if (role === "agency") {
      if (!agencyName || agencyName.trim() === "") {
        toast.error("Agency Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please confirm your password.");
        return;
      }
    } else if (role === "university" || role === "university_rep") {
      if (!fullName || fullName.trim() === "") {
        toast.error("Full Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please confirm your password.");
        return;
      }
    } else {
      if (!fullName || fullName.trim() === "") {
        toast.error("Full Name is required.");
        return;
      }
    }

    if (!phone || phone.trim() === "") {
      toast.error("Phone number is required.");
      return;
    }

    // If role is Agent, open the Agent Verification modal before account creation
    if (role === "agent") {
      setPendingAgentData({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      setIsAgentModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      if (role === "agency") {
        // ──────────────────────────────────────────────────────────────────
        // AGENCY REGISTRATION: Creates a PENDING application record only.
        // DO NOT log user in. DO NOT set active user session.
        // ──────────────────────────────────────────────────────────────────
        const res = await api.post("/api/auth/register", {
          name: agencyName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: "agency",
        });

        const appData = res?.data || res;
        const appId = appData?.applicationId || res?.applicationId || "";
        const regToken = appData?.registrationToken || res?.registrationToken || "";
        const agencyObj = appData?.agency || res?.agency || {
          agencyName: agencyName.trim(),
          officialBusinessEmail: email.trim(),
          phone: phone.trim(),
          applicationId: appId,
        };

        // Preserve pending registration session in sessionStorage (does not touch auth storage)
        try {
          if (appId) sessionStorage.setItem("admify_pending_agency_app_id", appId);
          if (regToken) sessionStorage.setItem("admify_pending_agency_reg_token", regToken);
          sessionStorage.setItem("admify_pending_agency_data", JSON.stringify(agencyObj));
        } catch (storageErr) {
          console.warn("Could not save pending agency registration to sessionStorage", storageErr);
        }

        setPendingAppId(appId);
        setPendingRegToken(regToken);
        setRegisteredAgencyData(agencyObj);

        toast.success("Agency application created! Please complete verification details.");
        setIsVerificationModalOpen(true);
      } else if (role === "university" || role === "university_rep") {
        // ──────────────────────────────────────────────────────────────────
        // UNI REP REGISTRATION: Creates a PENDING application record only.
        // DO NOT log user in. DO NOT set active user session.
        // ──────────────────────────────────────────────────────────────────
        const res = await api.post("/api/auth/register", {
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: "university_rep",
        });

        const appData = res?.data || res;
        const appId = appData?.applicationId || res?.applicationId || "";
        const regToken = appData?.registrationToken || res?.registrationToken || "";
        const repObj = appData?.representative || res?.representative || {
          fullName: fullName.trim(),
          officialEmail: email.trim(),
          phone: phone.trim(),
          applicationId: appId,
        };

        try {
          if (appId) sessionStorage.setItem("admify_pending_unirep_app_id", appId);
          if (regToken) sessionStorage.setItem("admify_pending_unirep_reg_token", regToken);
          sessionStorage.setItem("admify_pending_unirep_data", JSON.stringify(repObj));
        } catch (storageErr) {
          console.warn("Could not save pending unirep registration to sessionStorage", storageErr);
        }

        setPendingUniRepAppId(appId);
        setPendingUniRepRegToken(regToken);
        setRegisteredUniRepData(repObj);

        toast.success("University Representative application created! Please complete verification details.");
        setIsUniRepModalOpen(true);
      } else {
        // Standard user registration flow for student
        await register({
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
        });

        toast.success("Account created! Please log in to continue.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Agent Verification submission handler
  const handleVerifyAgent = async ({ agencyId, agentApplicationId, activationCode }) => {
    if (!pendingAgentData) return;
    setIsAgentSubmitting(true);
    try {
      await register({
        name: pendingAgentData.name,
        email: pendingAgentData.email,
        password: pendingAgentData.password,
        phone: pendingAgentData.phone,
        role: "agent",
        agencyId,
        agentApplicationId,
        activationCode,
      });

      toast.success("Agent account verified and activated! Welcome to Admify.");
      setIsAgentModalOpen(false);
      navigate("/agent/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to verify and activate Agent account.");
    } finally {
      setIsAgentSubmitting(false);
    }
  };

  const roles = [
    { id: "student", label: "Student", desc: "Find & apply to universities" },
    { id: "agent", label: "Agent", desc: "Manage student applications" },
    { id: "agency", label: "Agency", desc: "Study abroad consultancy" },
    {
      id: "university",
      label: "Uni Rep",
      desc: "Review applications & profiles",
    },
  ];

  return (
    <>
      <AuthLayout
        title={
          role === "agency"
            ? "Agency Registration"
            : role === "university" || role === "university_rep"
            ? "University Representative Registration"
            : "Create Account"
        }
        subtitle={
          role === "agency"
            ? "Register your global study abroad consultancy on Admify."
            : role === "university" || role === "university_rep"
            ? "Register as an authorized University Representative on Admify."
            : "Join the AI-powered education revolution."
        }
      >
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 relative">
            {roles.map((r) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-colors relative z-10 overflow-hidden ${
                  role === r.id
                    ? "border-primary-500 text-white"
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/50 text-slate-400"
                }`}
              >
                {role === r.id && (
                  <motion.div
                    layoutId="active-register-role"
                    className="absolute inset-0 bg-primary-900/30 shadow-[0_0_15px_rgba(124,58,237,0.2)] -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-sm font-bold mb-1">{r.label}</span>
                <span
                  className={`text-[10px] leading-tight hidden sm:block ${
                    role === r.id ? "text-primary-200" : "text-slate-500"
                  }`}
                >
                  {r.desc}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileTap={{ scale: 0.99 }} className="relative group flex-1">
                {role === "agency" ? (
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
                ) : (
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
                )}
                <input
                  type="text"
                  required
                  value={role === "agency" ? agencyName : fullName}
                  onChange={(e) =>
                    role === "agency"
                      ? setAgencyName(e.target.value)
                      : setFullName(e.target.value)
                  }
                  placeholder={
                    role === "agency"
                      ? "Agency Name *"
                      : role === "university" || role === "university_rep"
                      ? "Full Name *"
                      : "Full Name"
                  }
                  className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
                />
              </motion.div>

              <motion.div whileTap={{ scale: 0.99 }} className="relative group flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number *"
                  className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
                />
              </motion.div>
            </div>

            <motion.div whileTap={{ scale: 0.99 }} className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "agency"
                    ? "Official Business Email *"
                    : role === "university" || role === "university_rep"
                    ? "Official University Email *"
                    : "Email address"
                }
                className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
              />
            </motion.div>

            <motion.div whileTap={{ scale: 0.99 }} className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role === "agency" || role === "university" || role === "university_rep" ? "Password *" : "Create Password"}
                className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10 p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </motion.div>

            {/* Confirm Password for Agency and Uni Rep */}
            {(role === "agency" || role === "university" || role === "university_rep") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative group"
              >
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password *"
                  className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="mt-1 flex-shrink-0 text-slate-500 hover:text-primary-400 transition-colors"
            >
              {termsAccepted ? (
                <CheckSquare className="w-5 h-5 text-primary-500" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </motion.button>
            <p className="text-xs text-slate-500 leading-relaxed">
              I agree to Admify's{" "}
              <a href="#" className="text-primary-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary-400 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  {role === "agency"
                    ? "Create Agency Account"
                    : role === "university" || role === "university_rep"
                    ? "Create University Representative Account"
                    : "Create Account"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-bold transition-colors hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </form>
      </AuthLayout>

      {/* Agency Verification Modal */}
      {isVerificationModalOpen && (
        <AgencyVerificationModal
          isOpen={isVerificationModalOpen}
          initialData={registeredAgencyData || {}}
          applicationId={pendingAppId}
          registrationToken={pendingRegToken}
          onClose={() => {
            setIsVerificationModalOpen(false);
            try {
              sessionStorage.removeItem("admify_pending_agency_app_id");
              sessionStorage.removeItem("admify_pending_agency_reg_token");
              sessionStorage.removeItem("admify_pending_agency_data");
            } catch {}
            navigate("/login");
          }}
          onSubmitted={() => {
            // Verification submitted and pending Admin review
          }}
        />
      )}

      {/* University Representative Verification Modal */}
      {isUniRepModalOpen && (
        <UniversityRepresentativeVerificationModal
          isOpen={isUniRepModalOpen}
          initialData={registeredUniRepData || {}}
          applicationId={pendingUniRepAppId}
          registrationToken={pendingUniRepRegToken}
          onClose={() => {
            setIsUniRepModalOpen(false);
            try {
              sessionStorage.removeItem("admify_pending_unirep_app_id");
              sessionStorage.removeItem("admify_pending_unirep_reg_token");
              sessionStorage.removeItem("admify_pending_unirep_data");
            } catch {}
            navigate("/login");
          }}
          onSubmitted={() => {
            // Verification submitted and pending Admin review
          }}
        />
      )}

      {/* Agent Verification Modal (3 fields: Agency ID, Agent Application ID, Activation Code) */}
      {isAgentModalOpen && (
        <AgentVerificationModal
          isOpen={isAgentModalOpen}
          isSubmitting={isAgentSubmitting}
          initialEmail={pendingAgentData?.email || ""}
          onClose={() => setIsAgentModalOpen(false)}
          onVerify={handleVerifyAgent}
        />
      )}
    </>
  );
}

export default Register;
