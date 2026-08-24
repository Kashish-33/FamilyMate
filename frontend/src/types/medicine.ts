export interface MedicineItem {
  id: number;
  member_id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  expiry_date: string | null;
  created_at: string;
  status: string;
}

export interface MedicineDetail {
  id: number;
  member_id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  expiry_date: string | null;
  created_at: string;
  extracted_data: Record<string, string> | null;
}

export interface ExtractedMedicineData {
  medicine_name: string;
  extracted_fields: Record<string, string>;
}

export interface MedicineUploadResponse {
  message: string;
  medicine_id: number;
  extracted_data: ExtractedMedicineData;
}

export interface MedicineReminderItem {
  medicine_id: number;
  member_id: number;
  medicine_name: string;
  expiry_date: string | null;
  days_remaining: number;
}
