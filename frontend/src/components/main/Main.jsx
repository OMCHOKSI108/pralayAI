import { useContext, useEffect, useRef } from "react";
import { Context } from "../../context/Context";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../layout/TopBar";
import PromptBox from "../chat/PromptBox";
import MessageBubble from "../chat/MessageBubble";
import SuggestionCards from "../chat/SuggestionCards";
import ErrorBanner from "../ui/ErrorBanner";
import "./main.css";

const Main = ({ sidebarCollapsed, onToggleSidebar }) => {
  const {
    input,
    setInput,
    messages,
    loading,
    isGenerating,
    error,
    setError,
    onSent,
    stopGeneration,
  } = useContext(Context);

  const { user } = useAuth();
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom as messages grow
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !loading && !isGenerating) {
      onSent();
    }
  };

  const handleCardSend = (prompt) => {
    if (!loading && !isGenerating) {
      onSent(prompt);
    }
  };

  const username = user?.username || "there";
  const hasMessages = messages.length > 0;

  return (
    <div className="main-layout">
      <TopBar onToggleSidebar={onToggleSidebar} />

      <div className="main-content">
        {error && (
          <div className="main-error-wrapper">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {!hasMessages ? (
          <div className="main-empty">
            <div className="main-empty__inner">
              <h1 className="main-greeting">
                Hi, <span className="main-greeting__name">{username}!</span>
                <br />
                What&rsquo;s on your mind?
              </h1>
              <p className="main-subtitle">
                I&rsquo;m PralayAI — your defensive cybersecurity assistant.
              </p>
              <SuggestionCards onSend={handleCardSend} />
            </div>
          </div>
        ) : (
          <div className="main-messages">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="main-prompt-area">
        <div className="main-prompt-inner">
          <PromptBox
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSend={handleSend}
            onStop={stopGeneration}
            loading={loading}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
