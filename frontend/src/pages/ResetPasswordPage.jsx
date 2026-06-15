import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, ShieldCheck, ArrowLeft, Loader } from "lucide-react";
import { resolveResetToken, sendResetOtp, verifyReset } from "../config/PralayAPI";
import "./auth.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resolving, setResolving] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await resolveResetToken(token);
        setEmail(data.email);
      } catch (err) {
        setError("Invalid or expired reset link. Please start again.");
      } finally {
        setResolving(false);
      }
    })();
  }, [token]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) return;
    setError("");
    setLoading(true);
    try {
      await sendResetOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyReset(email, newPassword, otp);
      localStorage.setItem("pralayai_token", data.token);
      window.location.href = "/chat";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (resolving) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-inner" style={{ textAlign: "center", padding: "3rem 0" }}>
            <Loader size={32} className="spin" style={{ color: "var(--accent-blue)" }} />
            <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!otpSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-header">
              <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
                <KeyRound size={44} strokeWidth={1.5} />
              </div>
              <h1>PralayAI</h1>
              <p>Step 1: Enter your new password</p>
            </div>

            <form onSubmit={handleSendOtp} className="auth-form">
              <h2>Complete Reset</h2>

              {error && <div className="auth-error">{error}</div>}

              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus={!email}
                />
              </div>

              <div className="auth-field">
                <label>New Password (from email)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter the password sent to your email"
                  required
                  autoFocus={!!email}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading || !email || !newPassword}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
              <ShieldCheck size={44} strokeWidth={1.5} />
            </div>
            <h1>PralayAI</h1>
            <p>Step 2: Verify with OTP</p>
          </div>

          <form onSubmit={handleVerify} className="auth-form">
            <h2>Enter OTP</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "-0.5rem 0 1rem" }}>
              An OTP was sent to <strong>{email}</strong>
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>OTP Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                style={{ fontSize: "1.3rem", letterSpacing: "0.3em", textAlign: "center" }}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
