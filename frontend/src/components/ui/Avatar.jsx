const SIZE_MAP = {
  sm: { width: 28, height: 28, fontSize: "0.75rem" },
  md: { width: 36, height: 36, fontSize: "0.88rem" },
  lg: { width: 48, height: 48, fontSize: "1.1rem" },
};

const Avatar = ({ username = "U", size = "md", onClick }) => {
  const initials = (username || "U").charAt(0).toUpperCase();
  const { width, height, fontSize } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      onClick={onClick}
      aria-label={`Avatar for ${username}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick(e) : undefined}
      style={{
        width,
        height,
        borderRadius: "50%",
        background: "#3a3a3c",
        border: "1px solid #4a4a4c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        color: "#a0a0a4",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        userSelect: "none",
        transition: "background 0.15s ease",
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
