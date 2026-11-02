
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetFlow = (newMode) => {
    setMode(newMode);
    setStep("email");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setCountdown(0);
    clearMessages();
  };

  const sendOTP = async () => {
    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "register"
          ? "/auth/register/request-otp"
          : "/auth/forgot-password/request-otp";

      const response = await api.post(endpoint, {
        email: email.trim().toLowerCase(),
      });

      setStep("verify");
      setCountdown(60);
      setSuccess(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    localStorage.setItem("access_token", response.data.access_token);

    const userResponse = await api.get("/auth/me");
    localStorage.setItem("user_email", userResponse.data.email);

    navigate("/");
  };

  const handleRegistration = async () => {
    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    await api.post("/auth/register/complete", {
      email: email.trim().toLowerCase(),
      otp,
      password,
    });

    resetFlow("login");
    setSuccess("Account created successfully. You can now sign in.");
  };

  const handlePasswordReset = async () => {
    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await api.post("/auth/forgot-password/reset", {
      email: email.trim().toLowerCase(),
      otp,
      new_password: password,
    });

    resetFlow("login");
    setSuccess(response.data.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (mode === "login") {
        await handleLogin();
      } else if (step === "email") {
        await sendOTP();
      } else if (mode === "register") {
        await handleRegistration();
      } else {
        await handlePasswordReset();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    await sendOTP();
  };

  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
        ? step === "email"
          ? "Create your account"
          : "Verify your email"
        : step === "email"
          ? "Reset your password"
          : "Create new password";

  const subtitle =
    mode === "login"
      ? "Sign in to continue your job search."
      : mode === "register"
        ? step === "email"
          ? "Start building your career with AI."
          : `Enter the verification code sent to ${email}.`
        : step === "email"
          ? "We'll send you a secure verification code."
          : "Verify your code and choose a new password.";

  const submitLabel =
    mode === "login"
      ? "Sign In"
      : step === "email"
        ? "Send Verification Code"
        : mode === "register"
          ? "Verify & Create Account"
          : "Reset Password";

  return (
    <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center px-5 py-10 text-white">
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
            {title}
          </h1>

          <p className="text-gray-400 text-sm mb-8">
            {subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {step === "email" || mode === "login" ? (
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
            ) : (
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Verification code
                </label>

                <div className="flex items-center bg-[#0B0B12] border border-white/10 rounded-xl px-4">
                  <ShieldCheck size={18} className="text-gray-500" />

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-transparent p-4 outline-none text-white tracking-[0.3em]"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      clearMessages();
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || loading}
                    onClick={handleResend}
                    className="text-[#9B87F5] disabled:text-gray-600"
                  >
                    {countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {(mode === "login" || step === "verify") && (
              <>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    {mode === "login" ? "Password" : "New password"}
                  </label>

                  <div className="flex items-center bg-[#0B0B12] border border-white/10 rounded-xl px-4">
                    <Lock size={18} className="text-gray-500" />

                    <input
                      type="password"
                      required
                      minLength={mode === "login" ? 1 : 12}
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "login"
                          ? "Enter password"
                          : "Minimum 12 characters"
                      }
                      className="w-full bg-transparent p-4 outline-none text-white"
                    />
                  </div>
                </div>

                {mode !== "login" && (
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Confirm password
                    </label>

                    <div className="flex items-center bg-[#0B0B12] border border-white/10 rounded-xl px-4">
                      <Lock size={18} className="text-gray-500" />

                      <input
                        type="password"
                        required
                        minLength={12}
                        maxLength={128}
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Re-enter password"
                        className="w-full bg-transparent p-4 outline-none text-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => resetFlow("forgot")}
                  className="text-sm text-[#9B87F5] hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-[#F59E9E]">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (step === "verify" && otp.length !== 6)}
              className="w-full bg-[#6C63FF] hover:bg-[#8178FF] disabled:opacity-50 rounded-xl p-4 font-semibold flex items-center justify-center gap-2 transition"
            >
              {loading ? "Please wait..." : submitLabel}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {mode === "login" ? (
            <div className="text-center text-sm text-gray-400 mt-7">
              Don't have an account?

              <button
                type="button"
                onClick={() => resetFlow("register")}
                className="text-[#9B87F5] font-semibold ml-2 hover:text-white"
              >
                Register
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => resetFlow("login")}
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white mt-7 w-full"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          )}

        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Job Hunter AI · Your intelligent career companion
        </p>

      </div>
    </div>
  );
}
