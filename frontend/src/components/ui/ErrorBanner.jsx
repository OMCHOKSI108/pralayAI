import "./ErrorBanner.css";

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <span className="error-banner__icon">⚠</span>
      <span className="error-banner__message">{message}</span>
      {onDismiss && (
        <button
          className="error-banner__close"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
