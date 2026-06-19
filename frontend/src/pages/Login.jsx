import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login as loginApi, register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (isRegistering && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(name, email, password, role);
        toast.success("Registration successful! You can now log in.");
        setIsRegistering(false);
        setPassword("");
      } else {
        const data = await loginApi(email, password);
        login(data.token, data.role, data.name);
        toast.success("Login Successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 antialiased">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block h-3 w-3 rounded-full bg-violet-600 mb-2"></span>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isRegistering ? "Create your Account" : "Sign In to VyapariOne"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {isRegistering ? "Register as admin or staff member" : "Enter your credentials to continue"}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@vyaparione.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Role Select
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    role === "admin"
                      ? "border-violet-600 bg-violet-50 text-violet-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("staff")}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    role === "staff"
                      ? "border-violet-600 bg-violet-50 text-violet-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Staff
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegistering ? "Register Account" : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Need an account? Register Here"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
