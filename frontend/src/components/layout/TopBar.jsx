import { useState, useEffect } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { checkHealth } from "../../config/PralayAPI";
import { useTheme } from "../../context/ThemeContext";
import "./TopBar.css";

const TopBar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [model, setModel] = useState("Pralay 1.1");
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const ok = await checkHealth();
      if (!cancelled) setBackendOnline(ok);
    };

    poll();
    const interval = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="topbar__center">
        <span className="topbar__title">PralayAI</span>
      </div>

      <div className="topbar__right">
        <button
          className="topbar__hamburger"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <select
          className="topbar__model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Select model"
        >
          <option value="Pralay 1.1">Pralay 1.1</option>
          <option value="Pralay Pro" disabled>Pralay Pro (Coming Soon)</option>
        </select>

        <div
          className={`topbar__status-dot ${
            backendOnline === null
              ? "topbar__status-dot--unknown"
              : backendOnline
              ? "topbar__status-dot--online"
              : "topbar__status-dot--offline"
          }`}
          title={
            backendOnline === null
              ? "Checking backend..."
              : backendOnline
              ? "Backend online"
              : "Backend offline"
          }
          aria-label={backendOnline ? "Backend online" : "Backend offline"}
        />
      </div>
    </div>
  );
};

export default TopBar;
