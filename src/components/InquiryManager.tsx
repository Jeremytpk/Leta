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
  Tag
} from "lucide-react";
import { Inquiry } from "../types";
import { subscribeInquiries, deleteInquiry } from "../lib/dataService";

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to incoming messages in real-time
    const unsubscribe = subscribeInquiries((freshInquiries) => {
      setInquiries(freshInquiries);
      setLoading(false);
      // Auto-select the first inquiry if none is selected
      if (freshInquiries.length > 0 && !selectedInquiry) {
        setSelectedInquiry(freshInquiries[0]);
      }
    });

    return () => unsubscribe();
  }, [selectedInquiry]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this inquiry message?")) {
      return;
    }
    try {
      await deleteInquiry(id);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
      alert("Failed to delete inquiry. Please try again.");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.subject && inq.subject.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  return (
    <div id="inquiry-manager-root" className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-sans font-extrabold text-lg text-slate-950 m-0 tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-600" />
            <span>Public Dispatch & Contact Messages</span>
          </h3>
          <p className="font-sans text-xs text-slate-500 m-0 mt-0.5">
            Real-time feed of contact inquiries and dispatch requests submitted from the main landing page.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 font-bold tracking-tight shrink-0 self-start sm:self-center">
          <span>{inquiries.length} Messages Received</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Inbox List (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Inbox Entries Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Synchronizing incoming messages...</span>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center justify-center gap-2 py-20">
                <Inbox className="w-8 h-8 text-slate-300" />
                <span>No inquiries matched your search.</span>
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
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer text-left space-y-1.5 border-l-3 ${
                      isSelected 
                        ? "bg-slate-50/80 border-l-indigo-600 shadow-2xs" 
                        : "border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-sans font-bold text-slate-900 text-xs truncate max-w-[150px]">
                        {inq.name}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="font-sans text-[11px] font-semibold text-slate-700 truncate">
                      {inq.subject || "No Subject"}
                    </div>

                    <div className="font-sans text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {inq.message}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-indigo-600 font-mono">
                      <Mail className="w-3 h-3 text-indigo-400" />
                      <span className="truncate max-w-[200px]">{inq.email}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Detail Panel (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          {selectedInquiry ? (
            <div className="flex flex-col h-full">
              {/* Header Info */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-sans font-extrabold text-slate-900 text-sm leading-none m-0">
                        {selectedInquiry.name}
                      </h4>
                      <a 
                        href={`mailto:${selectedInquiry.email}`}
                        className="font-mono text-[11px] text-indigo-600 hover:underline inline-block mt-1"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message Details Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-sans">
                      Submitted: <span className="font-semibold text-slate-800">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-sans truncate">
                      Subject: <span className="font-semibold text-slate-800">{selectedInquiry.subject || "N/A"}</span>
                    </span>
                  </div>
                </div>

                {/* Subject Block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Message Subject
                  </span>
                  <div className="font-sans font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                    {selectedInquiry.subject || "(No subject provided)"}
                  </div>
                </div>

                {/* Message text */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Message Body
                  </span>
                  <div className="bg-slate-50/30 border border-slate-150 rounded-xl p-4 sm:p-5 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
                    {selectedInquiry.message}
                  </div>
                </div>

              </div>

              {/* Footer actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-right flex justify-end gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=RE: ${encodeURIComponent(selectedInquiry.subject || "Inquiry")}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic p-10 py-20 text-center">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-2.5" />
              <span className="text-xs">Select a contact message or dispatch request from the inbox list to read it.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
