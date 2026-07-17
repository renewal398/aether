"use client";

import React, { useState } from "react";
import { useEhr } from "@/context/EhrContext";
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginScreen() {
  const { login, activeRole } = useEhr();
  const [selectedRole, setSelectedRole] = useState(activeRole || "doctor");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "doctor", label: "Attending Doctor", desc: "Access clinical queue, consultations, and patient history" },
    { value: "nurse", label: "Ward Nurse", desc: "Manage observation beds, nursing careplans, and vitals" },
    { value: "pharmacist", label: "Pharmacist", desc: "Dispense medication, manage Rx queues and inventory levels" },
    { value: "lab_scientist", label: "Lab Scientist", desc: "Conduct diagnostic tests, update analyzers, approve labs" },
    { value: "radiologist", label: "Radiologist", desc: "View PACS DICOM scans and upload diagnostic imaging reports" },
    { value: "receptionist", label: "Reception Desk", desc: "Register new patients, manage appointments, check-in visits" },
    { value: "accountant", label: "Accountant", desc: "Process hospital revenue, split invoicing, and insurance claims" },
    { value: "patient", label: "Patient Portal", desc: "Access personal health timeline, prescriptions, and bookings" },
    { value: "hospital_admin", label: "Hospital Admin", desc: "Oversee operational stats, departments, staff, and supply levels" },
    { value: "super_admin", label: "Super Admin", desc: "IT admin console, user accounts control, security & audit logs" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      triggerError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate network delay for premium feel
    setTimeout(() => {
      const success = login(username, password, selectedRole);
      setLoading(false);
      if (!success) {
        triggerError("Invalid username or password. Please try again.");
      }
    }, 800);
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#070b13] overflow-hidden px-4">
      {/* Self-contained CSS animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .glow-orb-1 {
          filter: blur(130px);
          background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%);
        }
        .glow-orb-2 {
          filter: blur(130px);
          background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(0,0,0,0) 70%);
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] glow-orb-1 pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] glow-orb-2 pointer-events-none rounded-full" />

      {/* Login Box */}
      <div
        className={`relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-300 ${
          shaking ? "animate-shake border-red-500/50 shadow-red-500/5" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <svg className="mx-auto w-14 h-14 rounded-2xl shadow-lg shadow-blue-500/10 mb-4 animate-pulse border border-blue-500/20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#3b82f6"/>
            <text x="16" y="23" fontFamily="'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="20" fill="#ffffff" text-anchor="middle">Ω</text>
          </svg>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            AETHER <span className="text-blue-500">CLOUD EHR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Enterprise Clinical Health Records Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-ping" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Workstation Role
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-colors cursor-pointer appearance-none"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-900 text-slate-200">
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 italic font-normal leading-relaxed">
              {roles.find((r) => r.value === selectedRole)?.desc}
            </p>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500/50 transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-500/50 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/55 text-white font-semibold text-sm rounded-xl py-3 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-start space-x-3 bg-slate-950/30 p-4 rounded-xl">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-white">Sandbox Demo Credentials:</span> Use <code className="bg-slate-900 border border-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">itsme</code> for username and <code className="bg-slate-900 border border-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">password</code> for password.
          </div>
        </div>
      </div>
    </div>
  );
}
