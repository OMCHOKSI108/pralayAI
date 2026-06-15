import { useRef, useEffect, useState } from "react";
import { ArrowUp, Paperclip, Mic, Square } from "lucide-react";
import { uploadDocument } from "../../config/PralayAPI";
import "./PromptBox.css";

// ─────────────────────────────────────────────────────────────────────────────

const PromptBox = ({
  value,
  onChange,
  onSend,
  onStop,
  loading = false,
  isGenerating = false,
  placeholder = "Ask PralayAI a cybersecurity question...",
}) => {
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading && !isGenerating) {
        onSend();
      }
    }
  };

  const handleInput = (e) => {
    onChange(e);
    adjustHeight();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      onSend?.("I uploaded a file: " + file.name);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const canSend = value.trim().length > 0 && !loading && !isGenerating;
  const showStop = isGenerating;

  return (
    <div className="prompt-box-wrapper">
      <div className={`prompt-box ${loading && !isGenerating ? "prompt-box--loading" : ""}`}>
        {/* Attach file */}
        <label className="prompt-icon-btn" aria-label="Attach file" title="Upload file">
          <Paperclip size={17} />
          <input
            type="file"
            accept=".txt,.pdf,.md,.csv,.json,.docx"
            onChange={handleFile}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>

        <textarea
          ref={textareaRef}
          className="prompt-textarea"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "Generating response..." : placeholder}
          disabled={loading || isGenerating}
          rows={1}
          aria-label="Chat input"
        />

        {/* Mic — placeholder */}
        <button
          className="prompt-icon-btn"
          aria-label="Voice input (coming soon)"
          disabled
          title="Voice input (coming soon)"
          tabIndex={-1}
        >
          <Mic size={17} />
        </button>

        {/* Stop or Send */}
        {showStop ? (
          <button
            className="prompt-stop-btn"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generation"
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            className={`prompt-send-btn ${canSend ? "prompt-send-btn--active" : ""}`}
            onClick={() => canSend && onSend()}
            disabled={!canSend}
            aria-label="Send message"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <p className="prompt-disclaimer">
        PralayAI is a defensive cybersecurity assistant. Always verify critical decisions with a professional.
      </p>
    </div>
  );
};

export default PromptBox;
