import { useState } from "react";
import { updateMedicine } from "../../services/medicineApi";

type EditableMedicine = {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  expiry_date: string | null;
};

type EditMedicineModalProps = {
  medicine: EditableMedicine;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function EditMedicineModal({
  medicine,
  onClose,
  onSuccess,
}: EditMedicineModalProps) {
  const [medicineName, setMedicineName] = useState(
    medicine.medicine_name || ""
  );
  const [dosage, setDosage] = useState(
    medicine.dosage || ""
  );
  const [frequency, setFrequency] = useState(
    medicine.frequency || ""
  );
  const [expiryDate, setExpiryDate] = useState(
    medicine.expiry_date
      ? medicine.expiry_date.slice(0, 10)
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!medicineName.trim()) {
      setError("Please enter medicine name.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append(
        "medicine_name",
        medicineName.trim()
      );

      if (dosage.trim()) {
        formData.append("dosage", dosage.trim());
      }

      if (frequency.trim()) {
        formData.append(
          "frequency",
          frequency.trim()
        );
      }

      if (expiryDate) {
        formData.append("expiry_date", expiryDate);
      }

      await updateMedicine(medicine.id, formData);
      await onSuccess();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not update medicine."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">
          <div>
            <p className="text-sm font-semibold text-[#B86F83]">
              EDIT MEDICINE
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

        <div className="space-y-5 p-7">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Medicine Name
            </label>

            <input
              value={medicineName}
              onChange={(event) =>
                setMedicineName(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Dosage
              </label>

              <input
                value={dosage}
                onChange={(event) =>
                  setDosage(event.target.value)
                }
                disabled={saving}
                placeholder="e.g. 650 mg"
                className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Frequency
              </label>

              <input
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value)
                }
                disabled={saving}
                placeholder="e.g. Twice daily"
                className="w-full rounded-2xl border border-[#E9D5DA] px-5 py-3.5 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
              />
            </div>
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

export default EditMedicineModal;
