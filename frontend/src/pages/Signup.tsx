import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/userApi";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await signupUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-[#D98FA3] text-white flex items-center justify-center text-2xl shadow-sm">
            ✦
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Create account
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Join FamilyMate to manage your family records.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#F0E1E5] p-7 shadow-sm">
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1] outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1] outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter your phone number"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1] outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1] outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1] outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#D98FA3] text-white font-medium text-sm hover:bg-[#C77890] disabled:opacity-60 transition"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#A85F75] font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
