import { useState, useEffect } from 'react';

export interface Patient {
  id: string;
  name: string;
  nik: string;
  status: 'Rawat Jalan' | 'Rawat Inap' | 'IGD' | 'Terdaftar';
  rm: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctor: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface FinancialRecord {
  id: string;
  type: 'Invoice' | 'Claim' | 'Asset';
  description: string;
  amount: string;
  status: string;
}

class MockDatabase {
  private patients: Patient[] = [
    { id: 'p1', name: 'Budi Santoso', nik: '3301123456780001', status: 'Rawat Inap', rm: 'RM-1024' },
    { id: 'p2', name: 'Siti Aminah', nik: '3301123456780002', status: 'Rawat Jalan', rm: 'RM-1025' },
    { id: 'p3', name: 'Ahmad Dahlan', nik: '3301123456780003', status: 'Terdaftar', rm: 'RM-1026' }
  ];

  private appointments: Appointment[] = [
     { id: 'a1', patientName: 'Siti Aminah', doctor: 'Dr. Hartono Sp.OG', time: '2024-11-20', status: 'Scheduled' }
  ];

  private financials: FinancialRecord[] = [
    { id: 'f1', type: 'Invoice', description: 'Tagihan Rawat Inap - Budi S', amount: 'Rp 4.500.000', status: 'Belum Lunas' },
    { id: 'f2', type: 'Asset', description: 'MRI Scanner GE', amount: 'Rp 12.000.000.000', status: 'Active' },
    { id: 'f3', type: 'Claim', description: 'Klaim BPJS - Sep 2024', amount: 'Rp 150.000.000', status: 'Pending' }
  ];

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getSnapshot() {
    return {
      patients: [...this.patients],
      appointments: [...this.appointments],
      financials: [...this.financials]
    };
  }

  // --- Actions ---

  addPatient(patient: Omit<Patient, 'id'>) {
    const newPatient: Patient = { ...patient, id: Math.random().toString(36).substr(2, 9) };
    this.patients = [newPatient, ...this.patients];
    this.notify();
    return newPatient;
  }

  updatePatient(identifier: string, updates: Partial<Patient>) {
    // Find by ID, NIK or RM
    this.patients = this.patients.map(p => 
      (p.id === identifier || p.nik === identifier || p.rm === identifier) ? { ...p, ...updates } : p
    );
    this.notify();
  }

  addAppointment(appt: Omit<Appointment, 'id' | 'status'>) {
    const newAppt: Appointment = { 
        ...appt, 
        id: Math.random().toString(36).substr(2, 9),
        status: 'Scheduled'
    };
    this.appointments = [newAppt, ...this.appointments];
    this.notify();
    return newAppt;
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    this.appointments = this.appointments.map(a => 
      a.id === id ? { ...a, status } : a
    );
    this.notify();
  }

  addFinancialRecord(record: Omit<FinancialRecord, 'id' | 'status'>) {
     const newRecord: FinancialRecord = {
         ...record,
         id: Math.random().toString(36).substr(2, 9),
         status: record.type === 'Invoice' ? 'Belum Lunas' : 'Pending'
     };
     this.financials = [newRecord, ...this.financials];
     this.notify();
     return newRecord;
  }

  updateFinancialStatus(id: string, status: string) {
    this.financials = this.financials.map(f =>
      f.id === id ? { ...f, status } : f
    );
    this.notify();
  }
}

export const db = new MockDatabase();

export function useHospitalData() {
  const [data, setData] = useState(db.getSnapshot());

  useEffect(() => {
    return db.subscribe(() => {
      setData(db.getSnapshot());
    });
  }, []);

  return data;
}