import { useState } from "react";
import type { FamilyMember } from "../../types/family";
import { uploadDocument } from "../../services/documentApi";

type UploadDocumentModalProps = {
  members: FamilyMember[];
  defaultMemberId: string;
  onClose: () => void;
  onUploaded?: () => Promise<void> | void;
};

function UploadDocumentModal({
  members,
  defaultMemberId,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [documentType, setDocumentType] = useState("");
  const [customDocumentName, setCustomDocumentName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [reminderDays, setReminderDays] = useState("7");
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getUploadError = (
    data: any,
    fallback: string
  ) => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map(
          (item: any) =>
            item?.msg || String(item)
        )
        .join(", ");
    }

    return fallback;
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!memberId) {
      setError("Please select a family member.");
      return;
    }

    if (!documentType.trim()) {
      setError("Please enter the document type.");
      return;
    }

    if (!file) {
      setError("Please select a document image.");
      return;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("member_id", memberId);
      formData.append("document_type", documentType);
      formData.append(
        "custom_document_name",
        customDocumentName
      );

      if (issueDate) {
        formData.append("issue_date", issueDate);
      }

      if (expiryDate) {
        formData.append("expiry_date", expiryDate);
      }

      formData.append(
        "reminder_days_before",
        reminderDays
      );

      formData.append("file", file);

      await uploadDocument(formData);

      setSuccess(
        "Document uploaded successfully!"
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      if (onUploaded) {
        await onUploaded();
      }

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload document."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">
          <div>
            <p className="text-sm font-semibold text-[#B86F83]">
              FAMILY RECORDS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Upload Document
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

        {/* BODY */}
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

          {/* FAMILY MEMBER */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Family Member
            </label>

            <select
              value={memberId}
              onChange={(e) =>
                setMemberId(e.target.value)
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

          {/* DOCUMENT TYPE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Type
            </label>

            <input
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value)
              }
              disabled={uploading}
              placeholder="e.g. Aadhaar, Passport, Marksheet"
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3]"
            />
          </div>

          {/* DOCUMENT NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Name
            </label>

            <input
              value={customDocumentName}
              onChange={(e) =>
                setCustomDocumentName(
                  e.target.value
                )
              }
              disabled={uploading}
              placeholder="Optional custom name"
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3]"
            />
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Issue Date
              </label>

              <input
                type="date"
                value={issueDate}
                onChange={(e) =>
                  setIssueDate(e.target.value)
                }
                disabled={uploading}
                className="w-full rounded-2xl border border-[#E9D5DA] px-4 py-3.5 outline-none focus:border-[#D98FA3]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Expiry Date
              </label>

              <input
                type="date"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(e.target.value)
                }
                disabled={uploading}
                className="w-full rounded-2xl border border-[#E9D5DA] px-4 py-3.5 outline-none focus:border-[#D98FA3]"
              />
            </div>

          </div>

          {/* REMINDER */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reminder
            </label>

            <select
              value={reminderDays}
              onChange={(e) =>
                setReminderDays(e.target.value)
              }
              disabled={uploading}
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3]"
            >
              <option value="0">
                No reminder
              </option>

              <option value="3">
                3 days before
              </option>

              <option value="7">
                7 days before
              </option>

              <option value="15">
                15 days before
              </option>

              <option value="30">
                30 days before
              </option>
            </select>
          </div>

          {/* FILE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Image
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] || null
                )
              }
              disabled={uploading}
              className="w-full rounded-2xl border border-dashed border-[#D9A8B5] bg-[#FFF9FA] p-4"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 border-t border-[#F0E1E5] p-7">

          {/* CANCEL MUST REMAIN AVAILABLE DURING UPLOAD */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-600 hover:bg-[#FFF9FA]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              uploading ||
              !memberId ||
              !documentType ||
              !file
            }
            onClick={handleUpload}
            className="flex-1 rounded-2xl bg-[#D98FA3] px-5 py-3.5 font-semibold text-white hover:bg-[#C97F94] disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default UploadDocumentModal;