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
  Save,
  Building2,
  UserCheck,
  ShieldCheck,
  Briefcase,
  Award,
  Globe,
  Plus,
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

const POPULAR_DESTINATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "Netherlands",
  "Sweden",
  "Malaysia",
  "United Arab Emirates",
  "Japan",
  "Singapore",
  "France",
];

const STUDY_LEVELS = [
  "Foundation",
  "Diploma",
  "Undergraduate",
  "Master's",
  "PhD",
];

const SERVICES_LIST = [
  "University Application",
  "Visa Assistance",
  "Scholarship Assistance",
  "SOP/LOR Support",
  "Accommodation Assistance",
  "Pre-departure Support",
  "Career Counselling",
  "Other",
];

const AGENCY_TYPES = [
  "Study Abroad Consultancy",
  "Education Consultancy",
  "Immigration Consultancy",
  "Other",
];

const DESIGNATIONS = [
  "Owner",
  "Managing Director",
  "Director",
  "Manager",
  "Authorized Representative",
  "Other",
];

export default function AgencyVerificationModal({
  isOpen,
  onClose,
  initialData = {},
  applicationId = "",
  registrationToken = "",
  onSubmitted,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState(
    applicationId || initialData.applicationId || ""
  );
  const [draftLoadError, setDraftLoadError] = useState("");
  const [errors, setErrors] = useState({});

  // Scoped registration token for verification requests (registrationToken prop > sessionStorage)
  // NEVER fallback to localStorage admify_token (which belongs to authenticated user sessions)
  const token =
    registrationToken ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("admify_pending_agency_reg_token")
      : null) ||
    "";

  // Form State
  const [formData, setFormData] = useState({
    applicationId: applicationId || initialData.applicationId || "",
    // Step 1: Basic Information
    agencyName: initialData.agencyName || initialData.name || "",
    legalName: "",
    logo: "",
    agencyType: "Study Abroad Consultancy",
    yearEstablished: new Date().getFullYear() - 5,
    officeAddress: "",
    country: "Bangladesh",
    city: "",
    website: "",
    officialBusinessEmail: initialData.email || "",

    // Step 2: Authorized Person
    authorizedPerson: {
      fullName: "",
      designation: "Managing Director",
      phone: initialData.phone || "",
      email: initialData.email || "",
      identityNumber: "",
      identityDocument: { fileName: "", fileSize: "", fileType: "", fileData: "" },
    },

    // Step 3: Business Verification
    businessVerification: {
      tradeLicenseNumber: "",
      tradeLicenseDocument: { fileName: "", fileSize: "", fileType: "", fileData: "" },
      businessRegistrationNumber: "",
      businessRegistrationDocument: { fileName: "", fileSize: "", fileType: "", fileData: "" },
      tinNumber: "",
      tinDocument: { fileName: "", fileSize: "", fileType: "", fileData: "" },
      binVatNumber: "",
    },

    // Step 4: Agency Profile
    about: "",
    countriesServed: ["United States", "United Kingdom", "Canada", "Australia"],
    studyLevels: ["Undergraduate", "Master's"],
    servicesOffered: ["University Application", "Visa Assistance"],

    // Step 5: Experience & Capacity
    experience: {
      yearsOfExperience: 3,
      numberOfCounselors: 5,
      approximateStudentsServed: 150,
      partnerUniversities: [],
      certificationsMemberships: [],
    },

    // Step 6: Declarations
    confirmAccurate: false,
    agreeTerms: false,
  });

  // Partner uni & cert input helpers
  const [partnerUniInput, setPartnerUniInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // Sync initialData if provided when opening modal
  useEffect(() => {
    if (isOpen && initialData && (initialData.agencyName || initialData.name || initialData.email)) {
      setFormData((prev) => ({
        ...prev,
        agencyName: prev.agencyName || initialData.agencyName || initialData.name || "",
        officialBusinessEmail: prev.officialBusinessEmail || initialData.email || "",
        authorizedPerson: {
          ...prev.authorizedPerson,
          phone: prev.authorizedPerson?.phone || initialData.phone || "",
          email: prev.authorizedPerson?.email || initialData.email || "",
        },
      }));
    }
    if (applicationId) {
      setSubmittedAppId(applicationId);
    }
  }, [isOpen, initialData, applicationId]);

  // Load existing draft if present safely without crashing
  useEffect(() => {
    if (isOpen && token && typeof token === "string" && token.trim() !== "" && token !== "undefined") {
      const fetchDraft = async () => {
        try {
          setDraftLoadError("");
          const res = await api.get("/api/agency/verification", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res?.profile || res?.data?.profile) {
            const p = res?.profile || res?.data?.profile;
            setFormData((prev) => ({
              ...prev,
              agencyName: p.agencyName || prev.agencyName,
              legalName: p.legalName || prev.legalName,
              logo: p.logo || prev.logo,
              agencyType: p.agencyType || prev.agencyType,
              yearEstablished: p.yearEstablished || prev.yearEstablished,
              officeAddress: p.officeAddress || prev.officeAddress,
              country: p.country || prev.country,
              city: p.city || prev.city,
              website: p.website || prev.website,
              officialBusinessEmail: p.officialBusinessEmail || prev.officialBusinessEmail,
              authorizedPerson: {
                ...prev.authorizedPerson,
                ...(p.authorizedPerson || {}),
                identityDocument: {
                  ...prev.authorizedPerson?.identityDocument,
                  ...(p.authorizedPerson?.identityDocument || {}),
                },
              },
              businessVerification: {
                ...prev.businessVerification,
                ...(p.businessVerification || {}),
                tradeLicenseDocument: {
                  ...prev.businessVerification?.tradeLicenseDocument,
                  ...(p.businessVerification?.tradeLicenseDocument || {}),
                },
                businessRegistrationDocument: {
                  ...prev.businessVerification?.businessRegistrationDocument,
                  ...(p.businessVerification?.businessRegistrationDocument || {}),
                },
                tinDocument: {
                  ...prev.businessVerification?.tinDocument,
                  ...(p.businessVerification?.tinDocument || {}),
                },
              },
              about: p.about || prev.about,
              countriesServed:
                Array.isArray(p.countriesServed) && p.countriesServed.length > 0
                  ? p.countriesServed
                  : prev.countriesServed,
              studyLevels:
                Array.isArray(p.studyLevels) && p.studyLevels.length > 0
                  ? p.studyLevels
                  : prev.studyLevels,
              servicesOffered:
                Array.isArray(p.servicesOffered) && p.servicesOffered.length > 0
                  ? p.servicesOffered
                  : prev.servicesOffered,
              experience: {
                ...prev.experience,
                ...(p.experience || {}),
                partnerUniversities: Array.isArray(p.experience?.partnerUniversities)
                  ? p.experience.partnerUniversities
                  : prev.experience?.partnerUniversities || [],
                certificationsMemberships: Array.isArray(p.experience?.certificationsMemberships)
                  ? p.experience.certificationsMemberships
                  : prev.experience?.certificationsMemberships || [],
              },
              confirmAccurate: p.declarationsAccepted || false,
              agreeTerms: p.declarationsAccepted || false,
            }));

            if (p.applicationId) {
              setSubmittedAppId(p.applicationId);
            }

            if (p.verificationStatus === "UNDER_REVIEW" && p.isDraft === false) {
              setIsSuccess(true);
            }
          }
        } catch {
          // If draft fetch fails, do NOT crash or blank modal
          setDraftLoadError("Unable to retrieve saved draft from server. You can continue filling the form.");
        }
      };
      fetchDraft();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Field-specific label helper for user feedback
  const getDocLabel = (targetPath) => {
    switch (targetPath) {
      case "logo":
        return "Agency Logo";
      case "authorizedPerson.identityDocument":
        return "NID / Passport Copy";
      case "businessVerification.tradeLicenseDocument":
        return "Trade License Copy";
      case "businessVerification.businessRegistrationDocument":
        return "Business Registration Certificate";
      case "businessVerification.tinDocument":
        return "TIN Certificate";
      default:
        return "Document";
    }
  };

  // File Upload Helper
  const handleFileChange = (e, targetPath) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const label = getDocLabel(targetPath);
    const maxSizeBytes = targetPath === "logo" ? 2 * 1024 * 1024 : 3.5 * 1024 * 1024;
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);

    if (file.size > maxSizeBytes) {
      toast.error(`${label} is too large. Maximum allowed size is ${maxMb}MB.`);
      return;
    }

    const validTypes = targetPath === "logo"
      ? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      : [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

    if (!validTypes.includes(file.type)) {
      toast.error(
        targetPath === "logo"
          ? "Allowed logo formats: JPG, PNG, WEBP."
          : "Allowed file formats: PDF, JPG, PNG, WEBP."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const docPayload = {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        fileType: file.type,
        fileData: reader.result,
      };

      if (targetPath === "logo") {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      } else if (targetPath.startsWith("authorizedPerson.")) {
        const field = targetPath.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          authorizedPerson: { ...prev.authorizedPerson, [field]: docPayload },
        }));
      } else if (targetPath.startsWith("businessVerification.")) {
        const field = targetPath.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          businessVerification: {
            ...prev.businessVerification,
            [field]: docPayload,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (targetPath) => {
    if (targetPath === "logo") {
      setFormData((prev) => ({ ...prev, logo: "" }));
    } else if (targetPath.startsWith("authorizedPerson.")) {
      const field = targetPath.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        authorizedPerson: {
          ...prev.authorizedPerson,
          [field]: { fileName: "", fileSize: "", fileType: "", fileData: "" },
        },
      }));
    } else if (targetPath.startsWith("businessVerification.")) {
      const field = targetPath.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        businessVerification: {
          ...prev.businessVerification,
          [field]: { fileName: "", fileSize: "", fileType: "", fileData: "" },
        },
      }));
    }
  };

  // Validation per step
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.agencyName?.trim()) newErrors.agencyName = "Agency Name is required";
      if (!formData.legalName?.trim()) newErrors.legalName = "Official/Legal Agency Name is required";
      if (!formData.yearEstablished) newErrors.yearEstablished = "Year Established is required";
      if (!formData.officeAddress?.trim()) newErrors.officeAddress = "Office Address is required";
      if (!formData.country?.trim()) newErrors.country = "Country is required";
      if (!formData.city?.trim()) newErrors.city = "City is required";
      if (!formData.officialBusinessEmail?.trim()) {
        newErrors.officialBusinessEmail = "Official Business Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.officialBusinessEmail)) {
        newErrors.officialBusinessEmail = "Enter a valid email address";
      }
    }

    if (currentStep === 2) {
      const auth = formData.authorizedPerson;
      if (!auth.fullName?.trim()) newErrors.authFullName = "Full Name is required";
      if (!auth.phone?.trim()) newErrors.authPhone = "Phone Number is required";
      if (!auth.email?.trim()) newErrors.authEmail = "Email Address is required";
      if (!auth.identityNumber?.trim()) newErrors.authIdentityNumber = "NID/Passport Number is required";
      if (!auth.identityDocument?.fileData && !auth.identityDocument?.fileName) {
        newErrors.authIdentityDocument = "NID/Passport Copy document is required";
      }
    }

    if (currentStep === 3) {
      const biz = formData.businessVerification;
      if (!biz.tradeLicenseNumber?.trim()) newErrors.tradeLicenseNumber = "Trade License Number is required";
      if (!biz.tradeLicenseDocument?.fileData && !biz.tradeLicenseDocument?.fileName) {
        newErrors.tradeLicenseDocument = "Trade License Copy document is required";
      }
    }

    if (currentStep === 4) {
      if (!formData.about?.trim()) newErrors.about = "About Agency description is required";
      if (formData.countriesServed.length === 0) {
        newErrors.countriesServed = "Select at least one destination country served";
      }
      if (formData.servicesOffered.length === 0) {
        newErrors.servicesOffered = "Select at least one service offered";
      }
    }

    if (currentStep === 5) {
      const exp = formData.experience;
      if (exp.yearsOfExperience === "" || exp.yearsOfExperience === undefined || exp.yearsOfExperience < 0) {
        newErrors.yearsOfExperience = "Years of Experience is required";
      }
      if (!exp.numberOfCounselors || exp.numberOfCounselors < 1) {
        newErrors.numberOfCounselors = "Number of Counselors/Agents must be at least 1";
      }
    }

    if (currentStep === 6) {
      if (!formData.confirmAccurate) {
        newErrors.confirmAccurate = "You must confirm the accuracy of submitted information";
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "You must accept Admify's Agency Terms & Verification Policy";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 6));
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await api.put("/api/agency/verification/draft", formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Verification draft saved successfully.");
    } catch (err) {
      if (err.status === 413 || err.message?.toLowerCase().includes("large")) {
        toast.error("One or more uploaded documents are too large. Please reduce the file size (under 3.5MB each) and try again.");
      } else {
        toast.error(err.message || "Failed to save draft.");
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit Verification
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(6)) return;

    // Pre-flight check: total payload string size
    try {
      const payloadEstimate = JSON.stringify(formData);
      if (payloadEstimate.length > 35 * 1024 * 1024) {
        toast.error("Total uploaded documents exceed 25MB. Please compress your document scans (under 3.5MB each) before submitting.");
        return;
      }
    } catch {}

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        declarationsAccepted: Boolean(formData.confirmAccurate && formData.agreeTerms),
      };

      const res = await api.post("/api/agency/verification", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res?.success || res?.data?.success) {
        toast.success("Agency verification submitted successfully!");
        const finalAppId =
          res?.applicationId ||
          res?.data?.applicationId ||
          applicationId ||
          formData.applicationId ||
          "ADM-AGY-2026";
        setSubmittedAppId(finalAppId);
        setIsSuccess(true);
        if (onSubmitted) onSubmitted(res);
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to submit verification.");
      }
    } catch (err) {
      if (err.status === 413 || err.message?.toLowerCase().includes("large")) {
        toast.error("One or more uploaded documents are too large. Please reduce the file size (under 3.5MB each) and try again.");
      } else {
        toast.error(err.message || "Submission failed. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag list toggles
  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(item)
          ? current.filter((x) => x !== item)
          : [...current, item],
      };
    });
  };

  const addPartnerUni = () => {
    if (!partnerUniInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        partnerUniversities: [
          ...prev.experience.partnerUniversities,
          partnerUniInput.trim(),
        ],
      },
    }));
    setPartnerUniInput("");
  };

  const removePartnerUni = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        partnerUniversities: prev.experience.partnerUniversities.filter(
          (_, i) => i !== idx
        ),
      },
    }));
  };

  const addCert = () => {
    if (!certInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        certificationsMemberships: [
          ...prev.experience.certificationsMemberships,
          certInput.trim(),
        ],
      },
    }));
    setCertInput("");
  };

  const removeCert = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        certificationsMemberships: prev.experience.certificationsMemberships.filter(
          (_, i) => i !== idx
        ),
      },
    }));
  };

  // Reusable File Upload Box Component
  const FileUploadBox = ({ label, targetPath, fileObj, required, helper }) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {fileObj?.fileName || fileObj?.fileData ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
            <div className="flex items-center gap-3 overflow-hidden">
              {fileObj.fileType?.includes("pdf") ? (
                <FileText className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <ImageIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              )}
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                  {fileObj.fileName || "Uploaded document"}
                </p>
                <p className="text-[10px] text-slate-400">{fileObj.fileSize || "Verified"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(targetPath)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="relative flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 hover:border-primary-500/50 cursor-pointer transition-all group">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={(e) => handleFileChange(e, targetPath)}
            />
            <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary-400 mb-1 transition-colors" />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              Click to browse or drop file
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {helper || "PDF, JPG, PNG up to 5MB"}
            </span>
          </label>
        )}
      </div>
    );
  };

  const stepTitles = [
    { num: 1, title: "Basic Info", icon: Building2 },
    { num: 2, title: "Authorized Person", icon: UserCheck },
    { num: 3, title: "Business Verification", icon: ShieldCheck },
    { num: 4, title: "Agency Profile", icon: Globe },
    { num: 5, title: "Experience & Capacity", icon: Briefcase },
    { num: 6, title: "Declaration", icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary-500/20 text-primary-300 border border-primary-500/30">
                Official Agency
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Complete Agency Verification
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              To provide study-abroad services on Admify, please submit your agency and authorized representative information.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header (Only shown if not success) */}
        {!isSuccess && (
          <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[550px] gap-2">
              {stepTitles.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (step > s.num) setStep(s.num);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary-600/20 text-primary-300 border border-primary-500/40"
                        : isDone
                        ? "text-emerald-400 hover:bg-slate-800/50"
                        : "text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-primary-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                          : isDone
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body / Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {isSuccess ? (
            /* Confirmation Screen */
            <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
                  Status: Under Review
                </span>
                <h3 className="text-xl font-bold text-white">
                  Application Submitted Successfully
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Your agency registration has been submitted for verification.
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Admify Admin will review your submitted information and documents.
                  After approval, you will receive an email with your account activation instructions.
                </p>
              </div>

              {/* Application ID Pill */}
              <div className="p-3 rounded-xl bg-primary-950/40 border border-primary-500/30 text-center">
                <p className="text-[11px] font-semibold text-primary-300 uppercase tracking-wider">
                  Registration Reference
                </p>
                <p className="text-base font-extrabold text-white font-mono mt-0.5">
                  Application ID: {submittedAppId || applicationId || "ADM-AGY-2026"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-left text-xs space-y-1.5 text-slate-300">
                <p className="font-semibold text-white">Agency Details Recorded:</p>
                <p>• <span className="text-slate-400">Agency Name:</span> {formData.agencyName}</p>
                <p>• <span className="text-slate-400">Official Legal Name:</span> {formData.legalName || formData.agencyName}</p>
                <p>• <span className="text-slate-400">Country:</span> {formData.country}</p>
                <p>• <span className="text-slate-400">Authorized Representative:</span> {formData.authorizedPerson?.fullName} ({formData.authorizedPerson?.designation})</p>
                <p>• <span className="text-slate-400">Official Email:</span> {formData.officialBusinessEmail}</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                >
                  Close & Return to Login
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 1: Agency Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Agency Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.agencyName}
                        onChange={(e) =>
                          setFormData({ ...formData, agencyName: e.target.value })
                        }
                        placeholder="e.g. EduGlobal Admissions"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.agencyName && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.agencyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Official/Legal Agency Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.legalName}
                        onChange={(e) =>
                          setFormData({ ...formData, legalName: e.target.value })
                        }
                        placeholder="e.g. EduGlobal Admissions Consultancy Ltd."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.legalName && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.legalName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Agency Type <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={formData.agencyType}
                        onChange={(e) =>
                          setFormData({ ...formData, agencyType: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                        {AGENCY_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-slate-900 text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Year Established <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={formData.yearEstablished}
                        onChange={(e) =>
                          setFormData({ ...formData, yearEstablished: Number(e.target.value) })
                        }
                        placeholder="e.g. 2016"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.yearEstablished && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.yearEstablished}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Office Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.officeAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, officeAddress: e.target.value })
                      }
                      placeholder="e.g. Suite 4B, Concord Tower, Gulshan-2 / 120 Fleet St, London"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                    />
                    {errors.officeAddress && (
                      <p className="text-rose-400 text-[11px] mt-1">{errors.officeAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Country <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                        {GLOBAL_COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.country}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        City <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="e.g. Dhaka, London, Toronto, Sydney"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.city && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Official Business Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.officialBusinessEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, officialBusinessEmail: e.target.value })
                        }
                        placeholder="contact@eduglobal.com"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.officialBusinessEmail && (
                        <p className="text-rose-400 text-[11px] mt-1">
                          {errors.officialBusinessEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Website <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder="https://www.eduglobal.com"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Agency Logo <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <FileUploadBox
                      label=""
                      targetPath="logo"
                      fileObj={
                        formData.logo
                          ? { fileName: "agency-logo.png", fileSize: "Ready", fileType: "image/png", fileData: formData.logo }
                          : null
                      }
                      helper="Square or landscape PNG/JPG up to 5MB"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Authorized Person */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-primary-950/30 border border-primary-800/30 text-xs text-primary-200">
                    This is the person who officially operates/manages the agency account (e.g. Managing Director, Owner, or authorized representative).
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.authorizedPerson.fullName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorizedPerson: {
                              ...formData.authorizedPerson,
                              fullName: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.authFullName && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.authFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Designation <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={formData.authorizedPerson.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorizedPerson: {
                              ...formData.authorizedPerson,
                              designation: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                        {DESIGNATIONS.map((d) => (
                          <option key={d} value={d} className="bg-slate-900 text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.authorizedPerson.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorizedPerson: {
                              ...formData.authorizedPerson,
                              phone: e.target.value,
                            },
                          })
                        }
                        placeholder="+880 1700-000000"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.authPhone && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.authPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.authorizedPerson.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorizedPerson: {
                              ...formData.authorizedPerson,
                              email: e.target.value,
                            },
                          })
                        }
                        placeholder="representative@eduglobal.com"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.authEmail && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.authEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        NID / Passport Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.authorizedPerson.identityNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorizedPerson: {
                              ...formData.authorizedPerson,
                              identityNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="NID or Passport number"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.authIdentityNumber && (
                        <p className="text-rose-400 text-[11px] mt-1">
                          {errors.authIdentityNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <FileUploadBox
                        label="NID / Passport Copy"
                        targetPath="authorizedPerson.identityDocument"
                        fileObj={formData.authorizedPerson.identityDocument}
                        required
                        helper="Clear scanned copy in PDF, JPG, or PNG"
                      />
                      {errors.authIdentityDocument && (
                        <p className="text-rose-400 text-[11px] mt-1">
                          {errors.authIdentityDocument}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Business Verification */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                    Admify supports both domestic and global educational consultancies. Provide your official government-issued Trade License or corporate business registration documents.
                  </div>

                  {/* Required: Trade License */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Trade License Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.businessVerification.tradeLicenseNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessVerification: {
                              ...formData.businessVerification,
                              tradeLicenseNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. TRAD/DNCC/123456/2024"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.tradeLicenseNumber && (
                        <p className="text-rose-400 text-[11px] mt-1">
                          {errors.tradeLicenseNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <FileUploadBox
                        label="Trade License Copy"
                        targetPath="businessVerification.tradeLicenseDocument"
                        fileObj={formData.businessVerification.tradeLicenseDocument}
                        required
                        helper="Scanned valid trade license (PDF or Image)"
                      />
                      {errors.tradeLicenseDocument && (
                        <p className="text-rose-400 text-[11px] mt-1">
                          {errors.tradeLicenseDocument}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional: Business Registration */}
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Additional Corporate & Tax Documents (Optional / Country-Specific)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Business Registration Number <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessVerification.businessRegistrationNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessVerification: {
                                ...formData.businessVerification,
                                businessRegistrationNumber: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g. C-198273/2021"
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <FileUploadBox
                          label="Business Registration Certificate"
                          targetPath="businessVerification.businessRegistrationDocument"
                          fileObj={formData.businessVerification.businessRegistrationDocument}
                          helper="Certificate of Incorporation / Reg doc"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          TIN Number <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessVerification.tinNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessVerification: {
                                ...formData.businessVerification,
                                tinNumber: e.target.value,
                              },
                            })
                          }
                          placeholder="Tax Identification Number"
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <FileUploadBox
                          label="TIN Certificate"
                          targetPath="businessVerification.tinDocument"
                          fileObj={formData.businessVerification.tinDocument}
                          helper="Tax registration certificate"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        BIN / VAT Number <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.businessVerification.binVatNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessVerification: {
                              ...formData.businessVerification,
                              binVatNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. 002938475-0101"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Agency Profile */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      About Agency <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.about}
                      onChange={(e) =>
                        setFormData({ ...formData, about: e.target.value })
                      }
                      placeholder="Describe your consultancy's background, counseling specialties, student focus, and mission..."
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                    />
                    {errors.about && (
                      <p className="text-rose-400 text-[11px] mt-1">{errors.about}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Countries Served <span className="text-rose-400">*</span> (Select all destinations you recruit for)
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                      {POPULAR_DESTINATIONS.map((c) => {
                        const isSelected = formData.countriesServed.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleArrayItem("countriesServed", c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-primary-600 text-white shadow-md shadow-primary-900/40 border border-primary-500"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                    {errors.countriesServed && (
                      <p className="text-rose-400 text-[11px] mt-1">{errors.countriesServed}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Study Levels Catered
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {STUDY_LEVELS.map((lvl) => {
                        const isSelected = formData.studyLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleArrayItem("studyLevels", lvl)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-500"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Services Offered <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SERVICES_LIST.map((srv) => {
                        const isSelected = formData.servicesOffered.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => toggleArrayItem("servicesOffered", srv)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {srv}
                          </button>
                        );
                      })}
                    </div>
                    {errors.servicesOffered && (
                      <p className="text-rose-400 text-[11px] mt-1">{errors.servicesOffered}</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Experience & Capacity */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Years of Experience <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience.yearsOfExperience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: {
                              ...formData.experience,
                              yearsOfExperience: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.yearsOfExperience && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.yearsOfExperience}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Counselors / Agents <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.experience.numberOfCounselors}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: {
                              ...formData.experience,
                              numberOfCounselors: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      {errors.numberOfCounselors && (
                        <p className="text-rose-400 text-[11px] mt-1">{errors.numberOfCounselors}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Approx. Students Served
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience.approximateStudentsServed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: {
                              ...formData.experience,
                              approximateStudentsServed: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Partner Universities */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Partner Universities / Direct Institutional Contracts <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={partnerUniInput}
                        onChange={(e) => setPartnerUniInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addPartnerUni();
                          }
                        }}
                        placeholder="e.g. University of Toronto, Coventry University"
                        className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={addPartnerUni}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    {formData.experience.partnerUniversities.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                        {formData.experience.partnerUniversities.map((uni, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700"
                          >
                            {uni}
                            <button
                              type="button"
                              onClick={() => removePartnerUni(idx)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Professional Certifications / Memberships */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Professional Certifications / Industry Memberships <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCert();
                          }
                        }}
                        placeholder="e.g. ICEF Trained Agent, British Council Certified, PIER, AIRC"
                        className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={addCert}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    {formData.experience.certificationsMemberships.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                        {formData.experience.certificationsMemberships.map((cert, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs border border-slate-700"
                          >
                            {cert}
                            <button
                              type="button"
                              onClick={() => removeCert(idx)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: Verification Declaration */}
              {step === 6 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Submission Overview
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <p>
                        <span className="text-slate-500">Agency:</span>{" "}
                        <strong className="text-white">{formData.agencyName}</strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Legal Name:</span>{" "}
                        <strong className="text-white">{formData.legalName}</strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Country & City:</span>{" "}
                        {formData.city}, {formData.country}
                      </p>
                      <p>
                        <span className="text-slate-500">Authorized Rep:</span>{" "}
                        {formData.authorizedPerson?.fullName || "Not specified"} ({formData.authorizedPerson?.designation || ""})
                      </p>
                      <p>
                        <span className="text-slate-500">Trade License:</span>{" "}
                        {formData.businessVerification?.tradeLicenseNumber || "Not specified"}
                      </p>
                      <p>
                        <span className="text-slate-500">Countries Served:</span>{" "}
                        {formData.countriesServed?.join(", ") || "None specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.confirmAccurate}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmAccurate: e.target.checked })
                        }
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500 bg-slate-900 border-slate-700 w-4 h-4"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I confirm that the information and documents provided are accurate and belong to this agency. <span className="text-rose-400">*</span>
                      </span>
                    </label>
                    {errors.confirmAccurate && (
                      <p className="text-rose-400 text-[11px] px-1">{errors.confirmAccurate}</p>
                    )}

                    <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) =>
                          setFormData({ ...formData, agreeTerms: e.target.checked })
                        }
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500 bg-slate-900 border-slate-700 w-4 h-4"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I agree to Admify's Agency Terms & Verification Policy. <span className="text-rose-400">*</span>
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="text-rose-400 text-[11px] px-1">{errors.agreeTerms}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls (Only if not success) */}
        {!isSuccess && (
          <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between sticky bottom-0 z-20">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Skip for Now
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all flex items-center gap-1.5"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Submit for Verification
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
