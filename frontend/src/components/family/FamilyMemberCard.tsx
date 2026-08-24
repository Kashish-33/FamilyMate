import { useState } from "react";
import type { FamilyMember } from "../../types/family";
import {
  deleteFamilyMember,
} from "../../services/familyApi";
import EditFamilyMemberModal from "./EditFamilyMemberModal";

type FamilyMemberCardProps = {
  member: FamilyMember;
  onSuccess?: () => void;
};

function FamilyMemberCard({
  member,
  onSuccess,
}: FamilyMemberCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteFamilyMember(member.id);

      if (onSuccess) {
        onSuccess?.();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete family member"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl border border-[#F0E1E5] bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCECEF] text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {member.name}
              </h2>

              <p className="mt-1 text-sm text-[#B86F83]">
                {member.relation}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {member.age} years old
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-[#B86F83] hover:bg-[#FCECEF]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditFamilyMemberModal
          member={member}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);

            if (onSuccess) {
              onSuccess?.();
            }
          }}
        />
      )}
    </>
  );
}

export default FamilyMemberCard;