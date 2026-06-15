import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/chat");
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
            <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
              <Shield size={48} strokeWidth={1.5} />
            </div>
            <h1>PralayAI</h1>
            <p>Defensive Cybersecurity Assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Sign In</h2>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none" }}
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
