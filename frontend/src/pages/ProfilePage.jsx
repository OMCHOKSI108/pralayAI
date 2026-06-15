import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../config/PralayAPI";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");

    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess("Password changed successfully!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwError(err.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (newUsername.trim() === user?.username) {
      setErrorMsg("Username is the same as current.");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfile(newUsername.trim());
      updateUser(updated);
      setSuccessMsg("Username updated successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Gradient top line */}
        <div className="profile-card__accent" />

        <div className="profile-card__inner">
          {/* Back button */}
          <button
            className="profile-back-btn"
            onClick={() => navigate("/chat")}
            aria-label="Back to chat"
          >
            <ArrowLeft size={18} />
            <span>Back to Chat</span>
          </button>

          <h1 className="profile-title">Profile</h1>

          {/* Current user info */}
          <div className="profile-info-row">
            <div className="profile-avatar">
              {(user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info-text">
              <p className="profile-info-name">{user?.username}</p>
              <p className="profile-info-email">{user?.email}</p>
            </div>
          </div>

          <hr className="profile-divider" />

          {/* Edit form */}
          <form onSubmit={handleSubmit} className="profile-form">
            <h2 className="profile-form-title">Update Username</h2>

            {successMsg && (
              <div className="profile-success">{successMsg}</div>
            )}
            {errorMsg && (
              <div className="profile-error">{errorMsg}</div>
            )}

            <div className="profile-field">
              <label htmlFor="profile-username">New username</label>
              <input
                id="profile-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                minLength={3}
                required
                autoFocus
              />
            </div>

            <div className="profile-field">
              <label>Email (read-only)</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="profile-field__readonly"
              />
            </div>

            <button
              type="submit"
              className="profile-submit-btn"
              disabled={loading || !newUsername.trim()}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <hr className="profile-divider" />

          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="profile-form">
            <h2 className="profile-form-title">
              <KeyRound size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
              Change Password
            </h2>

            {pwSuccess && (
              <div className="profile-success">{pwSuccess}</div>
            )}
            {pwError && (
              <div className="profile-error">{pwError}</div>
            )}

            <div className="profile-field">
              <label htmlFor="profile-current-pw">Current Password</label>
              <div className="profile-pw-wrap">
                <input
                  id="profile-current-pw"
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-new-pw">New Password</label>
              <div className="profile-pw-wrap">
                <input
                  id="profile-new-pw"
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-confirm-pw">Confirm New Password</label>
              <div className="profile-pw-wrap">
                <input
                  id="profile-confirm-pw"
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="profile-pw-toggle"
                  onClick={() => setShowPw((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide passwords" : "Show passwords"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="profile-submit-btn"
              disabled={pwLoading || !currentPw || !newPw || !confirmPw}
            >
              {pwLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
