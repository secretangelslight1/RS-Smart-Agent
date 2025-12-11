export enum Sender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ToolCallData {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResponseData {
  name: string;
  result: Record<string, any>;
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  toolCalls?: ToolCallData[];
  toolResponses?: ToolResponseData[];
  timestamp: number;
}

// Tool Parameter Interfaces based on the prompt
export interface ManajemenPasienArgs {
  jenis_aksi: string;
  nomor_identitas: string;
  detail_data_pasien?: string;
}

export interface PenjadwalanMedisArgs {
  jenis_layanan: string;
  subjek_layanan: string;
  tanggal_waktu: string;
  nomor_identitas_pasien?: string;
}

export interface InformasiMedisArgs {
  topik_pertanyaan: string;
  sumber_prioritas?: string;
}

export interface AdministrasiRSArgs {
  jenis_administrasi: string;
  detail_referensi?: string;
  periode_laporan?: string;
}