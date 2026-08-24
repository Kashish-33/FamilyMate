import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/userApi";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(
        email.trim(),
        password
      );

      // Save authentication token
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Tell App.tsx that authentication has changed
      window.dispatchEvent(
        new Event("auth-changed")
      );

      // Navigate to Dashboard
      navigate("/", { replace: true });

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-[#D98FA3] text-white flex items-center justify-center text-2xl shadow-sm">
            ✦
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Sign in to your Family Copilot account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#F0E1E5] p-7 shadow-sm">

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="mb-5">
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
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1]
                outline-none text-sm text-slate-700
                placeholder:text-slate-400
                focus:border-[#D98FA3]
                focus:ring-2 focus:ring-[#FCECEF]"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8DDE1]
                outline-none text-sm text-slate-700
                placeholder:text-slate-400
                focus:border-[#D98FA3]
                focus:ring-2 focus:ring-[#FCECEF]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl
              bg-[#D98FA3] text-white
              font-medium text-sm
              hover:bg-[#C77890]
              disabled:opacity-60
              transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#A85F75] font-medium"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;