import React, { useState } from 'react';
import { useHospitalData, db, Patient, Appointment, FinancialRecord } from '../services/database';

const LiveDashboard: React.FC = () => {
  const { patients, appointments, financials } = useHospitalData();
  
  // Local state for UI toggles
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [showAddFin, setShowAddFin] = useState(false);

  // Form states
  const [newPatient, setNewPatient] = useState({ name: '', nik: '' });
  const [newAppt, setNewAppt] = useState({ patientName: '', doctor: '', time: '' });
  const [newFin, setNewFin] = useState({ type: 'Invoice', description: '', amount: '' });

  // --- Handlers ---

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.nik) return;
    db.addPatient({
        name: newPatient.name,
        nik: newPatient.nik,
        status: 'Terdaftar',
        rm: `RM-${Math.floor(Math.random() * 9000) + 1000}`
    });
    setNewPatient({ name: '', nik: '' });
    setShowAddPatient(false);
  };

  const handleCyclePatientStatus = (p: Patient) => {
    const statuses: Patient['status'][] = ['Terdaftar', 'Rawat Jalan', 'Rawat Inap', 'IGD'];
    const currentIndex = statuses.indexOf(p.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    db.updatePatient(p.id, { status: nextStatus });
  };

  const handleAddAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientName || !newAppt.doctor) return;
    db.addAppointment({
        patientName: newAppt.patientName,
        doctor: newAppt.doctor,
        time: newAppt.time || 'Today'
    });
    setNewAppt({ patientName: '', doctor: '', time: '' });
    setShowAddAppt(false);
  };

  const handleToggleApptStatus = (a: Appointment) => {
      const newStatus = a.status === 'Scheduled' ? 'Completed' : 'Scheduled';
      db.updateAppointmentStatus(a.id, newStatus);
  };

  const handleAddFin = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFin.description || !newFin.amount) return;
      db.addFinancialRecord({
          type: newFin.type as any,
          description: newFin.description,
          amount: newFin.amount
      });
      setNewFin({ type: 'Invoice', description: '', amount: '' });
      setShowAddFin(false);
  };

  const handleVerifyFin = (f: FinancialRecord) => {
      if (f.type === 'Invoice') {
          db.updateFinancialStatus(f.id, f.status === 'Lunas' ? 'Belum Lunas' : 'Lunas');
      } else {
          db.updateFinancialStatus(f.id, f.status === 'Verified' ? 'Pending' : 'Verified');
      }
  };

  return (
    <div className="h-full bg-slate-900 text-slate-200 overflow-y-auto p-4 border-l border-slate-700 font-mono text-sm flex flex-col gap-6">
      
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Admin Dashboard
         </h2>
         <span className="text-[10px] text-emerald-500 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-800">INTERACTIVE</span>
      </div>

      {/* --- Patients Section --- */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Patients</h3>
            <button onClick={() => setShowAddPatient(!showAddPatient)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-2 hover:bg-slate-700 rounded transition-colors">[+] Add</button>
        </div>

        {/* Add Patient Form */}
        {showAddPatient && (
            <form onSubmit={handleAddPatient} className="bg-slate-800 p-2 rounded mb-2 border border-slate-600 animate-in fade-in slide-in-from-top-2">
                <input 
                    className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 outline-none" 
                    placeholder="Patient Name" 
                    value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                />
                <input 
                    className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 outline-none" 
                    placeholder="NIK" 
                    value={newPatient.nik} onChange={e => setNewPatient({...newPatient, nik: e.target.value})}
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddPatient(false)} className="text-[10px] text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded">Save</button>
                </div>
            </form>
        )}

        <div className="flex flex-col gap-2">
          {patients.map((p) => (
            <div key={p.id} className="group relative flex justify-between items-center bg-slate-800 p-2 rounded hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600">
              <div>
                <div className="font-bold text-slate-200">{p.name}</div>
                <div className="text-[10px] text-slate-500">RM: {p.rm}</div>
              </div>
              <button 
                onClick={() => handleCyclePatientStatus(p)}
                title="Click to cycle status"
                className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer select-none hover:opacity-80 transition-opacity
                 ${p.status === 'Rawat Inap' ? 'bg-red-900/50 text-red-200 border border-red-800' : 
                   p.status === 'Rawat Jalan' ? 'bg-blue-900/50 text-blue-200 border border-blue-800' :
                   p.status === 'IGD' ? 'bg-orange-900/50 text-orange-200 border border-orange-800' :
                   'bg-emerald-900/50 text-emerald-200 border border-emerald-800'}`}>
                {p.status}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- Schedule Section --- */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Schedule</h3>
            <button onClick={() => setShowAddAppt(!showAddAppt)} className="text-purple-400 hover:text-purple-300 text-xs font-bold px-2 hover:bg-slate-700 rounded transition-colors">[+] Add</button>
        </div>

        {/* Add Appointment Form */}
         {showAddAppt && (
            <form onSubmit={handleAddAppt} className="bg-slate-800 p-2 rounded mb-2 border border-slate-600 animate-in fade-in slide-in-from-top-2">
                <input className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-purple-500 outline-none" 
                    placeholder="Patient Name" value={newAppt.patientName} onChange={e => setNewAppt({...newAppt, patientName: e.target.value})} />
                <input className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-purple-500 outline-none" 
                    placeholder="Doctor / Facility" value={newAppt.doctor} onChange={e => setNewAppt({...newAppt, doctor: e.target.value})} />
                <input className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-purple-500 outline-none" 
                    placeholder="Time (e.g. 10:00 AM)" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddAppt(false)} className="text-[10px] text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded">Book</button>
                </div>
            </form>
        )}

        <div className="flex flex-col gap-2">
           {appointments.map((appt) => (
             <div key={appt.id} className={`bg-slate-800 p-2 rounded border-l-2 ${appt.status === 'Completed' ? 'border-emerald-500 opacity-70' : 'border-indigo-500'} flex justify-between items-start group hover:bg-slate-700 transition-colors`}>
                <div>
                    <div className={`font-bold ${appt.status === 'Completed' ? 'text-emerald-400 line-through' : 'text-indigo-300'}`}>{appt.time}</div>
                    <div className="text-slate-300 mt-1">{appt.patientName}</div>
                    <div className="text-[10px] text-slate-500">{appt.doctor}</div>
                </div>
                <button 
                    onClick={() => handleToggleApptStatus(appt)}
                    className={`mt-1 p-1 rounded-full border ${appt.status === 'Completed' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 'bg-slate-700 border-slate-500 text-slate-400 hover:bg-slate-600 hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
             </div>
           ))}
        </div>
      </div>

      {/* --- Finance Section --- */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Admin / Finance</h3>
            <button onClick={() => setShowAddFin(!showAddFin)} className="text-orange-400 hover:text-orange-300 text-xs font-bold px-2 hover:bg-slate-700 rounded transition-colors">[+] Add</button>
        </div>

         {/* Add Finance Form */}
         {showAddFin && (
            <form onSubmit={handleAddFin} className="bg-slate-800 p-2 rounded mb-2 border border-slate-600 animate-in fade-in slide-in-from-top-2">
                <select className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white outline-none focus:ring-1 focus:ring-orange-500"
                    value={newFin.type} onChange={e => setNewFin({...newFin, type: e.target.value})}>
                    <option value="Invoice">Invoice</option>
                    <option value="Claim">Claim</option>
                    <option value="Asset">Asset</option>
                </select>
                <input className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-orange-500 outline-none" 
                    placeholder="Description" value={newFin.description} onChange={e => setNewFin({...newFin, description: e.target.value})} />
                <input className="w-full bg-slate-700 border-none rounded px-2 py-1 text-xs mb-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-orange-500 outline-none" 
                    placeholder="Amount (Rp)" value={newFin.amount} onChange={e => setNewFin({...newFin, amount: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddFin(false)} className="text-[10px] text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="text-[10px] bg-orange-600 hover:bg-orange-500 text-white px-2 py-1 rounded">Save</button>
                </div>
            </form>
        )}

        <div className="space-y-1">
            {financials.slice(0, 5).map(f => (
                <div key={f.id} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0 hover:bg-slate-800/50 px-1 rounded transition-colors group">
                    <div className="flex flex-col w-2/3">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-1 rounded font-bold uppercase ${f.type === 'Asset' ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>{f.type}</span>
                            <span className="text-slate-400 text-[10px] truncate">{f.description}</span>
                        </div>
                        <span className="text-slate-200 font-bold text-xs mt-0.5">{f.amount}</span>
                    </div>
                    
                    <button 
                        onClick={() => handleVerifyFin(f)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors
                        ${(f.status === 'Lunas' || f.status === 'Verified') 
                            ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 hover:content-["Undo"]' 
                            : 'bg-slate-800 text-orange-300 border-orange-900 hover:bg-emerald-900/50 hover:text-emerald-300 hover:border-emerald-700'}`}>
                        {f.status}
                    </button>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default LiveDashboard;