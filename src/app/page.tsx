"use client";

import React, { useState, useEffect } from "react";
import { EhrProvider, useEhr } from "@/context/EhrContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CommandPalette from "@/components/CommandPalette";
import MessagingPanel from "@/components/MessagingPanel";
import LoginScreen from "@/components/LoginScreen";
import RoleSwitchModal from "@/components/RoleSwitchModal";
import PatientChartHistoryModal from "@/components/PatientChartHistoryModal";
import {
  HIMDashboard,
  DoctorDashboard,
  NurseDashboard,
  PharmacistDashboard,
  LabScientistDashboard,
  RadiologistDashboard,
  AccountantDashboard,
  SuperAdminDashboard,
  HospitalAdminDashboard
} from "@/components/RoleDashboards";
import { MessageSquare, ShieldCheck, HeartPulse, Sparkles, UserCheck, ShieldAlert } from "lucide-react";

function MainAppContent() {
  const { activeRole, isLoggedIn, isInitialized, dbConnected, historyPatientId, setHistoryPatientId } = useEhr();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTabRaw] = useState("dashboard");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Safe wrapper to update state and localStorage
  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem(`aether_active_tab_${activeRole}`, tab);
    }
  };

  // Sync activeTab from localStorage when activeRole changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem(`aether_active_tab_${activeRole}`);
      setActiveTabRaw(savedTab || "dashboard");
    }
  }, [activeRole]);

  // Global keyboard shortcuts (Ctrl+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <svg className="absolute w-7 h-7 rounded-lg animate-pulse" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#3b82f6"/>
            <text x="16" y="23" fontFamily="'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="20" fill="#ffffff" text-anchor="middle">Ω</text>
          </svg>
        </div>
        <p className="text-secondary text-[10px] font-bold uppercase tracking-widest animate-pulse">Initializing Aether...</p>
      </div>
    );
  }

  if (dbConnected === false) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Database Connection Failed</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aether Cloud EHR cannot connect to the secure relational database cluster. 
            All client services have been suspended to guarantee clinical data integrity and regulatory compliance.
          </p>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-[10px] text-red-400 font-mono text-left overflow-x-auto">
            Code: ECONNREFUSED | Prisma Client initialization failed.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all text-white font-semibold text-xs rounded-xl shadow"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // Render sub-views dynamically based on the active tab and active role
  const renderWorkspace = () => {
    switch (activeRole) {
      case "super_admin":
        return <SuperAdminDashboard activeTab={activeTab} />;
      case "hospital_admin":
        return <HospitalAdminDashboard activeTab={activeTab} />;
      case "doctor":
        return <DoctorDashboard activeTab={activeTab} />;
      case "nurse":
        return <NurseDashboard activeTab={activeTab} />;
      case "pharmacist":
        return <PharmacistDashboard activeTab={activeTab} />;
      case "lab_scientist":
        return <LabScientistDashboard activeTab={activeTab} />;
      case "radiologist":
        return <RadiologistDashboard activeTab={activeTab} />;
      case "receptionist":
        return <HIMDashboard activeTab={activeTab} />;
      case "accountant":
        return <AccountantDashboard activeTab={activeTab} />;

      default:
        return (
          <div className="py-24 text-center">
            <h2 className="text-lg font-bold">Aether Cloud EHR System</h2>
            <p className="text-xs text-secondary mt-1">Select a role in the header switch to begin.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Navigation Drawer */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Core Layout Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? "md:pl-16" : "md:pl-64"
      }`}>
        {/* Global Toolbar Header */}
        <Header onSearchClick={() => setIsCommandPaletteOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 p-6 md:p-8 mt-16 max-w-7xl w-full mx-auto pb-24 overflow-x-hidden">
          {renderWorkspace()}
        </main>
      </div>

      {/* Global Modals & Messaging Intercom */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      
      <MessagingPanel isOpen={isMessageOpen} onClose={() => setIsMessageOpen(false)} />
      
      <RoleSwitchModal />

      <PatientChartHistoryModal
        patientId={historyPatientId}
        isOpen={historyPatientId !== null}
        onClose={() => setHistoryPatientId(null)}
      />

      {/* Messaging Panel Floating Action Button */}
      <button
        onClick={() => setIsMessageOpen(!isMessageOpen)}
        className="fixed bottom-6 right-6 z-30 p-4 bg-primary hover:bg-primary-hover text-white rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center justify-center"
        title="Open Care Team Messenger"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}

// Wrapper to export Provider Context
export default function Page() {
  return (
    <EhrProvider>
      <MainAppContent />
    </EhrProvider>
  );
}
