export interface DocumentItem {
  id: number;
  member_id: number;
  document_type: string;
  custom_document_name: string | null;
  file_path: string;
  issue_date: string | null;
  expiry_date: string | null;
  reminder_days_before: number;
  uploaded_at: string;
  extracted_data: Record<string, string> | null;
  status: string;
}