import { useState } from "react";
import type { DocumentItem } from "../../types/document";
import { updateDocument } from "../../services/documentApi";

type EditDocumentModalProps = {
  document: DocumentItem;
  onClose: () => void;
  onSuccess: () => void;
};

function EditDocumentModal({
  document,
  onClose,
  onSuccess,
}: EditDocumentModalProps) {
  const [documentName, setDocumentName] = useState(
    document.custom_document_name || ""
  );

  const [documentType, setDocumentType] = useState(
    document.document_type || ""
  );

  const [issueDate, setIssueDate] = useState(
    document.issue_date
      ? document.issue_date.slice(0, 10)
      : ""
  );

  const [expiryDate, setExpiryDate] = useState(
    document.expiry_date
      ? document.expiry_date.slice(0, 10)
      : ""
  );

  const [reminderDays, setReminderDays] = useState(
    String(document.reminder_days_before)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!documentType.trim()) {
      setError("Please enter the document type.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "document_type",
        documentType
      );

      formData.append(
        "custom_document_name",
        documentName
      );

      formData.append(
        "issue_date",
        issueDate
      );

      formData.append(
        "expiry_date",
        expiryDate
      );

      formData.append(
        "reminder_days_before",
        reminderDays
      );

      await updateDocument(
        document.id,
        formData
      );

      onSuccess();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not update document."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">

          <div>
            <p className="text-sm font-semibold text-[#B86F83]">
              EDIT DOCUMENT
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Update Details
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F4] text-2xl text-[#B86F83]"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="space-y-5 p-7">

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              ⚠ {error}
            </div>
          )}

          {/* DOCUMENT NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Name
            </label>

            <input
              value={documentName}
              onChange={(event) =>
                setDocumentName(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
            />
          </div>

          {/* DOCUMENT TYPE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Type
            </label>

            <input
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
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
                onChange={(event) =>
                  setIssueDate(event.target.value)
                }
                disabled={saving}
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
                onChange={(event) =>
                  setExpiryDate(event.target.value)
                }
                disabled={saving}
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
              onChange={(event) =>
                setReminderDays(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-2xl border border-[#E9D5DA] bg-white px-5 py-3.5 outline-none focus:border-[#D98FA3]"
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

        </div>

        {/* FOOTER */}

        <div className="flex gap-3 border-t border-[#F0E1E5] p-7">

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-600 hover:bg-[#FFF9FA] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="flex-1 rounded-2xl bg-[#D98FA3] px-5 py-3.5 font-semibold text-white hover:bg-[#C97F94] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default EditDocumentModal;