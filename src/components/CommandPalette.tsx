"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, User, FileText, Clipboard, Pill, Settings, Command } from "lucide-react";
import { useEhr } from "@/context/EhrContext";

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { patients, invoices, prescriptions, labOrders, setActivePatientId, setActiveRole } = useEhr();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter lists based on query
  const filteredPatients = query
    ? patients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(query.toLowerCase()) ||
          p.lastName.toLowerCase().includes(query.toLowerCase()) ||
          p.mrn.toLowerCase().includes(query.toLowerCase())
      )
    : patients.slice(0, 3);

  const filteredInvoices = query
    ? invoices.filter(
        (i) =>
          i.patientName.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredPrescriptions = query
    ? prescriptions.filter(
        (pr) =>
          pr.patientName.toLowerCase().includes(query.toLowerCase()) ||
          pr.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredLabs = query
    ? labOrders.filter(
        (l) =>
          l.patientName.toLowerCase().includes(query.toLowerCase()) ||
          l.testName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const commands: { label: string; action: () => void }[] = [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Input area */}
        <div className="flex items-center border-b border-border px-4 py-3 bg-accent/40">
          <Search className="w-5 h-5 text-secondary mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, patient MRN, drug, invoice ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none placeholder-secondary text-base focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center h-5 select-none pointer-events-none px-1.5 font-mono text-[10px] font-medium text-secondary bg-background border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {/* Quick Commands */}
          {commands.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center">
                <Command className="w-3 h-3 mr-1" /> Quick Commands
              </h3>
              <div className="mt-1 space-y-1">
                {commands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2 text-secondary" />
                    {cmd.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Patients */}
          {filteredPatients.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center">
                <User className="w-3 h-3 mr-1" /> Patients
              </h3>
              <div className="mt-1 space-y-1">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePatientId(p.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium flex items-center">
                      <User className="w-4 h-4 mr-2 text-secondary" />
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-xs text-secondary font-mono bg-background border border-border px-1.5 py-0.5 rounded">
                      {p.mrn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center">
                <FileText className="w-3 h-3 mr-1" /> Invoices
              </h3>
              <div className="mt-1 space-y-1">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-secondary" />
                      Billing for {inv.patientName}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      inv.status === "PAID" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}>
                      ${inv.patientPayable.toFixed(2)} - {inv.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {filteredPrescriptions.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center">
                <Pill className="w-3 h-3 mr-1" /> Prescriptions
              </h3>
              <div className="mt-1 space-y-1">
                {filteredPrescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium flex items-center">
                      <Pill className="w-4 h-4 mr-2 text-secondary" />
                      Rx for {rx.patientName}
                    </span>
                    <span className="text-xs text-secondary">{rx.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lab Orders */}
          {filteredLabs.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider flex items-center">
                <Clipboard className="w-3 h-3 mr-1" /> Lab Orders
              </h3>
              <div className="mt-1 space-y-1">
                {filteredLabs.map((lab) => (
                  <button
                    key={lab.id}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium flex items-center">
                      <Clipboard className="w-4 h-4 mr-2 text-secondary" />
                      {lab.testName} - {lab.patientName}
                    </span>
                    <span className="text-xs text-secondary">{lab.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query &&
            commands.length === 0 &&
            filteredPatients.length === 0 &&
            filteredInvoices.length === 0 &&
            filteredPrescriptions.length === 0 &&
            filteredLabs.length === 0 && (
              <div className="py-6 text-center text-secondary text-sm">
                No results found for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-2 border-t border-border bg-accent/20 text-[10px] text-secondary font-medium">
          <span>Search patients, bills, labs, or change dashboards</span>
          <span className="flex items-center">
            <span>Select: ↵</span>
            <span className="ml-3">Close: ESC</span>
          </span>
        </div>
      </div>
    </div>
  );
}
