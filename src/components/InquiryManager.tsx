import React, { useState, useEffect } from "react";
import { 
  Mail, 
  User, 
  Clock, 
  Trash2, 
  Search, 
  MessageSquare, 
  RefreshCw, 
  Inbox,
  Calendar,
  Tag,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  Plus,
  Phone,
  FileText,
  MapPin,
  DollarSign,
  Info,
  CheckCircle2,
  X
} from "lucide-react";
import { Inquiry, JobOffer } from "../types";
import { 
  subscribeInquiries, 
  deleteInquiry, 
  updateInquiry,
  subscribeJobOffers,
  createJobOffer,
  deleteJobOffer,
  updateJobOffer
} from "../lib/dataService";

type InquiryTab = "general" | "job_applications" | "job_offers";

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  
  const [activeTab, setActiveTab] = useState<InquiryTab>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Job Offer Form States
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerLocation, setOfferLocation] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerRequirements, setOfferRequirements] = useState("");
  const [offerSalaryRange, setOfferSalaryRange] = useState("");
  const [creatingOffer, setCreatingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Deletion Confirm States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"inquiry" | "job_offer">("inquiry");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to inquiries
    const unsubscribeInquiries = subscribeInquiries((freshInquiries) => {
      setInquiries(freshInquiries);
      setLoading(false);
    });

    // Subscribe to job offers
    const unsubscribeOffers = subscribeJobOffers((freshOffers) => {
      setJobOffers(freshOffers);
    });

    return () => {
      unsubscribeInquiries();
      unsubscribeOffers();
    };
  }, []);

  // When switching tabs, automatically select the first item of that category
  useEffect(() => {
    setSearchQuery("");
    if (activeTab === "general") {
      const generalList = inquiries.filter(i => i.type !== "job_application");
      if (generalList.length > 0) {
        setSelectedInquiry(generalList[0]);
      } else {
        setSelectedInquiry(null);
      }
      setSelectedJobOffer(null);
    } else if (activeTab === "job_applications") {
      const applicationsList = inquiries.filter(i => i.type === "job_application");
      if (applicationsList.length > 0) {
        setSelectedInquiry(applicationsList[0]);
      } else {
        setSelectedInquiry(null);
      }
      setSelectedJobOffer(null);
    } else {
      setSelectedInquiry(null);
      if (jobOffers.length > 0) {
        setSelectedJobOffer(jobOffers[0]);
      } else {
        setSelectedJobOffer(null);
      }
    }
  }, [activeTab, inquiries, jobOffers]);

  const selectInquiry = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.read === false) {
      try {
        await updateInquiry(inq.id, { read: true });
      } catch (err) {
        console.error("Failed to mark inquiry as read:", err);
      }
    }
  };

  const handleDeleteInquiryClick = (id: string) => {
    setDeleteConfirmId(id);
    setDeleteType("inquiry");
    setDeleteError(null);
  };

  const handleDeleteOfferClick = (id: string) => {
    setDeleteConfirmId(id);
    setDeleteType("job_offer");
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (deleteType === "inquiry") {
        await deleteInquiry(deleteConfirmId);
        if (selectedInquiry?.id === deleteConfirmId) {
          setSelectedInquiry(null);
        }
      } else {
        await deleteJobOffer(deleteConfirmId);
        if (selectedJobOffer?.id === deleteConfirmId) {
          setSelectedJobOffer(null);
        }
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setDeleteError("Failed to delete. You must have administrator permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateJobOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle || !offerLocation || !offerDescription) {
      setOfferError("Please fill in the title, location, and description.");
      return;
    }
    setCreatingOffer(true);
    setOfferError(null);
    try {
      const newOffer: JobOffer = {
        id: `offer-${Date.now()}`,
        title: offerTitle,
        location: offerLocation,
        description: offerDescription,
        requirements: offerRequirements,
        salaryRange: offerSalaryRange || "Competitive",
        status: "active",
        createdAt: new Date().toISOString()
      };
      await createJobOffer(newOffer);
      
      // Reset form states
      setOfferTitle("");
      setOfferLocation("");
      setOfferDescription("");
      setOfferRequirements("");
      setOfferSalaryRange("");
      setShowNewOfferForm(false);
    } catch (err) {
      console.error("Failed to create job offer:", err);
      setOfferError("Failed to save job offer in Firestore. Verify authorization.");
    } finally {
      setCreatingOffer(false);
    }
  };

  const handleReplyWithZoho = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => {
      console.error("Failed to copy email to clipboard:", err);
    });
  };

  // Filter lists based on tab & query
  const filteredInquiries = inquiries.filter((inq) => {
    // 1. Tab isolation
    if (activeTab === "general" && inq.type === "job_application") return false;
    if (activeTab === "job_applications" && inq.type !== "job_application") return false;
    if (activeTab === "job_offers") return false;

    // 2. Query match
    const q = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.subject && inq.subject.toLowerCase().includes(q)) ||
      (inq.jobTitle && inq.jobTitle.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  const filteredOffers = jobOffers.filter((offer) => {
    if (activeTab !== "job_offers") return false;
    const q = searchQuery.toLowerCase();
    return (
      offer.title.toLowerCase().includes(q) ||
      offer.location.toLowerCase().includes(q) ||
      offer.description.toLowerCase().includes(q)
    );
  });

  const unreadGeneralCount = inquiries.filter((inq) => inq.type !== "job_application" && inq.read === false).length;
  const unreadApplicationsCount = inquiries.filter((inq) => inq.type === "job_application" && inq.read === false).length;

  return (
    <div id="inquiry-manager-root" className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-sans font-extrabold text-lg text-slate-950 m-0 tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-600" />
            <span>Public Communications Hub</span>
          </h3>
          <p className="font-sans text-xs text-slate-500 m-0 mt-0.5">
            Real-time feed of service inquiries, dispatcher contact emails, and active career applications.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "general"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>General Inquiries</span>
            {unreadGeneralCount > 0 && (
              <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadGeneralCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("job_applications")}
            className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "job_applications"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Applications</span>
            {unreadApplicationsCount > 0 && (
              <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadApplicationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("job_offers")}
            className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "job_offers"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Job Offers</span>
            <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {jobOffers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Inbox / Listings (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          
          {/* Search and Action Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2.5 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "job_offers" 
                    ? "Search job offers..." 
                    : activeTab === "job_applications"
                    ? "Search candidate, role, notes..."
                    : "Search general messages..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
            
            {activeTab === "job_offers" && (
              <button
                onClick={() => setShowNewOfferForm(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Offer</span>
              </button>
            )}
          </div>

          {/* Inbox Entries Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Synchronizing incoming data...</span>
              </div>
            ) : activeTab === "job_offers" ? (
              /* --- RENDER JOB OFFERS --- */
              filteredOffers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center justify-center gap-2 py-20">
                  <Briefcase className="w-8 h-8 text-slate-300" />
                  <span>No job offers found. Create one now.</span>
                </div>
              ) : (
                filteredOffers.map((offer) => {
                  const isSelected = selectedJobOffer?.id === offer.id;
                  const formattedDate = new Date(offer.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric"
                  });

                  return (
                    <div
                      key={offer.id}
                      onClick={() => setSelectedJobOffer(offer)}
                      className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer text-left space-y-1.5 border-l-3 ${
                        isSelected 
                          ? "bg-indigo-50/20 border-l-indigo-600 shadow-2xs" 
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-sans text-xs font-extrabold text-slate-950 truncate max-w-[180px]">
                          {offer.title}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 font-sans text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {offer.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          {offer.salaryRange}
                        </span>
                      </div>

                      <div className="font-sans text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </div>

                      <div className="pt-1.5 flex justify-between items-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          offer.status === "active"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border border-amber-200 text-amber-700"
                        }`}>
                          {offer.status}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOfferClick(offer.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete job listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* --- RENDER INQUIRIES OR APPLICATIONS --- */
              filteredInquiries.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center justify-center gap-2 py-20">
                  <Inbox className="w-8 h-8 text-slate-300" />
                  <span>No entries found in this folder.</span>
                </div>
              ) : (
                filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  const formattedDate = new Date(inq.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={inq.id}
                      onClick={() => selectInquiry(inq)}
                      className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer text-left space-y-1.5 border-l-3 ${
                        isSelected 
                          ? "bg-slate-50/80 border-l-indigo-600 shadow-2xs" 
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {inq.read === false && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 animate-pulse" title="Unread" />
                          )}
                          <span className={`font-sans text-xs truncate max-w-[150px] ${inq.read === false ? "font-extrabold text-slate-950" : "font-bold text-slate-900"}`}>
                            {inq.name}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </span>
                      </div>

                      <div className={`font-sans text-[11px] truncate ${inq.read === false ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {inq.type === "job_application" 
                          ? `Application: ${inq.jobTitle || "Technician Role"}` 
                          : inq.subject || "No Subject"}
                      </div>

                      <div className="font-sans text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {inq.message}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-mono">
                          <Mail className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[150px]">{inq.email}</span>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right Side: Detail Panel (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          
          {activeTab === "job_offers" ? (
            /* --- JOB OFFER DETAIL VIEW --- */
            selectedJobOffer ? (
              <div className="flex flex-col h-full">
                {/* Header info */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-sans font-extrabold text-slate-900 text-sm leading-none m-0">
                          {selectedJobOffer.title}
                        </h4>
                        <span className="font-sans text-[11px] text-slate-500 inline-block mt-1">
                          Created on {new Date(selectedJobOffer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteOfferClick(selectedJobOffer.id)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-sans">
                        Location: <span className="font-semibold text-slate-800">{selectedJobOffer.location}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-sans truncate">
                        Salary: <span className="font-semibold text-slate-800">{selectedJobOffer.salaryRange}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Role Description & Overview
                    </span>
                    <div className="font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text bg-slate-50/10 p-3 border border-slate-100 rounded-lg">
                      {selectedJobOffer.description}
                    </div>
                  </div>

                  {selectedJobOffer.requirements && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Candidate Requirements
                      </span>
                      <div className="font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text bg-slate-50/10 p-3 border border-slate-100 rounded-lg">
                        {selectedJobOffer.requirements}
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Footer State toggling */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-left font-sans text-[10px] text-slate-500">
                    Status: <strong className="uppercase text-indigo-600">{selectedJobOffer.status}</strong>
                  </div>
                  <button
                    onClick={() => {
                      const nextStatus = selectedJobOffer.status === "active" ? "filled" : "active";
                      updateJobOffer(selectedJobOffer.id, { status: nextStatus });
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer"
                  >
                    Set as {selectedJobOffer.status === "active" ? "Filled" : "Active"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic p-10 py-20 text-center">
                <Briefcase className="w-12 h-12 text-slate-200 mb-2.5" />
                <span className="text-xs">Select a job offer listing from the queue to manage details.</span>
              </div>
            )
          ) : (
            /* --- INQUIRY OR APPLICATION DETAIL VIEW --- */
            selectedInquiry ? (
              <div className="flex flex-col h-full">
                {/* Header Info */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-left">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        {selectedInquiry.type === "job_application" ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-sans font-extrabold text-slate-900 text-sm leading-none m-0">
                          {selectedInquiry.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-[10px]">
                          <a 
                            href={`mailto:${selectedInquiry.email}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {selectedInquiry.email}
                          </a>
                          {selectedInquiry.phone && (
                            <span className="text-slate-400">
                              • <span className="text-slate-600">{selectedInquiry.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteInquiryClick(selectedInquiry.id)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Message Details Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left">
                  
                  {/* Meta details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-sans">
                        Received: <span className="font-semibold text-slate-800">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-sans truncate">
                        Position: <span className="font-semibold text-slate-850">
                          {selectedInquiry.type === "job_application" 
                            ? (selectedInquiry.jobTitle || "Technician Applicant")
                            : (selectedInquiry.subject || "General Inquiry")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {selectedInquiry.type === "job_application" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-left">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Candidate Professional Credentials</span>
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Nearest Branch Base</span>
                          <p className="font-semibold text-slate-800 m-0">{selectedInquiry.preferredBranch || "Atlanta HQ"}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Field Experience</span>
                          <p className="font-semibold text-slate-800 m-0">{selectedInquiry.experienceYears || "1-3 Years"}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Availability</span>
                          <p className="font-semibold text-slate-800 m-0">{selectedInquiry.availability || "Full-time"}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Expected Pay Rate</span>
                          <p className="font-semibold text-emerald-700 m-0">{selectedInquiry.expectedPay || "Competitive"}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Active Certifications</span>
                          <p className="font-semibold text-indigo-700 m-0 truncate">
                            {selectedInquiry.certifications && selectedInquiry.certifications.length > 0 
                              ? selectedInquiry.certifications.join(", ") 
                              : "None / General Tech"}
                          </p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Equipment &amp; Readiness</span>
                          <div className="flex flex-wrap gap-1">
                            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              selectedInquiry.hasLicense !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-500"
                            }`}>
                              DL: {selectedInquiry.hasLicense !== false ? "YES" : "NO"}
                            </span>
                            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              selectedInquiry.hasTransportation !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-500"
                            }`}>
                              VEHICLE: {selectedInquiry.hasTransportation !== false ? "YES" : "NO"}
                            </span>
                            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              selectedInquiry.ownsTools !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-500"
                            }`}>
                              TOOLS: {selectedInquiry.ownsTools !== false ? "YES" : "NO"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedInquiry.type === "job_application" && selectedInquiry.resumeText && (
                    <div className="space-y-1 bg-amber-50/20 border border-amber-100/60 rounded-xl p-4">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Professional Qualifications &amp; Experience Summary</span>
                      </span>
                      <div className="font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mt-2">
                        {selectedInquiry.resumeText}
                      </div>
                    </div>
                  )}

                  {/* Message body */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {selectedInquiry.type === "job_application" ? "Cover Letter / Letter of Interest" : "Message Body"}
                    </span>
                    <div className="bg-slate-50/30 border border-slate-150 rounded-xl p-4 sm:p-5 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
                      {selectedInquiry.message}
                    </div>
                  </div>

                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-left">
                    <div className="font-sans text-[10px] text-slate-500 font-medium">
                      Reply Mailroom: <span className="font-mono text-indigo-600 font-bold">techs@leta.repair</span>
                    </div>
                    {copied ? (
                      <div className="text-emerald-600 font-sans text-[11px] font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                        <Check className="w-3.5 h-3.5" />
                        <span>Applicant email copied to clipboard!</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 font-sans text-[10px] mt-0.5 leading-tight">
                        Clicking "Reply via Zoho Mail" copies the sender's email to your clipboard.
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {/* Native mail client backup */}
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=RE: ${encodeURIComponent(selectedInquiry.subject || "Job Application")}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-250"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Default Mail App</span>
                    </a>

                    {/* Primary Zoho Mail reply */}
                    <a
                      href={`https://mail.zoho.com/zm/#mail/compose/to=${encodeURIComponent(selectedInquiry.email)}?subject=${encodeURIComponent("RE: " + (selectedInquiry.subject || "Job Application"))}&body=${encodeURIComponent("Dear " + selectedInquiry.name + ",\n\n")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleReplyWithZoho(selectedInquiry.email)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Reply via Zoho Mail</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic p-10 py-20 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2.5" />
                <span className="text-xs">Select an application or message from the index queue to read it.</span>
              </div>
            )
          )}
        </div>

      </div>

      {/* NEW JOB OFFER FORM MODAL */}
      {showNewOfferForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Briefcase className="w-5 h-5" />
                <h4 className="font-sans font-extrabold text-slate-900 text-sm m-0">
                  Create Georgia Technician Job Listing
                </h4>
              </div>
              <button 
                onClick={() => setShowNewOfferForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJobOffer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field HVAC System Tech"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Regional Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlanta, GA"
                    value={offerLocation}
                    onChange={(e) => setOfferLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $26.00 - $34.00 / hr"
                    value={offerSalaryRange}
                    onChange={(e) => setOfferSalaryRange(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1 flex items-end">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2.5 w-full text-[10px] text-slate-500">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Listings publish in real-time to the public Careers page.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Job Description / Role Overview *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize key tasks, branch assignments, and reporting structure."
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Specific Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. valid driver's license; certification; 1-year experience..."
                  value={offerRequirements}
                  onChange={(e) => setOfferRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {offerError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-semibold rounded-lg">
                  {offerError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewOfferForm(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOffer}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {creatingOffer ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Job Offer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scaleUp text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-extrabold text-slate-900 text-sm m-0">
                Confirm Deletion
              </h4>
            </div>
            
            <p className="font-sans text-xs text-slate-600 leading-normal">
              Are you sure you want to permanently delete this {deleteType === "inquiry" ? "communication record" : "job offer listing"}? This action is irreversible and will update Firestore.
            </p>

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-medium rounded-lg leading-snug">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
