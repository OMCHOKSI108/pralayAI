import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
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
            <h2>Create Account</h2>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
