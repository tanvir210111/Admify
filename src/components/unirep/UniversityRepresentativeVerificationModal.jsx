import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Globe,
  Award,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const GLOBAL_COUNTRIES = [
  "Bangladesh",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "Netherlands",
  "Sweden",
  "Finland",
  "France",
  "Italy",
  "Spain",
  "Switzerland",
  "Malaysia",
  "United Arab Emirates",
  "Singapore",
  "India",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "Japan",
  "South Korea",
  "China",
  "Turkey",
  "Saudi Arabia",
  "Qatar",
  "South Africa",
  "Kenya",
  "Nigeria",
  "Brazil",
  "Other",
];

const STUDY_LEVELS = [
  "Foundation",
  "Diploma",
  "Undergraduate",
  "Master's",
  "PhD",
];

const DESIGNATIONS = [
  "International Admissions Officer",
  "International Relations Officer",
  "Regional Representative",
  "Recruitment Officer",
  "Authorized Representative",
  "Other",
];

const UNIVERSITY_TYPES = ["Public", "Private", "Government", "Other"];

export default function UniversityRepresentativeVerificationModal({
  isOpen,
  onClose,
  applicationId,
  registrationToken,
  initialData = {},
  onCompleted,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [formData, setFormData] = useState({
    // Section A: University Information
    university: {
      name: initialData?.universityName || "",
      legalName: initialData?.legalName || initialData?.universityName || "",
      logo: "",
      website: "",
      country: initialData?.country || "United States",
      city: "",
      type: "Public",
      domain: "",
    },
    // Section B: Representative Information
    representative: {
      fullName: initialData?.fullName || initialData?.name || "",
      designation: "International Admissions Officer",
      officialEmail: initialData?.officialEmail || initialData?.email || "",
      phone: initialData?.phone || "",
      employeeId: "",
    },
    // Section C: Authorization & Documents
    documents: {
      authorizationLetter: null,
      officialUniversityId: null,
      employeeIdDocument: null,
      supportingDocument: null,
    },
    // Section D: Academic Scope
    academicScope: {
      studyLevels: ["Undergraduate", "Master's"],
      programsDepartments: "",
      countriesRegionsHandled: ["United States", "Canada", "United Kingdom"],
    },
    // Section E: Professional Information
    professional: {
      yearsOfExperience: 3,
      previousExperience: "",
      languages: ["English"],
      areasOfExpertise: ["Admissions Counseling", "Visa Guidance"],
      certificationsMemberships: [],
    },
    // Section F: Declarations
    declarations: {
      informationAccuracy: false,
      authorizationConfirmation: false,
      termsAndPolicy: false,
    },
  });

  const [tagInputs, setTagInputs] = useState({
    language: "",
    expertise: "",
    certification: "",
    country: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState("");

  // Sync initialData when provided
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        representative: {
          ...prev.representative,
          fullName: initialData.fullName || initialData.name || prev.representative.fullName,
          officialEmail: initialData.officialEmail || initialData.email || prev.representative.officialEmail,
          phone: initialData.phone || prev.representative.phone,
        },
        university: {
          ...prev.university,
          domain:
            prev.university.domain ||
            (initialData.email?.includes("@") ? initialData.email.split("@")[1] : ""),
        },
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  // File Upload Helper
  const handleFileUpload = (e, fieldKey, isLogo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = (isLogo ? 2 : 3.5) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum allowed size is ${isLogo ? "2MB" : "3.5MB"}.`);
      return;
    }

    const validMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validMimes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a valid PDF, JPG, PNG, or WEBP file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      if (isLogo) {
        setFormData((prev) => ({
          ...prev,
          university: { ...prev.university, logo: base64Data },
        }));
        toast.success("University logo attached!");
      } else {
        const fileObj = {
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          fileType: file.type,
          fileData: base64Data,
        };
        setFormData((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [fieldKey]: fileObj,
          },
        }));
        toast.success(`${file.name} uploaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (fieldKey) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [fieldKey]: null,
      },
    }));
  };

  // Tag helper
  const addTag = (field, key) => {
    const val = tagInputs[key].trim();
    if (!val) return;
    if (formData.professional[field]?.includes(val)) {
      setTagInputs((p) => ({ ...p, [key]: "" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      professional: {
        ...prev.professional,
        [field]: [...(prev.professional[field] || []), val],
      },
    }));
    setTagInputs((p) => ({ ...p, [key]: "" }));
  };

  const removeTag = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      professional: {
        ...prev.professional,
        [field]: prev.professional[field].filter((x) => x !== item),
      },
    }));
  };

  const toggleStudyLevel = (lvl) => {
    setFormData((prev) => {
      const exists = prev.academicScope.studyLevels.includes(lvl);
      const nextLevels = exists
        ? prev.academicScope.studyLevels.filter((x) => x !== lvl)
        : [...prev.academicScope.studyLevels, lvl];
      return {
        ...prev,
        academicScope: {
          ...prev.academicScope,
          studyLevels: nextLevels.length > 0 ? nextLevels : [lvl],
        },
      };
    });
  };

  const toggleCountryHandled = (country) => {
    setFormData((prev) => {
      const exists = prev.academicScope.countriesRegionsHandled.includes(country);
      const nextList = exists
        ? prev.academicScope.countriesRegionsHandled.filter((x) => x !== country)
        : [...prev.academicScope.countriesRegionsHandled, country];
      return {
        ...prev,
        academicScope: {
          ...prev.academicScope,
          countriesRegionsHandled: nextList.length > 0 ? nextList : [country],
        },
      };
    });
  };

  // Step Validation
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      const u = formData.university;
      if (!u.name?.trim()) {
        toast.error("University Name is required.");
        return false;
      }
      if (!u.legalName?.trim()) {
        toast.error("Official/Legal University Name is required.");
        return false;
      }
      if (!u.website?.trim()) {
        toast.error("Official University Website is required.");
        return false;
      }
      if (!u.country?.trim()) {
        toast.error("University Country is required.");
        return false;
      }
      if (!u.city?.trim()) {
        toast.error("University City is required.");
        return false;
      }
      if (!u.domain?.trim()) {
        toast.error("Official University Email Domain is required (e.g. university.edu).");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const r = formData.representative;
      if (!r.fullName?.trim()) {
        toast.error("Representative Full Name is required.");
        return false;
      }
      if (!r.designation?.trim()) {
        toast.error("Designation is required.");
        return false;
      }
      if (!r.officialEmail?.trim()) {
        toast.error("Official Email is required.");
        return false;
      }
      if (!r.phone?.trim()) {
        toast.error("Phone Number is required.");
        return false;
      }
      if (!r.employeeId?.trim()) {
        toast.error("Employee ID / Representative ID is required.");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      const d = formData.documents;
      if (!d.authorizationLetter) {
        toast.error("Authorization Letter from University is required.");
        return false;
      }
      if (!d.officialUniversityId) {
        toast.error("Official University ID is required.");
        return false;
      }
      if (!d.employeeIdDocument) {
        toast.error("Employee / Representative ID Document is required.");
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      const a = formData.academicScope;
      if (!a.programsDepartments?.trim()) {
        toast.error("Programs / Departments representation scope is required.");
        return false;
      }
      if (!a.countriesRegionsHandled || a.countriesRegionsHandled.length === 0) {
        toast.error("Please select at least one Country / Region handled.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Verification Application
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.declarations.informationAccuracy) {
      toast.error("Please confirm that the provided information is accurate.");
      return;
    }
    if (!formData.declarations.authorizationConfirmation) {
      toast.error("Please confirm that you are authorized to represent the university.");
      return;
    }
    if (!formData.declarations.termsAndPolicy) {
      toast.error("Please agree to Admify's University Representative Terms & Verification Policy.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token =
        registrationToken ||
        sessionStorage.getItem("admify_pending_unirep_reg_token") ||
        "";

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.post("/api/university-rep/verification", formData, {
        headers,
      });

      const returnedAppId =
        res?.data?.application?.applicationId ||
        applicationId ||
        "UREP-APP-2026";

      setSubmittedAppId(returnedAppId);
      setIsSuccess(true);
      toast.success("Verification application submitted successfully!");

      // Clear pending storage
      try {
        sessionStorage.removeItem("admify_pending_unirep_app_id");
        sessionStorage.removeItem("admify_pending_unirep_reg_token");
        sessionStorage.removeItem("admify_pending_unirep_data");
      } catch {}

      if (onCompleted) {
        onCompleted(res?.data?.application);
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit verification application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "University Information",
    "Representative Details",
    "Authorization & Documents",
    "Academic Scope",
    "Professional Info",
    "Declaration & Review",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                University Representative Verification
                {applicationId && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary-500/10 text-primary-300 border border-primary-500/20">
                    {applicationId}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Official accreditation & verification for higher education institutions
              </p>
            </div>
          </div>
          {!isSuccess && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {!isSuccess && (
          <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800/60 overflow-x-auto custom-scrollbar">
            <div className="flex items-center justify-between min-w-[550px] gap-2">
              {stepTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isDone = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                return (
                  <div key={idx} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-primary-600 text-white ring-4 ring-primary-600/20 shadow-md"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap font-medium ${
                        isCurrent
                          ? "text-white"
                          : isDone
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {title}
                    </span>
                    {idx < stepTitles.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          stepNum < currentStep ? "bg-emerald-500/50" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="max-w-md mx-auto">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  Status: Under Review
                </span>
                <h3 className="text-2xl font-black text-white">
                  Verification Application Submitted!
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Your university verification package has been received and routed to the Admify Institutional Compliance Team for authorization review.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Application Reference:</span>
                    <span className="text-primary-300 font-mono font-bold">
                      {submittedAppId}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">University:</span>
                    <span className="text-white font-medium">
                      {formData.university.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Official Representative:</span>
                    <span className="text-white font-medium">
                      {formData.representative.fullName}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  Once approved by Admify, an activation link will be dispatched to your official email (<strong>{formData.representative.officialEmail}</strong>). Please activate your account via that email before signing in.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-bold text-sm shadow-lg transition-all"
              >
                Close & Return to Sign In
              </button>
            </div>
          ) : (
            <div>
              {/* SECTION A: University Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary-400" />
                      Section A: University Information
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Provide official institutional data corresponding to your university accreditation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        University Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.university.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, name: e.target.value },
                          })
                        }
                        placeholder="e.g. Oxford University"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Official/Legal University Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.university.legalName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, legalName: e.target.value },
                          })
                        }
                        placeholder="e.g. The Chancellor, Masters, and Scholars of the University of Oxford"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Official University Website *
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.university.website}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, website: e.target.value },
                          })
                        }
                        placeholder="https://www.ox.ac.uk"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Official University Email Domain *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.university.domain}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, domain: e.target.value },
                          })
                        }
                        placeholder="e.g. ox.ac.uk or harvard.edu"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Institutional domain used for faculty and admissions email addresses.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Country *
                      </label>
                      <select
                        value={formData.university.country}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, country: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                        {GLOBAL_COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.university.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, city: e.target.value },
                          })
                        }
                        placeholder="e.g. Oxford"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        University Type *
                      </label>
                      <select
                        value={formData.university.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: { ...formData.university, type: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                        {UNIVERSITY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        University Logo (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors">
                          <ImageIcon className="w-4 h-4 text-primary-400" />
                          <span>{formData.university.logo ? "Change Logo" : "Upload Logo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "logo", true)}
                            className="hidden"
                          />
                        </label>
                        {formData.university.logo && (
                          <div className="w-9 h-9 rounded-lg border border-slate-700 overflow-hidden bg-white/5 flex items-center justify-center p-1">
                            <img
                              src={formData.university.logo}
                              alt="Logo"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: Representative Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary-400" />
                      Section B: Representative Information
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authorized liaison profile who will act on behalf of the university.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.representative.fullName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative: {
                              ...formData.representative,
                              fullName: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Dr. Arthur Pendelton"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Designation *
                      </label>
                      <select
                        value={formData.representative.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative: {
                              ...formData.representative,
                              designation: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      >
                        {DESIGNATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Official University Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.representative.officialEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative: {
                              ...formData.representative,
                              officialEmail: e.target.value,
                            },
                          })
                        }
                        placeholder="rep@university.edu"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Must match the university institutional domain.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.representative.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative: {
                              ...formData.representative,
                              phone: e.target.value,
                            },
                          })
                        }
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Employee ID / Representative ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.representative.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            representative: {
                              ...formData.representative,
                              employeeId: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. EMP-UNI-88492"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: Authorization & Documents */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary-400" />
                      Section C: Authorization & Documents
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload institutional proof of authority. Supported: PDF, JPG, PNG, WEBP (Max 3.5MB).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Authorization Letter */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">
                            Authorization Letter *
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Signed official letter authorizing you to represent the university.
                          </p>
                        </div>
                      </div>
                      {formData.documents.authorizationLetter ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-200 truncate">
                              {formData.documents.authorizationLetter.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("authorizationLetter")}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-primary-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center transition-colors">
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            Click to upload Authorization Letter
                          </span>
                          <span className="text-[10px] text-slate-500">
                            PDF, JPG or PNG up to 3.5MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload(e, "authorizationLetter")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Official University ID */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">
                            Official University ID *
                          </p>
                          <p className="text-[11px] text-slate-400">
                            University staff identification card or faculty credential.
                          </p>
                        </div>
                      </div>
                      {formData.documents.officialUniversityId ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-200 truncate">
                              {formData.documents.officialUniversityId.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("officialUniversityId")}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-primary-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center transition-colors">
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            Click to upload University ID
                          </span>
                          <span className="text-[10px] text-slate-500">
                            PDF, JPG or PNG up to 3.5MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload(e, "officialUniversityId")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Employee / Representative ID Document */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">
                            Employee ID Document *
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Government ID or employment contract extract confirming representation.
                          </p>
                        </div>
                      </div>
                      {formData.documents.employeeIdDocument ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-200 truncate">
                              {formData.documents.employeeIdDocument.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("employeeIdDocument")}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-primary-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center transition-colors">
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            Click to upload Employee ID Document
                          </span>
                          <span className="text-[10px] text-slate-500">
                            PDF, JPG or PNG up to 3.5MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload(e, "employeeIdDocument")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Supporting Document */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">
                            Other Supporting Document (Optional)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Any additional accreditation cert, MOU, or institutional certificate.
                          </p>
                        </div>
                      </div>
                      {formData.documents.supportingDocument ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-200 truncate">
                              {formData.documents.supportingDocument.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("supportingDocument")}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-primary-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center transition-colors">
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            Click to upload Supporting Document
                          </span>
                          <span className="text-[10px] text-slate-500">
                            PDF, JPG or PNG up to 3.5MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload(e, "supportingDocument")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D: Academic Scope */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary-400" />
                      Section D: Academic Scope
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specify the academic levels, programs, and geographic regions under your remit.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Study Levels Handled * (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {STUDY_LEVELS.map((lvl) => {
                        const isSelected = formData.academicScope.studyLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleStudyLevel(lvl)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-primary-600/30 border-primary-500 text-white shadow-sm"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {isSelected ? `✓ ${lvl}` : lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Programs / Departments *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.academicScope.programsDepartments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicScope: {
                            ...formData.academicScope,
                            programsDepartments: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Faculty of Engineering & Physical Sciences, Faculty of Business & Humanities, All Undergraduate & Postgraduate programs"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Countries / Regions Handled *
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 custom-scrollbar">
                      {GLOBAL_COUNTRIES.map((country) => {
                        const isSelected =
                          formData.academicScope.countriesRegionsHandled.includes(country);
                        return (
                          <button
                            key={country}
                            type="button"
                            onClick={() => toggleCountryHandled(country)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-primary-500/20 border-primary-500/50 text-primary-200"
                                : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {isSelected ? `✓ ${country}` : country}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION E: Professional Information */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary-400" />
                      Section E: Professional Information
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Professional background and advisory qualifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.professional.yearsOfExperience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professional: {
                              ...formData.professional,
                              yearsOfExperience: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Languages Spoken
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputs.language}
                          onChange={(e) =>
                            setTagInputs({ ...tagInputs, language: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag("languages", "language");
                            }
                          }}
                          placeholder="e.g. English, French"
                          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => addTag("languages", "language")}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.professional.languages?.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => removeTag("languages", lang)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Previous Experience
                      </label>
                      <textarea
                        rows={2}
                        value={formData.professional.previousExperience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professional: {
                              ...formData.professional,
                              previousExperience: e.target.value,
                            },
                          })
                        }
                        placeholder="Detail prior academic recruitment, institutional partnerships, or regional management history..."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Areas of Expertise
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputs.expertise}
                          onChange={(e) =>
                            setTagInputs({ ...tagInputs, expertise: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag("areasOfExpertise", "expertise");
                            }
                          }}
                          placeholder="e.g. Visa Compliance"
                          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => addTag("areasOfExpertise", "expertise")}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.professional.areasOfExpertise?.map((exp) => (
                          <span
                            key={exp}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            {exp}
                            <button
                              type="button"
                              onClick={() => removeTag("areasOfExpertise", exp)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Certifications / Memberships
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputs.certification}
                          onChange={(e) =>
                            setTagInputs({ ...tagInputs, certification: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag("certificationsMemberships", "certification");
                            }
                          }}
                          placeholder="e.g. NAFSA, EAIE, AIRC"
                          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => addTag("certificationsMemberships", "certification")}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.professional.certificationsMemberships?.map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            {cert}
                            <button
                              type="button"
                              onClick={() => removeTag("certificationsMemberships", cert)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION F: Declaration */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary-400" />
                      Section F: Declaration & Final Submission
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review your submission summary and confirm legal representation consent.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Application Summary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">University:</span>
                        <span className="text-white font-medium">
                          {formData.university.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Country / City:</span>
                        <span className="text-white font-medium">
                          {formData.university.city}, {formData.university.country}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Representative:</span>
                        <span className="text-white font-medium">
                          {formData.representative.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Designation:</span>
                        <span className="text-white font-medium">
                          {formData.representative.designation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Declarations */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.declarations.informationAccuracy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            declarations: {
                              ...formData.declarations,
                              informationAccuracy: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 w-4 h-4 rounded border-slate-700 text-primary-600 focus:ring-primary-500 bg-slate-800 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                        I confirm that the information provided is accurate. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.declarations.authorizationConfirmation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            declarations: {
                              ...formData.declarations,
                              authorizationConfirmation: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 w-4 h-4 rounded border-slate-700 text-primary-600 focus:ring-primary-500 bg-slate-800 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                        I confirm that I am authorized to represent the stated university. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.declarations.termsAndPolicy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            declarations: {
                              ...formData.declarations,
                              termsAndPolicy: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 w-4 h-4 rounded border-slate-700 text-primary-600 focus:ring-primary-500 bg-slate-800 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                        I agree to Admify's University Representative Terms & Verification Policy. *
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Submit for Verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
