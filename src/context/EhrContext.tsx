"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

// ==========================================
// 1. Interfaces & Types
// ==========================================

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Staff {
  id: string;
  role: string; // 'super_admin' | 'hospital_admin' | 'doctor' | 'nurse' | 'pharmacist' | 'lab_scientist' | 'radiologist' | 'receptionist' | 'accountant' | 'patient'
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  hospital: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Patient {
  id: string;
  mrn: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  genotype: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string[];
}

export interface Vitals {
  id: string;
  visitId: string;
  recordedAt: string;
  recordedBy: string;
  temperature: number; // °C
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  respiratoryRate?: number;
  oxygenSaturation: number; // %
  weight?: number; // kg (optional)
  height?: number; // cm (optional)
  bmi?: number;
  painScore?: number; // optional
  bloodGlucose?: number; // mg/dL
}

export interface ClinicalNote {
  id: string;
  visitId: string;
  authorId: string;
  authorName: string;
  noteType: "SOAP" | "Progress" | "Discharge" | "Operative" | "Nursing";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signedAt?: string;
  digitalSignature?: string;
}

export interface Diagnosis {
  id: string;
  visitId: string;
  icd10Code: string;
  description: string;
  diagnosedBy: string;
  status: "ACTIVE" | "RESOLVED" | "CHRONIC";
  recordedAt: string;
}

export interface PrescriptionItem {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescribedAt: string;
  items: PrescriptionItem[];
  status: "PENDING" | "DISPENSED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "WAIVED";
  dispensedAt?: string;
  dispensedBy?: string;
}

export interface LabOrder {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  orderedByName: string;
  testName: string;
  status: "PENDING" | "SAMPLE_COLLECTED" | "PROCESSING" | "COMPLETED";
  paymentStatus: "UNPAID" | "PAID" | "WAIVED";
  orderedAt: string;
  clinicalIndication?: string;
  priority?: string;
  specimenType?: string;
  resultData?: {
    parameter: string;
    value: string;
    referenceRange: string;
    status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
  }[];
  analyzedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface RadiologyOrder {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  orderedByName: string;
  modality: "X-Ray" | "MRI" | "CT" | "Ultrasound" | "Mammography";
  bodyPart: string;
  status: "PENDING" | "UPLOADED" | "APPROVED";
  paymentStatus: "UNPAID" | "PAID" | "WAIVED";
  orderedAt: string;
  findings?: string;
  impression?: string;
  dicomUrl?: string; // Simulated link to S3 image data
  annotations?: { x: number; y: number; text: string }[];
  approvedAt?: string;
}

export interface Bed {
  id: string;
  roomNumber: string;
  bedNumber: string;
  roomType: "GENERAL" | "ICU" | "ISOLATION";
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE";
  currentPatientId?: string;
  currentPatientName?: string;
}

export interface Admission {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  bedId: string;
  admittedAt: string;
  dischargedAt?: string;
}

export interface Invoice {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  totalAmount: number;
  insuranceCovered: number;
  patientPayable: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOIDED";
  createdAt: string;
  items: { description: string; amount: number }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "CASH" | "CARD" | "INSURANCE" | "BANK_TRANSFER";
  processedBy: string;
  processedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  targetTable: string;
  targetId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  signerName?: string;
  faceImage?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

export interface CdsAlert {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  timestamp: string;
  patientName: string;
  acknowledged: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "DRUG" | "SUPPLY" | "CONSUMABLE";
  quantity: number;
  minAlertQty: number;
  expiryDate: string;
  batchNumber: string;
  unitPrice: number;
}

export interface MedicationAdministration {
  id: string;
  visitId: string;
  patientId: string;
  drugName: string;
  dosage: string;
  route: string;
  administeredAt: string;
  administeredBy: string;
  status: "GIVEN" | "REFUSED" | "MISSED";
  notes?: string;
}

export interface IntakeOutput {
  id: string;
  visitId: string;
  patientId: string;
  type: "INTAKE" | "OUTPUT";
  category: string;
  amount: number;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}

// ==========================================
// 2. Context Definitions
// ==========================================

interface EhrContextType {
  // Session / Roles
  activeRole: string;
  setActiveRole: (role: string) => void;
  currentUser: Staff;
  setCurrentUser: (user: Staff) => void;
  isLoggedIn: boolean;
  isInitialized: boolean;
  dbConnected: boolean | null;
  login: (username: string, password: string, role: string) => boolean;
  logout: () => void;
  pendingRoleSwitch: string | null;
  setPendingRoleSwitch: (role: string | null) => void;
  confirmRoleSwitch: () => void;
  cancelRoleSwitch: () => void;

  // Selection state
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  lastViewedPatientIds: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Databases
  patients: Patient[];
  visits: any[];
  vitalsList: Vitals[];
  clinicalNotes: ClinicalNote[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  beds: Bed[];
  admissions: Admission[];
  invoices: Invoice[];
  payments: Payment[];
  auditLogs: AuditLog[];
  messages: Message[];
  cdsAlerts: CdsAlert[];
  inventory: InventoryItem[];
  staffList: Staff[];
  medicationAdministrations: MedicationAdministration[];
  intakeOutputList: IntakeOutput[];
  historyPatientId: string | null;
  setHistoryPatientId: (id: string | null) => void;

  // Mutators
  registerPatient: (p: Omit<Patient, "id" | "mrn">) => Promise<Patient>;
  updatePatient: (id: string, p: Partial<Patient>) => Promise<Patient>;
  createVisit: (patientId: string, doctorId: string, visitType: string) => Promise<any>;
  recordVitals: (visitId: string, vitals: Omit<Vitals, "id" | "recordedAt" | "recordedBy" | "bmi">) => Promise<void>;
  recordClinicalNote: (visitId: string, note: Omit<ClinicalNote, "id" | "authorId" | "authorName" | "signedAt" | "digitalSignature">, sign?: boolean) => Promise<void>;
  recordMedicationAdministration: (visitId: string, admin: Omit<MedicationAdministration, "id" | "administeredAt" | "administeredBy">) => Promise<void>;
  recordIntakeOutput: (visitId: string, io: Omit<IntakeOutput, "id" | "recordedAt" | "recordedBy">) => Promise<void>;
  addDiagnosis: (visitId: string, icd10Code: string, description: string, status: "ACTIVE" | "RESOLVED" | "CHRONIC") => Promise<void>;
  addPrescription: (visitId: string, items: PrescriptionItem[]) => Promise<void>;
  dispensePrescription: (id: string) => Promise<void>;
  addLabOrder: (visitId: string, testName: string, clinicalIndication?: string, priority?: string, specimenType?: string) => Promise<void>;
  updateLabStatus: (id: string, status: LabOrder["status"], results?: LabOrder["resultData"], passSignerName?: string, passFaceImage?: string) => Promise<{ signerName: string; faceImage: string | null }>;
  addRadiologyOrder: (visitId: string, modality: RadiologyOrder["modality"], bodyPart: string) => Promise<void>;
  updateRadiologyStatus: (id: string, status: RadiologyOrder["status"], findings?: string, impression?: string, dicomUrl?: string, annotations?: any) => Promise<void>;
  markOrderPaid: (type: "lab" | "radiology" | "prescription", id: string, newStatus?: "PAID" | "WAIVED") => Promise<void>;
  updateBedStatus: (id: string, status: Bed["status"]) => void;
  admitPatient: (visitId: string, bedId: string) => Promise<void>;
  dischargePatient: (admissionId: string) => Promise<void>;
  addPayment: (invoiceId: string, amount: number, method: Payment["paymentMethod"]) => Promise<void>;
  acknowledgeAlert: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventoryQty: (id: string, qtyChange: number) => void;
  sendMessage: (text: string) => void;
  logSystemAction: (action: string, table: string, id: string, details: string, signerName?: string, faceImage?: string) => void;

  // Interoperability
  exportFhirPatient: (patientId: string) => string;
  exportHl7Patient: (patientId: string) => string;
}

const EhrContext = createContext<EhrContextType | undefined>(undefined);

// ==========================================
// 3. Provider Component
// ==========================================

export function EhrProvider({ children }: { children: React.ReactNode }) {
  // Session state
  const [activeRole, setActiveRoleRaw] = useState<string>("doctor");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<string | null>(null);

  // Confirmation Request for database updates
  interface ConfirmationRequest {
    message: string;
    resolve: (value: { signerName: string; faceImage: string | null }) => void;
    reject: (reason: any) => void;
  }
  const [confirmationRequest, setConfirmationRequest] = useState<ConfirmationRequest | null>(null);

  const requestConfirmation = (message: string): Promise<{ signerName: string; faceImage: string | null }> => {
    return new Promise((resolve, reject) => {
      setConfirmationRequest({
        message,
        resolve,
        reject,
      });
    });
  };

  const [lastViewedPatientIds, setLastViewedPatientIds] = useState<string[]>([]);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Simulated Database States (populated from API)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [vitalsList, setVitalsList] = useState<Vitals[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cdsAlerts, setCdsAlerts] = useState<CdsAlert[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [medicationAdministrations, setMedicationAdministrations] = useState<MedicationAdministration[]>([]);
  const [intakeOutputList, setIntakeOutputList] = useState<IntakeOutput[]>([]);
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);

  // Sync data from the database
  const syncData = async () => {
    try {
      const res = await fetch("/api/v1/sync");
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      setPatients(data.patients);
      setVisits(data.visits);
      setVitalsList(data.vitalsList);
      setClinicalNotes(data.clinicalNotes);
      setDiagnoses(data.diagnoses);
      setPrescriptions(data.prescriptions);
      setLabOrders(data.labOrders);
      setRadiologyOrders(data.radiologyOrders);
      setBeds(data.beds);
      setAdmissions(data.admissions);
      setInvoices(data.invoices);
      setPayments(data.payments);
      setAuditLogs(data.auditLogs);
      setMessages(data.messages);
      setCdsAlerts(data.cdsAlerts);
      setInventory(data.inventory);
      setStaffList(data.staffList);
      setMedicationAdministrations(data.medicationAdministrations);
      setIntakeOutputList(data.intakeOutputList);
      setDbConnected(true);
    } catch (err) {
      console.error("Sync data error: ", err);
      setDbConnected(false);
    }
  };

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("aether_is_logged_in");
      const storedRole = localStorage.getItem("aether_active_role");
      if (storedAuth === "true") {
        setIsLoggedIn(true);
      }
      if (storedRole) {
        setActiveRoleRaw(storedRole);
      }
      const storedPatientsHistory = localStorage.getItem("aether_last_viewed_patients");
      if (storedPatientsHistory) {
        setLastViewedPatientIds(JSON.parse(storedPatientsHistory));
      }
      setIsInitialized(true);
      syncData();
    }
  }, []);

  // Global listener for unhandled promise rejections to catch security sign-off cancellations
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleRejection = (event: PromiseRejectionEvent) => {
        if (event.reason && (event.reason.message === "Action cancelled by user" || event.reason === "Action cancelled by user")) {
          event.preventDefault();
          console.log("Global Catch: Clinician cancelled signature sign-off.");
        }
      };
      window.addEventListener("unhandledrejection", handleRejection);
      return () => window.removeEventListener("unhandledrejection", handleRejection);
    }
  }, []);

  // Sync activeRole to localStorage
  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined") {
      localStorage.setItem("aether_active_role", activeRole);
    }
  }, [activeRole, isLoggedIn]);

  const setActiveRole = (role: string) => {
    if (isLoggedIn) {
      setPendingRoleSwitch(role);
    } else {
      setActiveRoleRaw(role);
    }
  };

  const login = (username: string, password: string, role: string): boolean => {
    if (username === "itsme" && password === "password") {
      setActiveRoleRaw(role);
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_is_logged_in", "true");
        localStorage.setItem("aether_active_role", role);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("aether_is_logged_in");
      localStorage.removeItem("aether_active_role");
    }
  };

  const confirmRoleSwitch = () => {
    if (pendingRoleSwitch) {
      const target = pendingRoleSwitch;
      setActiveRoleRaw(target);
      setIsLoggedIn(false);
      setPendingRoleSwitch(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_active_role", target);
        localStorage.removeItem("aether_is_logged_in");
      }
    }
  };

  const cancelRoleSwitch = () => {
    setPendingRoleSwitch(null);
  };

  const [currentUser, setCurrentUser] = useState<Staff>({
    id: "staff-placeholder",
    role: "doctor",
    firstName: "",
    lastName: "",
    email: "doctor@hospital.org",
    department: "Emergency Medicine",
    hospital: "St. Mary's General Hospital",
    status: "ACTIVE",
  });

  const getCurrentUserName = (fallback: string): string => {
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    if (fullName) {
      return currentUser.role === "doctor" ? `Dr. ${fullName}` : fullName;
    }
    return fallback;
  };

  useEffect(() => {
    // Map current user to the correct database staff ID from backend seed
    if (staffList.length > 0) {
      const match = staffList.find(s => s.role === activeRole);
      if (match) {
        setCurrentUser(match);
      } else {
        const rolesMap: Record<string, Partial<Staff>> = {
          super_admin: { firstName: "", lastName: "", role: "super_admin", email: "super_admin@hospital.org", department: "IT / Administration" },
          hospital_admin: { firstName: "", lastName: "", role: "hospital_admin", email: "hospital_admin@hospital.org", department: "Clinical Operations" },
          doctor: { firstName: "", lastName: "", role: "doctor", email: "doctor@hospital.org", department: "Emergency Medicine" },
          nurse: { firstName: "", lastName: "", role: "nurse", email: "nurse@hospital.org", department: "Acute Care" },
          pharmacist: { firstName: "", lastName: "", role: "pharmacist", email: "pharmacist@hospital.org", department: "Outpatient Pharmacy" },
          lab_scientist: { firstName: "", lastName: "", role: "lab_scientist", email: "lab_scientist@hospital.org", department: "Clinical Pathology" },
          radiologist: { firstName: "", lastName: "", role: "radiologist", email: "radiologist@hospital.org", department: "Diagnostic Imaging" },
          receptionist: { firstName: "", lastName: "", role: "receptionist", email: "receptionist@hospital.org", department: "Front Desk Operations" },
          accountant: { firstName: "", lastName: "", role: "accountant", email: "accountant@hospital.org", department: "Finance and Claims" },
          patient: { firstName: "", lastName: "", role: "patient", email: "patient@hospital.org", department: "Primary Care Outpatient" },
        };
        if (rolesMap[activeRole]) {
          setCurrentUser(prev => ({
            ...prev,
            ...rolesMap[activeRole],
          }));
        }
      }
    }
  }, [activeRole, staffList]);

  // Selected patient focus (e.g. active workspace load)
  const [activePatientId, setActivePatientIdRaw] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const setActivePatientId = (id: string | null) => {
    setActivePatientIdRaw(id);
    if (id) {
      setLastViewedPatientIds((prev) => {
        const filtered = prev.filter((pId) => pId !== id);
        const next = [id, ...filtered].slice(0, 5);
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_last_viewed_patients", JSON.stringify(next));
        }
        return next;
      });
    }
  };

  const logSystemAction = (action: string, table: string, id: string, details: string, signerName?: string, faceImage?: string) => {
    // Audit logs are read-only on frontend; they are written via Hono mutators.
  };

  // ==========================================
  // 5. Operations / Mutators
  // ==========================================

  const registerPatient = async (p: Omit<Patient, "id" | "mrn">) => {
    const { signerName, faceImage } = await requestConfirmation(`Register patient: ${p.firstName} ${p.lastName}`);
    const res = await fetch("/api/v1/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...p,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to register patient");
    const newPatient = await res.json();
    await syncData();
    return newPatient;
  };

  const updatePatient = async (id: string, p: Partial<Patient>) => {
    const { signerName, faceImage } = await requestConfirmation(`Update patient profile: ${p.firstName} ${p.lastName}`);
    const res = await fetch(`/api/v1/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...p,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to update patient profile");
    const updatedPatient = await res.json();
    await syncData();
    return updatedPatient;
  };

  const createVisit = async (patientId: string, doctorId: string, visitType: string) => {
    const patient = patients.find(p => p.id === patientId);
    const { signerName, faceImage } = await requestConfirmation(`Check in patient: ${patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient"} for ${visitType}`);
    const res = await fetch("/api/v1/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        doctorId,
        visitType,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to check in patient");
    const newVisit = await res.json();
    await syncData();
    return newVisit;
  };

  const recordVitals = async (visitId: string, vitalsInput: Omit<Vitals, "id" | "recordedAt" | "recordedBy" | "bmi">) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Record patient vitals for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/vitals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...vitalsInput,
        recordedByStaffName: getCurrentUserName("Ward Nurse"),
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to record vitals");
    await syncData();
  };

  const recordClinicalNote = async (visitId: string, noteInput: Omit<ClinicalNote, "id" | "authorId" | "authorName" | "signedAt" | "digitalSignature">, sign = false) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Record clinical ${noteInput.noteType} note for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...noteInput,
        sign,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        authorStaffName: getCurrentUserName(currentUser.role === "doctor" ? "Attending Doctor" : "Ward Nurse"),
      }),
    });
    if (!res.ok) throw new Error("Failed to record note");
    await syncData();
  };

  const addDiagnosis = async (visitId: string, icd10Code: string, description: string, status: "ACTIVE" | "RESOLVED" | "CHRONIC") => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Add diagnosis: ${icd10Code} (${description}) for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/diagnoses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        icd10Code,
        description,
        status,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        doctorName: getCurrentUserName("Attending Doctor"),
      }),
    });
    if (!res.ok) throw new Error("Failed to add diagnosis");
    await syncData();
  };

  const addPrescription = async (visitId: string, items: PrescriptionItem[]) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Create prescription with ${items.length} items for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        doctorName: getCurrentUserName("Attending Doctor"),
      }),
    });
    if (!res.ok) throw new Error("Failed to add prescription");
    await syncData();
  };

  const dispensePrescription = async (id: string) => {
    const rxObj = prescriptions.find(r => r.id === id);
    const patientName = rxObj ? rxObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Dispense prescription for ${patientName}`);
    const res = await fetch(`/api/v1/prescriptions/${id}/dispense`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        pharmacistName: getCurrentUserName("Clinical Pharmacist"),
      }),
    });
    if (!res.ok) throw new Error("Failed to dispense prescription");
    await syncData();
  };

  const addLabOrder = async (visitId: string, testName: string, clinicalIndication?: string, priority?: string, specimenType?: string) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Order laboratory test: ${testName} for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testName,
        priority,
        clinicalIndication,
        specimenType,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        doctorName: getCurrentUserName("Attending Doctor"),
      }),
    });
    if (!res.ok) throw new Error("Failed to add lab order");
    await syncData();
  };

  const updateLabStatus = async (id: string, status: LabOrder["status"], results?: LabOrder["resultData"], passSignerName?: string, passFaceImage?: string): Promise<{ signerName: string; faceImage: string | null }> => {
    const labOrderObj = labOrders.find(l => l.id === id);
    const patientName = labOrderObj ? labOrderObj.patientName : "Patient";

    let signerName = passSignerName;
    let faceImage = passFaceImage || null;

    if (!signerName) {
      const confirmation = await requestConfirmation(`Update laboratory order status to ${status} for ${patientName}`);
      signerName = confirmation.signerName;
      faceImage = confirmation.faceImage;
    }

    const res = await fetch(`/api/v1/labs/${id}/results`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        results,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        scientistName: getCurrentUserName("Lab Scientist"),
      }),
    });
    if (!res.ok) throw new Error("Failed to update lab order results");
    await syncData();

    return { signerName, faceImage };
  };

  const addRadiologyOrder = async (visitId: string, modality: RadiologyOrder["modality"], bodyPart: string) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Order radiology scan: ${modality} of ${bodyPart} for ${patientName}`);
    const res = await fetch(`/api/v1/visits/${visitId}/radiology`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modality,
        bodyPart,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        doctorName: getCurrentUserName("Attending Doctor"),
      }),
    });
    if (!res.ok) throw new Error("Failed to add radiology order");
    await syncData();
  };

  const updateRadiologyStatus = async (id: string, status: RadiologyOrder["status"], findings?: string, impression?: string, dicomUrl?: string, annotations?: any) => {
    const radOrderObj = radiologyOrders.find(r => r.id === id);
    const patientName = radOrderObj ? radOrderObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Update radiology status to ${status} for ${patientName}`);
    const res = await fetch(`/api/v1/radiology/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        findings,
        impression,
        dicomUrl,
        annotations,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        radiologistName: getCurrentUserName("Radiologist"),
      }),
    });
    if (!res.ok) throw new Error("Failed to update radiology order status");
    await syncData();
  };

  const markOrderPaid = async (type: "lab" | "radiology" | "prescription", id: string, newStatus: "PAID" | "WAIVED" = "PAID") => {
    let patientName = "Patient";
    let orderDesc = "";
    if (type === "lab") {
      const o = labOrders.find(l => l.id === id);
      patientName = o?.patientName || patientName;
      orderDesc = o ? `Lab: ${o.testName}` : "Lab Order";
    } else if (type === "radiology") {
      const o = radiologyOrders.find(r => r.id === id);
      patientName = o?.patientName || patientName;
      orderDesc = o ? `Radiology: ${o.modality} - ${o.bodyPart}` : "Radiology Order";
    } else {
      const o = prescriptions.find(r => r.id === id);
      patientName = o?.patientName || patientName;
      orderDesc = o ? `Prescription: ${o.items.map(i => i.drugName).join(", ")}` : "Prescription";
    }

    const { signerName, faceImage } = await requestConfirmation(`Mark as ${newStatus}: ${orderDesc} for ${patientName}`);

    const res = await fetch(`/api/v1/orders/${type}/${id}/paid`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: newStatus,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        accountantName: getCurrentUserName("Accountant"),
      }),
    });
    if (!res.ok) throw new Error("Failed to update order payment status");
    await syncData();
  };

  const updateBedStatus = (id: string, status: Bed["status"]) => {
    // State is managed transactionally on backend sync
  };

  const admitPatient = async (visitId: string, bedId: string) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patName = visitObj ? visitObj.patientName : "Patient";
    const bedObj = beds.find(b => b.id === bedId);
    const bedInfo = bedObj ? `${bedObj.roomNumber} - Bed ${bedObj.bedNumber}` : "Bed";
    const { signerName, faceImage } = await requestConfirmation(`Admit patient: ${patName} to ${bedInfo}`);

    const res = await fetch("/api/v1/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitId,
        bedId,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        adminName: getCurrentUserName("Hospital Admin"),
      }),
    });
    if (!res.ok) throw new Error("Failed to admit patient");
    await syncData();
  };

  const dischargePatient = async (admissionId: string) => {
    const adm = admissions.find(a => a.id === admissionId);
    if (!adm) return;
    const { signerName, faceImage } = await requestConfirmation(`Discharge patient: ${adm.patientName}`);

    const res = await fetch(`/api/v1/admissions/${admissionId}/discharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to discharge patient");
    await syncData();
  };

  const addPayment = async (invoiceId: string, amount: number, method: Payment["paymentMethod"]) => {
    const invObj = invoices.find(i => i.id === invoiceId);
    const patientName = invObj ? invObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Process payment of $${amount} via ${method} for ${patientName}`);

    const res = await fetch("/api/v1/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        amount,
        paymentMethod: method,
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
        accountantName: getCurrentUserName("Accountant"),
      }),
    });
    if (!res.ok) throw new Error("Failed to add payment");
    await syncData();
  };

  const acknowledgeAlert = async (id: string) => {
    const res = await fetch(`/api/v1/alerts/${id}/acknowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to acknowledge alert");
    await syncData();
  };

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    // Inventory creation placeholder
  };

  const updateInventoryQty = (id: string, qtyChange: number) => {
    // Inventory management is done transactionally on backend dispense
  };

  const recordMedicationAdministration = async (
    visitId: string,
    adminInput: Omit<MedicationAdministration, "id" | "administeredAt" | "administeredBy">
  ) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Record medication administration for ${patientName}`);

    const res = await fetch(`/api/v1/visits/${visitId}/medication-administrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...adminInput,
        nurseName: getCurrentUserName("Ward Nurse"),
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to record medication administration");
    await syncData();
  };

  const recordIntakeOutput = async (
    visitId: string,
    ioInput: Omit<IntakeOutput, "id" | "recordedAt" | "recordedBy">
  ) => {
    const visitObj = visits.find(v => v.id === visitId);
    const patientName = visitObj ? visitObj.patientName : "Patient";
    const { signerName, faceImage } = await requestConfirmation(`Record intake/output chart for ${patientName}`);

    const res = await fetch(`/api/v1/visits/${visitId}/intake-output`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ioInput,
        nurseName: getCurrentUserName("Ward Nurse"),
        signerName,
        faceImage,
        currentUser_id: currentUser.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to record intake/output");
    await syncData();
  };

  const sendMessage = async (text: string) => {
    const res = await fetch("/api/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: getCurrentUserName(currentUser.role === "doctor" ? "Attending Doctor" : currentUser.role.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")),
        senderRole: currentUser.role,
        text,
      }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    await syncData();
  };

  // ==========================================
  // 6. Interoperability Exporters (FHIR & HL7)
  // ==========================================

  const exportFhirPatient = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return "{}";

    const fhirResource = {
      resourceType: "Patient",
      id: patient.id,
      identifier: [
        { use: "official", type: { text: "MRN" }, value: patient.mrn },
        { use: "usual", type: { text: "National ID" }, value: patient.nationalId }
      ],
      name: [
        {
          use: "official",
          family: patient.lastName,
          given: [patient.firstName]
        }
      ],
      telecom: [
        { system: "phone", value: patient.phone, use: "mobile" },
        { system: "email", value: patient.email, use: "home" }
      ],
      gender: patient.gender.toLowerCase() === "male" ? "male" : "female",
      birthDate: patient.dateOfBirth,
      address: [{ text: patient.address }],
      extension: [
        { url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup", valueCode: patient.bloodGroup },
        { url: "http://hl7.org/fhir/StructureDefinition/patient-genotype", valueCode: patient.genotype }
      ]
    };

    return JSON.stringify(fhirResource, null, 2);
  };

  const exportHl7Patient = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return "";

    const dobFormatted = patient.dateOfBirth.replace(/-/g, "");
    const nowFormatted = new Date().toISOString().slice(0,19).replace(/[-T:]/g,"");

    const hl7Segments = [
      `MSH|^~\\&|EHR_SYSTEM|ST_MARYS_HOSP|PACS_SYSTEM|RADIOLOGY|${nowFormatted}||ADT^A08^ADT_A01|MSG${Date.now()}|P|2.4`,
      `EVN|A08|${nowFormatted}`,
      `PID|1||${patient.mrn}^^^MRN||${patient.lastName}^${patient.firstName}^^^^L||${dobFormatted}|${patient.gender === "Male" ? "M" : "F"}|||${patient.address}^^^^USA||${patient.phone}|||||${patient.nationalId}`
    ];

    return hl7Segments.join("\n");
  };

  return (
    <EhrContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        isInitialized,
        dbConnected,
        login,
        logout,
        pendingRoleSwitch,
        setPendingRoleSwitch,
        confirmRoleSwitch,
        cancelRoleSwitch,
        activePatientId,
        setActivePatientId,
        lastViewedPatientIds,
        searchQuery,
        setSearchQuery,
        patients,
        visits,
        vitalsList,
        clinicalNotes,
        diagnoses,
        prescriptions,
        labOrders,
        radiologyOrders,
        beds,
        admissions,
        invoices,
        payments,
        auditLogs,
        messages,
        cdsAlerts,
        inventory,
        staffList,
        registerPatient,
        updatePatient,
        createVisit,
        recordVitals,
        recordClinicalNote,
        addDiagnosis,
        addPrescription,
        dispensePrescription,
        addLabOrder,
        updateLabStatus,
        markOrderPaid,
        addRadiologyOrder,
        updateRadiologyStatus,
        updateBedStatus,
        admitPatient,
        dischargePatient,
        addPayment,
        acknowledgeAlert,
        addInventoryItem,
        updateInventoryQty,
        sendMessage,
        logSystemAction,
        exportFhirPatient,
        exportHl7Patient,
        medicationAdministrations,
        intakeOutputList,
        recordMedicationAdministration,
        recordIntakeOutput,
        historyPatientId,
        setHistoryPatientId,
      }}
    >
      {children}
      {confirmationRequest && (
        <ConfirmationModal
          message={confirmationRequest.message}
          onConfirm={(signerName, faceImage) => {
            confirmationRequest.resolve({ signerName, faceImage });
            setConfirmationRequest(null);
          }}
          onCancel={() => {
            confirmationRequest.reject(new Error("Action cancelled by user"));
            setConfirmationRequest(null);
          }}
        />
      )}
    </EhrContext.Provider>
  );
}

export function useEhr() {
  const context = useContext(EhrContext);
  if (!context) {
    throw new Error("useEhr must be used within an EhrProvider");
  }
  return context;
}
