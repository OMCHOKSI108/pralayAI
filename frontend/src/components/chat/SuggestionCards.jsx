import { Shield, Crosshair, Cloud, Terminal } from "lucide-react";
import "./SuggestionCards.css";

const CARDS = [
  {
    icon: Shield,
    title: "Incident Response",
    subtitle: "Ransomware response steps",
    prompt: "Explain incident response steps for a ransomware attack in detail.",
  },
  {
    icon: Crosshair,
    title: "MITRE ATT&CK",
    subtitle: "Lateral movement techniques",
    prompt: "What are the MITRE ATT&CK techniques for lateral movement?",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    subtitle: "Detect suspicious logins in AWS",
    prompt: "How do I detect suspicious login activity in AWS CloudTrail logs?",
  },
  {
    icon: Terminal,
    title: "Linux Hardening",
    subtitle: "Secure a Linux server",
    prompt: "What security hardening steps should I apply to a Linux server?",
  },
];

const SuggestionCards = ({ onSend }) => {
  return (
    <div className="suggestion-grid">
      {CARDS.map((card) => (
        <button
          key={card.title}
          className="suggestion-card"
          onClick={() => onSend(card.prompt)}
          aria-label={`Ask: ${card.prompt}`}
        >
          <div className="suggestion-card__icon"><card.icon size={20} strokeWidth={1.5} /></div>
          <div className="suggestion-card__text">
            <p className="suggestion-card__title">{card.title}</p>
            <p className="suggestion-card__subtitle">{card.subtitle}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SuggestionCards;
