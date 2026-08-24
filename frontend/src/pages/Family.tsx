import { useEffect, useState } from "react";
import {
  createFamily,
  getFamilyMembers,
} from "../services/familyApi";
import type { FamilyMember } from "../types/family";

import FamilyMemberCard from "../components/family/FamilyMemberCard";
import AddFamilyMemberModal from "../components/family/AddFamilyMemberModal";

function Family() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasFamily, setHasFamily] = useState(true);
  const [familyName, setFamilyName] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      setError("");
      setSetupError("");

      const data = await getFamilyMembers();

      setHasFamily(true);
      setMembers(data);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message === "Family not found"
      ) {
        setHasFamily(false);
        setMembers([]);
        setError("");
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!familyName.trim()) {
      setSetupError("Please enter a family name.");
      return;
    }

    try {
      setSetupLoading(true);
      setSetupError("");

      await createFamily(familyName.trim());
      setHasFamily(true);
      setFamilyName("");

      await loadFamilyMembers();
    } catch (error) {
      console.error(error);

      setSetupError(
        error instanceof Error
          ? error.message
          : "Could not create family."
      );
    } finally {
      setSetupLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading family members...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!hasFamily) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border border-[#F0E1E5] bg-white p-8">
          <p className="text-sm font-medium text-[#B86F83]">
            FAMILY SETUP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Create Your Family
          </h1>

          <p className="mt-2 text-slate-500">
            Before adding family members, create your family profile.
          </p>

          {setupError && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
              {setupError}
            </div>
          )}

          <form
            onSubmit={handleCreateFamily}
            className="mt-6 max-w-md"
          >
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Family Name
            </label>

            <input
              type="text"
              value={familyName}
              onChange={(event) =>
                setFamilyName(event.target.value)
              }
              placeholder="e.g. Sharma Family"
              disabled={setupLoading}
              required
              className="w-full rounded-xl border border-[#E8DDE1] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={setupLoading}
              className="mt-4 rounded-xl bg-[#D98FA3] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#C97F94] disabled:opacity-60"
            >
              {setupLoading
                ? "Creating family..."
                : "Create Family"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#B86F83]">
            YOUR FAMILY
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Family Members
          </h1>

          <p className="mt-2 text-slate-500">
            People connected to your Family Copilot account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-[#D98FA3] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#C97F94]"
        >
          + Add Family Member
        </button>
      </div>

      {/* Family Members */}
      {members.length === 0 ? (
        <div className="rounded-3xl border border-[#F0E1E5] bg-white p-8 text-center">
          <div className="mb-3 text-4xl">
            👨‍👩‍👧
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            No family members yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add a family member to see them here.
          </p>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-5 rounded-xl bg-[#D98FA3] px-5 py-3 text-sm font-medium text-white hover:bg-[#C97F94]"
          >
            Add Your First Family Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onSuccess={loadFamilyMembers}
            />
          ))}
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <AddFamilyMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadFamilyMembers}
        />
      )}
    </div>
  );
}

export default Family;
