import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMemories, addMemory, updateMemory, deleteMemory, clearMemories } from "../config/PralayAPI";
import "./MemoryPage.css";

const MemoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");

  const loadMemories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMemories();
      setMemories(data.memories || []);
    } catch (e) {
      setError("Failed to load memories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setError("");
    setSuccess("");
    try {
      await addMemory(newKey.trim(), newValue.trim());
      setNewKey("");
      setNewValue("");
      setSuccess("Memory saved!");
      loadMemories();
    } catch (e) {
      setError(e.message || "Failed to save memory.");
    }
  };

  const handleUpdate = async (id) => {
    if (!editKey.trim() || !editValue.trim()) return;
    setError("");
    try {
      await updateMemory(id, { key: editKey.trim(), value: editValue.trim() });
      setEditingId(null);
      setSuccess("Memory updated!");
      loadMemories();
    } catch (e) {
      setError(e.message || "Failed to update memory.");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await deleteMemory(id);
      setSuccess("Memory deleted.");
      loadMemories();
    } catch (e) {
      setError(e.message || "Failed to delete memory.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all saved memories? This cannot be undone.")) return;
    setError("");
    try {
      await clearMemories();
      setSuccess("All memories cleared.");
      setMemories([]);
    } catch (e) {
      setError(e.message || "Failed to clear memories.");
    }
  };

  return (
    <div className="memory-page">
      <div className="memory-card">
        <div className="memory-card__accent" />
        <div className="memory-card__inner">
          <button className="memory-back-btn" onClick={() => navigate("/chat")} aria-label="Back to chat">
            <ArrowLeft size={18} />
            <span>Back to Chat</span>
          </button>

          <div className="memory-header">
            <h1 className="memory-title">Memory</h1>
            <p className="memory-subtitle">
              PralayAI remembers facts you teach it to personalize your experience.
            </p>
          </div>

          {error && <div className="memory-error">{error}</div>}
          {success && <div className="memory-success">{success}</div>}

          <form className="memory-add-form" onSubmit={handleAdd}>
            <div className="memory-add-fields">
              <input
                type="text"
                placeholder="Key (e.g., preferred_language)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="memory-input"
                required
              />
              <input
                type="text"
                placeholder="Value (e.g., Python)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="memory-input"
                required
              />
            </div>
            <button type="submit" className="memory-add-btn" disabled={!newKey.trim() || !newValue.trim()}>
              Save
            </button>
          </form>

          <div className="memory-list-header">
            <h2>Saved Memories ({memories.length})</h2>
            {memories.length > 0 && (
              <button className="memory-clear-btn" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>

          {loading ? (
            <div className="memory-loading">Loading...</div>
          ) : memories.length === 0 ? (
            <div className="memory-empty">
              No memories yet. Tell PralayAI something like "Remember I prefer short answers" and it will appear here.
            </div>
          ) : (
            <div className="memory-list">
              {memories.map((mem) => (
                <div key={mem.id} className="memory-item">
                  {editingId === mem.id ? (
                    <div className="memory-edit-form">
                      <input
                        type="text"
                        value={editKey}
                        onChange={(e) => setEditKey(e.target.value)}
                        className="memory-input memory-edit-input"
                      />
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="memory-input memory-edit-input"
                      />
                      <div className="memory-edit-actions">
                        <button className="memory-save-btn" onClick={() => handleUpdate(mem.id)}>Save</button>
                        <button className="memory-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="memory-item-content">
                        <span className="memory-item-key">{mem.key}:</span>
                        <span className="memory-item-value">{mem.value}</span>
                        <span className="memory-item-meta">
                          {Math.round(mem.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="memory-item-actions">
                        <button
                          className="memory-item-btn"
                          onClick={() => { setEditingId(mem.id); setEditKey(mem.key); setEditValue(mem.value); }}
                          aria-label="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="memory-item-btn memory-item-btn--danger"
                          onClick={() => handleDelete(mem.id)}
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryPage;
