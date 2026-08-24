import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import type { FamilyMember } from "../types/family";
import type {
  MedicineDetail,
  MedicineItem,
  MedicineUploadResponse,
} from "../types/medicine";

import { getFamilyMembers } from "../services/familyApi";
import {
  deleteMedicine,
  getMedicine,
  getMedicines,
} from "../services/medicineApi";

import MedicineCard from "../components/medicines/MedicineCard";
import AddMedicineModal from "../components/medicines/AddMedicineModal";
import EditMedicineModal from "../components/medicines/EditMedicineModal";

function Medicines() {
  const [medicines, setMedicines] = useState<MedicineItem[]>(
    []
  );
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedMedicine, setSelectedMedicine] =
    useState<MedicineItem | null>(null);
  const [selectedMedicineDetail, setSelectedMedicineDetail] =
    useState<MedicineDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [editingMedicine, setEditingMedicine] = useState<{
    id: number;
    medicine_name: string;
    dosage: string | null;
    frequency: string | null;
    expiry_date: string | null;
  } | null>(null);

  const [deletingMedicineId, setDeletingMedicineId] =
    useState<number | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const familyMembers = await getFamilyMembers();

      setMembers(familyMembers);

      if (familyMembers.length > 0) {
        const firstId = String(familyMembers[0].id);

        setSelectedMemberId(firstId);
        await loadMedicines(Number(firstId));
      } else {
        setMedicines([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load family members."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async (memberId: number) => {
    try {
      const data = await getMedicines(memberId);
      setMedicines(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load medicines."
      );
    }
  };

  const handleMemberChange = async (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const id = event.target.value;

    setSelectedMemberId(id);
    setError("");
    setSelectedMedicine(null);
    setSelectedMedicineDetail(null);

    if (!id) {
      setMedicines([]);
      return;
    }

    setLoading(true);
    await loadMedicines(Number(id));
    setLoading(false);
  };

  const openMedicineDetails = async (
    medicine: MedicineItem
  ) => {
    try {
      setError("");
      setSelectedMedicine(medicine);
      setSelectedMedicineDetail(null);
      setDetailLoading(true);

      const detail = await getMedicine(medicine.id);
      setSelectedMedicineDetail(detail);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load medicine details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUploaded = async (
    _: MedicineUploadResponse
  ) => {
    setActionMessage("Medicine uploaded successfully.");

    if (selectedMemberId) {
      await loadMedicines(Number(selectedMemberId));
    }

    setTimeout(() => {
      setActionMessage("");
    }, 2000);
  };

  const handleEditSuccess = async () => {
    setEditingMedicine(null);
    setActionMessage("Medicine updated successfully.");

    if (selectedMemberId) {
      await loadMedicines(Number(selectedMemberId));
    }

    if (selectedMedicine) {
      await openMedicineDetails(selectedMedicine);
    }

    setTimeout(() => {
      setActionMessage("");
    }, 2000);
  };

  const handleDelete = async () => {
    if (deletingMedicineId === null) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setActionMessage("");

      await deleteMedicine(deletingMedicineId);

      setSelectedMedicine(null);
      setSelectedMedicineDetail(null);
      setDeletingMedicineId(null);

      setActionMessage("Medicine deleted successfully.");

      if (selectedMemberId) {
        await loadMedicines(Number(selectedMemberId));
      }

      setTimeout(() => {
        setActionMessage("");
      }, 2000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleDateString("en-IN");
  };

  const getMemberName = (memberId: number) => {
    const member = members.find(
      (item) => item.id === memberId
    );

    return member?.name || `Member ${memberId}`;
  };

  const getStatusClass = (status: string) => {
    if (status === "EXPIRED") {
      return "border-red-200 bg-red-50 text-red-600";
    }

    if (status === "EXPIRING_SOON") {
      return "border-amber-200 bg-amber-50 text-amber-600";
    }

    return "border-green-200 bg-green-50 text-green-600";
  };

  if (loading && medicines.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9FA] p-10">
        <p className="text-sm font-semibold text-[#B86F83]">
          FAMILY HEALTH
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-800">
          Medicines
        </h1>

        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#FCECEF] border-t-[#D98FA3]" />

          <p className="mt-4 text-slate-500">
            Loading medicines...
          </p>
        </div>
      </div>
    );
  }

  const activeDetail = selectedMedicineDetail;
  const activeStatus = selectedMedicine?.status || "VALID";
  const extractedFields = activeDetail?.extracted_data
    ? Object.entries(activeDetail.extracted_data)
    : [];

  return (
    <div className="min-h-screen bg-[#FFF9FA] p-6 md:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#B86F83]">
            FAMILY HEALTH
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Medicines
          </h1>

          <p className="mt-2 text-slate-500">
            Keep track of medicines for your family members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowAddModal(true);
          }}
          className="rounded-2xl bg-[#D98FA3] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#C97F94]"
        >
          + Add Medicine
        </button>
      </div>

      {actionMessage && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-medium text-green-700">
          ✓ {actionMessage}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
          ⚠ {error}
        </div>
      )}

      {members.length > 0 && (
        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">
                Family Member
              </h2>

              <p className="text-sm text-slate-400">
                Select whose medicines you want to view.
              </p>
            </div>

            <select
              value={selectedMemberId}
              onChange={handleMemberChange}
              className="rounded-2xl border border-[#E9D5DA] bg-white px-5 py-3 text-slate-700 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
            >
              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name}
                  {member.relation
                    ? ` (${member.relation})`
                    : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!loading && medicines.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FCECEF] text-4xl">
            💊
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No medicines yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-slate-500">
            Upload a medicine image and it will appear here.
          </p>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-6 rounded-2xl bg-[#D98FA3] px-6 py-3 font-semibold text-white hover:bg-[#C97F94]"
          >
            Add your first medicine
          </button>
        </div>
      )}

      {medicines.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              memberName={getMemberName(
                medicine.member_id
              )}
              getStatusClass={getStatusClass}
              formatDate={formatDate}
              onClick={() => void openMedicineDetails(medicine)}
            />
          ))}
        </div>
      )}

      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">
              <div>
                <p className="text-sm font-semibold text-[#B86F83]">
                  MEDICINE DETAILS
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {activeDetail?.medicine_name ||
                    selectedMedicine.medicine_name ||
                    "Medicine"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMedicine(null);
                  setSelectedMedicineDetail(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F4] text-2xl text-[#B86F83] hover:bg-[#FCE3E9]"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-7">
              {detailLoading ? (
                <div className="rounded-2xl bg-[#FFF9FA] p-5 text-slate-500">
                  Loading medicine details...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-[#FFF9FA] p-5">
                    <div>
                      <p className="text-sm text-slate-400">
                        Current Status
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {activeStatus.replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
                        activeStatus
                      )}`}
                    >
                      {activeStatus.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoBox
                      label="Family Member"
                      value={getMemberName(
                        selectedMedicine.member_id
                      )}
                    />

                    <InfoBox
                      label="Added On"
                      value={formatDate(
                        selectedMedicine.created_at
                      )}
                    />

                    <InfoBox
                      label="Dosage"
                      value={
                        activeDetail?.dosage ||
                        selectedMedicine.dosage ||
                        "Not available"
                      }
                    />

                    <InfoBox
                      label="Frequency"
                      value={
                        activeDetail?.frequency ||
                        selectedMedicine.frequency ||
                        "Not available"
                      }
                    />

                    <InfoBox
                      label="Expiry Date"
                      value={formatDate(
                        activeDetail?.expiry_date ||
                          selectedMedicine.expiry_date
                      )}
                    />
                  </div>

                  <div className="rounded-2xl border border-[#F0E1E5] p-5">
                    <h3 className="text-sm font-semibold text-[#B86F83]">
                      Extracted Information
                    </h3>

                    {extractedFields.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No extracted data available.
                      </p>
                    ) : (
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {extractedFields.map(
                          ([key, value]) => (
                            <InfoBox
                              key={key}
                              label={toLabel(key)}
                              value={
                                value || "Not available"
                              }
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#F0E1E5] p-7 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const source =
                    selectedMedicineDetail ||
                    selectedMedicine;

                  setEditingMedicine({
                    id: source.id,
                    medicine_name:
                      source.medicine_name,
                    dosage: source.dosage,
                    frequency: source.frequency,
                    expiry_date: source.expiry_date,
                  });
                }}
                className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-700 hover:bg-[#FFF9FA]"
              >
                Edit Medicine
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeletingMedicineId(
                    selectedMedicine.id
                  )
                }
                className="flex-1 rounded-2xl border border-red-200 px-5 py-3.5 font-semibold text-red-600 hover:bg-red-50"
              >
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddMedicineModal
          members={members}
          defaultMemberId={selectedMemberId}
          onClose={() => setShowAddModal(false)}
          onUploaded={handleUploaded}
        />
      )}

      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingMedicineId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800">
              Delete medicine?
            </h3>

            <p className="mt-2 text-slate-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  setDeletingMedicineId(null)
                }
                className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-600 hover:bg-[#FFF9FA] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleDelete()}
                className="flex-1 rounded-2xl bg-red-500 px-5 py-3.5 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="rounded-2xl bg-[#FFF9FA] p-4">
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

export default Medicines;
