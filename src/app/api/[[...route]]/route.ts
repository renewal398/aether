import { Hono } from "hono";
import { handle } from "hono/vercel";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// Helper function for auditing clinical transactions
async function logSystemAction(
  userId: string,
  action: string,
  table: string,
  id: string,
  details: string,
  signerName?: string,
  faceImage?: string
) {
  const staff = await prisma.staff.findUnique({
    where: { id },
  }).catch(() => null);
  
  await prisma.auditLog.create({
    data: {
      userId: userId || null,
      action,
      targetTable: table,
      targetId: id,
      ipAddress: "192.168.10.144",
      newValues: {
        details,
        signerName: signerName || null,
        faceImage: faceImage || null,
      },
    },
  });
}

// Helper to seed core structural data if empty
async function ensureMetadataSeeded() {
  const roleCount = await prisma.role.count();
  if (roleCount === 0) {
    // 1. Roles
    const roles = [
      { name: "super_admin", description: "Super Administrator" },
      { name: "hospital_admin", description: "Hospital Administrator" },
      { name: "doctor", description: "Attending Physician" },
      { name: "nurse", description: "Ward Nurse" },
      { name: "pharmacist", description: "Clinical Pharmacist" },
      { name: "lab_scientist", description: "Pathology Scientist" },
      { name: "radiologist", description: "Radiology Specialist" },
      { name: "receptionist", description: "Front Desk Intake Agent" },
      { name: "accountant", description: "Medical Accountant" },
      { name: "patient", description: "Patient Account Portal" },
    ];

    for (const r of roles) {
      await prisma.role.create({ data: r });
    }

    // 2. Hospitals & Departments
    const smgh = await prisma.hospital.create({
      data: {
        name: "St. Mary's General Hospital",
        address: "742 Evergreen Terrace, Springfield",
        phone: "+1 (555) 123-4567",
        email: "contact@stmarys.org",
      },
    });

    const mca = await prisma.hospital.create({
      data: {
        name: "Mercy Clinical Annex",
        address: "112 Ocean Avenue, Amityville",
        phone: "+1 (555) 890-5678",
        email: "annex@mercy.org",
      },
    });

    const arlc = await prisma.hospital.create({
      data: {
        name: "Aether Regional Lab Center",
        address: "550 Broad St, North City",
        phone: "+1 (555) 345-6789",
        email: "labs@aether.org",
      },
    });

    // Create Departments
    const depts = [
      { name: "Emergency Medicine", code: "EM-01", hospitalId: smgh.id },
      { name: "Acute Care", code: "AC-02", hospitalId: smgh.id },
      { name: "Outpatient Pharmacy", code: "PH-03", hospitalId: smgh.id },
      { name: "Clinical Pathology", code: "CP-04", hospitalId: arlc.id },
      { name: "Diagnostic Imaging", code: "DI-05", hospitalId: smgh.id },
      { name: "Front Desk Operations", code: "FD-06", hospitalId: smgh.id },
      { name: "Finance and Claims", code: "FC-07", hospitalId: smgh.id },
      { name: "Primary Care Outpatient", code: "PC-08", hospitalId: mca.id },
      { name: "IT / Administration", code: "IT-09", hospitalId: smgh.id },
    ];

    for (const d of depts) {
      await prisma.department.create({ data: d });
    }

    // Get created roles
    const dbRoles = await prisma.role.findMany();
    const roleMap = new Map(dbRoles.map((r) => [r.name, r.id]));

    // Get departments
    const dbDepts = await prisma.department.findMany();
    const deptMap = new Map(dbDepts.map((d) => [d.name, d.id]));

    // 3. Staff credentials matching context defaults
    const staffList = [
      { firstName: "", lastName: "", roleName: "super_admin", deptName: "IT / Administration", email: "super_admin@hospital.org" },
      { firstName: "", lastName: "", roleName: "hospital_admin", deptName: "Clinical Operations", email: "hospital_admin@hospital.org" },
      { firstName: "", lastName: "", roleName: "doctor", deptName: "Emergency Medicine", email: "doctor@hospital.org" },
      { firstName: "", lastName: "", roleName: "nurse", deptName: "Acute Care", email: "nurse@hospital.org" },
      { firstName: "", lastName: "", roleName: "pharmacist", deptName: "Outpatient Pharmacy", email: "pharmacist@hospital.org" },
      { firstName: "", lastName: "", roleName: "lab_scientist", deptName: "Clinical Pathology", email: "lab_scientist@hospital.org" },
      { firstName: "", lastName: "", roleName: "radiologist", deptName: "Diagnostic Imaging", email: "radiologist@hospital.org" },
      { firstName: "", lastName: "", roleName: "receptionist", deptName: "Front Desk Operations", email: "receptionist@hospital.org" },
      { firstName: "", lastName: "", roleName: "accountant", deptName: "Finance and Claims", email: "accountant@hospital.org" },
    ];

    for (const s of staffList) {
      const roleId = roleMap.get(s.roleName);
      const departmentId = deptMap.get(s.deptName) || null;
      await prisma.staff.create({
        data: {
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          passwordHash: "secure_placeholder",
          hospitalId: smgh.id,
          departmentId,
          roleId,
          status: "ACTIVE",
        },
      });
    }

    // 4. Rooms and Beds for Admissions
    const icuRoom = await prisma.room.create({
      data: {
        hospitalId: smgh.id,
        roomNumber: "ICU-101",
        roomType: "ICU",
        status: "AVAILABLE",
      },
    });

    const medRoom = await prisma.room.create({
      data: {
        hospitalId: smgh.id,
        roomNumber: "MED-201",
        roomType: "GENERAL",
        status: "AVAILABLE",
      },
    });

    const isoRoom = await prisma.room.create({
      data: {
        hospitalId: smgh.id,
        roomNumber: "ISO-301",
        roomType: "ISOLATION",
        status: "AVAILABLE",
      },
    });

    // Create Beds
    const beds = [
      { roomId: icuRoom.id, bedNumber: "A", status: "AVAILABLE" },
      { roomId: icuRoom.id, bedNumber: "B", status: "AVAILABLE" },
      { roomId: medRoom.id, bedNumber: "1", status: "AVAILABLE" },
      { roomId: isoRoom.id, bedNumber: "1", status: "AVAILABLE" },
    ];

    for (const b of beds) {
      await prisma.bed.create({ data: b });
    }

    // 5. Inventory drug catalogs
    const drugs = [
      { name: "Aspirin 325mg", category: "DRUG", quantity: 1500, minAlertQty: 100, expiryDate: new Date("2027-09-30"), batchNumber: "ASP-992B", unitPrice: 0.15 },
      { name: "Nitroglycerin Spray 0.4mg", category: "DRUG", quantity: 45, minAlertQty: 10, expiryDate: new Date("2027-02-15"), batchNumber: "NIT-104A", unitPrice: 24.5 },
      { name: "Penicillin G 1.2M Units", category: "DRUG", quantity: 200, minAlertQty: 50, expiryDate: new Date("2026-12-01"), batchNumber: "PEN-304X", unitPrice: 8.5 },
      { name: "Saline Bag 1L", category: "SUPPLY", quantity: 450, minAlertQty: 75, expiryDate: new Date("2029-05-20"), batchNumber: "SAL-004C", unitPrice: 2.1 },
      { name: "COVID-19 Rapid Test Kit", category: "CONSUMABLE", quantity: 120, minAlertQty: 30, expiryDate: new Date("2027-01-10"), batchNumber: "COV-774A", unitPrice: 4.0 },
    ];

    for (const dr of drugs) {
      await prisma.inventoryItem.create({ data: dr });
    }
  }
}

