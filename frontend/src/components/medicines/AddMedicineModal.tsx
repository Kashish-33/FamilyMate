import { useState } from "react";
import type { FamilyMember } from "../../types/family";
import type {
  ExtractedMedicineData,
  MedicineUploadResponse,
} from "../../types/medicine";
import { uploadMedicine } from "../../services/medicineApi";

type AddMedicineModalProps = {
  members: FamilyMember[];
  defaultMemberId: string;
  onClose: () => void;
  onUploaded?: (
    response: MedicineUploadResponse
  ) => Promise<void> | void;
};

function AddMedicineModal({
  members,
  defaultMemberId,
  onClose,
  onUploaded,
}: AddMedicineModalProps) {
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extractedData, setExtractedData] =
    useState<ExtractedMedicineData | null>(null);

  const handleUpload = async () => {
    setError("");
    setSuccess("");
    setExtractedData(null);

    if (!memberId) {
      setError("Please select a family member.");
      return;
    }

    if (!file) {
      setError("Please select a medicine image.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("member_id", memberId);
      formData.append("file", file);

      const data = await uploadMedicine(formData);

      setExtractedData(data.extracted_data);
      setSuccess("Medicine uploaded successfully!");

      if (onUploaded) {
        await onUploaded(data);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload medicine."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">
          <div>
            <p className="text-sm font-semibold text-[#B86F83]">
              FAMILY HEALTH
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Add Medicine
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F4] text-2xl text-[#B86F83] hover:bg-[#FCE3E9]"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-7">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
              ⚠ {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
              ✓ {success}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Family Member
            </label>

            <select
              value={memberId}
              onChange={(event) =>
                setMemberId(event.target.value)
              }
              disabled={uploading}
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3]"
            >
              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Medicine Image
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] || null
                )
              }
              disabled={uploading}
              className="w-full rounded-2xl border border-dashed border-[#D9A8B5] bg-[#FFF9FA] p-4"
            />
          </div>

          {extractedData && (
            <div className="rounded-2xl border border-[#F0E1E5] bg-[#FFF9FA] p-5">
              <p className="text-sm font-semibold text-[#B86F83]">
                Extracted Information
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoBox
                  label="Medicine Name"
                  value={
                    extractedData.medicine_name ||
                    "Not available"
                  }
                />

                {Object.entries(
                  extractedData.extracted_fields || {}
                ).map(([key, value]) => (
                  <InfoBox
                    key={key}
                    label={toLabel(key)}
                    value={value || "Not available"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#F0E1E5] p-7">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-600 hover:bg-[#FFF9FA]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={uploading || !memberId || !file}
            onClick={handleUpload}
            className="flex-1 rounded-2xl bg-[#D98FA3] px-5 py-3.5 font-semibold text-white hover:bg-[#C97F94] disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Upload Medicine"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

const toLabel = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default AddMedicineModal;
