"use client";

import React, { useState } from "react";
import { useEhr } from "@/context/EhrContext";
import {
  X, User, Heart, FileText, Pill, Droplet, AlertTriangle, ShieldCheck, Activity, Calendar
} from "lucide-react";

interface PatientChartHistoryModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function PatientChartHistoryModal({ patientId, isOpen, onClose }: PatientChartHistoryModalProps) {
  const {
    patients,
    visits,
    vitalsList,
    clinicalNotes,
    medicationAdministrations,
    intakeOutputList,
    diagnoses
  } = useEhr();

  const [activeTab, setActiveTab] = useState<"demographics" | "vitals" | "notes" | "meds" | "fluids">("demographics");

  if (!isOpen || !patientId) return null;

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return null;

  // Filter patient history records
  const patientVisits = visits.filter((v) => v.patientId === patientId);
  const patientVisitIds = patientVisits.map((v) => v.id);

  const patientVitals = vitalsList.filter((v) => patientVisitIds.includes(v.visitId));
  const patientNotes = clinicalNotes.filter((n) => patientVisitIds.includes(n.visitId));
  const patientMedAdmins = medicationAdministrations.filter((m) => m.patientId === patientId || patientVisitIds.includes(m.visitId));
  const patientIOList = intakeOutputList.filter((io) => io.patientId === patientId || patientVisitIds.includes(io.visitId));
  const patientDiagnoses = diagnoses.filter((d) => patientVisitIds.includes(d.visitId));

  // Fluid balance calculations
  const totalIntake = patientIOList
    .filter((io) => io.type === "INTAKE")
    .reduce((sum, io) => sum + io.amount, 0);

  const totalOutput = patientIOList
    .filter((io) => io.type === "OUTPUT")
    .reduce((sum, io) => sum + io.amount, 0);

  const netFluidBalance = totalIntake - totalOutput;