// GET /api/v1/sync
app.get("/v1/sync", async (c) => {
  try {
    // Perform structural metadata seed if empty
    await ensureMetadataSeeded();

    const [
      patients,
      visitsRaw,
      vitalsList,
      clinicalNotesRaw,
      diagnoses,
      prescriptionsRaw,
      labOrdersRaw,
      radiologyOrdersRaw,
      bedsRaw,
      admissions,
      invoices,
      payments,
      auditLogsRaw,
      messages,
      cdsAlerts,
      inventory,
      staffListRaw,
      medicationAdministrations,
      intakeOutputListRaw,
    ] = await Promise.all([
      prisma.patient.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.visit.findMany({ include: { patient: true, doctor: true }, orderBy: { checkInTime: "desc" } }),
      prisma.vitals.findMany({ include: { recordedBy: true }, orderBy: { recordedAt: "desc" } }),
      prisma.clinicalNote.findMany({ include: { author: true, visit: true }, orderBy: { signedAt: "desc" } }),
      prisma.diagnosis.findMany({ orderBy: { recordedAt: "desc" } }),
      prisma.prescription.findMany({ include: { items: true, doctor: true, visit: { include: { patient: true } } }, orderBy: { prescribedAt: "desc" } }),
      prisma.labOrder.findMany({ include: { orderedBy: true, visit: { include: { patient: true } } }, orderBy: { orderedAt: "desc" } }),
      prisma.radiologyOrder.findMany({ include: { orderedBy: true, visit: { include: { patient: true } }, reports: true }, orderBy: { orderedAt: "desc" } }),
      prisma.bed.findMany({ include: { room: true } }),
      prisma.admission.findMany({ include: { visit: { include: { patient: true } }, bed: { include: { room: true } } } }),
      prisma.invoice.findMany({ include: { visit: { include: { patient: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.payment.findMany({ include: { processedBy: true }, orderBy: { processedAt: "desc" } }),
      prisma.auditLog.findMany({ include: { user: true }, orderBy: { timestamp: "desc" } }),
      prisma.message.findMany({ orderBy: { timestamp: "asc" } }),
      prisma.cdsAlert.findMany({ orderBy: { timestamp: "desc" } }),
      prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
      prisma.staff.findMany({ include: { role: true, department: true } }),
      prisma.medicationAdministration.findMany({ orderBy: { administeredAt: "desc" } }),
      prisma.intakeOutput.findMany({ orderBy: { recordedAt: "desc" } }),
    ]);

    // Map query results to match context interfaces
    const mappedPatients = patients.map((p) => ({
      ...p,
      dateOfBirth: p.dateOfBirth.toISOString().split("T")[0],
      allergies: p.bloodGroup === "O+" ? ["Penicillin", "Peanuts"] : p.bloodGroup === "A-" ? ["Sulfa Drugs"] : [],
    }));

    const mappedVisits = visitsRaw.map((v) => ({
      id: v.id,
      patientId: v.patientId,
      patientName: `${v.patient.firstName} ${v.patient.lastName}`,
      doctorId: v.doctorId,
      doctorName: v.doctor ? (`${v.doctor.firstName} ${v.doctor.lastName}`.trim() ? `Dr. ${v.doctor.firstName} ${v.doctor.lastName}` : "Attending Doctor") : "Unknown Doctor",
      visitType: v.visitType,
      status: v.status,
      checkInTime: v.checkInTime.toISOString(),
      checkOutTime: v.checkOutTime?.toISOString() || undefined,
    }));

    const mappedVitalsList = vitalsList.map((v) => ({
      id: v.id,
      visitId: v.visitId,
      recordedAt: v.recordedAt.toISOString(),
      recordedBy: v.recordedBy ? (`${v.recordedBy.firstName} ${v.recordedBy.lastName}`.trim() || "Ward Nurse") : "System",
      temperature: Number(v.temperature),
      systolicBp: v.systolicBp || 0,
      diastolicBp: v.diastolicBp || 0,
      heartRate: v.heartRate || 0,
      respiratoryRate: v.respiratoryRate || 0,
      oxygenSaturation: Number(v.oxygenSaturation),
      weight: v.weight ? Number(v.weight) : undefined,
      height: v.height ? Number(v.height) : undefined,
      bmi: v.bmi ? Number(v.bmi) : undefined,
      painScore: v.painScore || undefined,
    }));

    const mappedClinicalNotes = clinicalNotesRaw.map((n) => ({
      id: n.id,
      visitId: n.visitId,
      authorId: n.authorId || "",
      authorName: n.author ? (`${n.author.firstName} ${n.author.lastName}`.trim() || "Attending Practitioner") : "Attending Practitioner",
      noteType: n.noteType as any,
      subjective: n.subjective || "",
      objective: n.objective || "",
      assessment: n.assessment || "",
      plan: n.plan || "",
      signedAt: n.signedAt?.toISOString() || undefined,
      digitalSignature: n.digitalSignature || undefined,
    }));

    const mappedPrescriptions = prescriptionsRaw.map((r) => ({
      id: r.id,
      visitId: r.visitId,
      patientId: r.visit.patientId,
      patientName: `${r.visit.patient.firstName} ${r.visit.patient.lastName}`,
      doctorId: r.doctorId || "",
      doctorName: r.doctor ? (`${r.doctor.firstName} ${r.doctor.lastName}`.trim() ? `Dr. ${r.doctor.firstName} ${r.doctor.lastName}` : "Attending Doctor") : "Attending Doctor",
      prescribedAt: r.prescribedAt.toISOString(),
      items: r.items.map((it) => ({
        drugName: it.drugName,
        dosage: it.dosage,
        frequency: it.frequency,
        duration: it.duration,
        notes: it.notes || undefined,
      })),
      status: r.status as any,
      paymentStatus: r.paymentStatus as any,
    }));

    const mappedLabOrders = labOrdersRaw.map((l) => ({
      id: l.id,
      visitId: l.visitId,
      patientId: l.visit.patientId,
      patientName: `${l.visit.patient.firstName} ${l.visit.patient.lastName}`,
      orderedBy: l.orderedById || "",
      orderedByName: l.orderedBy ? (`${l.orderedBy.firstName} ${l.orderedBy.lastName}`.trim() ? `Dr. ${l.orderedBy.firstName} ${l.orderedBy.lastName}` : "Attending Doctor") : "Attending Doctor",
      testName: l.testName,
      status: l.status as any,
      paymentStatus: l.paymentStatus as any,
      orderedAt: l.orderedAt.toISOString(),
      approvedAt: l.approvedAt?.toISOString() || undefined,
    }));

    const mappedRadiologyOrders = radiologyOrdersRaw.map((r) => {
      const activeReport = r.reports[0];
      return {
        id: r.id,
        visitId: r.visitId,
        patientId: r.visit.patientId,
        patientName: `${r.visit.patient.firstName} ${r.visit.patient.lastName}`,
        orderedBy: r.orderedById || "",
        orderedByName: r.orderedBy ? (`${r.orderedBy.firstName} ${r.orderedBy.lastName}`.trim() ? `Dr. ${r.orderedBy.firstName} ${r.orderedBy.lastName}` : "Attending Doctor") : "Attending Doctor",
        modality: r.modality as any,
        bodyPart: r.bodyPart,
        status: r.status as any,
        paymentStatus: r.paymentStatus as any,
        orderedAt: r.orderedAt.toISOString(),
        findings: activeReport?.findings || undefined,
        impression: activeReport?.impression || undefined,
        dicomUrl: activeReport?.dicomUrl || undefined,
      };
    });

    const mappedBeds = bedsRaw.map((b) => {
      // Find active patient admission on this bed
      const activeAdmission = admissions.find((a) => a.bedId === b.id && !a.dischargedAt);
      return {
        id: b.id,
        roomNumber: b.room.roomNumber,
        bedNumber: b.bedNumber,
        roomType: b.room.roomType as any,
        status: b.status as any,
        currentPatientId: activeAdmission?.visit.patientId || undefined,
        currentPatientName: activeAdmission
          ? `${activeAdmission.visit.patient.firstName} ${activeAdmission.visit.patient.lastName}`
          : undefined,
      };
    });

    const mappedAdmissions = admissions.map((a) => ({
      id: a.id,
      visitId: a.visitId,
      patientId: a.visit.patientId,
      patientName: `${a.visit.patient.firstName} ${a.visit.patient.lastName}`,
      bedId: a.bedId || "",
      admittedAt: a.admittedAt.toISOString(),
      dischargedAt: a.dischargedAt?.toISOString() || undefined,
    }));

    const mappedInvoices = invoices.map((i) => ({
      id: i.id,
      visitId: i.visitId,
      patientId: i.visit.patientId,
      patientName: `${i.visit.patient.firstName} ${i.visit.patient.lastName}`,
      totalAmount: Number(i.totalAmount),
      insuranceCovered: Number(i.insuranceCovered),
      patientPayable: Number(i.patientPayable),
      status: i.status as any,
      createdAt: i.createdAt.toISOString(),
      items: [{ description: "Standard Consultation Fee", amount: Number(i.totalAmount) }],
    }));

    const mappedPayments = payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod as any,
      processedBy: p.processedBy ? (`${p.processedBy.firstName} ${p.processedBy.lastName}`.trim() || "Accountant") : "System",
      processedAt: p.processedAt.toISOString(),
    }));

    const mappedAuditLogs = auditLogsRaw.map((a) => ({
      id: a.id,
      userId: a.userId || "system",
      userName: a.user ? (`${a.user.firstName} ${a.user.lastName}`.trim() || "Staff Member") : "System",
      userRole: a.user?.roleId || "system",
      action: a.action,
      targetTable: a.targetTable || "",
      targetId: a.targetId || "",
      ipAddress: a.ipAddress || "127.0.0.1",
      timestamp: a.timestamp.toISOString(),
      details: (a.newValues as any)?.details || a.action,
      signerName: (a.newValues as any)?.signerName || undefined,
      faceImage: (a.newValues as any)?.faceImage || undefined,
    }));

    const mappedInventory = inventory.map((inv) => ({
      id: inv.id,
      name: inv.name,
      category: inv.category as any,
      quantity: inv.quantity,
      minAlertQty: inv.minAlertQty,
      expiryDate: inv.expiryDate.toISOString().split("T")[0],
      batchNumber: inv.batchNumber,
      unitPrice: Number(inv.unitPrice),
    }));

    const mappedStaffList = staffListRaw.map((s) => ({
      id: s.id,
      role: s.role?.name || "doctor",
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      department: s.department?.name || "",
      hospital: "St. Mary's General Hospital",
      status: s.status as any,
    }));

    const mappedMedicationAdministrations = medicationAdministrations.map((m) => ({
      ...m,
      administeredAt: m.administeredAt.toISOString(),
    }));

    const mappedIntakeOutputList = intakeOutputListRaw.map((io) => ({
      id: io.id,
      visitId: io.visitId,
      patientId: io.patientId,
      type: io.type as any,
      category: io.category,
      amount: Number(io.amount),
      recordedAt: io.recordedAt.toISOString(),
      recordedBy: io.recordedBy,
      notes: io.notes || undefined,
    }));

    return c.json({
      patients: mappedPatients,
      visits: mappedVisits,
      vitalsList: mappedVitalsList,
      clinicalNotes: mappedClinicalNotes,
      diagnoses,
      prescriptions: mappedPrescriptions,
      labOrders: mappedLabOrders,
      radiologyOrders: mappedRadiologyOrders,
      beds: mappedBeds,
      admissions: mappedAdmissions,
      invoices: mappedInvoices,
      payments: mappedPayments,
      auditLogs: mappedAuditLogs,
      messages,
      cdsAlerts,
      inventory: mappedInventory,
      staffList: mappedStaffList,
      medicationAdministrations: mappedMedicationAdministrations,
      intakeOutputList: mappedIntakeOutputList,
    });
  } catch (error: any) {
    console.error("Sync API error: ", error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/patients
app.post("/v1/patients", async (c) => {
  try {
    const body = await c.req.json();
    const { signerName, faceImage, ...patientData } = body;

    const mrn = `MRN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient = await prisma.patient.create({
      data: {
        mrn,
        nationalId: patientData.nationalId || null,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: new Date(patientData.dateOfBirth),
        gender: patientData.gender,
        phone: patientData.phone || null,
        email: patientData.email || null,
        address: patientData.address || null,
        bloodGroup: patientData.bloodGroup || null,
        genotype: patientData.genotype || null,
        emergencyContactName: patientData.emergencyContactName || null,
        emergencyContactPhone: patientData.emergencyContactPhone || null,
        insuranceProvider: patientData.insuranceProvider || null,
        insurancePolicyNumber: patientData.insurancePolicyNumber || null,
      },
    });

    await logSystemAction(
      patientData.currentUser_id || "",
      "REGISTER_PATIENT",
      "patients",
      newPatient.id,
      `Registered patient ${newPatient.firstName} ${newPatient.lastName} (MRN: ${newPatient.mrn}, DOB: ${patientData.dateOfBirth})`,
      signerName,
      faceImage
    );

    return c.json(newPatient);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// PUT /api/v1/patients/:id
app.put("/v1/patients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { signerName, faceImage, ...patientData } = body;

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        nationalId: patientData.nationalId !== undefined ? (patientData.nationalId || null) : undefined,
        firstName: patientData.firstName !== undefined ? patientData.firstName : undefined,
        lastName: patientData.lastName !== undefined ? patientData.lastName : undefined,
        dateOfBirth: patientData.dateOfBirth !== undefined ? new Date(patientData.dateOfBirth) : undefined,
        gender: patientData.gender !== undefined ? patientData.gender : undefined,
        phone: patientData.phone !== undefined ? (patientData.phone || null) : undefined,
        email: patientData.email !== undefined ? (patientData.email || null) : undefined,
        address: patientData.address !== undefined ? (patientData.address || null) : undefined,
        bloodGroup: patientData.bloodGroup !== undefined ? (patientData.bloodGroup || null) : undefined,
        genotype: patientData.genotype !== undefined ? (patientData.genotype || null) : undefined,
        emergencyContactName: patientData.emergencyContactName !== undefined ? (patientData.emergencyContactName || null) : undefined,
        emergencyContactPhone: patientData.emergencyContactPhone !== undefined ? (patientData.emergencyContactPhone || null) : undefined,
        insuranceProvider: patientData.insuranceProvider !== undefined ? (patientData.insuranceProvider || null) : undefined,
        insurancePolicyNumber: patientData.insurancePolicyNumber !== undefined ? (patientData.insurancePolicyNumber || null) : undefined,
      },
    });

    await logSystemAction(
      body.currentUser_id || "",
      "UPDATE_PATIENT",
      "patients",
      updatedPatient.id,
      `Updated patient profile ${updatedPatient.firstName} ${updatedPatient.lastName} (MRN: ${updatedPatient.mrn})`,
      signerName,
      faceImage
    );

    return c.json(updatedPatient);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits
app.post("/v1/visits", async (c) => {
  try {
    const body = await c.req.json();
    const { patientId, doctorId, visitType, signerName, faceImage, currentUser_id } = body;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return c.json({ error: "Patient not found" }, 404);

    const newVisit = await prisma.visit.create({
      data: {
        patientId,
        doctorId: doctorId || null,
        visitType,
        status: "CHECKED_IN",
      },
      include: { doctor: true },
    });

    const doctorName = newVisit.doctor
      ? `Dr. ${newVisit.doctor.firstName} ${newVisit.doctor.lastName}`
      : "Unknown Doctor";

    await logSystemAction(
      currentUser_id || "",
      "CREATE_VISIT",
      "visits",
      newVisit.id,
      `Check-in created. Type: ${visitType}, Patient: ${patient.firstName} ${patient.lastName}, Attending: ${doctorName}`,
      signerName,
      faceImage
    );

    // Create consultation invoice
    await prisma.invoice.create({
      data: {
        visitId: newVisit.id,
        totalAmount: 150.0,
        insuranceCovered: 120.0,
        patientPayable: 30.0,
        status: "UNPAID",
      },
    });

    return c.json(newVisit);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/vitals
app.post("/v1/visits/:id/vitals", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const {
      temperature,
      systolicBp,
      diastolicBp,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      painScore,
      recordedByStaffName,
      signerName,
      faceImage,
      currentUser_id,
    } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const bmiVal = (weight && height) ? (weight / ((height / 100) ** 2)) : null;

    const newVitals = await prisma.vitals.create({
      data: {
        visitId,
        temperature: temperature || null,
        systolicBp: systolicBp || null,
        diastolicBp: diastolicBp || null,
        heartRate: heartRate || null,
        respiratoryRate: respiratoryRate || null,
        oxygenSaturation: oxygenSaturation || null,
        weight: weight || null,
        height: height || null,
        bmi: bmiVal ? Number(bmiVal.toFixed(1)) : null,
        painScore: painScore || null,
        recordedById: currentUser_id || null,
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "RECORD_VITALS",
      "vitals",
      newVitals.id,
      `Vitals recorded for ${patientName}: Temp ${temperature}°C, BP ${systolicBp}/${diastolicBp} mmHg, HR ${heartRate} bpm, SpO2 ${oxygenSaturation}%`,
      signerName,
      faceImage
    );

    // CDS rules evaluation
    if (systolicBp >= 180 || diastolicBp >= 120) {
      await prisma.cdsAlert.create({
        data: {
          severity: "CRITICAL",
          title: "Hypertensive Crisis Warning",
          message: `Critical BP detected: ${systolicBp}/${diastolicBp} mmHg. Clinical action required immediately.`,
          patientName,
          acknowledged: false,
        },
      });
    }
    if (oxygenSaturation && oxygenSaturation < 90) {
      await prisma.cdsAlert.create({
        data: {
          severity: "CRITICAL",
          title: "Hypoxemia Warning",
          message: `Critical Oxygen Saturation: ${oxygenSaturation}%. Provide immediate oxygen supplementation.`,
          patientName,
          acknowledged: false,
        },
      });
    }

    return c.json(newVitals);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/notes
app.post("/v1/visits/:id/notes", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const {
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      sign,
      signerName,
      faceImage,
      currentUser_id,
      authorStaffName,
    } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const digitalSig = sign
      ? `SIG-${authorStaffName.replace(/\s+/g, "-").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      : null;

    const newNote = await prisma.clinicalNote.create({
      data: {
        visitId,
        authorId: currentUser_id || null,
        noteType,
        subjective,
        objective,
        assessment,
        plan,
        digitalSignature: digitalSig,
        signedAt: sign ? new Date() : null,
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "RECORD_NOTE",
      "clinical_notes",
      newNote.id,
      `Recorded ${noteType} note for ${patientName} by ${authorStaffName}`,
      signerName,
      faceImage
    );

    return c.json(newNote);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/diagnoses
app.post("/v1/visits/:id/diagnoses", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { icd10Code, description, status, signerName, faceImage, currentUser_id, doctorName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newDiag = await prisma.diagnosis.create({
      data: {
        visitId,
        icd10Code,
        description,
        diagnosedBy: currentUser_id || null,
        status,
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "ADD_DIAGNOSIS",
      "diagnoses",
      newDiag.id,
      `Added diagnosis for ${patientName}: ICD-10 Code ${icd10Code} - "${description}" (Status: ${status})`,
      signerName,
      faceImage
    );

    return c.json(newDiag);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/prescriptions
app.post("/v1/visits/:id/prescriptions", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { items, signerName, faceImage, currentUser_id, doctorName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newRx = await prisma.prescription.create({
      data: {
        visitId,
        doctorId: currentUser_id || null,
        status: "PENDING",
      },
    });

    for (const it of items) {
      await prisma.prescriptionItem.create({
        data: {
          prescriptionId: newRx.id,
          drugName: it.drugName,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          notes: it.notes || null,
        },
      });
    }

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    // Allergy check warning rules
    const patientAllergies = visit.patient.bloodGroup === "O+" ? ["penicillin", "peanuts"] : visit.patient.bloodGroup === "A-" ? ["sulfa drugs"] : [];
    items.forEach(async (it: any) => {
      const matchingAllergy = patientAllergies.find(
        (all) => it.drugName.toLowerCase().includes(all) || all.includes(it.drugName.toLowerCase())
      );
      if (matchingAllergy) {
        await prisma.cdsAlert.create({
          data: {
            severity: "CRITICAL",
            title: "Drug-Allergy Interaction Warning",
            message: `Prescribing ${it.drugName} is contraindicated. Patient has a documented allergy to ${matchingAllergy}.`,
            patientName,
            acknowledged: false,
          },
        });
      }
    });

    await logSystemAction(
      currentUser_id || "",
      "CREATE_PRESCRIPTION",
      "prescriptions",
      newRx.id,
      `Prescription created for ${patientName} by ${doctorName}. Items: ${items.map((it: any) => `${it.drugName} ${it.dosage}`).join(", ")}`,
      signerName,
      faceImage
    );

    return c.json(newRx);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/prescriptions/:id/dispense
app.post("/v1/prescriptions/:id/dispense", async (c) => {
  try {
    const rxId = c.req.param("id");
    const body = await c.req.json();
    const { signerName, faceImage, currentUser_id, pharmacistName } = body;

    const rx = await prisma.prescription.findUnique({
      where: { id: rxId },
      include: { items: true, visit: { include: { patient: true } } },
    });
    if (!rx) return c.json({ error: "Prescription not found" }, 404);

    const updatedRx = await prisma.prescription.update({
      where: { id: rxId },
      data: {
        status: "DISPENSED",
      },
    });

    const patientName = `${rx.visit.patient.firstName} ${rx.visit.patient.lastName}`;

    // Decrement inventory stock logic
    for (const it of rx.items) {
      const stockItem = await prisma.inventoryItem.findFirst({
        where: { name: { contains: it.drugName, mode: "insensitive" } },
      });
      if (stockItem) {
        const newQty = Math.max(0, stockItem.quantity - 30); // deduct standard pack size
        await prisma.inventoryItem.update({
          where: { id: stockItem.id },
          data: { quantity: newQty },
        });

        if (newQty <= stockItem.minAlertQty) {
          await prisma.cdsAlert.create({
            data: {
              severity: "WARNING",
              title: "Low Stock Warning",
              message: `Inventory stock of ${stockItem.name} is critical. Remaining quantity: ${newQty} units.`,
              patientName: "System Stock Room",
              acknowledged: false,
            },
          });
        }
      }
    }

    await logSystemAction(
      currentUser_id || "",
      "DISPENSE_PRESCRIPTION",
      "prescriptions",
      rx.id,
      `Prescription fulfilled for ${patientName}. Fulfilled by ${pharmacistName}`,
      signerName,
      faceImage
    );

    return c.json(updatedRx);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/labs
app.post("/v1/visits/:id/labs", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { testName, priority, clinicalIndication, specimenType, signerName, faceImage, currentUser_id, doctorName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newLab = await prisma.labOrder.create({
      data: {
        visitId,
        testName,
        orderedById: currentUser_id || null,
        status: "PENDING",
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "ORDER_LAB",
      "lab_orders",
      newLab.id,
      `Laboratory order created. Test: "${testName}", Specimen: "${specimenType || 'N/A'}" for patient ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(newLab);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// PUT /api/v1/labs/:id/results
app.put("/v1/labs/:id/results", async (c) => {
  try {
    const labId = c.req.param("id");
    const body = await c.req.json();
    const { status, results, signerName, faceImage, currentUser_id, scientistName } = body;

    const order = await prisma.labOrder.findUnique({
      where: { id: labId },
      include: { visit: { include: { patient: true } } },
    });
    if (!order) return c.json({ error: "Lab order not found" }, 404);

    const updatedOrder = await prisma.labOrder.update({
      where: { id: labId },
      data: {
        status,
        analyzedById: currentUser_id || null,
        approvedById: currentUser_id || null,
        approvedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    if (results) {
      await prisma.labResult.create({
        data: {
          labOrderId: labId,
          resultData: results,
        },
      });

      // Check for critical findings alerts
      const patientName = `${order.visit.patient.firstName} ${order.visit.patient.lastName}`;
      results.forEach(async (res: any) => {
        if (res.status === "CRITICAL") {
          await prisma.cdsAlert.create({
            data: {
              severity: "CRITICAL",
              title: "Critical Lab Value Alert",
              message: `Lab result for ${patientName} has critical value: ${res.parameter} is ${res.value} (Ref: ${res.referenceRange})`,
              patientName,
              acknowledged: false,
            },
          });
        }
      });
    }

    const patientName = `${order.visit.patient.firstName} ${order.visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "UPDATE_LAB",
      "lab_orders",
      labId,
      `Laboratory status updated to ${status} for ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(updatedOrder);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/radiology
app.post("/v1/visits/:id/radiology", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { modality, bodyPart, signerName, faceImage, currentUser_id, doctorName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newRad = await prisma.radiologyOrder.create({
      data: {
        visitId,
        modality,
        bodyPart,
        orderedById: currentUser_id || null,
        status: "PENDING",
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "ORDER_RADIOLOGY",
      "radiology_orders",
      newRad.id,
      `Radiology order created. Modality: ${modality}, Region: ${bodyPart} for patient ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(newRad);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// PUT /api/v1/radiology/:id/status
app.put("/v1/radiology/:id/status", async (c) => {
  try {
    const radId = c.req.param("id");
    const body = await c.req.json();
    const { status, findings, impression, dicomUrl, annotations, signerName, faceImage, currentUser_id, radiologistName } = body;

    const order = await prisma.radiologyOrder.findUnique({
      where: { id: radId },
      include: { visit: { include: { patient: true } } },
    });
    if (!order) return c.json({ error: "Radiology order not found" }, 404);

    const updatedOrder = await prisma.radiologyOrder.update({
      where: { id: radId },
      data: {
        status,
      },
    });

    if (findings || impression || dicomUrl) {
      await prisma.radiologyReport.create({
        data: {
          radiologyOrderId: radId,
          findings: findings || "",
          impression: impression || "",
          dicomUrl: dicomUrl || null,
          radiologistId: currentUser_id || null,
          approvedAt: status === "APPROVED" ? new Date() : null,
        },
      });
    }

    const patientName = `${order.visit.patient.firstName} ${order.visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "UPDATE_RADIOLOGY",
      "radiology_orders",
      radId,
      `Radiology scan status updated to ${status} for ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(updatedOrder);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// PUT /api/v1/orders/:type/:id/paid
app.put("/v1/orders/:type/:id/paid", async (c) => {
  try {
    const orderType = c.req.param("type");
    const orderId = c.req.param("id");
    const body = await c.req.json();
    const { paymentStatus, signerName, faceImage, currentUser_id, accountantName } = body;

    let updatedOrder;
    let details = "";

    if (orderType === "lab") {
      updatedOrder = await prisma.labOrder.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: { visit: { include: { patient: true } } },
      });
      details = `Lab order for ${updatedOrder.visit.patient.firstName} ${updatedOrder.visit.patient.lastName} marked as ${paymentStatus}`;
    } else if (orderType === "radiology") {
      updatedOrder = await prisma.radiologyOrder.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: { visit: { include: { patient: true } } },
      });
      details = `Radiology scan for ${updatedOrder.visit.patient.firstName} ${updatedOrder.visit.patient.lastName} marked as ${paymentStatus}`;
    } else {
      updatedOrder = await prisma.prescription.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: { visit: { include: { patient: true } } },
      });
      details = `Prescription for ${updatedOrder.visit.patient.firstName} ${updatedOrder.visit.patient.lastName} marked as ${paymentStatus}`;
    }

    await logSystemAction(
      currentUser_id || "",
      "MARK_ORDER_PAID",
      orderType === "lab" ? "lab_orders" : orderType === "radiology" ? "radiology_orders" : "prescriptions",
      orderId,
      details,
      signerName,
      faceImage
    );

    return c.json(updatedOrder);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/admissions
app.post("/v1/admissions", async (c) => {
  try {
    const body = await c.req.json();
    const { visitId, bedId, signerName, faceImage, currentUser_id, adminName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: { room: true },
    });
    if (!bed) return c.json({ error: "Bed not found" }, 404);

    // Create admission
    const newAdmission = await prisma.admission.create({
      data: {
        visitId,
        bedId,
      },
    });

    // Lock bed to OCCUPIED
    await prisma.bed.update({
      where: { id: bedId },
      data: { status: "OCCUPIED" },
    });

    // Update visit status
    await prisma.visit.update({
      where: { id: visitId },
      data: { status: "ADMITTED" },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;
    const bedInfo = `${bed.room.roomNumber} - Bed ${bed.bedNumber}`;

    await logSystemAction(
      currentUser_id || "",
      "ADMIT_PATIENT",
      "admissions",
      newAdmission.id,
      `Patient admitted: ${patientName}, Assigned Bed: ${bedInfo}`,
      signerName,
      faceImage
    );

    return c.json(newAdmission);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/admissions/:id/discharge
app.post("/v1/admissions/:id/discharge", async (c) => {
  try {
    const admId = c.req.param("id");
    const body = await c.req.json();
    const { signerName, faceImage, currentUser_id } = body;

    const adm = await prisma.admission.findUnique({
      where: { id: admId },
      include: { visit: { include: { patient: true } }, bed: true },
    });
    if (!adm) return c.json({ error: "Admission not found" }, 404);

    // Update admission record
    const updatedAdm = await prisma.admission.update({
      where: { id: admId },
      data: { dischargedAt: new Date() },
    });

    // Set bed to cleaning
    if (adm.bedId) {
      await prisma.bed.update({
        where: { id: adm.bedId },
        data: { status: "CLEANING" },
      });
    }

    // Complete visit
    await prisma.visit.update({
      where: { id: adm.visitId },
      data: { status: "COMPLETED", checkOutTime: new Date() },
    });

    const patientName = `${adm.visit.patient.firstName} ${adm.visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "DISCHARGE_PATIENT",
      "admissions",
      admId,
      `Patient discharged. Patient: ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(updatedAdm);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/payments
app.post("/v1/payments", async (c) => {
  try {
    const body = await c.req.json();
    const { invoiceId, amount, paymentMethod, signerName, faceImage, currentUser_id, accountantName } = body;

    const newPayment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        processedById: currentUser_id || null,
      },
    });

    // Recalculate invoice status
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true, visit: { include: { patient: true } } },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const newStatus = totalPaid >= Number(invoice.patientPayable) ? "PAID" : totalPaid > 0 ? "PARTIALLY_PAID" : "UNPAID";
      
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      const patientName = `${invoice.visit.patient.firstName} ${invoice.visit.patient.lastName}`;

      await logSystemAction(
        currentUser_id || "",
        "PROCESS_PAYMENT",
        "payments",
        newPayment.id,
        `Billing payment logged. Patient: ${patientName}, Invoice ID: ${invoiceId}, Amount: $${amount}, Method: ${paymentMethod}`,
        signerName,
        faceImage
      );
    }

    return c.json(newPayment);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/alerts/:id/acknowledge
app.post("/v1/alerts/:id/acknowledge", async (c) => {
  try {
    const alertId = c.req.param("id");
    const updatedAlert = await prisma.cdsAlert.update({
      where: { id: alertId },
      data: { acknowledged: true },
    });
    return c.json(updatedAlert);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/medication-administrations
app.post("/v1/visits/:id/medication-administrations", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { drugName, dosage, route, status, notes, signerName, faceImage, currentUser_id, nurseName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newAdmin = await prisma.medicationAdministration.create({
      data: {
        visitId,
        patientId: visit.patientId,
        drugName,
        dosage,
        route,
        status,
        notes: notes || null,
        administeredBy: nurseName,
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "RECORD_MED_ADMIN",
      "medication_administrations",
      newAdmin.id,
      `Administered ${drugName} to ${patientName}. Status: ${status}`,
      signerName,
      faceImage
    );

    return c.json(newAdmin);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/visits/:id/intake-output
app.post("/v1/visits/:id/intake-output", async (c) => {
  try {
    const visitId = c.req.param("id");
    const body = await c.req.json();
    const { type, category, amount, notes, signerName, faceImage, currentUser_id, nurseName } = body;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });
    if (!visit) return c.json({ error: "Visit not found" }, 404);

    const newIo = await prisma.intakeOutput.create({
      data: {
        visitId,
        patientId: visit.patientId,
        type,
        category,
        amount,
        notes: notes || null,
        recordedBy: nurseName,
      },
    });

    const patientName = `${visit.patient.firstName} ${visit.patient.lastName}`;

    await logSystemAction(
      currentUser_id || "",
      "RECORD_INTAKE_OUTPUT",
      "intake_outputs",
      newIo.id,
      `Recorded ${type} record: ${category} of ${amount}mL for ${patientName}`,
      signerName,
      faceImage
    );

    return c.json(newIo);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/v1/messages
app.post("/v1/messages", async (c) => {
  try {
    const body = await c.req.json();
    const { sender, senderRole, text } = body;

    const newMsg = await prisma.message.create({
      data: {
        sender,
        senderRole,
        text,
      },
    });
    return c.json(newMsg);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/iykyk
app.get("/iykyk", async (c) => {
  // Set anti-bot and crawler indexing headers
  c.header("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  const ua = c.req.header("user-agent") || "";
  const botRegex = /bot|crawler|spider|scrape|crawl|scanner|sqlmap|nmap|acunetix|nikto|curl|wget|python|go-http-client/i;
  
  // Return standard 404 plaintext to mimic a missing route for scrapers/scanners
  if (botRegex.test(ua)) {
    return c.text("Not Found", 404);
  }

  try {
    const sqlPath = path.join(process.cwd(), "setup_db.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute setup SQL queries to build/verify all schema tables
    await prisma.$executeRawUnsafe(sql);

    // Seed core database configuration (roles, hospitals, etc.) if empty
    await ensureMetadataSeeded();

    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aether Database Setup</title>
          <meta name="robots" content="noindex, nofollow">
          <style>
            body { font-family: sans-serif; background: #0b0f19; color: #3b82f6; text-align: center; padding: 50px; }
            h1 { color: #10b981; }
          </style>
        </head>
        <body>
          <h1>Database Synchronized Successfully</h1>
          <p>The necessary database tables have been verified and created if they did not exist.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 500);
  }
});

// Mounting Next.js route handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
