import { ToolCallData } from "../types";
import { db } from "./database";

// This simulates the backend logic of the hospital system
export const executeMockTool = async (toolCall: ToolCallData): Promise<Record<string, any>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`Executing Mock Tool: ${toolCall.name}`, toolCall.args);

  switch (toolCall.name) {
    case 'manajemen_pasien_data': {
      const { jenis_aksi, nomor_identitas, detail_data_pasien } = toolCall.args;
      
      if (jenis_aksi === 'RegistrasiBaru') {
        // Simple heuristic to extract name for the demo if provided in the string
        let extractedName = "Pasien Baru";
        if (detail_data_pasien) {
            const nameMatch = detail_data_pasien.match(/nama\s*[:is]*\s*([a-zA-Z\s]+)(?:,|$|\.)/i);
            if (nameMatch) extractedName = nameMatch[1].trim();
            else if (!detail_data_pasien.includes(':')) extractedName = detail_data_pasien.split(',')[0];
        }

        const newP = db.addPatient({
            name: extractedName,
            nik: nomor_identitas,
            status: 'Terdaftar',
            rm: `RM-${Math.floor(Math.random() * 10000) + 1000}`
        });
        return { 
            status: 'success', 
            message: `Registrasi berhasil. Pasien: ${newP.name}, No. RM: ${newP.rm}. Data telah tersimpan di database.` 
        };
      }
      
      if (jenis_aksi === 'CekStatusRawat') {
        const patients = db.getSnapshot().patients;
        const p = patients.find(pat => pat.nik === nomor_identitas || pat.rm === nomor_identitas);
        if (p) return { status: 'success', data: p };
        return { status: 'not_found', message: 'Pasien tidak ditemukan dalam database.' };
      }

      if (jenis_aksi === 'UpdateData') {
          db.updatePatient(nomor_identitas, {}); // Just triggering update for demo visual
          return { status: 'success', message: `Data pasien ${nomor_identitas} berhasil diperbarui sesuai permintaan: ${detail_data_pasien}` };
      }
      
      return { status: 'success', message: `Aksi ${jenis_aksi} selesai.` };
    }

    case 'penjadwalan_medis': {
      const { subjek_layanan, tanggal_waktu, nomor_identitas_pasien } = toolCall.args;
      
      // Try to find patient name if ID provided
      let patientName = "Umum/TBD";
      if (nomor_identitas_pasien) {
          const p = db.getSnapshot().patients.find(pat => pat.nik === nomor_identitas_pasien || pat.rm === nomor_identitas_pasien);
          if (p) patientName = p.name;
          else patientName = `Pasien (${nomor_identitas_pasien})`;
      }

      const newAppt = db.addAppointment({
          patientName: patientName,
          doctor: subjek_layanan,
          time: tanggal_waktu
      });

      return { 
        status: 'success', 
        message: `Booking terkonfirmasi: ${subjek_layanan} pada ${tanggal_waktu}. Kode: BK-${newAppt.id.toUpperCase()}`,
        data: newAppt
      };
    }

    case 'informasi_medis_umum': {
      const { topik_pertanyaan } = toolCall.args;
      return { 
        status: 'success', 
        content: `[RAG Retrieval] SOP Rumah Sakit mengenai "${topik_pertanyaan}": Penanganan meliputi triase prioritas 1, stabilisasi ABC (Airway, Breathing, Circulation), dan rujukan spesialis jika diperlukan.` 
      };
    }

    case 'administrasi_rs_operasional': {
      const { jenis_administrasi, detail_referensi } = toolCall.args;
      const snapshot = db.getSnapshot();

      if (jenis_administrasi === 'CekBilling') {
        return { status: 'success', data: { overview: snapshot.financials.filter(f => f.type === 'Invoice') } };
      }
      if (jenis_administrasi === 'ManajemenAset') {
         return { status: 'success', data: { overview: snapshot.financials.filter(f => f.type === 'Asset') } };
      }
      return { status: 'success', message: `Permintaan administrasi ${jenis_administrasi} (${detail_referensi}) sedang diproses.` };
    }

    default:
      return { status: 'error', message: 'Fungsi tidak dikenali.' };
  }
};