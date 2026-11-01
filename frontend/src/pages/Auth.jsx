
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("access_token", response.data.access_token);

        const userResponse = await api.get("/auth/me");
        localStorage.setItem("user_email", userResponse.data.email);

        navigate("/");
      } else {
        await api.post("/auth/register", {
          email,
          password,
        });

        setIsLogin(true);
        setPassword("");
        setError("Account created! Please log in.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center px-5 text-white">
      <div className="w-full max-w-md">

        <div className="flex justify-center items-center gap-3 mb-10">
          <div className="bg-[#6C63FF] p-3 rounded-xl">
            <BriefcaseBusiness size={25} />
          </div>
          <span className="text-2xl font-bold">Job Hunter AI</span>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-2xl p-8 shadow-2xl">

          <div className="flex items-center gap-2 text-[#9B87F5] text-sm mb-4">
            <Sparkles size={16} />
            AI-powered career workspace
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>

          <p className="text-gray-400 text-sm mb-8">
            {isLogin
              ? "Sign in to continue your job search."
              : "Start building your career with AI."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Email address
              </label>
              <div className="flex items-center bg-[#0B0B12] border border-white/10 rounded-xl px-4">
                <Mail size={18} className="text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent p-4 outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Password
              </label>
              <div className="flex items-center bg-[#0B0B12] border border-white/10 rounded-xl px-4">
                <Lock size={18} className="text-gray-500" />
                <input
                  type="password"
                  required
                  minLength={isLogin ? 1 : 12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter password" : "Minimum 12 characters"}
                  className="w-full bg-transparent p-4 outline-none text-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#F59E9E]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-[#8178FF] disabled:opacity-50 rounded-xl p-4 font-semibold flex items-center justify-center gap-2 transition"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="text-center text-sm text-gray-400 mt-7">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setPassword("");
              }}
              className="text-[#9B87F5] font-semibold ml-2 hover:text-white"
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Job Hunter AI · Your intelligent career companion
        </p>
      </div>
    </div>
  );
}
