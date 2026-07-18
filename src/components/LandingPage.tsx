import React, { useState, useEffect } from "react";
import { createInquiry, subscribeJobOffers } from "../lib/dataService";
import { JobOffer, Inquiry } from "../types";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  Network, 
  Laptop, 
  Server, 
  Menu, 
  X, 
  CheckCircle2,
  Clock,
  ChevronRight,
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  Info,
  User,
  ArrowLeft
} from "lucide-react";
// @ts-ignore
import LetaLogo from "../../assets/LetaLogo.png";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Job Offers state
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [viewingJobOffer, setViewingJobOffer] = useState<JobOffer | null>(null);
  const [selectedOfferForApply, setSelectedOfferForApply] = useState<JobOffer | null>(null);

  // Job Apply Form States
  const [applyName, setApplyName] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyExperience, setApplyExperience] = useState("");
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  
  // Enhanced candidate fields
  const [applyBranch, setApplyBranch] = useState("Atlanta HQ");
  const [applyExperienceYears, setApplyExperienceYears] = useState("1-3 Years");
  const [applyCertification, setApplyCertification] = useState("None");
  const [applyHasLicense, setApplyHasLicense] = useState(true);
  const [applyHasTransportation, setApplyHasTransportation] = useState(true);
  const [applyOwnsTools, setApplyOwnsTools] = useState(true);
  const [applyExpectedPay, setApplyExpectedPay] = useState("");
  const [applyAvailability, setApplyAvailability] = useState("Full-time");
  
  // Future employee account credentials setup
  const [applyProposedEmail, setApplyProposedEmail] = useState("");
  const [applyConfirmedName, setApplyConfirmedName] = useState("");
  const [applyProposedPassword, setApplyProposedPassword] = useState("");

  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Subscribe to Job Offers
  useEffect(() => {
    const unsubscribe = subscribeJobOffers((offers) => {
      // Filter active job listings to show the candidates
      setJobOffers(offers.filter(o => o.status === "active"));
    });
    return () => unsubscribe();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    
    setSubmitting(true);
    setSubmitError(null);

    const emailBody = `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`;
    const mailtoUrl = `mailto:techs@leta.repair?subject=${encodeURIComponent(contactSubject || "Dispatch Request")}&body=${encodeURIComponent(emailBody)}`;

    try {
      // 1. Save directly to Firestore as requested by user
      const inquiryPayload = {
        id: `inq-${Date.now()}`,
        name: contactName,
        email: contactEmail,
        subject: contactSubject || "Dispatch Request",
        message: contactMessage,
        createdAt: new Date().toISOString(),
        read: false,
      };
      await createInquiry(inquiryPayload);

      // 2. Try secondary REST POST endpoint (might return 404 in static hosting/Netlify, so we catch silently)
      try {
        await fetch("/api/contact-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: contactName,
            email: contactEmail,
            subject: contactSubject,
            message: contactMessage,
          }),
        });
      } catch (postErr) {
        console.warn("REST endpoint skipped/not available (statically hosted). Saved in Firestore successfully.", postErr);
      }

      setFormSubmitted(true);
      // Reset fields
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      console.error("Error saving contact form to Firestore, falling back to direct email:", err);
      // Fallback to mailto link if network is blocked/404/CORS/hosting issues
      window.location.href = mailtoUrl;
      setFormSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetOffer = selectedOfferForApply || viewingJobOffer;
    if (!targetOffer) return;
    
    if (!applyName || !applyEmail || !applyPhone || !applyExperience || !applyCoverLetter) {
      setApplyError("Please fill in all required fields.");
      return;
    }

    if (!applyProposedEmail) {
      setApplyError("Please specify the email you wish to use for logging into your employee account.");
      return;
    }

    if (!applyConfirmedName) {
      setApplyError("Please retype your full legal name to verify and configure your future account.");
      return;
    }

    if (applyConfirmedName.trim().toLowerCase() !== applyName.trim().toLowerCase()) {
      setApplyError("Retyped Full Name must match your Full Name exactly.");
      return;
    }

    if (!applyProposedPassword) {
      setApplyError("Please choose a proposed passcode to secure your future employee account.");
      return;
    }

    setApplySubmitting(true);
    setApplyError(null);

    try {
      const applicationPayload: Inquiry = {
        id: `appl-${Date.now()}`,
        name: applyName,
        email: applyEmail,
        subject: `Application: ${targetOffer.title}`,
        message: applyCoverLetter,
        createdAt: new Date().toISOString(),
        read: false,
        type: "job_application",
        jobOfferId: targetOffer.id,
        jobTitle: targetOffer.title,
        phone: applyPhone,
        resumeText: applyExperience,
        preferredBranch: applyBranch,
        hasLicense: applyHasLicense,
        certifications: applyCertification !== "None" ? [applyCertification] : [],
        ownsTools: applyOwnsTools,
        hasTransportation: applyHasTransportation,
        expectedPay: applyExpectedPay,
        experienceYears: applyExperienceYears,
        availability: applyAvailability as "Full-time" | "Part-time" | "Contract",
        proposedLoginEmail: applyProposedEmail,
        confirmedFullName: applyConfirmedName,
        proposedPassword: applyProposedPassword
      };
      await createInquiry(applicationPayload);

      setApplySubmitted(true);
      // Reset fields
      setApplyName("");
      setApplyEmail("");
      setApplyPhone("");
      setApplyExperience("");
      setApplyCoverLetter("");
      setApplyBranch("Atlanta HQ");
      setApplyExperienceYears("1-3 Years");
      setApplyCertification("None");
      setApplyHasLicense(true);
      setApplyHasTransportation(true);
      setApplyOwnsTools(true);
      setApplyExpectedPay("");
      setApplyAvailability("Full-time");
      setApplyProposedEmail("");
      setApplyConfirmedName("");
      setApplyProposedPassword("");
    } catch (err) {
      console.error("Error submitting job application to Firestore:", err);
      setApplyError("Transmission failed. Please retry or contact techs@leta.repair directly.");
    } finally {
      setApplySubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (viewingJobOffer) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 animate-fadeIn">
        {/* Sub-page Navigation Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingJobOffer(null)}>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                <img 
                  src={LetaLogo} 
                  alt="Leta Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.nextElementSibling;
                    if (fb) {
                      fb.classList.remove("hidden");
                      fb.classList.add("flex");
                    }
                  }}
                />
                <div className="hidden p-2 bg-indigo-600 text-white w-full h-full items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                  Leta Technologies
                </span>
                <span className="font-mono text-[9px] text-indigo-600 uppercase tracking-widest block font-bold">
                  Careers Desk
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setViewingJobOffer(null);
                setApplySubmitted(false);
                setApplyError(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Listings</span>
            </button>
          </div>
        </header>

        {/* Sub-page Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <button 
              onClick={() => {
                setViewingJobOffer(null);
                setApplySubmitted(false);
                setApplyError(null);
              }} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Careers List
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600 truncate max-w-[150px] sm:max-w-none font-medium">{viewingJobOffer.title}</span>
          </div>

          {/* Job Info Hero Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-left space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950 leading-tight">
                  {viewingJobOffer.title}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase">
                  {viewingJobOffer.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-2 font-sans">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <strong className="text-slate-800">{viewingJobOffer.location}</strong>
                </span>
                <span className="flex items-center gap-2 font-sans">
                  <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                  <strong className="text-emerald-700">{viewingJobOffer.salaryRange || "Competitive"}</strong>
                </span>
                <span className="flex items-center gap-2 font-sans">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Listed on {new Date(viewingJobOffer.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-sans font-bold text-[10px] text-indigo-600 uppercase tracking-wider block">
                Role Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                {viewingJobOffer.description}
              </p>
            </div>

            {/* Requirements */}
            {viewingJobOffer.requirements && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-sans font-bold text-[10px] text-indigo-600 uppercase tracking-wider block">
                  Role Requirements &amp; Qualifications
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {viewingJobOffer.requirements}
                </p>
              </div>
            )}
          </div>

          {/* Quick Info Protocol Callout */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 text-left flex gap-4 items-start shadow-2xs">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-sans font-extrabold text-indigo-950 text-xs sm:text-sm leading-tight">
                Georgia Technician Onboarding Protocol
              </h4>
              <p className="text-[11px] sm:text-xs text-indigo-800/90 leading-relaxed font-sans">
                Leta Technologies LLC maintains registered field branches across Georgia. Field dispatch roles require active coordinate mapping, tool validation, and compliance with local safety regulations.
              </p>
            </div>
          </div>

          {/* Comprehensive Application Form directly integrated here */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-left space-y-6 shadow-2xs">
            <div className="space-y-1">
              <h2 className="font-sans font-extrabold text-lg sm:text-xl text-slate-950 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Job Application Form</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Please complete this comprehensive application to join our dispatch dispatch network.
              </p>
            </div>

            <hr className="border-slate-100" />

            {applySubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-sans font-bold text-lg text-slate-900">Application Received!</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto text-center">
                  Thank you for applying for the **{viewingJobOffer.title}** position. Your profile, certification status, branch choice, and tool details have been securely cataloged inside the operations database. A Georgia regional coordinator will contact you shortly.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setViewingJobOffer(null);
                      setApplySubmitted(false);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Careers List</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-6">
                
                {/* 1. Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    1. Contact &amp; Geographic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Robert Smith"
                        value={applyName}
                        onChange={(e) => setApplyName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. robert@example.com"
                        value={applyEmail}
                        onChange={(e) => setApplyEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. (404) 555-0199"
                        value={applyPhone}
                        onChange={(e) => setApplyPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Nearest Georgia Branch Base *
                      </label>
                      <select
                        value={applyBranch}
                        onChange={(e) => setApplyBranch(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      >
                        <option value="Atlanta HQ">Atlanta HQ (Main Branch)</option>
                        <option value="Savannah Office">Savannah Office</option>
                        <option value="Augusta Hub">Augusta Hub</option>
                        <option value="Columbus Dispatch">Columbus Dispatch</option>
                        <option value="Macon Base">Macon Base</option>
                        <option value="Athens Sector">Athens Sector</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Professional Background */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    2. Technical Credentials &amp; Certifications
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Field Experience (Years) *
                      </label>
                      <select
                        value={applyExperienceYears}
                        onChange={(e) => setApplyExperienceYears(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      >
                        <option value="Entry-Level (<1 Year)">Entry-Level (&lt;1 Year)</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years Expert">10+ Years Expert</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Primary Certification *
                      </label>
                      <select
                        value={applyCertification}
                        onChange={(e) => setApplyCertification(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      >
                        <option value="None">No Active Certification</option>
                        <option value="CompTIA Network+ / A+">CompTIA Network+ / A+</option>
                        <option value="Cisco Certified (CCNA/CCNP)">Cisco Certified (CCNA/CCNP)</option>
                        <option value="HVAC / EPA Universal">HVAC / EPA Universal</option>
                        <option value="Fiber Optics Certified (FOA)">Fiber Optics Certified (FOA)</option>
                        <option value="OSHA-10 / OSHA-30 Safety">OSHA-10 / OSHA-30 Safety</option>
                        <option value="BICSI Cabling Tech">BICSI Cabling Tech</option>
                        <option value="Other Industry License">Other Industry License</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Expected Pay Rate ($/hr) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. $28.50"
                        value={applyExpectedPay}
                        onChange={(e) => setApplyExpectedPay(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Availability
                      </label>
                      <select
                        value={applyAvailability}
                        onChange={(e) => setApplyAvailability(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-sans"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract / On-Call</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                        Valid Georgia DL?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setApplyHasLicense(true)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            applyHasLicense 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setApplyHasLicense(false)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            !applyHasLicense 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                        Reliable Vehicle?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setApplyHasTransportation(true)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            applyHasTransportation 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setApplyHasTransportation(false)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            !applyHasTransportation 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                        Standard Hand Tools?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setApplyOwnsTools(true)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            applyOwnsTools 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setApplyOwnsTools(false)}
                          className={`flex-1 py-1 text-center font-sans font-bold text-xs rounded-lg border cursor-pointer transition-all ${
                            !applyOwnsTools 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Narrative Experience */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    3. Professional Qualifications Summary
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Qualifications, Prior Work History &amp; Certifications *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="List your previous field dispatcher / engineering roles, equipment you can service, and any other credentials."
                      value={applyExperience}
                      onChange={(e) => setApplyExperience(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Cover Letter / Statement of Interest *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Why do you want to join the Leta Technologies LLC Georgia field network?"
                      value={applyCoverLetter}
                      onChange={(e) => setApplyCoverLetter(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                    />
                  </div>
                </div>

                {/* 4. Choose & Configure Future Employee Account */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    4. Choose &amp; Configure Future Employee Account
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Configure your future login credentials for the Leta Employee Portal. If hired, this profile will be activated immediately by the operations team.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Preferred Login Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. robert.smith@letatech.com"
                        value={applyProposedEmail}
                        onChange={(e) => setApplyProposedEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        This email address will be your corporate username.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Retype Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Must match your Full Name exactly"
                        value={applyConfirmedName}
                        onChange={(e) => setApplyConfirmedName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Retype your legal name to verify and sign this application.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 max-w-sm">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Proposed Portal Passcode / Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={applyProposedPassword}
                      onChange={(e) => setApplyProposedPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Set a secure password for your potential future employee account.
                    </span>
                  </div>
                </div>

                {applyError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-xs text-rose-700 font-semibold rounded-lg">
                    {applyError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingJobOffer(null);
                      setApplyError(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-sans text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applySubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {applySubmitting ? "Submitting Application..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        {/* Short footer */}
        <footer className="bg-slate-900 text-slate-500 text-[11px] py-6 border-t border-slate-800/60 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            &copy; {new Date().getFullYear()} Leta Technologies LLC. Registered dispatch operations inside the State of Georgia.
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900" id="home">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
              <img 
                src={LetaLogo} 
                alt="Leta Technologies LLC Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) {
                    fb.classList.remove("hidden");
                    fb.classList.add("flex");
                  }
                }}
              />
              <div className="hidden p-2 bg-indigo-600 rounded-lg text-white w-full h-full items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                Leta Technologies LLC
              </span>
              <span className="font-mono text-[9px] text-indigo-600 uppercase tracking-widest block font-bold">
                Dispatch
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("home")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("about")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("services")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection("careers")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Careers
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Login Action & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
              id="desktop-login-button"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Login</span>
            </button>

            {/* Mobile burger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-fadeIn">
            <div className="px-4 py-4 space-y-3 flex flex-col">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("careers")}
                className="text-left py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Careers
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Contact
              </button>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold tracking-wide cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-radial from-indigo-50/50 via-slate-50 to-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              
              {/* Left Column Content */}
              <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs text-indigo-700 font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  Georgia Regional IT Dispatch & Logistics
                </div>

                <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-tight">
                  Premium Onsite IT Solutions <br className="hidden sm:inline" />
                  <span className="text-indigo-600">Dispatched in Real-Time</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-650 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Leta Technologies LLC provides elite technical dispatch and localized support services. 
                  We manage networks, configure hardware, and solve infrastructure emergencies across Georgia, 
                  matching your location with certified smart-hands engineers instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => scrollToSection("services")}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explore Our Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-sm border border-slate-250 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Contact Sales</span>
                  </button>
                </div>

                {/* Regional highlights stats line */}
                <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">Georgia Statewide Coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">All 159 Counties Covered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">24/7 Dispatch Control</span>
                  </div>
                </div>
              </div>

              {/* Right Column Illustration */}
              <div className="hidden lg:block lg:col-span-5 relative">
                <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-3xl transform rotate-6 scale-90"></div>
                <div className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-6">
                  
                  {/* Mock Ticket Hub Frame */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                    </div>
                    <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Leta Dispatch Live
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="p-2 bg-indigo-500 text-white rounded-lg">
                        <Network className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[10px] text-slate-400 block font-bold font-mono">TICKET #42901 - ASSIGNED</span>
                        <h4 className="text-xs font-bold text-slate-900">Configure Fiber Router</h4>
                        <p className="text-[11px] text-slate-500">Peachtree Tower, Atlanta GA</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start p-3 bg-white border border-slate-150 rounded-xl">
                      <div className="p-2 bg-indigo-500 text-white rounded-lg">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[10px] text-slate-400 block font-bold font-mono">TICKET #42905 - IN PROGRESS</span>
                        <h4 className="text-xs font-bold text-slate-900">Switch Rack Diagnostics</h4>
                        <p className="text-[11px] text-slate-500">Regional Distribution, Savannah GA</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start p-3 bg-white border border-slate-150 rounded-xl">
                      <div className="p-2 bg-emerald-500 text-white rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[10px] text-emerald-600 block font-bold font-mono">TICKET #42890 - RESOLVED</span>
                        <h4 className="text-xs font-bold text-slate-900">Active Directory Restoration</h4>
                        <p className="text-[11px] text-slate-500">Broad Street Healthcare, Augusta GA</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Average ETA: 52 mins</span>
                    </span>
                    <button onClick={onLoginClick} className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer">
                      <span>Access Staff Hub</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white border-t border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                Our Corporate Identity
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950">
                Pioneering IT Logistics Across Georgia
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Leta Technologies LLC is structured to serve as the unified bridge between complex organizational hardware challenges and regional dispatch professionals. From small business office switches to complex server migrations, we provide the technical infrastructure and on-demand labor needed to succeed.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 sm:mt-16">
              
              <div className="bg-slate-50 border border-slate-200/60 p-6 sm:p-8 rounded-xl space-y-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-slate-900 text-sm sm:text-base">
                  Corporate Integrity
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We guarantee fully-vetted, background-checked, and highly-certified Georgia tech personnel. Your physical security and virtual access rules are strictly respected.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-6 sm:p-8 rounded-xl space-y-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-slate-900 text-sm sm:text-base">
                  Rapid Local Dispatch
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Utilizing our proprietary branch-coordination database system, we route technicians across the entire state of Georgia to guarantee rapid statewide onsite support.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-6 sm:p-8 rounded-xl space-y-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-slate-900 text-sm sm:text-base">
                  Full-Stack Coverage
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our dispatch operations handle hardware swaps, ethernet termination, diagnostic audits, POS restoration, server rack organization, and cloud handoffs.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                Services Catalog
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950">
                Complete Field Engineering & Support
              </h2>
              <p className="text-sm text-slate-500">
                Enterprise capability combined with local precision. Here are the core disciplines we dispatch daily:
              </p>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              
              {/* Service 1 */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Network className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900">
                    Network Engineering
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Fiber optics installation, Cat6 structured cabling, switch/router stack programming, and secure Wi-Fi heatmapping.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block pt-2">
                  Statewide Georgia Coverage
                </span>
              </div>

              {/* Service 2 */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900">
                    Infrastructure & Servers
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Rack configurations, uninterruptible power supplies (UPS) replacement, cooling checks, and hypervisor audits.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block pt-2">
                  Georgia Server Care
                </span>
              </div>

              {/* Service 3 */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900">
                    Workstation Deployments
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mass office workstation updates, computer peripherals mapping, active directory join, and endpoint security configuration.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block pt-2">
                  Georgia Onsite Support
                </span>
              </div>

              {/* Service 4 */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900">
                    Urgent Smart-Hands
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Physical hardware verification, remote console diagnostics loop-ins, motherboard replacement, and critical POS recovery.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block pt-2">
                  Emergency 1HR Dispatch
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* Careers / Job Opportunities Section */}
        <section id="careers" className="py-20 bg-white border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                Join Our Network
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-950">
                Leta Field Engineer & Technician Careers
              </h2>
              <p className="text-sm text-slate-500">
                We are actively recruiting skilled field engineers, IT coordinators, smart-hands technicians, and apprentices throughout Georgia. See active openings below and apply in 60 seconds.
              </p>
            </div>

            {/* Job Openings Grid */}
            <div className="mt-12 max-w-4xl mx-auto space-y-6">
              {jobOffers.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-indigo-500 mx-auto" />
                  <h3 className="font-sans font-bold text-sm text-slate-800">
                    No active listings at this moment
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Our Georgia dispatch operations are growing. If you are an experienced field engineer looking to join our roster, please send your resume and details directly to our mailroom at <strong className="text-indigo-600">techs@leta.repair</strong>.
                  </p>
                </div>
              ) : (
                jobOffers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="bg-slate-50 hover:bg-indigo-50/5 border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all text-left shadow-2xs"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans font-extrabold text-slate-950 text-base sm:text-lg leading-tight">
                          {offer.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase">
                          {offer.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {offer.location}
                        </span>
                        <span className="flex items-center gap-1.5 font-sans">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {offer.salaryRange || "Competitive"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setViewingJobOffer(offer);
                        setApplySubmitted(false);
                        setApplyError(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-extrabold rounded-lg transition-all shadow-xs shrink-0 cursor-pointer text-center sm:self-center self-start"
                    >
                      View Details &amp; Apply
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              
              {/* Left Side: Contact details */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                    Contact Us
                  </span>
                  <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 mt-3">
                    Connect With Our Georgia Dispatch Office
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Ready to schedule an onsite engineer or discuss corporate retainer options? 
                    Fill out our contact form and an operations coordinator will contact you immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-600 shrink-0">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Phone Support</h4>
                      <p className="text-xs text-slate-500 mt-0.5">(470) 252-6681</p>
                      <p className="text-[10px] text-slate-400 font-mono">Georgia HQ Office Line</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-600 shrink-0">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Corporate Email</h4>
                      <p className="text-xs text-slate-500 mt-0.5">techs@leta.repair</p>
                      <p className="text-[10px] text-slate-400 font-mono">Operations & Accounts Team</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-600 shrink-0">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Headquarters Address</h4>
                      <p className="text-xs text-slate-500 mt-0.5">4646 Buford Hwy</p>
                      <p className="text-[10px] text-slate-400">Atlanta, GA 30309</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="lg:col-span-7 mt-8 lg:mt-0">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                  {formSubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-sans font-bold text-base text-slate-900">Message Received!</h3>
                      <p className="text-xs text-slate-550 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out to Leta Technologies LLC. Your information has been delivered to our dispatch team at <span className="font-semibold text-indigo-600">techs@leta.repair</span>. An operations manager will follow up via email or phone shortly.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide transition-all cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Robert Georgia"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. robert@company.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Inquiry Subject
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Onsite Cabling Quote"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Message Body
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Please describe your equipment type, location in Georgia, and technical problem..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
                        ></textarea>
                      </div>

                      {submitError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs leading-relaxed">
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <span>{submitting ? "Sending..." : "Submit Dispatch Request"}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            
            {/* Logo Brand Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-white p-1">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  Leta Technologies LLC
                </span>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">
                  Georgia Field Office Network
                </span>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-xs hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-xs hover:text-white transition-colors cursor-pointer"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="text-xs hover:text-white transition-colors cursor-pointer"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-xs hover:text-white transition-colors cursor-pointer"
              >
                Contact
              </button>
              <button 
                onClick={onLoginClick}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
              >
                Portal Login
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p className="m-0 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Leta Technologies LLC. All rights reserved. Registered dispatch operations inside the State of Georgia.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-slate-300 transition-colors cursor-pointer underline"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setShowTermsModal(true)}
                className="hover:text-slate-300 transition-colors cursor-pointer underline"
              >
                Terms and Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Privacy Policy Modal --- */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-sans font-bold">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Privacy Policy</span>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-left text-xs text-slate-600 space-y-4">
              <p className="font-semibold text-slate-900">Effective Date: July 14, 2026</p>
              
              <h4 className="font-bold text-slate-900 uppercase">1. Information We Collect</h4>
              <p>
                Leta Technologies LLC collects necessary business operational metrics including corporate identifiers, email communications, telephone contact data, physical site addresses, coordinates, branch mappings, and onsite technician service ticket comments. We secure password data using cryptographic hashes via Google Firebase Authentication.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">2. Storage and Security Standards</h4>
              <p>
                All databases, comments, and technician logs are parsed and synchronized within private Google Cloud regional storage clusters. No client network credentials or diagnostics logs are distributed outside our secure Georgia office boundaries.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">3. Information Distribution</h4>
              <p>
                Leta Technologies LLC never sells, leases, or lends dispatch coordinates, technician rates, client information lists, or service log collections to third-party databases. Data is solely utilized for active dispatch management, regional reporting, and local payroll processing.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">4. Contact Information</h4>
              <p>
                For regional inquiries, please email our privacy team at <span className="font-mono text-indigo-600">privacy@leta.repair</span> or call our Georgia line at (770) 555-0199.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Terms and Conditions Modal --- */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-sans font-bold">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Terms & Conditions</span>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-left text-xs text-slate-600 space-y-4">
              <p className="font-semibold text-slate-900">Effective Date: July 14, 2026</p>
              
              <h4 className="font-bold text-slate-900 uppercase">1. Onsite Service and Dispatch Rules</h4>
              <p>
                By requesting onsite services, client designates Leta Technologies LLC as their premium provider of "smart-hands" diagnostic repairs. Standard dispatch scheduling remains subject to physical personnel availability throughout all Georgia counties.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">2. Staff Portal Rules and Usage</h4>
              <p>
                Access to the Leta Technologies LLC Staff Hub (including Chat, active tickets, and branch logs) is strictly reserved for authenticated administrators and registered personnel whose status has been verified and set to ACTIVE. Misuse of communication parameters or ticket modification endpoints will terminate portal privileges immediately.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">3. Service Warranties & Limits</h4>
              <p>
                Leta Technologies LLC performs diagnostics according to standard engineering best-practices. We are not liable for pre-existing client server errors, local telecom dropouts, or hardware component degradation.
              </p>

              <h4 className="font-bold text-slate-900 uppercase">4. Governing Jurisdiction</h4>
              <p>
                These legal parameters and terms of dispatch are bound exclusively to the legislation of the State of Georgia, USA.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Agree & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Online Job Application Modal --- */}
      {selectedOfferForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-left">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-sans font-extrabold text-sm sm:text-base">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Apply: {selectedOfferForApply.title}</span>
              </div>
              <button
                onClick={() => setSelectedOfferForApply(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {applySubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-sans font-bold text-base text-slate-900">Application Received!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto text-center">
                    Thank you for applying for the **{selectedOfferForApply.title}** position with Leta Technologies. Your information has been delivered to our administrative coordinators. An operations manager will evaluate your application and contact you soon.
                  </p>
                  <button
                    onClick={() => setSelectedOfferForApply(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide transition-all cursor-pointer mx-auto block"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedOfferForApply.location} • {selectedOfferForApply.salaryRange}</span>
                    </div>
                    <p className="font-sans leading-normal">
                      We require certified regional technicians. Your coordinates and background are validated by regional supervisors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Robert Smith"
                        value={applyName}
                        onChange={(e) => setApplyName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. robert@example.com"
                        value={applyEmail}
                        onChange={(e) => setApplyEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (404) 555-0199"
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Professional Qualifications & Experience Summary *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Summarize your work experience, telecom / cabling / HVAC / smart-hands certifications, and tools owned."
                      value={applyExperience}
                      onChange={(e) => setApplyExperience(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Cover Letter / Statement of Interest *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us why you're a great fit for the Leta Technologies Georgia service network."
                      value={applyCoverLetter}
                      onChange={(e) => setApplyCoverLetter(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {applyError && (
                    <div className="p-2 bg-rose-50 border border-rose-100 text-[10px] text-rose-700 font-semibold rounded-lg">
                      {applyError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-150 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOfferForApply(null)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applySubmitting}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {applySubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
