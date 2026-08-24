
import { useState } from "react";
import { createFamilyMember } from "../../services/familyApi";

type AddFamilyMemberModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

function AddFamilyMemberModal({
  onClose,
  onSuccess,
}: AddFamilyMemberModalProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createFamilyMember({
        name,
        relation,
        age: Number(age),
        gender,
        phone,
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add family member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Add Family Member
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add someone to your family.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D98FA3]"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Relation
            </label>

            <input
              type="text"
              value={relation}
              onChange={(event) => setRelation(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D98FA3]"
              placeholder="e.g. Father, Mother, Son"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Age
              </label>

              <input
                type="number"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                required
                min="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D98FA3]"
                placeholder="Age"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D98FA3]"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D98FA3]"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#D98FA3] px-5 py-3 text-sm font-medium text-white hover:bg-[#C97F94] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFamilyMemberModal;
