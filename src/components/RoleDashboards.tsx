"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEhr } from "@/context/EhrContext";
import {
  User, Clipboard, Heart, FileText, Pill, ShieldAlert, Droplet,
  CheckCircle, Plus, Send, RefreshCw, BarChart2, Users,
  Building, HardDrive, ShieldCheck, MapPin, Eye, Upload,
  Download, Printer, AlertTriangle, Video, PhoneCall, Check, Calendar, Mail,
  Lock, Activity, Key, X, Search, ChevronDown, ChevronRight, Edit3
} from "lucide-react";

// UTC/Timezone-independent date/time formatting helpers to prevent hydration mismatches
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// ============================================================================
// 1. HEALTH INFORMATION MANAGEMENT (HIM) DASHBOARD
// ============================================================================
export function HIMDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { patients, registerPatient, updatePatient, createVisit, visits, setHistoryPatientId } = useEhr();
  
  // Registration Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [genotype, setGenotype] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicy, setInsurancePolicy] = useState("");
  const [allergiesInput, setAllergiesInput] = useState("");

  // Edit patient states
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");

  // Scheduling states
  const [selectedPatId, setSelectedPatId] = useState("");
  const [visitType, setVisitType] = useState("Outpatient");

  const [notification, setNotification] = useState("");

  const handleSelectPatientForEdit = (pat: typeof patients[0]) => {
    setEditingPatientId(pat.id);
    setFirstName(pat.firstName);
    setLastName(pat.lastName);
    setDob(pat.dateOfBirth);
    setGender(pat.gender);
    setPhone(pat.phone || "");
    setEmail(pat.email || "");
    setAddress(pat.address || "");
    setNationalId(pat.nationalId || "");
    setBloodGroup(pat.bloodGroup || "");
    setGenotype(pat.genotype || "");
    setEmergencyName(pat.emergencyContactName || "");
    setEmergencyPhone(pat.emergencyContactPhone || "");
    setInsuranceProvider(pat.insuranceProvider || "");
    setInsurancePolicy(pat.insurancePolicyNumber || "");
    setAllergiesInput(pat.allergies ? pat.allergies.join(", ") : "");
  };

  const handleClearForm = () => {
    setEditingPatientId(null);
    setFirstName("");
    setLastName("");
    setDob("");
    setGender("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNationalId("");
    setBloodGroup("");
    setGenotype("");
    setEmergencyName("");
    setEmergencyPhone("");
    setInsuranceProvider("");
    setInsurancePolicy("");
    setAllergiesInput("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
      alert("Invalid intake: Please enter a valid first name, last name, and date of birth.");
      return;
    }
    if (!gender) {
      alert("Invalid intake: Gender is required.");
      return;
    }
    if (!phone.trim()) {
      alert("Invalid intake: Contact phone number is required.");
      return;
    }
    if (!address.trim()) {
      alert("Invalid intake: Physical home address is required.");
      return;
    }
    try {
      if (editingPatientId) {
        const updated = await updatePatient(editingPatientId, {
          nationalId: nationalId.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dob.trim(),
          gender,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          bloodGroup,
          genotype,
          emergencyContactName: emergencyName.trim(),
          emergencyContactPhone: emergencyPhone.trim(),
          insuranceProvider: insuranceProvider.trim(),
          insurancePolicyNumber: insurancePolicy.trim(),
          allergies: allergiesInput ? allergiesInput.split(",").map((s) => s.trim()).filter(Boolean) : [],
        });
        setNotification(`Successfully updated patient profile: ${updated.firstName} ${updated.lastName}`);
        setTimeout(() => setNotification(""), 5000);
        handleClearForm();
      } else {
        const newPat = await registerPatient({
          nationalId: nationalId.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dob.trim(),
          gender,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          bloodGroup,
          genotype,
          emergencyContactName: emergencyName.trim(),
          emergencyContactPhone: emergencyPhone.trim(),
          insuranceProvider: insuranceProvider.trim(),
          insurancePolicyNumber: insurancePolicy.trim(),
          allergies: allergiesInput ? allergiesInput.split(",").map((s) => s.trim()).filter(Boolean) : [],
        });
        setNotification(`Successfully registered patient with MRN: ${newPat.mrn}`);
        setTimeout(() => setNotification(""), 5000);
        handleClearForm();
      }
    } catch (err) {
      console.log("Registration/Update error:", err);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatId) return;
    try {
      await createVisit(selectedPatId, "staff-1", visitType);
      setNotification("Patient successfully checked in & queued.");
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.log("Check-in cancelled:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">HIM (Health Information Management) Console</h2>
          <p className="text-xs text-secondary">
            {activeTab === "registration" ? "Register new patient intake record." : 
             activeTab === "scheduling" ? "Manage patient clinic calendar and checks." :
             "Overview of health information intake and records."}
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-success/15 border border-success/30 rounded-lg text-xs font-semibold text-success flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        {(activeTab === "dashboard" || activeTab === "registration") && (
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                {editingPatientId ? (
                  <>
                    <Edit3 className="w-4 h-4 mr-1.5 text-primary" /> Edit Patient Profile
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5 text-primary" /> Patient Intake Registration
                  </>
                )}
              </span>
              {editingPatientId && (
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Editing mode
                </span>
              )}
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Last Name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Date of Birth *</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    style={{
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>-- Select Gender --</option>
                    <option value="Male" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Male</option>
                    <option value="Female" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Female</option>
                    <option value="Other" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">National ID</label>
                  <input type="text" placeholder="e.g. 109-291-884" value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Contact Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Residential Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Blood Group</label>
                  <input type="text" placeholder="O+, A-, etc." value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Genotype</label>
                  <input type="text" placeholder="AA, AS, SS" value={genotype} onChange={(e) => setGenotype(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Emergency Contact Name</label>
                  <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Emergency Phone</label>
                  <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Insurance Provider</label>
                  <input type="text" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Insurance Policy Number</label>
                  <input type="text" value={insurancePolicy} onChange={(e) => setInsurancePolicy(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Drug / Food Allergies (Comma-separated)</label>
                  <input type="text" placeholder="Penicillin, Peanuts, Latex" value={allergiesInput} onChange={(e) => setAllergiesInput(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {editingPatientId && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold shadow transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow transition-all">
                  {editingPatientId ? "Update Patient Profile" : "Save & Register Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Registered Patients Directory */}
        {(activeTab === "dashboard" || activeTab === "registration") && (
          <div className={`${activeTab === "registration" ? "lg:col-span-1" : "lg:col-span-3"} bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col h-[650px] overflow-hidden`}>
            <h3 className="text-sm font-bold border-b border-border pb-2 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-primary" /> Registered Patients Directory
            </h3>
            
            {/* Search Box */}
            <div className="relative mb-3">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search name or MRN..."
                className="w-full pl-7 pr-3 py-1.5 bg-accent/25 border border-border rounded-lg text-xs text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2.5" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {patients
                .filter(p => 
                  `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
                  p.mrn.toLowerCase().includes(patientSearch.toLowerCase())
                )
                .map((pat) => (
                  <div 
                    key={pat.id} 
                    onClick={() => handleSelectPatientForEdit(pat)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs flex justify-between items-center ${
                      editingPatientId === pat.id 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-accent/10 border-border/40 hover:bg-accent/25 hover:border-border/80"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold">{pat.firstName} {pat.lastName}</h4>
                      <p className="text-[10px] text-secondary">MRN: {pat.mrn}</p>
                      <p className="text-[9px] text-secondary/70">DOB: {pat.dateOfBirth}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${editingPatientId === pat.id ? "translate-x-0.5 text-primary" : "text-secondary"}`} />
                  </div>
                ))}
              {patients.filter(p => 
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
                p.mrn.toLowerCase().includes(patientSearch.toLowerCase())
              ).length === 0 && (
                <p className="text-xs text-secondary text-center py-6">No matching patients found.</p>
              )}
            </div>
          </div>
        )}

        {/* Check-In and Queue form */}
        {(activeTab === "dashboard" || activeTab === "scheduling") && (
          <div className={`${activeTab === "scheduling" ? "lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}`}>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center">
                <Clipboard className="w-4 h-4 mr-1 text-primary" /> Active Clinic Check-In
              </h3>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Select Patient</label>
                  <select
                    value={selectedPatId}
                    onChange={(e) => setSelectedPatId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    style={{
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>-- Choose Patient --</option>
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                        {pat.firstName} {pat.lastName} ({pat.mrn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Encounter Class</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    style={{
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Outpatient</option>
                    <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Emergency</option>
                    <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Telemedicine</option>
                    <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Preventive Wellness</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow transition-all">
                  Initiate Visit Check-In
                </button>
              </form>
            </div>

            {/* Current Waiting Queue */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Today&apos;s Queued Encounters</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {visits.map((vis) => (
                  <div key={vis.id} className="p-3 bg-accent/30 border border-border rounded-lg flex items-center justify-between text-xs animate-fade-in">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h5 className="font-semibold text-foreground">{vis.patientName}</h5>
                        <button
                          type="button"
                          onClick={() => setHistoryPatientId(vis.patientId)}
                          className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                          title="View Chart History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary">
                        {vis.visitType} | Checked in {formatTime(vis.checkInTime)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      vis.status === "COMPLETED" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}>
                      {vis.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PatientFocusSwitcher() {
  const { patients, activePatientId, setActivePatientId, lastViewedPatientIds } = useEhr();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase())
  );

  const lastViewedPatients = (lastViewedPatientIds || [])
    .map(id => patients.find(p => p.id === id))
    .filter((p): p is typeof patients[0] => !!p)
    .slice(0, 5);

  return (
    <div className="relative flex items-center space-x-2 z-10" ref={dropdownRef}>
      <label className="text-xs text-secondary font-semibold">Switch Patient Focus:</label>
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setSearch("");
          }}
          className="flex items-center justify-between px-3 py-1.5 w-56 rounded-lg border border-border text-xs font-semibold bg-card text-foreground hover:border-primary/45 transition-all shadow-xs"
        >
          <span className="truncate">{activePatient ? `${activePatient.firstName} ${activePatient.lastName}` : "Select Patient"}</span>
          <ChevronDown className="w-3.5 h-3.5 ml-2 text-secondary flex-shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-30 p-2.5 space-y-2.5 animate-fade-in text-xs text-foreground">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient name or MRN..."
                className="w-full pl-7 pr-7 py-1.5 bg-accent/25 hover:bg-accent/45 focus:bg-accent/45 border border-border rounded-lg text-xs text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-secondary absolute left-2 top-2" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-secondary hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Patients List */}
            <div className="max-h-56 overflow-y-auto space-y-2">
              {search ? (
                // Search Results
                <div>
                  <div className="px-2 py-0.5 text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">
                    Search Results ({filteredPatients.length})
                  </div>
                  {filteredPatients.length === 0 ? (
                    <div className="p-3 text-center text-secondary text-[11px]">No patients match search.</div>
                  ) : (
                    filteredPatients.map(pat => (
                      <button
                        key={pat.id}
                        onClick={() => {
                          setActivePatientId(pat.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                          activePatientId === pat.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                        }`}
                      >
                        <span>{pat.firstName} {pat.lastName}</span>
                        <span className="text-[9px] font-mono text-secondary bg-background border border-border/40 px-1 rounded">{pat.mrn}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Default View: Last Viewed and All/Other Patients
                <div className="space-y-2.5">
                  {/* Last Viewed */}
                  <div>
                    <div className="px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider mb-1">
                      Recent Focus History
                    </div>
                    {lastViewedPatients.length === 0 ? (
                      <div className="px-2 py-1 text-secondary text-[10px] italic">No recently viewed patients.</div>
                    ) : (
                      lastViewedPatients.map(pat => (
                        <button
                          key={pat.id}
                          onClick={() => {
                            setActivePatientId(pat.id);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                            activePatientId === pat.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                          }`}
                        >
                          <span>{pat.firstName} {pat.lastName}</span>
                          <span className="text-[9px] font-mono text-secondary bg-background border border-border/40 px-1 rounded">{pat.mrn}</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* All Patients */}
                  <div className="border-t border-border/40 pt-2">
                    <div className="px-2 py-0.5 text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">
                      All Registered Patients
                    </div>
                    {patients.map(pat => (
                      <button
                        key={pat.id}
                        onClick={() => {
                          setActivePatientId(pat.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                          activePatientId === pat.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                        }`}
                      >
                        <span>{pat.firstName} {pat.lastName}</span>
                        <span className="text-[9px] font-mono text-secondary bg-background border border-border/40 px-1 rounded">{pat.mrn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. CLINICAL DOCTOR WORKSPACE
// ============================================================================
export function DoctorDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const {
    patients, visits, vitalsList, clinicalNotes, diagnoses,
    prescriptions, labOrders, radiologyOrders, activePatientId,
    setActivePatientId, recordVitals, recordClinicalNote, addDiagnosis,
    addPrescription, addLabOrder, addRadiologyOrder, exportFhirPatient, exportHl7Patient,
    setHistoryPatientId
  } = useEhr();

  // Find active patient clinical files
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activePatientVisit = visits.find((v) => v.patientId === activePatient?.id && v.status !== "COMPLETED") || visits[0];
  
  // SOAP Forms states
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [soapSigned, setSoapSigned] = useState(false);

  // Vitals Forms states
  const [temp, setTemp] = useState("");
  const [sbp, setSbp] = useState("");
  const [dbp, setDbp] = useState("");
  const [hr, setHr] = useState("");
  const [rr, setRr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [pain, setPain] = useState("");

  // Diagnostic states
  const [diagCode, setDiagCode] = useState("J06.9");
  const [diagDesc, setDiagDesc] = useState("Acute upper respiratory infection, unspecified");
  
  // Prescribing list state
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFreq, setMedFreq] = useState("");
  const [medDur, setMedDur] = useState("");
  const [rxList, setRxList] = useState<{ drugName: string; dosage: string; frequency: string; duration: string }[]>([]);

  // Interoperability exports state
  const [exportType, setExportType] = useState<"FHIR" | "HL7">("FHIR");
  const [exportOutput, setExportOutput] = useState("");

  // Lab Order Form states
  const [orderLabTestName, setOrderLabTestName] = useState("");
  const [orderLabSpecimen, setOrderLabSpecimen] = useState("Blood");
  const [orderLabPriority, setOrderLabPriority] = useState("Routine");
  const [orderLabIndication, setOrderLabIndication] = useState("");

  // Radiology Order Form states
  const [orderRadModality, setOrderRadModality] = useState<"X-Ray" | "MRI" | "CT" | "Ultrasound" | "Mammography">("X-Ray");
  const [orderRadBodyPart, setOrderRadBodyPart] = useState("Chest");



  const handleAddRxItem = () => {
    if (!medName.trim() || !medDosage.trim() || !medFreq.trim() || !medDur.trim()) {
      alert("Validation failed: Please fill in the medication name, dosage, frequency, and duration to add the prescription.");
      return;
    }
    setRxList([...rxList, { drugName: medName.trim(), dosage: medDosage.trim(), frequency: medFreq.trim(), duration: medDur.trim() }]);
    setMedName(""); setMedDosage(""); setMedFreq(""); setMedDur("");
  };

  const handleSaveSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit) return;
    if (!subjective.trim() || !objective.trim() || !assessment.trim() || !plan.trim()) {
      alert("Incomplete medical record: Please complete all sections of the SOAP note (Subjective, Objective, Assessment, and Plan) before committing.");
      return;
    }
    try {
      await recordClinicalNote(activePatientVisit.id, {
        visitId: activePatientVisit.id,
        noteType: "SOAP",
        subjective: subjective.trim(),
        objective: objective.trim(),
        assessment: assessment.trim(),
        plan: plan.trim(),
      }, soapSigned);
      alert("SOAP Consultation Note Saved.");
      setSubjective(""); setObjective(""); setAssessment(""); setPlan(""); setSoapSigned(false);
    } catch (err) {
      console.log("SOAP note save cancelled:", err);
    }
  };

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit) return;
    if (!temp || !sbp || !dbp || !hr || !spo2) {
      alert("Invalid vital signs: Temperature, Blood Pressure, Heart Rate, and Oxygen Saturation are required fields.");
      return;
    }
    try {
      await recordVitals(activePatientVisit.id, {
        visitId: activePatientVisit.id,
        temperature: Number(temp),
        systolicBp: Number(sbp),
        diastolicBp: Number(dbp),
        heartRate: Number(hr),
        oxygenSaturation: Number(spo2),
        ...(rr !== "" ? { respiratoryRate: Number(rr) } : {}),
        ...(weight !== "" ? { weight: Number(weight) } : {}),
        ...(height !== "" ? { height: Number(height) } : {}),
        ...(pain !== "" ? { painScore: Number(pain) } : {}),
      });
      alert("Patient vital signs updated successfully.");
    } catch (err) {
      console.log("Add vitals cancelled:", err);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit) return;
    if (!diagCode.trim() || !diagDesc.trim()) {
      alert("Please provide both the ICD-10 Diagnosis Code and Description.");
      return;
    }
    try {
      await addDiagnosis(activePatientVisit.id, diagCode.trim(), diagDesc.trim(), "ACTIVE");
      alert("ICD-10 Diagnosis coded.");
    } catch (err) {
      console.log("Diagnosis cancelled:", err);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit || rxList.length === 0) return;
    try {
      await addPrescription(activePatientVisit.id, rxList);
      alert("Prescription builder dispatched.");
      setRxList([]);
    } catch (err) {
      console.log("Prescription cancelled:", err);
    }
  };

  const handleOrderLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit) return;
    if (!orderLabTestName.trim()) {
      alert("Please enter a valid laboratory test name.");
      return;
    }
    try {
      await addLabOrder(activePatientVisit.id, orderLabTestName.trim(), orderLabIndication.trim(), orderLabPriority, orderLabSpecimen.trim());
      alert("Laboratory test ordered successfully.");
      setOrderLabIndication("");
    } catch (e) {
      console.log("Lab order cancelled:", e);
    }
  };

  const handleOrderRadiology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientVisit) return;
    if (!orderRadBodyPart.trim()) {
      alert("Please enter a valid body part target.");
      return;
    }
    try {
      await addRadiologyOrder(activePatientVisit.id, orderRadModality, orderRadBodyPart.trim());
      alert("Radiology scan ordered successfully.");
      setOrderRadBodyPart("Chest");
    } catch (e) {
      console.log("Radiology order cancelled:", e);
    }
  };

  const handleExport = () => {
    if (!activePatient) return;
    if (exportType === "FHIR") {
      setExportOutput(exportFhirPatient(activePatient.id));
    } else {
      setExportOutput(exportHl7Patient(activePatient.id));
    }
  };



  // Get active lists for active patient
  const patVitalsList = vitalsList.filter((v) => v.visitId === activePatientVisit?.id);
  const latestVitals = patVitalsList[0];
  const patNotes = clinicalNotes.filter((n) => n.visitId === activePatientVisit?.id);
  const patDiagnoses = diagnoses.filter((d) => d.visitId === activePatientVisit?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Selector (Shared) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div>
          <h2 className="text-xs uppercase font-bold text-secondary">Active Medical Workspace</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-bold text-lg text-foreground">
              {activePatient?.firstName} {activePatient?.lastName}
            </span>
            <span className="text-xs font-mono bg-accent border border-border px-1.5 py-0.5 rounded text-secondary font-semibold">
              {activePatient?.mrn}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PatientFocusSwitcher />
          {activePatient && (
            <button
              onClick={() => setHistoryPatientId(activePatient.id)}
              className="flex items-center px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-lg text-xs font-semibold transition-all shadow-xs"
              title="Open Patient History Folder"
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Chart History
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD TAB LAYOUT */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Card details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-primary" /> Patient Demographics
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-secondary">DOB:</span> <span className="font-semibold">{activePatient?.dateOfBirth || "—"}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Gender:</span> <span className="font-semibold">{activePatient?.gender || "—"}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Blood:</span> <span className="font-semibold font-mono">{activePatient?.bloodGroup ? `${activePatient.bloodGroup} (${activePatient.genotype || "—"})` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Phone:</span> <span className="font-semibold">{activePatient?.phone || "—"}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Address:</span> <span className="font-semibold text-right max-w-[140px] truncate">{activePatient?.address || "—"}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Insurance:</span> <span className="font-semibold text-primary truncate max-w-[120px]">{activePatient?.insuranceProvider || "—"}</span></div>
              </div>
              <div className="border-t border-border pt-3">
                <h5 className="text-[10px] text-secondary uppercase font-bold mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-danger" /> Allergen Directives
                </h5>
                <div className="flex flex-wrap gap-1">
                  {activePatient?.allergies.map((all, i) => (
                    <span key={i} className="text-[10px] bg-danger/15 text-danger border border-danger/25 px-2 py-0.5 rounded font-bold">
                      {all}
                    </span>
                  )) || <span className="text-xs text-secondary">None</span>}
                </div>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center">
                <Heart className="w-4 h-4 mr-1.5 text-danger pulse-soft" /> Attending Vitals
              </h3>
              {latestVitals ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-accent/30 border border-border rounded-lg text-center">
                    <span className="text-[9px] text-secondary font-bold block uppercase">Temp</span>
                    <span className="font-bold text-sm">{latestVitals.temperature}°C</span>
                  </div>
                  <div className="p-2.5 bg-accent/30 border border-border rounded-lg text-center">
                    <span className="text-[9px] text-secondary font-bold block uppercase">BP</span>
                    <span className="font-bold text-sm">{latestVitals.systolicBp}/{latestVitals.diastolicBp}</span>
                  </div>
                  <div className="p-2.5 bg-accent/30 border border-border rounded-lg text-center">
                    <span className="text-[9px] text-secondary font-bold block uppercase">Pulse</span>
                    <span className="font-bold text-sm">{latestVitals.heartRate} bpm</span>
                  </div>
                  <div className="p-2.5 bg-accent/30 border border-border rounded-lg text-center">
                    <span className="text-[9px] text-secondary font-bold block uppercase">SpO2</span>
                    <span className="font-bold text-sm">{latestVitals.oxygenSaturation}%</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-secondary font-semibold">No vitals recorded.</div>
              )}
            </div>
          </div>

          {/* Timeline & Inerop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encounter history */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center">
                <Clipboard className="w-4 h-4 mr-1.5 text-primary" /> Active Encounter Timeline
              </h3>
              <div className="space-y-3">
                {patNotes.map((note) => (
                  <div key={note.id} className="p-3.5 bg-accent/20 border border-border/60 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                      <span>{note.noteType.toUpperCase()} CLINICAL RECORD</span>
                      <span className="text-secondary font-mono">{note.signedAt ? formatDate(note.signedAt) : "Draft"}</span>
                    </div>
                    <p className="text-[11px] text-secondary mt-1"><strong className="text-foreground">S:</strong> {note.subjective}</p>
                    <p className="text-[11px] text-secondary"><strong className="text-foreground">O:</strong> {note.objective}</p>
                    <p className="text-[11px] text-secondary"><strong className="text-foreground">A:</strong> {note.assessment}</p>
                    <p className="text-[11px] text-secondary"><strong className="text-foreground">P:</strong> {note.plan}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* HL7 exporter */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-border pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1.5 text-primary" /> FHIR/HL7 Interop Serialization
                </h3>
                <div className="flex space-x-1">
                  <button onClick={() => setExportType("FHIR")} className={`px-2 py-0.5 rounded text-[10px] font-bold ${exportType === "FHIR" ? "bg-primary text-white" : "bg-accent"}`}>FHIR</button>
                  <button onClick={() => setExportType("HL7")} className={`px-2 py-0.5 rounded text-[10px] font-bold ${exportType === "HL7" ? "bg-primary text-white" : "bg-accent"}`}>HL7</button>
                </div>
              </div>
              <button onClick={handleExport} className="w-full py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold transition-all">
                Export {exportType} Dataset
              </button>
              {exportOutput && (
                <pre className="p-3 bg-accent/40 rounded-lg text-[9px] font-mono overflow-auto max-h-40 border border-border text-foreground">
                  {exportOutput}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2">Attending Patient Queue</h3>
          <div className="space-y-2">
            {visits.filter(v => v.status !== "COMPLETED").map((vis) => (
              <div key={vis.id} className="p-3 bg-accent/30 border border-border rounded-lg flex items-center justify-between text-xs hover:border-primary/40 cursor-pointer" onClick={() => setActivePatientId(vis.patientId)}>
                <div>
                  <h4 className="font-semibold text-foreground">{vis.patientName}</h4>
                  <p className="text-[10px] text-secondary">{vis.visitType} Encounter | Checked in: {formatTime(vis.checkInTime)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-primary text-white rounded text-[10px] font-semibold">Load Workspace</button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistoryPatientId(vis.patientId);
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary hover:text-white text-secondary transition-all"
                    title="View Chart History"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "consultation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* SOAP notes */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">SOAP Consultation Note</h3>
              <form onSubmit={handleSaveSoap} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Subjective (S)</label>
                  <textarea rows={3} value={subjective} onChange={(e) => setSubjective(e.target.value)} placeholder="Patient claims..." className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Objective (O)</label>
                  <textarea rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Intake observation..." className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Assessment (A)</label>
                  <textarea rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Diagnosis notes..." className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Plan (P)</label>
                  <textarea rows={2} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Directions..." className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                </div>
                <div className="flex items-center space-x-2 border-t border-border pt-4">
                  <input type="checkbox" checked={soapSigned} onChange={(e) => setSoapSigned(e.target.checked)} className="rounded border-border text-primary" />
                  <span className="text-xs text-secondary font-medium">Affix digital signature</span>
                </div>
                <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg transition-all">
                  Commit Note to EHR
                </button>
              </form>
            </div>

            {/* Prescriptions */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
                <Pill className="w-4 h-4 mr-1.5 text-primary" /> Outpatient Prescriber
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Medication</label>
                  <input type="text" placeholder="Drug name" value={medName} onChange={(e) => setMedName(e.target.value)} className="w-full p-2 border border-border bg-accent/20 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Dosage</label>
                  <input type="text" placeholder="e.g. 500mg" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} className="w-full p-2 border border-border bg-accent/20 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Frequency</label>
                  <input type="text" placeholder="BID, daily" value={medFreq} onChange={(e) => setMedFreq(e.target.value)} className="w-full p-2 border border-border bg-accent/20 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Duration</label>
                  <input type="text" placeholder="10 days" value={medDur} onChange={(e) => setMedDur(e.target.value)} className="w-full p-2 border border-border bg-accent/20 rounded-lg" />
                </div>
              </div>
              <button type="button" onClick={handleAddRxItem} className="px-3 py-1.5 rounded bg-accent hover:bg-accent/60 text-xs font-semibold flex items-center">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add to Order
              </button>

              {rxList.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-accent/45 text-[9px] font-bold text-secondary uppercase">
                      <tr><th className="p-2">Drug</th><th className="p-2">Dose</th><th className="p-2">Freq</th><th className="p-2">Dur</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rxList.map((rxItem, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold">{rxItem.drugName}</td>
                          <td className="p-2">{rxItem.dosage}</td>
                          <td className="p-2">{rxItem.frequency}</td>
                          <td className="p-2">{rxItem.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button type="button" onClick={handlePrescribe} disabled={rxList.length === 0} className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg disabled:opacity-50">
                Transmit Prescriptions
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Capture Vitals */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Triage Vitals</h3>
              <form onSubmit={handleAddVitals} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary">Temp (°C)</label>
                    <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 rounded" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary">BP (Syst/Diast)</label>
                    <div className="flex items-center space-x-1">
                      <input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 rounded text-center" />
                      <span>/</span>
                      <input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 rounded text-center" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary">HR (bpm)</label>
                    <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 rounded" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary">SpO2 (%)</label>
                    <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 rounded" />
                  </div>
                </div>
                <button type="submit" className="w-full py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold">
                  Save Vitals
                </button>
              </form>
            </div>

            {/* Diagnoses forms */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Diagnoses ICD-10</h3>
              <form onSubmit={handleDiagnose} className="space-y-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-0.5">ICD-10 Code</label>
                  <input type="text" value={diagCode} onChange={(e) => setDiagCode(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 text-xs rounded" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-0.5">Description</label>
                  <input type="text" value={diagDesc} onChange={(e) => setDiagDesc(e.target.value)} className="w-full p-1.5 border border-border bg-accent/20 text-xs rounded" />
                </div>
                <button type="submit" className="w-full py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold">
                  Record Diagnosis
                </button>
              </form>
            </div>

            {/* Lab & Radiology Orders */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="text-sm font-bold border-b border-border pb-2">Laboratory & Radiology Ordering</h3>
              
              {/* Lab Order Form */}
              <form onSubmit={handleOrderLab} className="space-y-3.5 border-b border-border/40 pb-4">
                <h4 className="text-xs font-bold text-primary flex items-center">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Lab Order
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Test Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CBC, Lipid Panel..."
                      value={orderLabTestName}
                      onChange={(e) => setOrderLabTestName(e.target.value)}
                      className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Specimen Type</label>
                    <select
                      value={orderLabSpecimen}
                      onChange={(e) => setOrderLabSpecimen(e.target.value)}
                      className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs"
                      style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    >
                      <option value="Blood">Blood (Whole Blood/Serum)</option>
                      <option value="Urine">Urine</option>
                      <option value="Saliva">Saliva</option>
                      <option value="Swab">Nasopharyngeal Swab</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Priority</label>
                  <div className="flex space-x-3">
                    {["Routine", "Urgent", "STAT"].map((p) => (
                      <label key={p} className="flex items-center space-x-1 cursor-pointer font-medium text-foreground">
                        <input
                          type="radio"
                          name="lab_priority"
                          value={p}
                          checked={orderLabPriority === p}
                          onChange={() => setOrderLabPriority(p)}
                          className="text-primary border-border bg-accent/20 focus:ring-primary"
                        />
                        <span className="ml-1">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Clinical Indication / Notes (Essay)</label>
                  <textarea
                    rows={3}
                    value={orderLabIndication}
                    onChange={(e) => setOrderLabIndication(e.target.value)}
                    placeholder="Provide clinical context, instructions, or signs/symptoms..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground placeholder:text-secondary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Lab Order</span>
                </button>
              </form>

              {/* Radiology Order Form */}
              <form onSubmit={handleOrderRadiology} className="space-y-3.5">
                <h4 className="text-xs font-bold text-primary flex items-center">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Radiology Scan
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Modality</label>
                    <select
                      value={orderRadModality}
                      onChange={(e) => setOrderRadModality(e.target.value as any)}
                      className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs"
                      style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    >
                      <option value="X-Ray">Plain X-Ray</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="CT">Computed Tomography (CT)</option>
                      <option value="Ultrasound">Diagnostic Ultrasound</option>
                      <option value="Mammography">Mammography</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Target Body Part</label>
                    <input
                      type="text"
                      value={orderRadBodyPart}
                      onChange={(e) => setOrderRadBodyPart(e.target.value)}
                      placeholder="e.g. Chest AP/Lat, Left Shoulder"
                      className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Radiology Order</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// ============================================================================
// 3. WARD NURSES' STATION
// ============================================================================
export function NurseDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const {
    visits, recordVitals, clinicalNotes, recordClinicalNote, prescriptions,
    medicationAdministrations, intakeOutputList, recordMedicationAdministration,
    recordIntakeOutput, setHistoryPatientId, vitalsList, patients
  } = useEhr();
  const [selectedVisitId, setSelectedVisitId] = useState("");

  const activeVisit = visits.find((v) => v.id === selectedVisitId);
  const activePatient = activeVisit ? patients.find((p) => p.id === activeVisit.patientId) : null;

  // Tab configurations
  const [nursingMode, setNursingMode] = useState<"entries" | "chart">("entries");
  const [activeFormSubTab, setActiveFormSubTab] = useState<"vitals" | "notes" | "meds" | "fluids">("vitals");
  const [activeHistorySubTab, setActiveHistorySubTab] = useState<"demographics" | "vitals" | "notes" | "meds" | "fluids">("demographics");

  // Vitals capture state
  const [temp, setTemp] = useState<string>("");
  const [sbp, setSbp] = useState<string>("");
  const [dbp, setDbp] = useState<string>("");
  const [hr, setHr] = useState<string>("");
  const [rr, setRr] = useState<string>("");
  const [spo2, setSpo2] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [pain, setPain] = useState<string>("");

  // Note form state
  const [nursingReport, setNursingReport] = useState("");

  // Medication Administration state
  const [adminMedName, setAdminMedName] = useState("");
  const [adminMedDosage, setAdminMedDosage] = useState("");
  const [adminMedRoute, setAdminMedRoute] = useState("Oral");
  const [adminMedStatus, setAdminMedStatus] = useState<"GIVEN" | "REFUSED" | "MISSED">("GIVEN");
  const [adminMedNotes, setAdminMedNotes] = useState("");

  // Fluid Charting state
  const [fluidType, setFluidType] = useState<"INTAKE" | "OUTPUT">("INTAKE");
  const [fluidCategory, setFluidCategory] = useState("Oral Fluid");
  const [fluidAmount, setFluidAmount] = useState<string>("");
  const [fluidNotes, setFluidNotes] = useState("");

  // Category sync for fluids
  useEffect(() => {
    setFluidCategory(fluidType === "INTAKE" ? "Oral Fluid" : "Urine");
  }, [fluidType]);

  // Sync activeFormSubTab from outer activeTab prop (from sidebar)
  useEffect(() => {
    if (activeTab === "patients") {
      setNursingMode("entries");
      setActiveFormSubTab("vitals");
    } else if (activeTab === "careplans") {
      setNursingMode("entries");
      setActiveFormSubTab("notes");
    } else if (activeTab === "medchart") {
      setNursingMode("entries");
      setActiveFormSubTab("meds");
    }
  }, [activeTab]);

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId) return;
    if (!temp || !sbp || !dbp || !hr || !spo2) {
      alert("Invalid vital signs: Temperature, Blood Pressure, Heart Rate, and Oxygen Saturation are required fields.");
      return;
    }
    try {
      await recordVitals(selectedVisitId, {
        visitId: selectedVisitId,
        temperature: Number(temp),
        systolicBp: Number(sbp),
        diastolicBp: Number(dbp),
        heartRate: Number(hr),
        oxygenSaturation: Number(spo2),
        ...(rr !== "" ? { respiratoryRate: Number(rr) } : {}),
        ...(weight !== "" ? { weight: Number(weight) } : {}),
        ...(height !== "" ? { height: Number(height) } : {}),
        ...(pain !== "" ? { painScore: Number(pain) } : {}),
      });
      alert("Vitals entered.");
    } catch (err) {
      console.log("Vitals capture cancelled:", err);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId || !nursingReport) return;
    try {
      await recordClinicalNote(selectedVisitId, {
        visitId: selectedVisitId,
        noteType: "Nursing",
        subjective: "Shift observation report.",
        objective: nursingReport,
        assessment: "General checkup.",
        plan: "Follow nursing care guidelines.",
      });
      alert("Nursing Shift Note filed.");
      setNursingReport("");
    } catch (err) {
      console.log("Nursing shift note cancelled:", err);
    }
  };

  const handleSubmitMedAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId || !activeVisit) return;
    if (!adminMedName.trim() || !adminMedDosage.trim()) {
      alert("Validation failed: Medication name and dosage are required.");
      return;
    }
    try {
      await recordMedicationAdministration(selectedVisitId, {
        visitId: selectedVisitId,
        patientId: activeVisit.patientId,
        drugName: adminMedName.trim(),
        dosage: adminMedDosage.trim(),
        route: adminMedRoute,
        status: adminMedStatus,
        notes: adminMedNotes.trim() || undefined
      });
      alert("Medication administration logged.");
      setAdminMedName("");
      setAdminMedDosage("");
      setAdminMedNotes("");
    } catch (err) {
      console.log("Medication administration cancelled:", err);
    }
  };

  const handleSubmitFluidChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId || !activeVisit) return;
    if (!fluidAmount || Number(fluidAmount) <= 0) {
      alert("Validation failed: Please enter a valid fluid amount.");
      return;
    }
    try {
      await recordIntakeOutput(selectedVisitId, {
        visitId: selectedVisitId,
        patientId: activeVisit.patientId,
        type: fluidType,
        category: fluidCategory,
        amount: Number(fluidAmount),
        notes: fluidNotes.trim() || undefined
      });
      alert("Fluid record logged.");
      setFluidAmount("");
      setFluidNotes("");
    } catch (err) {
      console.log("Fluid logging cancelled:", err);
    }
  };

  // Filter current patient records
  const patientVisitIds = visits.filter(v => activeVisit && v.patientId === activeVisit.patientId).map(v => v.id);
  const patientVitals = vitalsList.filter(v => patientVisitIds.includes(v.visitId));
  const patientNotes = clinicalNotes.filter(n => patientVisitIds.includes(n.visitId));
  const patientMedsGiven = medicationAdministrations.filter(m => activeVisit && (m.patientId === activeVisit.patientId || patientVisitIds.includes(m.visitId)));
  const patientFluids = intakeOutputList.filter(io => activeVisit && (io.patientId === activeVisit.patientId || patientVisitIds.includes(io.visitId)));

  const totalIntake = patientFluids.filter(f => f.type === "INTAKE").reduce((sum, f) => sum + f.amount, 0);
  const totalOutput = patientFluids.filter(f => f.type === "OUTPUT").reduce((sum, f) => sum + f.amount, 0);
  const fluidBalance = totalIntake - totalOutput;

  const patientPrescriptions = activeVisit 
    ? prescriptions.filter(p => p.patientId === activeVisit.patientId && p.status !== "CANCELLED")
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Nurses' Station</h2>
        <p className="text-xs text-secondary">
          {activeTab === "patients" ? "Log vital signs for assigned beds." : 
           activeTab === "careplans" ? "Nursing shift notes and checklists." :
           activeTab === "medchart" ? "Medication administration chart." :
           "Manage active patient care paths."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting / Observation Patients List */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold border-b border-border pb-2">Assigned Intake Queue</h3>
          <div className="space-y-2">
            {visits.filter(v => v.status !== "COMPLETED").map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVisitId(v.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${
                  selectedVisitId === v.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-accent/20 border-border hover:bg-accent/40"
                }`}
              >
                <div>
                  <h4 className="font-bold text-foreground">{v.patientName}</h4>
                  <p className="text-[10px] text-secondary">Encounter: {v.visitType}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono text-secondary">
                    {v.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistoryPatientId(v.patientId);
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary hover:text-white text-secondary transition-all"
                    title="View Chart History"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Patient Workspace */}
        {activeVisit ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Patient Header Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Active Workspace Target</span>
                <h3 className="font-bold text-base text-foreground mt-0.5">{activeVisit.patientName}</h3>
                <p className="text-[10px] text-secondary mt-0.5 font-mono font-semibold">Encounter: {activeVisit.visitType}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setHistoryPatientId(activeVisit.patientId)}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-lg text-xs font-semibold flex items-center transition-all animate-pulse-soft"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Full Archive Folder
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-border text-xs">
              <button
                onClick={() => setNursingMode("entries")}
                className={`pb-2.5 px-4 font-semibold border-b-2 transition-all ${
                  nursingMode === "entries" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-foreground"
                }`}
              >
                Document Entries
              </button>
              <button
                onClick={() => setNursingMode("chart")}
                className={`pb-2.5 px-4 font-semibold border-b-2 transition-all ${
                  nursingMode === "chart" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-foreground"
                }`}
              >
                Patient History & Logs
              </button>
            </div>

            {/* Sub Mode: Document Entries */}
            {nursingMode === "entries" && (
              <div className="space-y-6">
                
                {/* Sub Tab Selector */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-accent/20 border border-border/80 rounded-lg text-xs w-fit">
                  <button
                    onClick={() => setActiveFormSubTab("vitals")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeFormSubTab === "vitals" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Vitals Capture
                  </button>
                  <button
                    onClick={() => setActiveFormSubTab("notes")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeFormSubTab === "notes" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Shift Notes
                  </button>
                  <button
                    onClick={() => setActiveFormSubTab("meds")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeFormSubTab === "meds" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Administer Meds
                  </button>
                  <button
                    onClick={() => setActiveFormSubTab("fluids")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeFormSubTab === "fluids" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Fluid Charting (I/O)
                  </button>
                </div>

                {/* Form: Vitals */}
                {activeFormSubTab === "vitals" && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Record Intake Vitals</h3>
                    <form onSubmit={handleSubmitVitals} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Temp (°C)</label>
                          <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Heart Rate (bpm)</label>
                          <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Systolic BP</label>
                          <input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Diastolic BP</label>
                          <input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Oxygen Sat (%)</label>
                          <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Pain Score (0-10) <span className="text-[9px] font-normal text-secondary/70 normal-case">optional</span></label>
                          <input type="number" min="0" max="10" placeholder="0–10" value={pain} onChange={(e) => setPain(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground placeholder:text-secondary/50 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Weight (kg) <span className="text-[9px] font-normal text-secondary/70 normal-case">optional</span></label>
                          <input type="number" step="0.1" placeholder="e.g. 72.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground placeholder:text-secondary/50 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Height (cm) <span className="text-[9px] font-normal text-secondary/70 normal-case">optional</span></label>
                          <input type="number" step="0.1" placeholder="e.g. 170" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground placeholder:text-secondary/50 focus:outline-none" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg transition-all">
                        Transmit Vitals
                      </button>
                    </form>
                  </div>
                )}

                {/* Form: Shift Notes */}
                {activeFormSubTab === "notes" && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Nursing Shift Notes</h3>
                    <form onSubmit={handleSubmitNote} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Clinical Observation Notes</label>
                        <textarea rows={6} value={nursingReport} onChange={(e) => setNursingReport(e.target.value)} placeholder="Enter details..." className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg transition-all">
                        Submit Shift Assessment Note
                      </button>
                    </form>
                  </div>
                )}

                {/* Form: Administer Medication */}
                {activeFormSubTab === "meds" && (
                  <div className="space-y-4">
                    
                    {/* Active Prescriptions Quick Fill list */}
                    {patientPrescriptions.length > 0 && (
                      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary">Active Prescriptions (Click to Autofill Form)</h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {patientPrescriptions.flatMap(p => p.items).map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setAdminMedName(item.drugName);
                                setAdminMedDosage(item.dosage);
                              }}
                              className="px-2.5 py-1.5 bg-accent/30 hover:bg-accent/60 border border-border rounded-lg text-[10px] font-medium transition-all text-left flex flex-col"
                            >
                              <strong className="text-foreground">{item.drugName}</strong>
                              <span className="text-[9px] text-secondary">{item.dosage} · {item.frequency}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Log Medication Administration</h3>
                      <form onSubmit={handleSubmitMedAdmin} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Medication Name</label>
                            <input type="text" placeholder="e.g. Aspirin" value={adminMedName} onChange={(e) => setAdminMedName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Dosage</label>
                            <input type="text" placeholder="e.g. 325 mg" value={adminMedDosage} onChange={(e) => setAdminMedDosage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Route of Administration</label>
                            <select value={adminMedRoute} onChange={(e) => setAdminMedRoute(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none">
                              <option value="Oral">Oral</option>
                              <option value="IV">Intravenous (IV)</option>
                              <option value="IM">Intramuscular (IM)</option>
                              <option value="SC">Subcutaneous (SC)</option>
                              <option value="Sublingual">Sublingual</option>
                              <option value="Inhalation">Inhalation</option>
                              <option value="PR">Rectal (PR)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Administration Status</label>
                            <select value={adminMedStatus} onChange={(e) => setAdminMedStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none">
                              <option value="GIVEN">Given (Success)</option>
                              <option value="REFUSED">Patient Refused</option>
                              <option value="MISSED">Dose Missed</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Clinician Notes / Comments</label>
                          <textarea rows={2} placeholder="Optional comments..." value={adminMedNotes} onChange={(e) => setAdminMedNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                        <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg transition-all">
                          Record Administration Log
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Form: Fluid Charting */}
                {activeFormSubTab === "fluids" && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Fluid Intake & Output Charting</h3>
                    <form onSubmit={handleSubmitFluidChart} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Log Type</label>
                          <select value={fluidType} onChange={(e) => setFluidType(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none">
                            <option value="INTAKE">Intake (Fluids Received)</option>
                            <option value="OUTPUT">Output (Fluids Lost)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Category</label>
                          <select value={fluidCategory} onChange={(e) => setFluidCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none">
                            {fluidType === "INTAKE" ? (
                              <>
                                <option value="Oral Fluid">Oral Fluid (Water/Juice)</option>
                                <option value="IV Fluid">IV Fluid (Saline/Dextrose)</option>
                                <option value="Blood">Blood / Plasma Transfusion</option>
                                <option value="TPN">Total Parenteral Nutrition (TPN)</option>
                              </>
                            ) : (
                              <>
                                <option value="Urine">Urine Output</option>
                                <option value="Vomit">Emesis (Vomit)</option>
                                <option value="Drainage">Surgical Drainage</option>
                                <option value="Stool">Stool / Bowel Movement</option>
                                <option value="Nasogastric">Nasogastric Aspirate</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Volume (mL)</label>
                          <input type="number" placeholder="Volume in mL" value={fluidAmount} onChange={(e) => setFluidAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Observations / Notes</label>
                        <textarea rows={2} placeholder="Fluid properties (color, consistency, etc.)" value={fluidNotes} onChange={(e) => setFluidNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:outline-none" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow rounded-lg transition-all">
                        Record Fluid Chart
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Sub Mode: Patient History & Charts */}
            {nursingMode === "chart" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* History sub-tab selector */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-accent/20 border border-border/80 rounded-lg text-xs w-fit">
                  <button
                    onClick={() => setActiveHistorySubTab("demographics")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeHistorySubTab === "demographics" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Allergies & Demographics
                  </button>
                  <button
                    onClick={() => setActiveHistorySubTab("vitals")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeHistorySubTab === "vitals" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Vitals History ({patientVitals.length})
                  </button>
                  <button
                    onClick={() => setActiveHistorySubTab("notes")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeHistorySubTab === "notes" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Clinical Notes ({patientNotes.length})
                  </button>
                  <button
                    onClick={() => setActiveHistorySubTab("meds")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeHistorySubTab === "meds" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Meds Given ({patientMedsGiven.length})
                  </button>
                  <button
                    onClick={() => setActiveHistorySubTab("fluids")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeHistorySubTab === "fluids" ? "bg-card text-foreground shadow-xs border border-border/30" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Fluid Charting ({patientFluids.length})
                  </button>
                </div>

                {/* Hist Tab: Demographics */}
                {activeHistorySubTab === "demographics" && activePatient && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 text-xs animate-fade-in">
                    <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-primary" /> Demographics Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-secondary">DOB:</span> <strong className="text-foreground">{activePatient.dateOfBirth}</strong></div>
                      <div><span className="text-secondary">Gender:</span> <strong className="text-foreground">{activePatient.gender}</strong></div>
                      <div><span className="text-secondary">Blood Group:</span> <strong className="text-foreground font-mono">{activePatient.bloodGroup} ({activePatient.genotype})</strong></div>
                      <div><span className="text-secondary">Phone:</span> <strong className="text-foreground">{activePatient.phone}</strong></div>
                      <div className="col-span-2"><span className="text-secondary">Address:</span> <strong className="text-foreground">{activePatient.address}</strong></div>
                      <div className="col-span-2"><span className="text-secondary">Emergency contact:</span> <strong className="text-foreground">{activePatient.emergencyContactName} ({activePatient.emergencyContactPhone})</strong></div>
                    </div>
                    {activePatient.allergies.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <h4 className="text-[10px] text-danger uppercase font-bold mb-1.5">Documented Allergies</h4>
                        <div className="flex flex-wrap gap-1">
                          {activePatient.allergies.map((all, i) => (
                            <span key={i} className="px-2 py-0.5 bg-danger/15 text-danger border border-danger/20 rounded font-bold text-[9px] uppercase">
                              {all}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hist Tab: Vitals */}
                {activeHistorySubTab === "vitals" && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-xs animate-fade-in">
                    <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Triage Vitals Timeline</h3>
                    {patientVitals.length === 0 ? (
                      <p className="text-center text-secondary py-6 font-semibold">No vitals logs recorded.</p>
                    ) : (
                      <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                            <tr>
                              <th className="p-3">Time</th>
                              <th className="p-3">Temp</th>
                              <th className="p-3">BP (mmHg)</th>
                              <th className="p-3">HR</th>
                              <th className="p-3">SpO2</th>
                              <th className="p-3">Staff</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {patientVitals.map((v) => (
                              <tr key={v.id} className="hover:bg-accent/10">
                                <td className="p-3 font-medium">{formatDate(v.recordedAt)} {formatTime(v.recordedAt)}</td>
                                <td className="p-3 font-semibold">{v.temperature}°C</td>
                                <td className="p-3 font-semibold">{v.recordedBy ? `${v.systolicBp}/${v.diastolicBp}` : `${v.systolicBp}/${v.diastolicBp}`}</td>
                                <td className="p-3">{v.heartRate} bpm</td>
                                <td className="p-3 font-semibold">{v.oxygenSaturation}%</td>
                                <td className="p-3 text-secondary">{v.recordedBy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Hist Tab: Clinical Notes */}
                {activeHistorySubTab === "notes" && (
                  <div className="space-y-4 animate-fade-in">
                    {patientNotes.length === 0 ? (
                      <div className="bg-card border border-border rounded-xl p-6 text-center text-secondary font-semibold text-xs">No clinical notes available.</div>
                    ) : (
                      patientNotes.map((note) => (
                        <div key={note.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2 text-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                            <span>{note.noteType.toUpperCase()} NOTE BY {note.authorName.toUpperCase()}</span>
                            <span className="text-secondary font-mono">{note.signedAt ? formatDate(note.signedAt) : "Draft"}</span>
                          </div>
                          <p className="text-[11px] text-secondary leading-relaxed whitespace-pre-line">{note.objective}</p>
                          {note.digitalSignature && (
                            <p className="text-[9px] font-mono text-success">Signature verification: {note.digitalSignature}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Hist Tab: Medication Logs */}
                {activeHistorySubTab === "meds" && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-xs animate-fade-in">
                    <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Medication Administration History</h3>
                    {patientMedsGiven.length === 0 ? (
                      <p className="text-center text-secondary py-6 font-semibold">No recorded medication administrations.</p>
                    ) : (
                      <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                            <tr>
                              <th className="p-3">Time</th>
                              <th className="p-3">Medication</th>
                              <th className="p-3">Dose / Route</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Nurse</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {patientMedsGiven.map((m) => (
                              <tr key={m.id} className="hover:bg-accent/10">
                                <td className="p-3 font-medium">{formatDate(m.administeredAt)} {formatTime(m.administeredAt)}</td>
                                <td className="p-3 font-bold text-foreground">{m.drugName}</td>
                                <td className="p-3">{m.dosage} · <span className="font-semibold text-secondary">{m.route}</span></td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    m.status === "GIVEN" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                                  }`}>{m.status}</span>
                                </td>
                                <td className="p-3 text-secondary">{m.administeredBy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Hist Tab: Fluids Chart */}
                {activeHistorySubTab === "fluids" && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Summary Balance */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-success/10 border border-success/15 rounded-xl text-center">
                        <span className="text-[9px] text-success font-bold uppercase block mb-1">Total Intake</span>
                        <span className="text-base font-bold font-mono text-success">{totalIntake} mL</span>
                      </div>
                      <div className="p-3 bg-danger/10 border border-danger/15 rounded-xl text-center">
                        <span className="text-[9px] text-danger font-bold uppercase block mb-1">Total Output</span>
                        <span className="text-base font-bold font-mono text-danger">{totalOutput} mL</span>
                      </div>
                      <div className="p-3 bg-primary/10 border border-primary/15 rounded-xl text-center">
                        <span className="text-[9px] text-primary font-bold uppercase block mb-1">Net Balance</span>
                        <span className={`text-base font-bold font-mono ${fluidBalance >= 0 ? "text-primary" : "text-warning"}`}>{fluidBalance > 0 ? `+${fluidBalance}` : fluidBalance} mL</span>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-xs">
                      <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">Fluid Balance Ledger (Intake & Output)</h3>
                      {patientFluids.length === 0 ? (
                        <p className="text-center text-secondary py-6 font-semibold">No recorded fluid intakes or outputs.</p>
                      ) : (
                        <div className="overflow-x-auto border border-border rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                              <tr>
                                <th className="p-3">Time</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Volume</th>
                                <th className="p-3">Staff</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {patientFluids.map((f) => (
                                <tr key={f.id} className="hover:bg-accent/10">
                                  <td className="p-3 font-medium">{formatDate(f.recordedAt)} {formatTime(f.recordedAt)}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      f.type === "INTAKE" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                                    }`}>{f.type}</span>
                                  </td>
                                  <td className="p-3 font-semibold text-foreground">{f.category}</td>
                                  <td className="p-3 font-bold font-mono">{f.amount} mL</td>
                                  <td className="p-3 text-secondary">{f.recordedBy}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
            <Clipboard className="w-10 h-10 text-secondary/40 animate-pulse" />
            <h3 className="font-bold text-sm text-foreground">No Patient Selected</h3>
            <p className="text-xs text-secondary max-w-sm">Select a patient from the Assigned Intake Queue on the left to document vitals, shift note logs, administer medications, or review chart histories.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 4. PHARMACIST DISPATCH QUEUE
// ============================================================================
export function PharmacistDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { prescriptions, dispensePrescription, inventory, setHistoryPatientId } = useEhr();

  const paidRx = prescriptions.filter(p => p.status === "PENDING" && (p.paymentStatus === "PAID" || p.paymentStatus === "WAIVED"));
  const unpaidRx = prescriptions.filter(p => p.status === "PENDING" && p.paymentStatus === "UNPAID");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Pharmacy Hub</h2>
        <p className="text-xs text-secondary">
          {activeTab === "inventory" ? "Manage drug stock levels." :
           activeTab === "interaction" ? "View dispensation ledger." :
           "Verify and fulfill scripts."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Queue */}
        {(activeTab === "dashboard" || activeTab === "interaction") && (
          <div className={`${activeTab === "interaction" ? "lg:col-span-3" : "lg:col-span-2"} bg-card border border-border rounded-xl p-5 shadow-sm space-y-4`}>
            <h3 className="text-sm font-bold border-b border-border pb-2">Pending Dispensation Worklist</h3>
            <div className="space-y-3">
              {unpaidRx.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-warning">⏳ Awaiting Payment Clearance</p>
                  {unpaidRx.map((rx) => (
                    <div key={rx.id} className="p-3 border border-warning/30 rounded-xl bg-warning/5 flex justify-between items-center text-xs opacity-70">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-foreground">{rx.patientName}</h4>
                          <button
                            type="button"
                            onClick={() => setHistoryPatientId(rx.patientId)}
                            className="p-1 rounded-lg hover:bg-accent text-secondary hover:text-primary transition-all"
                            title="View Chart History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-secondary">{rx.items.map(i => i.drugName).join(", ")}</p>
                        <p className="text-[10px] text-secondary font-semibold">By {rx.doctorName}</p>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-warning/15 text-warning text-[9px] font-bold uppercase"><Lock className="w-3 h-3" /> UNPAID</span>
                    </div>
                  ))}
                </div>
              )}
              {paidRx.length === 0 && unpaidRx.length > 0 && (
                <p className="text-center text-xs text-secondary py-6 font-semibold">No payment-cleared prescriptions to dispense.</p>
              )}
              {paidRx.length === 0 && unpaidRx.length === 0 && (
                <div className="py-12 text-center text-xs text-secondary font-semibold">No pending prescriptions to dispense.</div>
              )}
              {paidRx.map((rx) => (
                  <div key={rx.id} className="p-4 border border-border rounded-xl bg-accent/20 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-foreground">{rx.patientName}</h4>
                          <button
                            type="button"
                            onClick={() => setHistoryPatientId(rx.patientId)}
                            className="p-1 rounded-lg hover:bg-accent text-secondary hover:text-primary transition-all"
                            title="View Chart History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-secondary">Ordered by {rx.doctorName} on {formatDate(rx.prescribedAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-bold">
                        {rx.status}
                      </span>
                    </div>

                    <div className="bg-card border border-border/60 rounded-lg p-3 space-y-2">
                      <h5 className="font-bold text-[10px] uppercase text-secondary">Medications List</h5>
                      <ul className="space-y-1 divide-y divide-border/40">
                        {rx.items.map((it, idx) => (
                          <li key={idx} className="pt-1 flex justify-between font-medium">
                            <span>{it.drugName} ({it.dosage})</span>
                            <span className="text-secondary">{it.frequency} - {it.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await dispensePrescription(rx.id);
                        } catch (err) {
                          console.log("Dispense cancelled:", err);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow"
                    >
                      Verify & Dispense Medications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug Inventory */}
        {(activeTab === "dashboard" || activeTab === "inventory") && (
          <div className={`${activeTab === "inventory" ? "lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"} bg-card border border-border rounded-xl p-5 shadow-sm`}>
            <h3 className={`text-sm font-bold border-b border-border pb-2 flex items-center ${activeTab === "inventory" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
              <Pill className="w-4 h-4 mr-1.5 text-primary" /> Inventory levels
            </h3>
            {inventory.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center text-xs p-2.5 bg-accent/30 rounded-lg border border-border/40">
                <div>
                  <h5 className="font-semibold">{inv.name}</h5>
                  <p className="text-[10px] text-secondary">Batch: {inv.batchNumber} | Exp: {inv.expiryDate}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${inv.quantity <= inv.minAlertQty ? "text-danger" : "text-foreground"}`}>
                    {inv.quantity} units
                  </span>
                  {inv.quantity <= inv.minAlertQty && (
                    <span className="text-[8px] bg-danger/10 text-danger px-1 rounded font-bold uppercase">Low Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 5. LABORATORY WORKLIST & ANALYZER
// ============================================================================
export function LabScientistDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { labOrders, updateLabStatus, setHistoryPatientId } = useEhr();

  const paidOrders = labOrders.filter(o => o.paymentStatus === "PAID" || o.paymentStatus === "WAIVED");
  const unpaidOrders = labOrders.filter(o => o.paymentStatus === "UNPAID");

  // Active analysis item
  const [activeAnalysisOrderId, setActiveAnalysisOrderId] = useState<string | null>(null);

  // Core clinical indicators
  const [labGenotype, setLabGenotype] = useState("AA");
  const [labBloodGroup, setLabBloodGroup] = useState("O+");

  // Dynamic Screening Tests Builder (Hepatitis, HIV, Syphilis, etc.)
  const [screeningTestsList, setScreeningTestsList] = useState<{ parameter: string; value: string; referenceRange: string; status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL" }[]>([
    { parameter: "HIV Test", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" },
    { parameter: "Hepatitis B (HBsAg)", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" },
    { parameter: "Hepatitis C (HCV Ab)", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" }
  ]);
  const [newScreeningName, setNewScreeningName] = useState("");
  const [newScreeningVal, setNewScreeningVal] = useState("Non-Reactive");

  // Custom chemical/hematological results builder
  const [customResultsList, setCustomResultsList] = useState<{ parameter: string; value: string; referenceRange: string; status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL" }[]>([]);
  const [customParamName, setCustomParamName] = useState("");
  const [customParamVal, setCustomParamVal] = useState("");
  const [customParamRef, setCustomParamRef] = useState("");
  const [customParamStatus, setCustomParamStatus] = useState<"NORMAL" | "HIGH" | "LOW" | "CRITICAL">("NORMAL");

  const handleCollectSample = async (orderId: string) => {
    try {
      await updateLabStatus(orderId, "SAMPLE_COLLECTED");
      alert("Sample collected. Ready to run analysis.");
    } catch (e) {
      console.log("Sample collection cancelled:", e);
    }
  };

  const handleAddCustomRow = () => {
    if (!customParamName.trim() || !customParamVal.trim() || !customParamRef.trim()) {
      alert("Please fill in parameter name, value, and reference range.");
      return;
    }
    setCustomResultsList([
      ...customResultsList,
      {
        parameter: customParamName.trim(),
        value: customParamVal.trim(),
        referenceRange: customParamRef.trim(),
        status: customParamStatus
      }
    ]);
    setCustomParamName("");
    setCustomParamVal("");
    setCustomParamRef("");
    setCustomParamStatus("NORMAL");
  };

  const handleAddScreeningTest = () => {
    if (!newScreeningName.trim()) {
      alert("Please enter a valid screening test name (e.g. Syphilis, Malaria).");
      return;
    }
    const exists = screeningTestsList.some(t => t.parameter.toLowerCase() === newScreeningName.trim().toLowerCase());
    if (exists) {
      alert("This test parameter already exists in the results panel.");
      return;
    }
    setScreeningTestsList([
      ...screeningTestsList,
      {
        parameter: newScreeningName.trim(),
        value: newScreeningVal,
        referenceRange: "Non-Reactive",
        status: (newScreeningVal === "Reactive" || newScreeningVal === "Positive") ? "CRITICAL" : "NORMAL"
      }
    ]);
    setNewScreeningName("");
    setNewScreeningVal("Non-Reactive");
  };

  const handleRemoveScreeningTest = (paramName: string) => {
    setScreeningTestsList(prev => prev.filter(t => t.parameter !== paramName));
  };

  const handleTransmitResults = async (orderId: string) => {
    const finalResults = [
      { parameter: "Genotype", value: labGenotype, referenceRange: "AA/AS/AC", status: (labGenotype === "SS" || labGenotype === "SC") ? "CRITICAL" as const : "NORMAL" as const },
      { parameter: "Blood Group", value: labBloodGroup, referenceRange: "ABO System", status: "NORMAL" as const },
      ...screeningTestsList,
      ...customResultsList
    ];

    try {
      // First update status to PROCESSING silently (simulate machine load)
      const activeOrderObj = labOrders.find(o => o.id === orderId);
      const patientName = activeOrderObj ? activeOrderObj.patientName : "Patient";
      
      const { signerName, faceImage } = await updateLabStatus(orderId, "PROCESSING");
      
      // Submit completed results
      await updateLabStatus(orderId, "COMPLETED", finalResults, signerName, faceImage || undefined);
      
      alert(`Lab report successfully transmitted and signed off for ${patientName}`);
      setActiveAnalysisOrderId(null);
      setCustomResultsList([]);
      setLabGenotype("AA");
      setLabBloodGroup("O+");
      setScreeningTestsList([
        { parameter: "HIV Test", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" },
        { parameter: "Hepatitis B (HBsAg)", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" },
        { parameter: "Hepatitis C (HCV Ab)", value: "Non-Reactive", referenceRange: "Non-Reactive", status: "NORMAL" }
      ]);
      setNewScreeningName("");
      setNewScreeningVal("Non-Reactive");
    } catch (e) {
      console.log("Results transmission cancelled:", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Lab Pathology Worklist</h2>
        <p className="text-xs text-secondary">
          {activeTab === "analyzers" ? "Run blood and chemical analyzer modules." :
           activeTab === "quality" ? "Reference and results history log." :
           "Manage specimen tracking worklists."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specimens worklist */}
        <div className={`bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 ${activeAnalysisOrderId ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <h3 className="text-sm font-bold border-b border-border pb-2">Specimens worklist</h3>

          {unpaidOrders.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-warning">⏳ Awaiting Payment Clearance</p>
              {unpaidOrders.map((ord) => (
                <div key={ord.id} className="p-3 border border-warning/30 rounded-xl bg-warning/5 flex justify-between items-center text-xs opacity-70">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-foreground">{ord.patientName}</h4>
                      <button
                        type="button"
                        onClick={() => setHistoryPatientId(ord.patientId)}
                        className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                        title="View Chart History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-secondary">Test: <span className="font-semibold">{ord.testName}</span></p>
                    <p className="text-[10px] text-secondary">Ordered: {formatDate(ord.orderedAt)} by {ord.orderedByName}</p>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-warning/15 text-warning text-[9px] font-bold uppercase">
                    <Lock className="w-3 h-3" /> UNPAID
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {paidOrders.length === 0 && unpaidOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-secondary font-semibold">No lab orders in system.</div>
            )}
            {paidOrders.length === 0 && unpaidOrders.length > 0 && (
              <div className="py-8 text-center text-xs text-secondary font-semibold">No payment-cleared orders to process yet.</div>
            )}
            {paidOrders.map((ord) => (
              <div key={ord.id} className="p-4 border border-border rounded-xl bg-accent/20 flex flex-col justify-between gap-4 text-xs animate-fade-in">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-foreground">{ord.patientName}</h4>
                        <button
                          type="button"
                          onClick={() => setHistoryPatientId(ord.patientId)}
                          className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                          title="View Chart History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary">Test Ordered: <span className="text-foreground font-semibold">{ord.testName}</span></p>
                      <p className="text-[10px] text-secondary">Ordered By: {ord.orderedByName} | Date: {formatDate(ord.orderedAt)} {formatTime(ord.orderedAt)}</p>
                      {ord.clinicalIndication && (
                        <p className="text-[10px] text-secondary italic mt-1 bg-accent/40 px-2 py-1 rounded">Indication: "{ord.clinicalIndication}"</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === "COMPLETED" ? "bg-success/15 text-success" : 
                      ord.status === "SAMPLE_COLLECTED" ? "bg-info/15 text-info" : "bg-warning/15 text-warning"
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  {ord.resultData && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-card border border-border p-2 rounded-lg">
                      {ord.resultData.map((res, i) => (
                        <div key={i} className="text-center p-1.5 border border-border/40 rounded bg-accent/20">
                          <span className="text-[8px] text-secondary font-bold block uppercase">{res.parameter}</span>
                          <span className={`font-bold ${res.status === "CRITICAL" ? "text-danger" : "text-foreground"}`}>{res.value}</span>
                          <span className="text-[8px] text-secondary block">Ref: {res.referenceRange}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {ord.status !== "COMPLETED" && (activeTab === "dashboard" || activeTab === "analyzers") && (
                  <div className="flex justify-end space-x-2 pt-2 border-t border-border/20">
                    {ord.status === "PENDING" ? (
                      <button onClick={() => handleCollectSample(ord.id)} className="px-3 py-1 bg-primary text-white rounded text-xs font-semibold">
                        Collect Sample
                      </button>
                    ) : (
                      <button onClick={() => {
                        setActiveAnalysisOrderId(ord.id);
                        setCustomResultsList([]);
                      }} className="px-3 py-1 bg-success hover:bg-success-hover text-white rounded text-xs font-semibold">
                        Enter Lab Results
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enter Results Sidebar Form */}
        {activeAnalysisOrderId && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="text-sm font-bold text-primary">Lab Results Recorder</h3>
              <button onClick={() => setActiveAnalysisOrderId(null)} className="text-secondary hover:text-foreground text-xs font-bold">Cancel</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Genotype */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Genotype</label>
                <select
                  value={labGenotype}
                  onChange={(e) => setLabGenotype(e.target.value)}
                  className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                >
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="SS">SS (Sickle Cell)</option>
                  <option value="AC">AC</option>
                  <option value="SC">SC</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Blood Group</label>
                <select
                  value={labBloodGroup}
                  onChange={(e) => setLabBloodGroup(e.target.value)}
                  className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                >
                  <option value="O+">O Rh D positive (O+)</option>
                  <option value="O-">O Rh D negative (O-)</option>
                  <option value="A+">A Rh D positive (A+)</option>
                  <option value="A-">A Rh D negative (A-)</option>
                  <option value="B+">B Rh D positive (B+)</option>
                  <option value="B-">B Rh D negative (B-)</option>
                  <option value="AB+">AB Rh D positive (AB+)</option>
                  <option value="AB-">AB Rh D negative (AB-)</option>
                </select>
              </div>

              {/* Screening/Serology Tests List */}
              <div className="border-t border-border pt-3 space-y-2.5">
                <h4 className="text-[10px] font-bold text-secondary uppercase">Rapid / Screening Tests</h4>
                
                {/* List currently recorded screening tests */}
                {screeningTestsList.length > 0 && (
                  <div className="bg-accent/15 border border-border/40 p-2 rounded-lg space-y-1.5 text-[10px]">
                    {screeningTestsList.map((test, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-border/10 pb-1">
                        <div>
                          <span className="font-semibold text-foreground">{test.parameter}: </span>
                          <span className={test.status === "CRITICAL" ? "text-danger font-bold" : "text-secondary font-medium"}>
                            {test.value}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveScreeningTest(test.parameter)}
                          className="text-danger hover:text-danger/80 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new screening test inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Test Parameter</label>
                    <input
                      type="text"
                      placeholder="e.g. Syphilis, HIV, HBV"
                      value={newScreeningName}
                      onChange={(e) => setNewScreeningName(e.target.value)}
                      className="w-full p-1 border border-border bg-accent/20 rounded text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Result</label>
                    <select
                      value={newScreeningVal}
                      onChange={(e) => setNewScreeningVal(e.target.value)}
                      className="w-full p-1 border border-border bg-accent/20 rounded text-[11px]"
                      style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    >
                      <option value="Non-Reactive">Non-Reactive (Negative)</option>
                      <option value="Reactive">Reactive (Positive)</option>
                      <option value="Negative">Negative</option>
                      <option value="Positive">Positive</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddScreeningTest}
                  className="w-full py-1 bg-accent hover:bg-accent/60 font-semibold rounded text-[10px] transition-all"
                >
                  + Add / Update Screening Test
                </button>
              </div>

              {/* Custom Parameter Section */}
              <div className="border-t border-border pt-3 space-y-2.5">
                <h4 className="text-[10px] font-bold text-secondary uppercase">Additional Parameters</h4>
                
                {/* Custom list summary */}
                {customResultsList.length > 0 && (
                  <div className="bg-accent/15 border border-border/40 p-2 rounded-lg space-y-1 text-[10px]">
                    {customResultsList.map((row, index) => (
                      <div key={index} className="flex justify-between border-b border-border/10 pb-1">
                        <span className="font-semibold">{row.parameter}:</span>
                        <span>{row.value} (Ref: {row.referenceRange}) ({row.status})</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Parameter</label>
                    <input type="text" placeholder="e.g. WBC" value={customParamName} onChange={(e) => setCustomParamName(e.target.value)} className="w-full p-1 border border-border bg-accent/20 rounded" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Value</label>
                    <input type="text" placeholder="e.g. 7.4" value={customParamVal} onChange={(e) => setCustomParamVal(e.target.value)} className="w-full p-1 border border-border bg-accent/20 rounded" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Ref Range</label>
                    <input type="text" placeholder="e.g. 4.5-11.0" value={customParamRef} onChange={(e) => setCustomParamRef(e.target.value)} className="w-full p-1 border border-border bg-accent/20 rounded" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-secondary font-bold">Status</label>
                    <select
                      value={customParamStatus}
                      onChange={(e) => setCustomParamStatus(e.target.value as any)}
                      className="w-full p-1 border border-border bg-accent/20 rounded text-[11px]"
                      style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="LOW">LOW</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <button type="button" onClick={handleAddCustomRow} className="w-full py-1.5 bg-accent hover:bg-accent/60 font-semibold rounded text-[10px] transition-all">
                  + Add Parameter Row
                </button>
              </div>

              {/* Submission */}
              <button
                type="button"
                onClick={() => handleTransmitResults(activeAnalysisOrderId)}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transition-all mt-4"
              >
                Sign & Transmit Verified Lab Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 6. RADIOLOGIST DICOM VIEWER
// ============================================================================
export function RadiologistDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { radiologyOrders, updateRadiologyStatus, setHistoryPatientId } = useEhr();

  const paidRadOrders = radiologyOrders.filter(o => o.paymentStatus === "PAID" || o.paymentStatus === "WAIVED");
  const unpaidRadOrders = radiologyOrders.filter(o => o.paymentStatus === "UNPAID");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [annotations, setAnnotations] = useState<{ x: number; y: number; text: string }[]>([]);
  const [activeReport, setActiveReport] = useState("");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);

  const activeOrder = radiologyOrders.find((r) => r.id === selectedOrderId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    ctx.filter = "none";
    annotations.forEach((ann) => {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px sans-serif";
      ctx.fillText(ann.text, ann.x + 8, ann.y + 3);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    if (uploadedImageSrc) {
      const img = new Image();
      img.src = uploadedImageSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAnnotations(ctx);
      };
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 4;

      // Spine
      ctx.beginPath();
      ctx.moveTo(150, 20);
      ctx.lineTo(150, 280);
      ctx.stroke();

      // Ribs
      for (let i = 0; i < 8; i++) {
        const y = 60 + i * 25;
        ctx.beginPath();
        ctx.ellipse(150, y, 70, 15, Math.PI / 10, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(150, y, 70, 15, -Math.PI / 10, 1.5 * Math.PI, 0.5 * Math.PI);
        ctx.stroke();
      }
      drawAnnotations(ctx);
    }
  }, [brightness, contrast, annotations, selectedOrderId, uploadedImageSrc]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const label = prompt("Enter annotation note:");
    if (label) {
      setAnnotations([...annotations, { x, y, text: label }]);
    }
  };

  const handleApproveReport = async () => {
    if (!selectedOrderId) return;
    if (!activeReport.trim()) {
      alert("Please write the radiological findings report description before signing off approval.");
      return;
    }
    try {
      await updateRadiologyStatus(selectedOrderId, "APPROVED", activeReport.trim(), "Consistent with chest findings.", uploadedImageSrc || "/dicom-store/image.dcm", annotations);
      alert("Report approved.");
      setActiveReport("");
      setUploadedImageSrc(null);
    } catch (err) {
      console.log("Radiology approval cancelled:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Radiology Desk</h2>
        <p className="text-xs text-secondary">
          {activeTab === "imaging" ? "PACS clinical image canvas tools." :
           activeTab === "reporting" ? "Write and sign off findings." :
           "Overview of pending radiological requests."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worklist */}
        {(activeTab === "dashboard" || activeTab === "reporting") && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold border-b border-border pb-2">Imaging requests</h3>
            <div className="space-y-2">
              {unpaidRadOrders.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-warning">⏳ Awaiting Payment</p>
                  {unpaidRadOrders.map((ord) => (
                    <div key={ord.id} className="w-full p-2.5 rounded-xl border border-warning/30 bg-warning/5 text-xs flex justify-between items-center opacity-60">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-foreground">{ord.patientName}</h4>
                          <button
                            type="button"
                            onClick={() => setHistoryPatientId(ord.patientId)}
                            className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                            title="View Chart History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-secondary">{ord.modality} - {ord.bodyPart}</p>
                      </div>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/15 text-warning text-[8px] font-bold"><Lock className="w-2.5 h-2.5" /> UNPAID</span>
                    </div>
                  ))}
                </div>
              )}
              {paidRadOrders.length === 0 && unpaidRadOrders.length > 0 && (
                <p className="text-center text-xs text-secondary py-6 font-semibold">No payment-cleared scans to review.</p>
              )}
              {paidRadOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center cursor-pointer ${
                    selectedOrderId === ord.id ? "bg-primary/10 border-primary text-primary" : "bg-accent/20 hover:bg-accent/40"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-foreground">{ord.patientName}</h4>
                    <p className="text-[10px] text-secondary">{ord.modality} - {ord.bodyPart}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistoryPatientId(ord.patientId);
                    }}
                    className="p-1 hover:bg-primary hover:text-white rounded text-secondary transition-all"
                    title="View Chart History"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas DICOM */}
        {(activeTab === "dashboard" || activeTab === "imaging") && (
          <div className={`${activeTab === "imaging" ? "lg:col-span-3" : ""} bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col items-center justify-center`}>
            <h3 className="text-sm font-bold border-b border-border pb-2 w-full mb-4">PACS DICOM Viewer</h3>
            {activeOrder ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                <canvas ref={canvasRef} width={300} height={300} onClick={handleCanvasClick} className="border-2 border-slate-900 rounded-lg cursor-crosshair shadow-md" />
                
                {/* PACS Image File Uploader */}
                <div className="w-full max-w-sm border border-dashed border-border rounded-xl p-3 bg-accent/10 flex flex-col items-center justify-center text-center text-xs">
                  <span className="text-[10px] font-bold text-secondary uppercase mb-1.5 tracking-wider">PACS Scan File Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-[10px] text-foreground file:mr-2.5 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                  />
                  {uploadedImageSrc && (
                    <span className="text-[9px] text-success font-bold mt-1.5">✓ Uploaded Scan Registered to Canvas</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-xs mt-2">
                  <div>
                    <label className="block text-[10px] text-secondary">Brightness</label>
                    <input type="range" min="50" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary">Contrast</label>
                    <input type="range" min="50" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-secondary">Select an imaging order.</div>
            )}
          </div>
        )}

        {/* Report writer */}
        {(activeTab === "dashboard" || activeTab === "reporting") && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Diagnostics Findings Report</h3>
            {activeOrder ? (
              <div className="space-y-4">
                <textarea rows={6} value={activeReport} onChange={(e) => setActiveReport(e.target.value)} placeholder="Type findings..." className="w-full p-2.5 rounded border border-border bg-accent/20 text-xs text-foreground focus:outline-none" />
                <button onClick={handleApproveReport} className="w-full py-2 bg-primary text-white rounded text-xs font-semibold">Sign Report</button>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-secondary">Select an imaging order.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 7. ACCOUNTANT & BILLING LEDGER
// ============================================================================
export function AccountantDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { invoices, addPayment, payments, labOrders, radiologyOrders, prescriptions, markOrderPaid, patients, setHistoryPatientId } = useEhr();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<"CASH" | "CARD" | "INSURANCE">("CASH");

  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  // Pending billable orders (all UNPAID across types)
  const pendingLabOrders = labOrders.filter(o => o.paymentStatus === "UNPAID");
  const pendingRadOrders = radiologyOrders.filter(o => o.paymentStatus === "UNPAID");
  const pendingRxOrders = prescriptions.filter(o => o.paymentStatus === "UNPAID" && o.status !== "DISPENSED");
  const totalPending = pendingLabOrders.length + pendingRadOrders.length + pendingRxOrders.length;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert("Please select a patient invoice to log a payment against.");
      return;
    }
    if (payAmount <= 0) {
      alert("Please enter a valid payment amount greater than zero.");
      return;
    }
    if (activeInvoice) {
      const invoicePayments = payments.filter(p => p.invoiceId === selectedInvoiceId);
      const totalPaid = invoicePayments.reduce((acc, p) => acc + p.amount, 0);
      const balance = activeInvoice.patientPayable - totalPaid;
      if (payAmount > balance) {
        alert(`Transaction rejected: Payment amount ($${payAmount}) exceeds the outstanding balance ($${balance}).`);
        return;
      }
    }
    try {
      await addPayment(selectedInvoiceId, Number(payAmount), payMethod);
      alert("Payment logged.");
      setPayAmount(0);
    } catch (err) {
      console.log("Payment logging cancelled:", err);
    }
  };

  const handleMarkPaid = async (type: "lab" | "radiology" | "prescription", id: string, status: "PAID" | "WAIVED" = "PAID") => {
    try {
      await markOrderPaid(type, id, status);
    } catch (err) {
      console.log("Mark paid cancelled:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Revenue Ledger</h2>
        <p className="text-xs text-secondary">
          {activeTab === "billing" ? "Process split billing and patient collections." :
           activeTab === "insurance" ? "Manage insurance claims dispatch." :
           activeTab === "orders" ? "Review and clear pending billable orders." :
           "Overview of accounts receivable."}
        </p>
      </div>

      {/* Pending Billable Orders Panel */}
      {(activeTab === "dashboard" || activeTab === "orders") && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold">Pending Billable Orders</h3>
            {totalPending > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold">{totalPending} awaiting clearance</span>
            )}
          </div>

          {totalPending === 0 ? (
            <div className="py-8 text-center text-xs text-secondary font-semibold">✓ All orders have been processed. No pending payments.</div>
          ) : (
            <div className="space-y-4">
              {/* Lab Orders */}
              {pendingLabOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">🔬 Laboratory Orders</p>
                  {pendingLabOrders.map((ord) => {
                    const patient = patients.find(p => p.id === ord.patientId);
                    return (
                      <div key={ord.id} className="p-3.5 border border-border rounded-xl bg-accent/20 text-xs">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-foreground">{ord.patientName}</h4>
                              <button
                                type="button"
                                onClick={() => setHistoryPatientId(ord.patientId)}
                                className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                                title="View Chart History"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {patient && <span className="text-[9px] text-secondary font-mono bg-accent/40 px-1.5 py-0.5 rounded">MRN: {patient.mrn}</span>}
                            </div>
                            <p className="text-[10px] text-secondary mt-0.5">Test: <span className="font-semibold text-foreground">{ord.testName}</span></p>
                            <p className="text-[10px] text-secondary">Ordered by: {ord.orderedByName} · {formatDate(ord.orderedAt)}</p>
                            {patient && <p className="text-[10px] text-secondary">Insurance: {patient.insuranceProvider || "None"}</p>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button onClick={() => handleMarkPaid("lab", ord.id, "PAID")} className="px-3 py-1 bg-success/90 hover:bg-success text-white text-[10px] font-bold rounded-lg transition-all shadow">
                              ✓ Mark Paid
                            </button>
                            <button onClick={() => handleMarkPaid("lab", ord.id, "WAIVED")} className="px-3 py-1 bg-accent hover:bg-accent/70 text-foreground text-[10px] font-bold rounded-lg transition-all border border-border">
                              Waive
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Radiology Orders */}
              {pendingRadOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">🩻 Radiology Orders</p>
                  {pendingRadOrders.map((ord) => {
                    const patient = patients.find(p => p.id === ord.patientId);
                    return (
                      <div key={ord.id} className="p-3.5 border border-border rounded-xl bg-accent/20 text-xs">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-foreground">{ord.patientName}</h4>
                              <button
                                type="button"
                                onClick={() => setHistoryPatientId(ord.patientId)}
                                className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                                title="View Chart History"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {patient && <span className="text-[9px] text-secondary font-mono bg-accent/40 px-1.5 py-0.5 rounded">MRN: {patient.mrn}</span>}
                            </div>
                            <p className="text-[10px] text-secondary mt-0.5">Scan: <span className="font-semibold text-foreground">{ord.modality} — {ord.bodyPart}</span></p>
                            <p className="text-[10px] text-secondary">Ordered by: {ord.orderedByName} · {formatDate(ord.orderedAt)}</p>
                            {patient && <p className="text-[10px] text-secondary">Insurance: {patient.insuranceProvider || "None"}</p>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button onClick={() => handleMarkPaid("radiology", ord.id, "PAID")} className="px-3 py-1 bg-success/90 hover:bg-success text-white text-[10px] font-bold rounded-lg transition-all shadow">
                              ✓ Mark Paid
                            </button>
                            <button onClick={() => handleMarkPaid("radiology", ord.id, "WAIVED")} className="px-3 py-1 bg-accent hover:bg-accent/70 text-foreground text-[10px] font-bold rounded-lg transition-all border border-border">
                              Waive
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prescription Orders */}
              {pendingRxOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">💊 Prescription Orders</p>
                  {pendingRxOrders.map((rx) => {
                    const patient = patients.find(p => p.id === rx.patientId);
                    return (
                      <div key={rx.id} className="p-3.5 border border-border rounded-xl bg-accent/20 text-xs">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-foreground">{rx.patientName}</h4>
                              <button
                                type="button"
                                onClick={() => setHistoryPatientId(rx.patientId)}
                                className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                                title="View Chart History"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {patient && <span className="text-[9px] text-secondary font-mono bg-accent/40 px-1.5 py-0.5 rounded">MRN: {patient.mrn}</span>}
                            </div>
                            <p className="text-[10px] text-secondary mt-0.5">Drugs: <span className="font-semibold text-foreground">{rx.items.map(i => `${i.drugName} (${i.dosage})`).join(", ")}</span></p>
                            <p className="text-[10px] text-secondary">Prescribed by: {rx.doctorName} · {formatDate(rx.prescribedAt)}</p>
                            {patient && <p className="text-[10px] text-secondary">Insurance: {patient.insuranceProvider || "None"}</p>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button onClick={() => handleMarkPaid("prescription", rx.id, "PAID")} className="px-3 py-1 bg-success/90 hover:bg-success text-white text-[10px] font-bold rounded-lg transition-all shadow">
                              ✓ Mark Paid
                            </button>
                            <button onClick={() => handleMarkPaid("prescription", rx.id, "WAIVED")} className="px-3 py-1 bg-accent hover:bg-accent/70 text-foreground text-[10px] font-bold rounded-lg transition-all border border-border">
                              Waive
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(activeTab === "dashboard" || activeTab === "insurance") && (
          <div className={`${activeTab === "insurance" ? "lg:col-span-3" : "lg:col-span-2"} bg-card border border-border rounded-xl p-5 shadow-sm space-y-4`}>
            <h3 className="text-sm font-bold border-b border-border pb-2">Split Invoices Ledger</h3>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`w-full text-left p-3.5 border rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                    selectedInvoiceId === inv.id ? "bg-primary/10 border-primary text-primary" : "bg-accent/20 border-border hover:bg-accent/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-foreground">{inv.patientName}</h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryPatientId(inv.patientId);
                        }}
                        className="text-secondary hover:text-primary transition-all p-0.5 rounded-lg"
                        title="View Chart History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-secondary">Invoiced: {formatDate(inv.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">${inv.patientPayable.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      inv.status === "PAID" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "dashboard" || activeTab === "billing") && (
          <div className={`${activeTab === "billing" ? "lg:col-span-3" : ""} bg-card border border-border rounded-xl p-5 shadow-sm space-y-6`}>
            {activeInvoice ? (
              <>
                <div className="text-xs space-y-2">
                  <h3 className="text-sm font-bold border-b border-border pb-2">Split Bill Model</h3>
                  <div className="flex justify-between"><span>Patient:</span> <span>{activeInvoice.patientName}</span></div>
                  <div className="flex justify-between"><span>Insurance Cover:</span> <span className="text-primary">${activeInvoice.insuranceCovered.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold border-t border-border pt-2"><span>Payable:</span> <span>${activeInvoice.patientPayable.toFixed(2)}</span></div>
                </div>
                <form onSubmit={handlePay} className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Amount ($)</label>
                    <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="w-full p-2 border border-border bg-accent/20 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-secondary mb-1">Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as any)}
                      className="w-full p-2 border border-border rounded-lg text-xs"
                      style={{
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <option value="CASH" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Cash drawer</option>
                      <option value="CARD" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Credit card</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-white rounded text-xs font-semibold shadow">Collect Receipt</button>
                </form>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-secondary">Select an invoice from the ledger to compute split models.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



// ============================================================================
// 9. SUPER ADMINISTRATOR
// ============================================================================
function HospitalConfigView() {
  const { exportFhirPatient, exportHl7Patient } = useEhr();
  const [hospitals, setHospitals] = useState([
    { id: "hosp-1", name: "St. Mary's General Hospital", code: "SMGH-01", address: "742 Evergreen Terrace, Springfield", beds: 85, depts: 35, status: "ACTIVE", type: "General" },
    { id: "hosp-2", name: "Mercy Clinical Annex", code: "MCA-02", address: "112 Ocean Avenue, Amityville", beds: 15, depts: 8, status: "ACTIVE", type: "Outpatient" },
    { id: "hosp-3", name: "Aether Regional Lab Center", code: "ARLC-03", address: "550 Broad St, North City", beds: 0, depts: 4, status: "MAINTENANCE", type: "Diagnostic" }
  ]);

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("General");
  const [newBeds, setNewBeds] = useState(10);
  const [newDepts, setNewDepts] = useState(5);
  const [newAddress, setNewAddress] = useState("");

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    const newHosp = {
      id: `hosp-${Date.now()}`,
      name: newName.trim(),
      code: newCode.trim().toUpperCase(),
      address: newAddress.trim() || "Address Pending",
      beds: Number(newBeds),
      depts: Number(newDepts),
      status: "ACTIVE",
      type: newType
    };
    setHospitals([...hospitals, newHosp]);
    setNewName("");
    setNewCode("");
    setNewAddress("");
    alert(`Site '${newHosp.name}' added to clinical network ledger.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-[9px] font-bold text-secondary uppercase">Connected Branches</span>
          <h4 className="text-xl font-bold mt-1 text-foreground">{hospitals.length}</h4>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-[9px] font-bold text-secondary uppercase">Total Bed Capacity</span>
          <h4 className="text-xl font-bold mt-1 text-foreground">{hospitals.reduce((acc, h) => acc + h.beds, 0)}</h4>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-[9px] font-bold text-secondary uppercase">Active Departments</span>
          <h4 className="text-xl font-bold mt-1 text-foreground">{hospitals.reduce((acc, h) => acc + h.depts, 0)}</h4>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-[9px] font-bold text-secondary uppercase">Sync Status</span>
          <h4 className="text-xl font-bold mt-1 text-success flex items-center">
            <span className="w-2 h-2 rounded-full bg-success mr-1.5 animate-pulse" />
            100% Operational
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospitals List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
            <Building className="w-4 h-4 mr-1.5 text-primary" /> Hospital Site Configuration Ledger
          </h3>
          <div className="space-y-3">
            {hospitals.map((h) => (
              <div key={h.id} className="p-4 bg-accent/25 rounded-xl border border-border/40 text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-foreground text-sm">{h.name}</h4>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase">{h.type}</span>
                  </div>
                  <p className="text-secondary font-mono text-[9px]">{h.code} | {h.address}</p>
                  <div className="flex space-x-4 pt-1 text-[10px] text-secondary font-semibold">
                    <span>Depts: <strong className="text-foreground">{h.depts}</strong></span>
                    <span>Beds: <strong className="text-foreground">{h.beds}</strong></span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  h.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>{h.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Hospital Form */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center">
            <Plus className="w-4 h-4 mr-1.5 text-primary" /> Register New Branch
          </h3>
          <form onSubmit={handleAddHospital} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Branch Name *</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Mercy Children Hospital" className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Unique Code *</label>
                <input type="text" required value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. MCH-04" className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Facility Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-foreground focus:ring-1 focus:ring-primary focus:outline-none" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                  <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>General</option>
                  <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Outpatient</option>
                  <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Diagnostic</option>
                  <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Research</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Configured Beds</label>
                <input type="number" value={newBeds} onChange={(e) => setNewBeds(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Active Depts</label>
                <input type="number" value={newDepts} onChange={(e) => setNewDepts(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Physical Address</label>
              <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="e.g. 123 Health Ave, Springfield" className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold shadow transition-all">
              Initialize Branch Site
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SecurityApiView() {
  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "PACS DICOM Gateway Integration", key: "ae_live_8f0a82b991cd4a22b918a", created: "2026-04-10", scope: "Imaging READ/WRITE" },
    { id: "key-2", name: "FHIR Interoperability Exchange Sync", key: "ae_live_f1947b0a88cd42a2b9d88", created: "2026-05-15", scope: "Patient Records READ" },
    { id: "key-3", name: "Athena Health Split-Invoicing Gateway", key: "ae_live_77e02b8d4ab2087c9bc35", created: "2026-06-20", scope: "Financial READ/WRITE" }
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("Patient Records READ");

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: `ae_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      created: new Date().toISOString().split("T")[0],
      scope: newKeyScope
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    alert(`Generated API access token for '${newKey.name}' client.`);
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke API access credentials for '${name}'? This action is immediate.`)) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-success">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-foreground">Compliance Guard</h4>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            HIPAA Audit Mode is active. All server mutations are synced to the tamper-proof ledger database.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-primary">
            <Lock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-foreground">Active Encryption</h4>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            TLS 1.3 configured. Internal SQL clusters utilize AES-256 transparent database encryption (TDE).
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-warning">
            <Activity className="w-5 h-5" />
            <h4 className="font-bold text-sm text-foreground">FHIR Sync Webhook</h4>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Automatic real-time sync with regional public health CDC database registries active.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keys Ledger */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
            <Key className="w-4 h-4 mr-1.5 text-primary" /> Active API Integration Credentials
          </h3>
          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-4 bg-accent/25 rounded-xl border border-border/40 text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm">{k.name}</h4>
                  <p className="text-secondary text-[10px] font-semibold uppercase">Scope: <span className="text-primary">{k.scope}</span></p>
                  <p className="font-mono text-[10px] text-secondary/90 bg-accent border border-border/30 px-2 py-1 rounded max-w-sm truncate mt-1">
                    {k.key}
                  </p>
                  <p className="text-[9px] text-secondary font-mono pt-1">Issued on: {k.created}</p>
                </div>
                <button
                  onClick={() => handleRevoke(k.id, k.name)}
                  className="px-2.5 py-1 text-[10px] font-bold text-danger hover:bg-danger/10 border border-danger/25 hover:border-danger/40 rounded transition-all"
                >
                  Revoke Key
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Token Form */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold border-b border-border pb-2 mb-4 flex items-center">
            <Plus className="w-4 h-4 mr-1.5 text-primary" /> Register Client Integration
          </h3>
          <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Client Application Name *</label>
              <input type="text" required value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. MyChart Patient Portal" className="w-full px-3 py-2 rounded-lg border border-border bg-accent/20 text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-secondary mb-1">Access Token Scope</label>
              <select value={newKeyScope} onChange={(e) => setNewKeyScope(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-foreground focus:ring-1 focus:ring-primary focus:outline-none" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Patient Records READ</option>
                <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Patient Records READ/WRITE</option>
                <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Imaging READ</option>
                <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Imaging READ/WRITE</option>
                <option style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Financial READ/WRITE</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold shadow transition-all">
              Provision Integration Key
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { auditLogs, staffList } = useEhr();
  const [selectedVerifyLog, setSelectedVerifyLog] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchText = (
        log.action.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.ipAddress.toLowerCase().includes(query) ||
        (log.signerName && log.signerName.toLowerCase().includes(query)) ||
        log.userRole.toLowerCase().includes(query) ||
        formatTime(log.timestamp).toLowerCase().includes(query) ||
        formatDate(log.timestamp).toLowerCase().includes(query)
      );
      if (!matchText) return false;
    }

    if (selectedRole && log.userRole !== selectedRole) {
      return false;
    }

    if (startDate) {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (logDate < startDate) return false;
    }

    if (endDate) {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (logDate > endDate) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">
          {activeTab === "hospitals" ? "Hospital Network Configuration" :
           activeTab === "security" ? "Security Policies & API Keys" :
           "Super Admin Console"}
        </h2>
        <p className="text-xs text-secondary">
          {activeTab === "hospitals" ? "Manage clinical network setup and register hospital branches." :
           activeTab === "staff" ? "Manage active clinician login profiles." :
           activeTab === "audits" ? "HIPAA access tracking database." :
           activeTab === "security" ? "Manage system-level API access keys, encryption status, and compliance protocols." :
           "Overview of database audit logs and clinician directories."}
        </p>
      </div>

      {(activeTab === "dashboard" || activeTab === "staff" || activeTab === "audits") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinicians */}
          {(activeTab === "dashboard" || activeTab === "staff") && (
            <div className={`${activeTab === "staff" ? "lg:col-span-3" : ""} bg-card border border-border rounded-xl p-5 shadow-sm space-y-4`}>
              <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-primary" /> Active Clinician Directory
              </h3>
              <div className="space-y-2">
                {staffList.map((st) => (
                  <div key={st.id} className="p-3 bg-accent/30 rounded-xl border border-border/40 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">
                        {st.firstName || st.lastName ? `${st.firstName} ${st.lastName}`.trim() : st.role.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </h4>
                      <p className="text-[10px] text-secondary">{st.role.replace("_", " ").toUpperCase()} | {st.department}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[9px] font-bold uppercase">{st.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audits */}
          {(activeTab === "dashboard" || activeTab === "audits") && (
            <div className={`${activeTab === "audits" ? "lg:col-span-3" : "lg:col-span-2"} bg-card border border-border rounded-xl p-5 shadow-sm space-y-4`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-3">
                <h3 className="text-sm font-bold flex items-center">
                  <HardDrive className="w-4 h-4 mr-1.5 text-primary" /> HIPAA Access Logs
                </h3>
                <span className="text-[10px] text-secondary font-semibold uppercase bg-accent border border-border/40 px-2.5 py-0.5 rounded-full">
                  Showing {filteredLogs.length} of {auditLogs.length} Entries
                </span>
              </div>

              {/* Advanced Filter Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-accent/15 border border-border/30 rounded-xl p-3 text-xs">
                {/* Search */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-secondary">Search Terms</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Keywords, names, details..."
                      className="w-full pl-7 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                    <div className="absolute left-2 top-2.5 text-secondary">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-secondary">Operator Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                  >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="receptionist">HIM</option>
                    <option value="lab_scientist">Lab Scientist</option>
                    <option value="radiologist">Radiologist</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-secondary">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-secondary">End Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      style={{ colorScheme: 'dark' }}
                    />
                    {(searchQuery || selectedRole || startDate || endDate) && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedRole("");
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="px-2.5 bg-danger/10 hover:bg-danger/25 text-danger border border-danger/30 rounded-lg text-xs font-bold transition-all uppercase tracking-wider"
                        title="Clear Filters"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-secondary">No matching system access logs found.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-accent/20 border border-border/40 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                        <span>{log.action}</span>
                        <span className="text-[9px] text-secondary font-mono">{formatDate(log.timestamp)} {formatTime(log.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-secondary">{log.details}</p>
                      <div className="flex justify-between items-center text-[9px] text-secondary font-mono pt-1 border-t border-border/10 mt-1">
                        <div>
                          <span>User: {log.userName}</span>
                          {log.signerName && (
                            <span className="ml-2 pl-2 border-l border-border/45 text-foreground font-bold">
                              Signed: {log.signerName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>IP: {log.ipAddress}</span>
                          {log.faceImage && (
                            <button
                              onClick={() => setSelectedVerifyLog(log)}
                              className="ml-2 px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[8px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1"
                            >
                              <Video className="w-2.5 h-2.5" />
                              <span>Verify</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "hospitals" && (
        <HospitalConfigView />
      )}

      {activeTab === "security" && (
        <SecurityApiView />
      )}

      {/* Biometric Capture Audit Verification Modal */}
      {selectedVerifyLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-foreground relative animate-scale-up">
            <button
              onClick={() => setSelectedVerifyLog(null)}
              className="absolute top-4 right-4 text-secondary hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4">
              <div className="p-2 bg-primary/15 rounded-lg text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Audit Identity Verification</h3>
                <p className="text-[9px] text-secondary uppercase font-semibold tracking-wider">HIPAA Compliance Sign-off</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo */}
              <div className="bg-accent/10 border border-border rounded-xl p-2 flex items-center justify-center overflow-hidden aspect-video md:aspect-square relative">
                {selectedVerifyLog.faceImage ? (
                  <img
                    src={selectedVerifyLog.faceImage}
                    alt="Captured biometric verification"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-[10px] text-secondary">No capture available</span>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs py-1 px-2 rounded text-[8px] text-white/95 font-mono text-center truncate">
                  Biometric Verification Snapshot
                </div>
              </div>

              {/* Log Details */}
              <div className="space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Logged Action</span>
                    <span className="font-semibold text-primary">{selectedVerifyLog.action}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Timestamp</span>
                    <span className="font-mono text-[11px]">{formatDate(selectedVerifyLog.timestamp)} {formatTime(selectedVerifyLog.timestamp)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Operator (User)</span>
                    <span>{selectedVerifyLog.userName} ({selectedVerifyLog.userRole.replace("_", " ").toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Digital Signature (Name Entered)</span>
                    <span className="font-bold text-white bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">
                      ✓ {selectedVerifyLog.signerName || selectedVerifyLog.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Action Details</span>
                    <p className="text-[11px] text-secondary italic leading-relaxed mt-0.5">"{selectedVerifyLog.details}"</p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex justify-end">
                  <button
                    onClick={() => setSelectedVerifyLog(null)}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all shadow"
                  >
                    Close Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 10. HOSPITAL ADMINISTRATOR
// ============================================================================
export function HospitalAdminDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  const { patients, visits, beds, inventory, staffList } = useEhr();

  const occupiedBeds = beds.filter((b) => b.status === "OCCUPIED").length;
  const criticalItems = inventory.filter((i) => i.quantity <= i.minAlertQty).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Clinical Operations Dashboard</h2>
        <p className="text-xs text-secondary">
          {activeTab === "beds" ? "Real-time bed utilization metrics." :
           activeTab === "departments" ? "Active departments setup." :
           activeTab === "staff" ? "Clinicians operational logs." :
           activeTab === "inventory" ? "Medical supplies stock tracking." :
           "Overview of clinic capacity statistics."}
        </p>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-secondary uppercase">Patients</span>
                <h4 className="text-xl font-bold mt-1">{patients.length}</h4>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-secondary uppercase">Active Encounters</span>
                <h4 className="text-xl font-bold mt-1">{visits.filter((v) => v.status !== "COMPLETED").length}</h4>
              </div>
              <Clipboard className="w-8 h-8 text-success/20" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-secondary uppercase">Bed occupancy</span>
                <h4 className="text-xl font-bold mt-1">{occupiedBeds} / {beds.length}</h4>
              </div>
              <Building className="w-8 h-8 text-info/20" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-secondary uppercase">Low Stock Alerts</span>
                <h4 className="text-xl font-bold mt-1 text-danger">{criticalItems}</h4>
              </div>
              <ShieldAlert className="w-8 h-8 text-danger/20 animate-pulse" />
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold border-b border-border pb-2 mb-4">Patient Admission Trends</h3>
            <div className="h-60 w-full flex items-end justify-between px-6 pt-6 border-b border-l border-border relative">
              <div className="absolute left-0 right-0 top-1/4 border-t border-border/40" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-border/40" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-border/40" />

              {/* Bar 1 */}
              <div className="flex flex-col items-center flex-1 max-w-[50px] space-y-2 group">
                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">12</span>
                <div className="w-full bg-primary/20 hover:bg-primary border border-primary/40 rounded-t-lg transition-all duration-500" style={{ height: "120px" }} />
                <span className="text-[10px] text-secondary font-semibold">Mon</span>
              </div>
              {/* Bar 2 */}
              <div className="flex flex-col items-center flex-1 max-w-[50px] space-y-2 group">
                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">18</span>
                <div className="w-full bg-primary/20 hover:bg-primary border border-primary/40 rounded-t-lg transition-all duration-500" style={{ height: "180px" }} />
                <span className="text-[10px] text-secondary font-semibold">Tue</span>
              </div>
              {/* Bar 3 */}
              <div className="flex flex-col items-center flex-1 max-w-[50px] space-y-2 group">
                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">15</span>
                <div className="w-full bg-primary/20 hover:bg-primary border border-primary/40 rounded-t-lg transition-all duration-500" style={{ height: "150px" }} />
                <span className="text-[10px] text-secondary font-semibold">Wed</span>
              </div>
              {/* Bar 4 */}
              <div className="flex flex-col items-center flex-1 max-w-[50px] space-y-2 group">
                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">22</span>
                <div className="w-full bg-primary/20 hover:bg-primary border border-primary/40 rounded-t-lg transition-all duration-500" style={{ height: "220px" }} />
                <span className="text-[10px] text-secondary font-semibold">Thu</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "beds" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2">Active Bed Mapping</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.map((bed) => (
              <div key={bed.id} className="p-4 bg-accent/20 border border-border/60 rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-bold">{bed.roomNumber} - Bed {bed.bedNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    bed.status === "AVAILABLE" ? "bg-success/15 text-success" : 
                    bed.status === "OCCUPIED" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                  }`}>{bed.status}</span>
                </div>
                <div className="text-[11px] text-secondary">
                  <span>Class: {bed.roomType}</span>
                  {bed.currentPatientName && (
                    <span className="block mt-1 text-foreground font-semibold">Occupant: {bed.currentPatientName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "departments" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2">Clinical Services & Departments</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between">
              <span>Emergency Medicine Department (ED)</span> <span className="font-semibold text-secondary">12 active staff</span>
            </div>
            <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between">
              <span>Diagnostic Imaging Department (X-Ray/PACS)</span> <span className="font-semibold text-secondary">5 active staff</span>
            </div>
            <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between">
              <span>Outpatient Pharmacy Department</span> <span className="font-semibold text-secondary">4 active staff</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2">Attending Clinician Directory</h3>
          <div className="space-y-2 text-xs">
            {staffList.map((st) => (
              <div key={st.id} className="p-3 bg-accent/30 rounded-xl border border-border/40 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">
                    {st.firstName || st.lastName ? `${st.firstName} ${st.lastName}`.trim() : st.role.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </h4>
                  <p className="text-[10px] text-secondary">{st.role.replace("_", " ").toUpperCase()} | {st.department}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[9px] font-bold uppercase">{st.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2">Central Supply Center</h3>
          <div className="space-y-3">
            {inventory.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center text-xs p-3 bg-accent/30 rounded-lg border border-border/40">
                <div>
                  <h5 className="font-semibold">{inv.name}</h5>
                  <p className="text-[10px] text-secondary">Batch: {inv.batchNumber} | Expiry: {inv.expiryDate}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${inv.quantity <= inv.minAlertQty ? "text-danger" : "text-foreground"}`}>
                    {inv.quantity} units
                  </span>
                  {inv.quantity <= inv.minAlertQty && (
                    <span className="text-[8px] bg-danger/10 text-danger px-1.5 rounded font-bold uppercase">Critical Low</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
