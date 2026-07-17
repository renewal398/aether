"use client";

import React from "react";
import { useEhr } from "@/context/EhrContext";
import { ShieldAlert, X } from "lucide-react";

export default function RoleSwitchModal() {
  const { pendingRoleSwitch, confirmRoleSwitch, cancelRoleSwitch } = useEhr();

  if (!pendingRoleSwitch) return null;

  const rolesMap: Record<string, string> = {
    super_admin: "Super Admin",
    hospital_admin: "Hospital Admin",
    doctor: "Attending Doctor",
    nurse: "Ward Nurse",
    pharmacist: "Pharmacist",
    lab_scientist: "Lab Scientist",
    radiologist: "Radiologist",
    receptionist: "HIM Console",
    accountant: "Accountant",
  };

  const targetRoleLabel = rolesMap[pendingRoleSwitch] || pendingRoleSwitch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div 
        className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md transition-opacity duration-300"
        onClick={cancelRoleSwitch}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-10 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={cancelRoleSwitch}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-accent/40 transition-all"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Banner */}
        <div className="flex items-center justify-center mx-auto w-14 h-14 rounded-full bg-warning/10 border border-warning/20 text-warning mb-6">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-bold text-foreground">
          Confirm Workstation Switch
        </h3>

        {/* Warning Body */}
        <p className="text-center text-xs text-secondary mt-3 leading-relaxed">
          You are about to switch your active session to the <span className="font-bold text-foreground bg-accent px-1.5 py-0.5 rounded">{targetRoleLabel}</span> dashboard.
        </p>

        <div className="mt-4 p-3 bg-danger/10 border border-danger/15 rounded-xl flex items-start space-x-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0 mt-1.5 animate-pulse" />
          <p className="text-[11px] font-medium text-danger leading-relaxed">
            This will terminate your current session. You must re-authenticate with the credentials for the new role to continue.
          </p>
        </div>

        {/* Actions Tray */}
        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
          <button
            onClick={cancelRoleSwitch}
            className="flex-1 bg-accent hover:bg-accent/80 text-foreground font-semibold text-xs rounded-xl py-3 border border-border/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Cancel Switch
          </button>
          <button
            onClick={confirmRoleSwitch}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl py-3 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Confirm & Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
