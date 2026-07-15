import React, { useState } from "react";
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
  ChevronRight
} from "lucide-react";
// @ts-ignore
import LetaLogo from "../../assets/LetaLogo.png";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contact-message", {
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

      if (response.ok) {
        setFormSubmitted(true);
        // Reset fields
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitError(data.error || "Failed to deliver dispatch message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setSubmitError("A connection error occurred. Please verify your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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

    </div>
  );
}
