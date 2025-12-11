import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
**Role (Peran):** Anda adalah **Kelola Sistem Rumah Sakit**, Agen Pusat (Induk Agen) yang bertugas mengelola dan mengarahkan semua permintaan pengguna (pasien, staf, atau administrasi) mengenai fungsi rumah sakit.

**Instruksi Kritis:**
1.  **Delegasi:** Selalu pilih SATU fungsi (Sub-Agen) yang paling relevan.
2.  **Konteks:** Ekstrak semua parameter yang dibutuhkan dari permintaan pengguna untuk diisi dalam *Function Call*.
3.  **Klarifikasi:** Jika permintaan ambigu, jangan memanggil fungsi; minta klarifikasi dari pengguna.
4.  **Keamanan:** Sadari bahwa Anda menangani domain yang memerlukan akurasi tinggi (medis) dan kepatuhan (keuangan, RME).
`;

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'manajemen_pasien_data',
    description: 'Menangani manajemen data pasien, termasuk pendaftaran pasien baru, pembaruan data identitas/sosial, pencarian status rawat inap/rawat jalan, atau pencarian Rekam Medis. Harus menggunakan parameter unik seperti NIK atau Nomor Rekam Medis (No. RM).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        jenis_aksi: {
          type: Type.STRING,
          description: 'Jenis tindakan yang diminta: RegistrasiBaru, UpdateData, CekStatusRawat, AmbilCatatanMedis.',
        },
        nomor_identitas: {
          type: Type.STRING,
          description: 'Nomor identitas unik pasien: NIK atau NomorRM.',
        },
        detail_data_pasien: {
          type: Type.STRING,
          description: 'Detail data yang akan diinput atau diubah (misalnya: "Alamat baru: Jl. Mawar No. 5", "Tgl Lahir: 1990-01-01").',
        },
      },
      required: ['jenis_aksi', 'nomor_identitas'],
    },
  },
  {
    name: 'penjadwalan_medis',
    description: 'Mengelola semua aspek jadwal, termasuk membuat/mengubah/membatalkan janji temu, memeriksa ketersediaan dokter, atau mengecek informasi tempat tidur/fasilitas (Info Kamar Kosong).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        jenis_layanan: {
          type: Type.STRING,
          description: 'Fokus layanan: BuatJanjiTemu, CekJadwalDokter, CekKetersediaanFasilitas.',
        },
        subjek_layanan: {
          type: Type.STRING,
          description: 'Nama dokter, spesialisasi, atau fasilitas medis (misal: "Dr. Agung Sp.A", "Poli Jantung", "Kamar VIP").',
        },
        tanggal_waktu: {
          type: Type.STRING,
          description: 'Tanggal dan waktu spesifik (misal: "besok pukul 10 pagi", "2024-11-20").',
        },
        nomor_identitas_pasien: {
          type: Type.STRING,
          description: 'Nomor RM pasien jika tindakan terkait janji temu spesifik.',
        },
      },
      required: ['jenis_layanan', 'subjek_layanan', 'tanggal_waktu'],
    },
  },
  {
    name: 'informasi_medis_umum',
    description: 'Menyediakan informasi medis umum, panduan kesehatan, atau SOP/Protokol klinis yang tidak terkait data pasien spesifik. Agen ini disimulasikan menggunakan RAG/pencarian pengetahuan eksternal.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topik_pertanyaan: {
          type: Type.STRING,
          description: 'Topik atau istilah medis yang dicari (misal: "Gejala TBC", "SOP Penanganan Syok Anafilaksis").',
        },
        sumber_prioritas: {
          type: Type.STRING,
          description: 'Prioritas sumber (misal: "Guideline Klinis", "Edukasi Pasien", "Umum").',
        },
      },
      required: ['topik_pertanyaan'],
    },
  },
  {
    name: 'administrasi_rs_operasional',
    description: 'Menangani fungsi back-office dan administratif yang kompleks seperti Penagihan (Billing), Klaim Asuransi, Pelaporan Keuangan (Neraca, Laba Rugi), dan Manajemen Aset/Inventaris.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        jenis_administrasi: {
          type: Type.STRING,
          description: 'Kategori tugas: CekBilling, KlaimAsuransi, LapKeuangan, ManajemenAset, CekInventaris.',
        },
        detail_referensi: {
          type: Type.STRING,
          description: 'Nomor tagihan (invoice), nama asuransi, nama aset/obat, atau jenis laporan yang diminta (misal: "Invoice No. 123", "BPJS Kesehatan", "Aset MRI", "Laporan Arus Kas").',
        },
        periode_laporan: {
          type: Type.STRING,
          description: 'Periode waktu terkait (misal: "Q3 2024", "bulan lalu").',
        },
      },
      required: ['jenis_administrasi'],
    },
  },
];