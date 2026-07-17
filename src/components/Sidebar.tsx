"use client";

import React from "react";
import {
  Activity,
  Calendar,
  Users,
  Pill,
  ClipboardList,
  Layers,
  HeartPulse,
  DollarSign,
  Shield,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  Database,
  Building,
  User,
  MessageSquare
} from "lucide-react";
import { useEhr } from "@/context/EhrContext";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab, mobileOpen, setMobileOpen }: SidebarProps) {
  const { activeRole, currentUser } = useEhr();

  // Dynamic Navigation definitions based on active role
  const getNavItems = () => {
    switch (activeRole) {
      case "super_admin":
        return [
          { id: "dashboard", label: "Admin Console", icon: Home },
          { id: "hospitals", label: "Hospital Config", icon: Building },
          { id: "staff", label: "User Accounts", icon: Users },
          { id: "audits", label: "Audit Ledger", icon: Database },
          { id: "security", label: "Security & API", icon: Shield },
        ];
      case "hospital_admin":
        return [
          { id: "dashboard", label: "Operational Stats", icon: Home },
          { id: "beds", label: "Bed Utilization", icon: Layers },
          { id: "departments", label: "Clinical Services", icon: Building },
          { id: "staff", label: "Clinician Directory", icon: Users },
          { id: "inventory", label: "Supply Center", icon: ClipboardList },
        ];
      case "doctor":
        return [
          { id: "dashboard", label: "Doctor Console", icon: Home },
          { id: "queue", label: "Clinical Queue", icon: ClipboardList },
          { id: "consultation", label: "Consult Room", icon: HeartPulse },
        ];
      case "nurse":
        return [
          { id: "dashboard", label: "Nurses' Station", icon: Home },
          { id: "patients", label: "Observation Bed list", icon: HeartPulse },
          { id: "careplans", label: "Clinical Worklist", icon: ClipboardList },
          { id: "medchart", label: "Medication Chart", icon: Pill },
        ];
      case "pharmacist":
        return [
          { id: "dashboard", label: "Rx Dispatch Queue", icon: Home },
          { id: "inventory", label: "Inventory Levels", icon: Pill },
          { id: "interaction", label: "Dispensation Ledger", icon: ClipboardList },
        ];
      case "lab_scientist":
        return [
          { id: "dashboard", label: "Lab Worklist", icon: Home },
          { id: "analyzers", label: "Analyzer Terminal", icon: Activity },
          { id: "quality", label: "Specimen Ledger", icon: Database },
        ];
      case "radiologist":
        return [
          { id: "dashboard", label: "PACS Viewer Hub", icon: Home },
          { id: "imaging", label: "DICOM Browser", icon: Activity },
          { id: "reporting", label: "Diagnostic Reports", icon: ClipboardList },
        ];
      case "receptionist":
        return [
          { id: "dashboard", label: "HIM Console", icon: Home },
          { id: "registration", label: "Patient Admission", icon: Users },
          { id: "scheduling", label: "Appointments Grid", icon: Calendar },
        ];
      case "accountant":
        return [
          { id: "dashboard", label: "Revenue Ledger", icon: Home },
          { id: "orders", label: "Pending Orders", icon: ClipboardList },
          { id: "billing", label: "Split Invoicing", icon: DollarSign },
          { id: "insurance", label: "Claims Processing", icon: Shield },
        ];
      default:
        return [{ id: "dashboard", label: "Dashboard", icon: Home }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-card text-card-foreground border-r border-border flex flex-col transition-all duration-300 md:translate-x-0 ${
        collapsed ? "w-16" : "w-64"
      } ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand logo header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2 animate-slide-in">
            <svg className="w-8 h-8 rounded-lg flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#3b82f6"/>
              <text x="16" y="23" fontFamily="'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="20" fill="#ffffff" text-anchor="middle">Ω</text>
            </svg>
            <div>
              <span className="font-bold text-sm tracking-wide text-foreground">AETHER</span>
              <span className="text-[10px] block text-secondary uppercase font-semibold">Cloud EHR v1.0</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded bg-accent text-secondary hover:text-foreground hidden md:block ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Profile summary */}
      {!collapsed && (
        <div className="p-4 border-b border-border bg-accent/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-xs truncate">
                {currentUser.firstName || currentUser.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
                  : currentUser.role.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </h4>
              <p className="text-[10px] text-secondary truncate font-semibold uppercase">
                {currentUser.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation menu */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center py-2.5 px-3 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-secondary hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-secondary"}`} />
              {!collapsed && <span className="ml-3 font-medium truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom context switcher status */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center space-x-2 p-1 font-mono text-[9px] text-secondary bg-accent/40 rounded">
          <Activity className="w-3.5 h-3.5 text-success pulse-soft" />
          {!collapsed && <span>FHIR Sync Active</span>}
        </div>
      </div>
    </aside>
  );
}
