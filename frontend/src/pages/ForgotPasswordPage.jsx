import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { forgotPassword } from "../config/PralayAPI";
import "./auth.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      navigate("/reset-password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}><Shield size={44} strokeWidth={1.5} /></div>
            <h1>PralayAI</h1>
            <p>Reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Forgot Password</h2>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Sending..." : "Send New Password"}
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

export default ForgotPasswordPage;
