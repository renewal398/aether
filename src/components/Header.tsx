"use client";

import React, { useState } from "react";
import { Search, Bell, Moon, Sun, ShieldAlert, Check, ChevronDown, UserCheck, Menu } from "lucide-react";
import { useEhr } from "@/context/EhrContext";

interface HeaderProps {
  onSearchClick: () => void;
  onMenuClick?: () => void;
}

export default function Header({ onSearchClick, onMenuClick }: HeaderProps) {
  const { activeRole, setActiveRole, cdsAlerts, acknowledgeAlert, currentUser } = useEhr();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const activeAlerts = cdsAlerts.filter((a) => !a.acknowledged);

  const roles = [
    { value: "super_admin", label: "Super Admin" },
    { value: "hospital_admin", label: "Hospital Admin" },
    { value: "doctor", label: "Attending Doctor" },
    { value: "nurse", label: "Ward Nurse" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "lab_scientist", label: "Lab Scientist" },
    { value: "radiologist", label: "Radiologist" },
    { value: "receptionist", label: "HIM Desk" },
    { value: "accountant", label: "Accountant" },
  ];

  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border px-6 flex items-center justify-between fixed top-0 right-0 z-10 w-full md:pl-20">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuClick}
        className="p-1.5 mr-3 rounded bg-accent text-secondary hover:text-foreground md:hidden flex items-center justify-center"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search Input trigger */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onSearchClick}
          className="flex items-center w-full px-3 py-1.5 rounded-lg border border-border bg-accent/40 text-secondary hover:border-primary/40 cursor-pointer transition-colors"
        >
          <Search className="w-4 h-4 mr-2" />
          <span className="text-sm flex-1 text-left">Search patients, orders, codes...</span>
          <kbd className="hidden sm:inline-flex items-center h-5 select-none pointer-events-none px-1.5 font-mono text-[9px] font-medium text-secondary bg-background border border-border rounded">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center space-x-4">
        {/* Testing Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelect(!showRoleSelect)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            <span>Role: {roles.find((r) => r.value === activeRole)?.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>

          {showRoleSelect && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowRoleSelect(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl py-1 z-30 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider border-b border-border bg-accent/20">
                  Switch Active Role
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setActiveRole(r.value);
                        setShowRoleSelect(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between ${activeRole === r.value
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent text-card-foreground"
                        }`}
                    >
                      {r.label}
                      {activeRole === r.value && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-accent text-secondary hover:text-foreground transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Clinical Decision Support (CDS) Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`p-2 rounded-lg relative transition-colors ${activeAlerts.length > 0
                ? "bg-danger/10 text-danger hover:bg-danger/15"
                : "bg-accent text-secondary hover:text-foreground"
              }`}
          >
            <Bell className={`w-4 h-4 ${activeAlerts.length > 0 ? "animate-bounce" : ""}`} />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowAlerts(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-30 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-border bg-danger/[0.04] flex items-center justify-between">
                  <div className="flex items-center text-danger font-semibold text-sm">
                    <ShieldAlert className="w-4.5 h-4.5 mr-2" />
                    Clinical Safety Warnings
                  </div>
                  <span className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded-full font-bold">
                    {activeAlerts.length} Active
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {activeAlerts.length === 0 ? (
                    <div className="p-6 text-center text-secondary text-sm">
                      All safety warnings cleared. System is compliant.
                    </div>
                  ) : (
                    activeAlerts.map((al) => (
                      <div key={al.id} className="p-3 hover:bg-accent/40 transition-colors">
                        <div className="flex items-start justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${al.severity === "CRITICAL"
                              ? "bg-danger/15 text-danger"
                              : "bg-warning/15 text-warning"
                            }`}>
                            {al.severity}
                          </span>
                          <span className="text-[9px] text-secondary font-mono">
                            {String(new Date(al.timestamp).getUTCHours()).padStart(2, "0")}:{String(new Date(al.timestamp).getUTCMinutes()).padStart(2, "0")}
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs mt-1 text-foreground">{al.title}</h5>
                        <p className="text-[11px] text-secondary mt-0.5">{al.message}</p>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-border/30">
                          <span className="text-[9px] font-medium text-secondary truncate max-w-[150px]">
                            Patient: {al.patientName}
                          </span>
                          <button
                            onClick={() => acknowledgeAlert(al.id)}
                            className="flex items-center text-[10px] text-primary hover:text-primary-hover font-semibold"
                          >
                            <Check className="w-3 h-3 mr-1" /> Acknowledge
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-border bg-accent/20 text-[10px] text-center text-secondary font-semibold">
                  Aether CDS Compliance Audit Engine
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