  // Check for critical vitals
  const isVitalsCritical = (v: typeof vitalsList[0]) => {
    return v.temperature >= 38.5 || v.temperature <= 35.0 ||
      v.systolicBp >= 140 || v.systolicBp <= 90 ||
      v.diastolicBp >= 90 || v.diastolicBp <= 50 ||
      v.oxygenSaturation < 92;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-foreground animate-scale-up">
        
        {/* Header */}
        <div className="p-5 border-b border-border bg-accent/10 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-bold text-foreground">
                {patient.firstName} {patient.lastName}
              </h2>
              <span className="text-xs font-mono bg-accent border border-border px-2 py-0.5 rounded text-secondary font-semibold">
                {patient.mrn}
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-1 font-semibold uppercase tracking-wider">
              Clinical Folder Archive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-accent text-secondary hover:text-foreground transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allergy Warning Banner */}
        {patient.allergies.length > 0 && (
          <div className="px-5 py-2.5 bg-danger/10 border-b border-danger/20 flex items-center space-x-2 text-danger text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
            <span>CRITICAL ALLERGIES DOCUMENTED: {patient.allergies.join(", ")}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-52 border-r border-border bg-accent/5 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            <button
              onClick={() => setActiveTab("demographics")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left truncate shrink-0 ${
                activeTab === "demographics"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Demographics</span>
            </button>
            <button
              onClick={() => setActiveTab("vitals")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left truncate shrink-0 ${
                activeTab === "vitals"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Triage Vitals ({patientVitals.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left truncate shrink-0 ${
                activeTab === "notes"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Clinical Notes ({patientNotes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("meds")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left truncate shrink-0 ${
                activeTab === "meds"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <Pill className="w-4 h-4 shrink-0" />
              <span>Medication Logs ({patientMedAdmins.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("fluids")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left truncate shrink-0 ${
                activeTab === "fluids"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <Droplet className="w-4 h-4 shrink-0" />
              <span>Fluid Chart I/O ({patientIOList.length})</span>
            </button>
          </div>

          {/* Details Scroll Panel */}
          <div className="flex-1 p-5 overflow-y-auto min-w-0">
            
            {/* Tab: Demographics */}
            {activeTab === "demographics" && (
              <div className="space-y-6 animate-fade-in text-xs">
                <div>
                  <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-4 text-foreground">
                    <User className="w-4 h-4 mr-1.5 text-primary" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Full Name</span>
                      <span className="font-semibold text-foreground">{patient.firstName} {patient.lastName}</span>
                    </div>
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Date of Birth</span>
                      <span className="font-semibold text-foreground">{patient.dateOfBirth}</span>
                    </div>
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Gender</span>
                      <span className="font-semibold text-foreground">{patient.gender}</span>
                    </div>
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Blood Registry</span>
                      <span className="font-semibold text-foreground font-mono">{patient.bloodGroup} ({patient.genotype})</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-4 text-foreground">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-primary" /> Insurance & emergency contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Policy / Provider</span>
                      <span className="font-semibold text-foreground">{patient.insuranceProvider} · <span className="font-mono text-secondary">{patient.insurancePolicyNumber}</span></span>
                    </div>
                    <div className="p-3 bg-accent/25 border border-border rounded-xl">
                      <span className="text-[10px] text-secondary font-bold uppercase block mb-1">Emergency contact</span>
                      <span className="font-semibold text-foreground">{patient.emergencyContactName} ({patient.emergencyContactPhone})</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-4 text-foreground">
                    <Calendar className="w-4 h-4 mr-1.5 text-primary" /> ICD-10 Diagnoses Records
                  </h3>
                  {patientDiagnoses.length === 0 ? (
                    <div className="text-center py-6 text-secondary bg-accent/15 rounded-xl border border-border">No recorded diagnosis codes.</div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                          <tr>
                            <th className="p-3">ICD-10 Code</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Diagnosed By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {patientDiagnoses.map((d) => (
                            <tr key={d.id} className="hover:bg-accent/10">
                              <td className="p-3 font-mono font-bold text-primary">{d.icd10Code}</td>
                              <td className="p-3 font-medium">{d.description}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  d.status === "ACTIVE" ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
                                }`}>
                                  {d.status}
                                </span>
                              </td>
                              <td className="p-3 text-secondary">{d.diagnosedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Vitals History */}
            {activeTab === "vitals" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-2 text-foreground">
                  <Heart className="w-4 h-4 mr-1.5 text-danger" /> Triage Vitals History
                </h3>
                {patientVitals.length === 0 ? (
                  <div className="text-center py-12 text-secondary bg-accent/15 rounded-xl border border-border">No vital signs logs recorded.</div>
                ) : (
                  <div className="border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                        <tr>
                          <th className="p-3">Date/Time</th>
                          <th className="p-3">Temp</th>
                          <th className="p-3">BP (mmHg)</th>
                          <th className="p-3">Pulse</th>
                          <th className="p-3">SpO2</th>
                          <th className="p-3">RR</th>
                          <th className="p-3">Details (Pain/Wt/BMI)</th>
                          <th className="p-3">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patientVitals.map((v) => {
                          const isCritical = isVitalsCritical(v);
                          return (
                            <tr key={v.id} className={`hover:bg-accent/10 transition-colors ${isCritical ? "bg-danger/5" : ""}`}>
                              <td className="p-3 font-medium text-foreground">
                                <div>{formatDate(v.recordedAt)}</div>
                                <div className="text-[10px] text-secondary font-mono">{formatTime(v.recordedAt)}</div>
                              </td>
                              <td className="p-3 font-semibold">
                                <span className={v.temperature >= 38.5 ? "text-danger font-bold" : v.temperature <= 35.0 ? "text-primary" : "text-foreground"}>
                                  {v.temperature.toFixed(1)}°C
                                </span>
                              </td>
                              <td className="p-3 font-semibold">
                                <span className={v.systolicBp >= 140 || v.diastolicBp >= 90 ? "text-danger font-bold" : "text-foreground"}>
                                  {v.systolicBp}/{v.diastolicBp}
                                </span>
                              </td>
                              <td className="p-3 font-semibold">{v.heartRate} bpm</td>
                              <td className="p-3 font-semibold">
                                <span className={v.oxygenSaturation < 92 ? "text-danger font-bold" : "text-foreground"}>
                                  {v.oxygenSaturation}%
                                </span>
                              </td>
                              <td className="p-3 text-secondary">{v.respiratoryRate} /min</td>
                              <td className="p-3 text-secondary text-[11px]">
                                {v.painScore !== undefined && <div>Pain: <span className="font-semibold text-foreground">{v.painScore}/10</span></div>}
                                {v.weight && <div>Wt: <span className="font-semibold text-foreground">{v.weight}kg</span></div>}
                                {v.bmi && <div>BMI: <span className="font-semibold text-foreground">{v.bmi}</span></div>}
                              </td>
                              <td className="p-3 text-secondary truncate max-w-[100px]" title={v.recordedBy}>
                                {v.recordedBy}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Clinical Notes */}
            {activeTab === "notes" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-2 text-foreground">
                  <FileText className="w-4 h-4 mr-1.5 text-primary" /> Clinical Consultation & Shift Notes
                </h3>
                {patientNotes.length === 0 ? (
                  <div className="text-center py-12 text-secondary bg-accent/15 rounded-xl border border-border">No notes recorded in database.</div>
                ) : (
                  <div className="space-y-4">
                    {patientNotes.map((note) => (
                      <div key={note.id} className="p-4 border border-border rounded-xl bg-accent/15 space-y-3 shadow-xs animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              note.noteType === "SOAP" ? "bg-primary/10 text-primary border border-primary/20" :
                              note.noteType === "Nursing" ? "bg-warning/10 text-warning border border-warning/20" :
                              "bg-secondary/15 text-secondary"
                            }`}>
                              {note.noteType} Clinical Note
                            </span>
                            <p className="text-[10px] text-secondary mt-1">Author: <strong className="text-foreground font-semibold">{note.authorName}</strong></p>
                          </div>
                          <span className="text-[10px] font-mono text-secondary">
                            {formatDate(note.signedAt || "")} {note.signedAt ? formatTime(note.signedAt) : "(Draft)"}
                          </span>
                        </div>

                        {note.noteType === "SOAP" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                            <div className="p-2.5 bg-card border border-border/40 rounded-lg">
                              <strong className="text-foreground block mb-1">Subjective (S)</strong>
                              <p className="text-secondary leading-relaxed">{note.subjective}</p>
                            </div>
                            <div className="p-2.5 bg-card border border-border/40 rounded-lg">
                              <strong className="text-foreground block mb-1">Objective (O)</strong>
                              <p className="text-secondary leading-relaxed">{note.objective}</p>
                            </div>
                            <div className="p-2.5 bg-card border border-border/40 rounded-lg">
                              <strong className="text-foreground block mb-1">Assessment (A)</strong>
                              <p className="text-secondary leading-relaxed">{note.assessment}</p>
                            </div>
                            <div className="p-2.5 bg-card border border-border/40 rounded-lg">
                              <strong className="text-foreground block mb-1">Plan (P)</strong>
                              <p className="text-secondary leading-relaxed">{note.plan}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-card border border-border/40 rounded-lg text-[11px]">
                            <strong className="text-foreground block mb-1">Nursing Shift Assessment</strong>
                            <p className="text-secondary leading-relaxed whitespace-pre-line">{note.objective}</p>
                          </div>
                        )}

                        {note.digitalSignature && (
                          <div className="flex items-center space-x-1.5 text-[9px] font-mono bg-success/10 text-success border border-success/20 px-2 py-1 rounded w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Digitally Signed: {note.digitalSignature}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Medication History */}
            {activeTab === "meds" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-2 text-foreground">
                  <Pill className="w-4 h-4 mr-1.5 text-primary" /> Medication Administration Logs
                </h3>
                {patientMedAdmins.length === 0 ? (
                  <div className="text-center py-12 text-secondary bg-accent/15 rounded-xl border border-border">No medication administration records.</div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                        <tr>
                          <th className="p-3">Administration Time</th>
                          <th className="p-3">Medication</th>
                          <th className="p-3">Dose / Route</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Clinical Notes</th>
                          <th className="p-3">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patientMedAdmins.map((m) => (
                          <tr key={m.id} className="hover:bg-accent/10">
                            <td className="p-3 font-medium text-foreground">
                              <div>{formatDate(m.administeredAt)}</div>
                              <div className="text-[10px] text-secondary font-mono">{formatTime(m.administeredAt)}</div>
                            </td>
                            <td className="p-3 font-bold text-foreground">{m.drugName}</td>
                            <td className="p-3">
                              <div>{m.dosage}</div>
                              <span className="text-[10px] text-secondary font-semibold uppercase">{m.route}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                m.status === "GIVEN" ? "bg-success/15 text-success" :
                                m.status === "REFUSED" ? "bg-danger/15 text-danger" :
                                "bg-warning/15 text-warning"
                              }`}>{m.status}</span>
                            </td>
                            <td className="p-3 text-secondary text-[11px] max-w-[180px] truncate" title={m.notes}>
                              {m.notes || "—"}
                            </td>
                            <td className="p-3 text-secondary truncate max-w-[100px]" title={m.administeredBy}>
                              {m.administeredBy}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Fluid Chart I/O */}
            {activeTab === "fluids" && (
              <div className="space-y-5 animate-fade-in text-xs">
                
                {/* fluid totals summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-success/10 border border-success/20 rounded-xl text-center shadow-xs">
                    <span className="text-[9px] text-success font-bold uppercase tracking-wider block mb-1">Total Fluid Intake</span>
                    <span className="text-lg font-bold text-success font-mono">{totalIntake} mL</span>
                  </div>
                  <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-center shadow-xs">
                    <span className="text-[9px] text-danger font-bold uppercase tracking-wider block mb-1">Total Fluid Output</span>
                    <span className="text-lg font-bold text-danger font-mono">{totalOutput} mL</span>
                  </div>
                  <div className={`p-3.5 border rounded-xl text-center shadow-xs ${
                    netFluidBalance >= 0 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-warning/10 border-warning/20 text-warning"
                  }`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">Net Fluid Balance</span>
                    <span className="text-lg font-bold font-mono">
                      {netFluidBalance > 0 ? `+${netFluidBalance}` : netFluidBalance} mL
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center mb-3 text-foreground">
                    <Droplet className="w-4 h-4 mr-1.5 text-primary" /> Fluid Intake & Output Ledger
                  </h3>
                  {patientIOList.length === 0 ? (
                    <div className="text-center py-10 text-secondary bg-accent/15 rounded-xl border border-border">No fluid intake/output logs recorded.</div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-accent/40 text-[9px] font-bold text-secondary uppercase">
                          <tr>
                            <th className="p-3">Record Time</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Amount (mL)</th>
                            <th className="p-3">Notes</th>
                            <th className="p-3">Staff</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {patientIOList.map((io) => (
                            <tr key={io.id} className="hover:bg-accent/10">
                              <td className="p-3 font-medium text-foreground">
                                <div>{formatDate(io.recordedAt)}</div>
                                <div className="text-[10px] text-secondary font-mono">{formatTime(io.recordedAt)}</div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  io.type === "INTAKE" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                                }`}>
                                  {io.type}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-foreground">{io.category}</td>
                              <td className="p-3 font-bold font-mono">{io.amount} mL</td>
                              <td className="p-3 text-secondary text-[11px] max-w-[150px] truncate" title={io.notes}>
                                {io.notes || "—"}
                              </td>
                              <td className="p-3 text-secondary truncate max-w-[100px]" title={io.recordedBy}>
                                {io.recordedBy}
                              </td>
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
        </div>
      </div>
    </div>
  );
}
