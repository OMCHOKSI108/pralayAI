import { useState, useContext } from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Context } from "../../context/Context";
import { assets } from "../../assets/assets";
import ProcessPanel from "./ProcessPanel";
import CitationCard from "./CitationCard";
import MermaidBlock from "./MermaidBlock";
import "./MessageBubble.css";

const LoadingDots = () => (
  <div className="msg-loading-dots" aria-label="PralayAI is thinking">
    <span /><span /><span />
  </div>
);

const StreamingCursor = () => (
  <span className="msg-streaming-cursor" aria-hidden="true">▋</span>
);

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const lang = className ? className.replace("language-", "") : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="msg-code-block">
      <div className="msg-code-block__header">
        <span className="msg-code-block__lang">{lang || "code"}</span>
        <button className="msg-code-block__copy" onClick={handleCopy} aria-label={copied ? "Copied!" : "Copy code"}>
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <pre className="msg-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MermaidCodeBlock({ children }) {
  const code = String(children).replace(/\n$/, "");
  return <MermaidBlock chart={code} />;
}

const REMARK_PLUGINS = [remarkGfm];

const MD_COMPONENTS = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return <code className="msg-inline-code" {...props}>{children}</code>;
    }
    const lang = className ? className.replace("language-", "") : "";
    if (lang === "mermaid") {
      return <MermaidCodeBlock>{children}</MermaidCodeBlock>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

function MarkdownRenderer({ content, isStreaming }) {
  return (
    <div className="msg-markdown">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={MD_COMPONENTS}>
        {content}
      </ReactMarkdown>
      {isStreaming && <StreamingCursor />}
    </div>
  );
}

function formatTimestamp(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const { role, content, timestamp, status } = message;
  const isUser = role === "user";
  const isStreaming = status === "streaming";
  const isWaiting = isStreaming && content === "";

  const { currentSkill, currentProcess, currentCitations, memoryUsed, statusMessage } = useContext(Context);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (isUser) {
    return (
      <div className="msg-row msg-row--user">
        <div className="msg-bubble msg-bubble--user">
          <p className="msg-text">{content}</p>
          <span className="msg-timestamp">{formatTimestamp(timestamp)}</span>
        </div>
        <div className="msg-avatar msg-avatar--user" aria-label="You">U</div>
      </div>
    );
  }

  const showProcessPanel = !isUser && !isWaiting && (currentSkill || currentProcess);

  return (
    <div className="msg-row msg-row--assistant">
      <div className="msg-avatar msg-avatar--assistant" aria-label="PralayAI">
        <img src={assets.gemini_icon} alt="PralayAI" />
      </div>

      <div className="msg-card msg-card--assistant">
        {isWaiting ? (
          <>
            {statusMessage && (
              <div className="msg-status-line">
                <span className="msg-status-line__text">{statusMessage}</span>
              </div>
            )}
            <LoadingDots />
          </>
        ) : (
          <>
            {currentSkill && !isStreaming && (
              <div className="msg-skill-chip">
                <span className="msg-skill-chip__label">
                  {currentSkill.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {isStreaming && statusMessage && (
              <div className="msg-status-line msg-status-line--streaming">
                <span className="msg-status-line__text">{statusMessage}</span>
              </div>
            )}
            <MarkdownRenderer content={content} isStreaming={isStreaming} />
            {!isStreaming && (
              <div className="msg-card-footer">
                <span className="msg-timestamp">{formatTimestamp(timestamp)}</span>
                <button className="msg-copy-btn" onClick={handleCopy} aria-label={copied ? "Copied!" : "Copy response"}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            )}
            {showProcessPanel && (
              <ProcessPanel
                process={currentProcess}
                skill={currentSkill}
                citations={currentCitations}
                memoryUsed={memoryUsed}
              />
            )}
            {currentCitations?.length > 0 && !isStreaming && (
              <div className="msg-citations">
                {currentCitations.map((c, i) => (
                  <CitationCard key={i} citation={c} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
