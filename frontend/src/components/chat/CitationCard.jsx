import { useState } from "react";
import "./CitationCard.css";

const CitationCard = ({ citation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`citation-card ${expanded ? "citation-card--expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
    >
      <div className="citation-card__header">
        <span className="citation-card__icon">
          {citation.source_type === "document" ? "📄" : "🌐"}
        </span>
        <span className="citation-card__title">{citation.title || "Source"}</span>
        {citation.relevance > 0 && (
          <span className="citation-card__score">
            {Math.round(citation.relevance * 100)}%
          </span>
        )}
      </div>
      {expanded && citation.snippet && (
        <div className="citation-card__body">
          <p className="citation-card__snippet">{citation.snippet}</p>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-card__link"
              onClick={(e) => e.stopPropagation()}
            >
              🔗 Visit source
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CitationCard;
