import { useState } from "react";
import { ChevronDown, MessageCircle, Globe, Search, Code, Bug, Brain, FileText, Shield, ExternalLink } from "lucide-react";
import "./ProcessPanel.css";

const SkillIcon = ({ skill }) => {
  const icons = {
    general_chat: MessageCircle,
    web_research: Globe,
    deep_research: Search,
    code_writer: Code,
    code_debugger: Bug,
    memory_manager: Brain,
    rag_answer: FileText,
    safety_filter: Shield,
  };
  const Icon = icons[skill] || MessageCircle;
  return <Icon size={16} strokeWidth={1.5} className="process-skill-icon" />;
};

const ProcessPanel = ({ process, skill, citations, memoryUsed }) => {
  const [open, setOpen] = useState(false);

  if (!process && !skill) return null;

  const p = process || {};
  const skillName = p.skill || skill || "general_chat";

  const confidenceColors = {
    high: "var(--accent-green)",
    medium: "var(--accent-yellow, #ff9800)",
    low: "var(--accent-red)",
  };

  const confidenceLabels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <div className="process-panel">
      <button
        className="process-panel__toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <SkillIcon skill={skillName} />
        <span className="process-panel__skill">{skillName.replace(/_/g, " ")}</span>
        {memoryUsed && <span className="process-panel__badge process-panel__badge--memory">Memory</span>}
        {citations?.length > 0 && (
          <span className="process-panel__badge process-panel__badge--sources">{citations.length} sources</span>
        )}
        {p.confidence && (
          <span
            className="process-panel__confidence"
            style={{ color: confidenceColors[p.confidence] || "var(--text-muted)" }}
          >
            {confidenceLabels[p.confidence] || p.confidence}
          </span>
        )}
        <ChevronDown size={14} className={`process-panel__chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="process-panel__content">
          <div className="process-panel__section">
            <strong>Understanding</strong>
            <p>{p.reasoning_summary || "Understanding user query and selecting appropriate approach."}</p>
          </div>

          {p.assumptions?.length > 0 && (
            <div className="process-panel__section">
              <strong>Assumptions</strong>
              <ul>
                {p.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {p.limitations?.length > 0 && (
            <div className="process-panel__section">
              <strong>Limitations</strong>
              <ul>
                {p.limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="process-panel__section">
            <strong>Sources Checked</strong>
            <ul>
              {p.rag_used && <li>Uploaded documents (RAG)</li>}
              {p.web_used && <li>Web search results {citations?.length ? `(${citations.length} sources)` : ""}</li>}
              {!p.rag_used && !p.web_used && <li>General knowledge (no external sources)</li>}
              {p.memory_used && <li>Retrieved user memories</li>}
            </ul>
          </div>

          <div className="process-panel__section">
            <strong>Evidence Found</strong>
            <p>{citations?.length > 0 ? `Found ${citations.length} relevant sources.` : "Answer based on model knowledge."}</p>
          </div>

          <div className="process-panel__section">
            <strong>Final Answer Basis</strong>
            <p>{p.confidence === "high" ? "Strong evidence supports this answer." :
               p.confidence === "medium" ? "Partially supported; verify for critical decisions." :
               "Limited information; consider this as guidance only."}
            </p>
          </div>
        </div>
      )}

      {citations?.length > 0 && (
        <div className="process-panel__citations">
          {citations.map((c, i) => (
            <div key={i} className="process-panel__citation">
              <span className="process-panel__citation-num">{i + 1}</span>
              <span>{c.title || c.url || "Source"}</span>
              {c.url && (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="process-panel__citation-link">
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessPanel;
