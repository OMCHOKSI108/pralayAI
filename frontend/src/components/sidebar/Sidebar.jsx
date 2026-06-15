import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, LogOut, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { Context } from "../../context/Context";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import "./sidebar.css";

// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const {
    newChat,
    conversations,
    conversationId,
    loadConversations,
    loadConversationById,
    removeConversation,
  } = useContext(Context);
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  // Load this user's conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewChat = () => {
    newChat();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  /** Load full conversation and display its messages */
  const handleConversationClick = (id) => {
    if (id && id !== conversationId) {
      loadConversationById(id);
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {!collapsed && (
        <div
          className="sidebar-backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}
        aria-label="Navigation sidebar"
      >
        {/* ── Top section ─────────────────────────────────────────────────── */}
        <div className="sidebar__top">
          {/* New Chat */}
          <button
            className="sidebar__new-chat"
            onClick={handleNewChat}
            aria-label="New chat"
          >
            <Plus size={17} />
            {!collapsed && <span>New Chat</span>}
          </button>

          {/* Search — expanded only */}
          {!collapsed && (
            <div className="sidebar__search">
              <Search size={13} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search conversations"
              />
            </div>
          )}

          {/* Conversation history — expanded only */}
          {!collapsed && (
            <div className="sidebar__history">
              {filteredConversations.length > 0 ? (
                <>
                  <p className="sidebar__section-label">Recent</p>
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`sidebar__chat-item ${
                        conv.id === conversationId ? "sidebar__chat-item--active" : ""
                      }`}
                      onClick={() => handleConversationClick(conv.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleConversationClick(conv.id)}
                      aria-label={`Open conversation: ${conv.title}`}
                      aria-current={conv.id === conversationId ? "page" : undefined}
                    >
                      <MessageSquare size={14} />
                      <span className="sidebar__chat-title">
                        {conv.title.length > 28 ? conv.title.slice(0, 28) + "…" : conv.title}
                      </span>
                      <button
                        className="sidebar__chat-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeConversation(conv.id);
                        }}
                        aria-label={`Delete: ${conv.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="sidebar__empty-history">
                  {searchQuery
                    ? "No matching chats."
                    : "No chats yet. Start a new conversation!"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom section ───────────────────────────────────────────────── */}
        <div className="sidebar__bottom">
          {/* User profile row */}
          <div
            className="sidebar__user"
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleProfileClick()}
            aria-label="Go to profile"
          >
            <Avatar username={user?.username} size="sm" />
            {!collapsed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user?.username || "User"}</span>
                <span className="sidebar__user-email">{user?.email || ""}</span>
              </div>
            )}
          </div>

          {/* Memory */}
          <button
            className="sidebar__icon-btn"
            onClick={() => navigate("/memory")}
            aria-label="Memory"
            title="Memory"
          >
            <Brain size={15} />
            {!collapsed && <span>Memory</span>}
          </button>

          {/* Logout */}
          <button
            className="sidebar__icon-btn sidebar__icon-btn--danger"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut size={15} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
