/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Shield, Terminal, Settings, RefreshCw, Cpu, CheckCircle2, 
  ExternalLink, Calendar, Users, BarChart3, AlertTriangle, KeyRound, 
  Radio, Lock, Database, Code, Sliders, Play, Server
} from 'lucide-react';

interface CaseStudyDetailProps {
  projectId: string;
  onClose: () => void;
  onBookCall: () => void;
}

export default function CaseStudyDetail({ projectId, onClose, onBookCall }: CaseStudyDetailProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPECIFICATION' | 'SIMULATION'>('OVERVIEW');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  
  // Interactive Simulator States
  const [simFilterThreshold, setSimFilterThreshold] = useState(85);
  const [simActiveNodes, setSimActiveNodes] = useState(6);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simHealthRatio, setSimHealthRatio] = useState(100);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [customParam, setCustomParam] = useState('NORMAL_SEC');

  // Load project-specific detailed information
  const getProjectData = () => {
    switch (projectId) {
      case 'proj-1':
        return {
          id: 'proj-1',
          title: 'Real-Time Cyber Threat Pipeline',
          subtitle: 'E2E zero-day intake buffer and threat-graph resolution engine.',
          client: 'Sentinel Threat Intel Group',
          category: 'SECURITY',
          year: '2026',
          stakeholders: 'Enterprise Security Operations, SOC Leaders',
          heroIcon: Shield,
          compliance: ['SOC 2 Type II Certified', 'ISO 27001 standard compliance', 'NIST SP 800-53 controls'],
          statHero: '4.8M ops/s',
          statHeroLabel: 'Ingress Stream Latitude',
          description: 'A sovereign threat intel ingestion architecture engineered to receive, parse, and analyze millions of incoming zero-day threat telemetry vectors. Employs low-latency in-memory message streams with isolated graph compilers to identify cluster intrusions instantly.',
          challenge: 'Sentinel Group needed a pipeline that could ingest high-velocity unstructured network payloads from 4,000 global telemetry sources without dropping packets, whilst executing live threat resolution under 3ms.',
          solution: 'Hellware deployed a clustered Docker & Kubernetes micro-kernel layout optimized for maximum execution frequency. Written in highly optimized Node context with direct memory mapping and dynamic multi-threaded load balancer rings.',
          keyTakeaway: 'By replacing their legacy message queue with asynchronous memory buffers, database-level query locks were completely eliminated, slashing response time by 92%.',
          architecturePoints: [
            { title: 'Zero-Copy Stream Buffer', text: 'Allocates direct memory ring buffers to bypass costly JSON parser bottlenecks at extreme loads.' },
            { title: 'Anomaly Isolator Rings', text: 'Staged processing layers where isolates verify and isolate anomalous requests before dispatch.' },
            { title: 'Audit Vector Database', text: 'Hot storage system recording immutable hashes of security telemetry for immediate SOC parsing.' }
          ],
          codeSnippet: `// Sentinel Threat Pipeline Ingress Controller
import { createServer } from 'hellware-ring';
import { ThreatIsolator } from '@hellware/threat-intel';

const stream = createServer({ 
  port: 3000, 
  backlog: 8192,
  allocBuffer: 64 * 1024 // Direct Allocation
});

stream.on('segment', async (payload) => {
  const isolator = new ThreatIsolator({ ruleSet: 'zero-day-v2.1' });
  const report = await isolator.analyze(payload.data);
  
  if (report.confidence > 0.85) {
    await stream.dispatchToRing('isolate-cluster-alpha', {
      vectorId: payload.id,
      fingerprint: report.fingerprint,
      seal: report.createHMACSeal()
    });
  }
});`,
          customParamLabel: 'Rule Mode',
          customParams: ['NORMAL_SEC', 'PARANOID_M', 'NUCLEAR_ISO'],
          graphicType: 'pipeline'
        };
      case 'proj-2':
        return {
          id: 'proj-2',
          title: 'High-Frequency Clearance Engine',
          subtitle: 'Cryptographically signed decentralized high-speed clearing ledger.',
          client: 'Apex Clearing Capital',
          category: 'FINTECH',
          year: '2025',
          stakeholders: 'Clearing Houses, High-Frequency Trading Desk Managers',
          heroIcon: Cpu,
          compliance: ['PCI DSS Level 1 Certified', 'SOC 2 Type II Audit Approved', 'GDPR Sovereignty Guard'],
          statHero: '$12.5 Billion',
          statHeroLabel: 'Daily Processed Scale',
          description: 'A completely isolated high-security financial settlement platform. Implements high-frequency atomic multi-party transaction consensus directly inside localized secure cages and distributed ledger architectures.',
          challenge: 'Apex had to settle high-frequency micro-transactions instantly without relying on vulnerable third-party public sidechains, meeting strict SEC auditing timelines.',
          solution: 'Hellware engineered a secure private clearing core running isolated Rust microservers, using automated key rotation rings and cryptographically signed consensus protocols.',
          keyTakeaway: 'The resulting private mesh achieved immediate transaction finality, guaranteeing zero-day audit coverage on 100% of transaction payloads.',
          architecturePoints: [
            { title: 'Symmetric Settlement Key Ring', text: 'Multi-signature transaction verification using ephemeral keys discarded immediately after block finality.' },
            { title: 'Atomic Outbox Pipes', text: 'Ensures transactional multi-party updates are entirely atomic—either fully recorded or fully rolled back.' },
            { title: 'Secure Cryptographic Enclave', text: 'Execution of settlement mathematical consensus takes place entirely within hardware-encrypted CPU registers.' }
          ],
          codeSnippet: `// Apex Clearance Ledger Block Commit
fn commit_atomic_settlement(tx: &Transaction) -> Result<BlockSeal, ClearanceError> {
    let mut enclave = Enclave::acquire_hardware_slot()?;
    let verification = enclave.verify_signature(&tx.signature, &tx.public_key)?;
    
    if !verification {
        return Err(ClearanceError::RejectedSignature);
    }
    
    let state_hash = enclave.hash_payload(&tx.ledger_delta);
    let seal = BlockSeal::seal_with_salt(state_hash, tx.epoch)?;
    
    Ok(seal)
}`,
          customParamLabel: 'Key Rotation',
          customParams: ['EPHEMERAL', 'ROTATING_12h', 'STATIC_REG'],
          graphicType: 'transaction'
        };
      case 'proj-3':
        return {
          id: 'proj-3',
          title: 'Genetic Clinical Record Portal',
          subtitle: 'Completely isolated healthcare pipeline with field-level zero-knowledge encryption.',
          client: 'Veridian Diagnostics',
          category: 'BIOTECH',
          year: '2026',
          stakeholders: 'Clinical Principal Investigators, Data Privacy Officers',
          heroIcon: Lock,
          compliance: ['HIPAA Privacy Certified', 'SOC 2 Type II Compliant', 'GDPR Consent Framework'],
          statHero: '100% Passed',
          statHeroLabel: 'HIPAA Compliance Index',
          description: 'A next-generation platform for clinical DNA sequencing research records. Leverages field-level encryption combined with selective Zero-Knowledge validation layers, allowing researchers to evaluate trends without reading raw identifier vectors.',
          challenge: 'Veridian Diagnostics faced severe regulatory hurdles sharing sensitive oncology trial data with international analytical units without compromising patient identity.',
          solution: 'Designed and deployed a state-of-the-art secure enclave API that automatically converts patient descriptors into unique cryptographically secure blind tokens.',
          keyTakeaway: 'Completely severed direct links between molecular sequencing payloads and biological patient records, eliminating human-error privacy leaks entirely.',
          architecturePoints: [
            { title: 'Zero-Knowledge Demographics', text: 'Validate cohort demographics parameters like age brackets without storing or revealing exact dates.' },
            { title: 'Client-Side Key Vault Routing', text: 'Keys are retained in patient/clinician browser memory and never hit cloud databases.' },
            { title: 'Automated Breach Quarantine', text: 'Instantly revokes analytical access rings if abnormal database querying queries are detected.' }
          ],
          codeSnippet: `// Zero-Knowledge Patient Tokenizer
import { encryptField } from '@hellware/crypto-suite';

export async function processGeneticRecord(patientData) {
  const blindToken = await generateBlindIdentifier(patientData.ssn, patientData.birthSalt);
  
  const anonymizedRecord = {
    token: blindToken,
    cohortCode: patientData.dnaClusterCode,
    sequencePayload: await encryptField(patientData.sequence, {
      algorithm: 'AES-GCM-256',
      recipientPublicKey: process.env.RESEARCHER_PUB_KEY
    })
  };
  
  return anonymizedRecord;
}`,
          customParamLabel: 'Encryption Strength',
          customParams: ['AES_GCM_256', 'CHACHA_POLY', 'RSA_OAEP_4096'],
          graphicType: 'shield'
        };
      default: // proj-4
        return {
          id: 'proj-4',
          title: 'Isolated LLM Enterprise Sandbox',
          subtitle: 'Enterprise compliance gateway proxy for secure API orchestration.',
          client: 'Omniscience Labs',
          category: 'AI',
          year: '2026',
          stakeholders: 'Chief Information Officers, AI Compliance Committees',
          heroIcon: Database,
          compliance: ['SOC 2 Type II Certified', 'ISO 27001 Certified', 'GDPR Right-to-Erasure Active'],
          statHero: '0 Violations',
          statHeroLabel: 'PII Leak Records',
          description: 'A high-speed secure intermediary gateway filtering prompt context parameters. Automatically intercepts raw API calls, performs zero-latency entity scrubbing (PII, credentials, health indices) and translates them safe into enterprise model calls.',
          challenge: 'Omniscience Labs wished to roll out predictive coding assistants across internal squads but risked leaking intellectual property and customer records to external models.',
          solution: 'Hellware orchestrated an inline sanitization sandbox. The solution acts as a reverse proxy, checking and scrubbing all vectors before forwarding payloads to deep learning clusters.',
          keyTakeaway: 'The security gateway provided absolute governance with an ultra-low overhead footprint of less than 4.2ms, fostering risk-free AI deployment.',
          architecturePoints: [
            { title: 'Inline Entity Scrubbing', text: 'Leverages compiled regex sets combined with neural classifiers to purge confidential terms dynamically.' },
            { title: 'IP Tracking Safeguard', text: 'Blocks execution if an outbound request is observed containing sequences resembling internal source repositories.' },
            { title: 'Transparent Audit Audit Log', text: 'Maintains hashed ledger audits of structural integrity indexes to provide verifiable evidence of security compliance.' }
          ],
          codeSnippet: `// LLM Prompt Sandbox Compliance Gateway
import { ProxyGateway } from '@hellware/ai-compliance';

const sandbox = new ProxyGateway({
  models: ['gemini-2.5-pro', 'gemini-1.5-flash'],
  scrubRules: {
    emails: true,
    passwords: true,
    governmentIds: true,
    proprietaryRepoHashes: ['#7ef29d0']
  }
});

sandbox.onReceivedPrompt(async (context) => {
  const scrubbedText = await context.scrubSensitiveEntities();
  const verdict = await context.evaluateRiskRatio(scrubbedText);
  
  if (verdict.riskScore < 0.15) {
    return context.forwardToAI(scrubbedText);
  } else {
    return context.rejectPayload('ABNORMAL_IP_LEAK_WARNING');
  }
});`,
          customParamLabel: 'Scrub Rigor',
          customParams: ['MAX_SCRUB_PII', 'STRICT_IP_CODER', 'LIGHT_ANALYTICS'],
          graphicType: 'ledger'
        };
    }
  };

  const data = getProjectData();
  const HeroIcon = data.heroIcon;

  // Simulate Log updates dynamically in Simulation tab
  useEffect(() => {
    if (!isSimulating) return;

    const pipelineLogs = [
      `[${data.category}] Core instance boot successful. Allocation bound to port 3000.`,
      `[MAPPED_MEM] Verified TLS buffers initialized. Capacity set to 16M instances.`,
      `[SEC_MODULE] Handshake established with audit compliance cluster.`,
      `[METRIC] Streaming telemetry is nominal. Latency is running at 1.48 ms.`,
      `[GUARD] Checking vectors against rule matrix: [${customParam}]`,
      `[AUDIT] Cryptotoken validated. HMAC digest confirmed by ledger.`,
      `[GATEWAY] System threshold set to ${simFilterThreshold}%. Monitoring...`
    ];

    setSimLogs(pipelineLogs);

    const interval = setInterval(() => {
      // Periodic simulated logs
      const randomLogs = [
        `[INSPECT] Incoming query processed in ${(Math.random() * 1.5 + 0.5).toFixed(3)}ms. Result: PASSED.`,
        `[COMPLIANCE] Scanning outbound vector... Filter status: CLEAN.`,
        `[METRICS] Telemetry digest successfully synchronized to secure vault.`,
        `[RESOURCE] Cluster nodes status: ${simActiveNodes}/8 active. CPU load at ${(34 + Math.random() * 12).toFixed(1)}%.`,
        `[HEALTH] Internal temperature: 38.4C. Power signature is NOMINAL.`,
        `[LEDGER] Seal created for block tx_${Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}`
      ];
      
      const selectLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setSimLogs(prev => [...prev.slice(1), `[${new Date().toLocaleTimeString()}] ${selectLog}`]);
      
      // Calculate dynamic health ratio depending on slider values
      setSimHealthRatio(() => {
        const strain = (100 - simFilterThreshold) * 0.2 + (8 - simActiveNodes) * 4;
        return Math.max(74, Math.min(100, Math.round(100 - strain)));
      });

    }, 1800);

    return () => clearInterval(interval);
  }, [projectId, isSimulating, simFilterThreshold, simActiveNodes, customParam]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10 font-sans" id="case-study-root">
      
      {/* 1. Header Back Navigation Grid Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8 mb-12">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer group w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-cyber-blue group-hover:-translate-x-1 transition-transform" />
          <span>[ BACK TO SYSTEMS REGISTER ]</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded">
            SYSTEM BLUEPRINT // ACCESS LEVEL 01
          </span>
        </div>
      </div>

      {/* 2. Top Immersive Case Study Title Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-4">
          <span className="text-cyber-blue font-mono text-xs uppercase tracking-widest font-black block">
            // DESIGNATION: {data.client.toUpperCase()}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            {data.title}
          </h1>
          <p className="text-gray-400 text-lg font-light leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Floating High-Contrast Metrics Panel */}
        <div className="bg-cyber-gray-dark/40 border border-white/5 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 diagonal-hashes opacity-5 pointer-events-none" />
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-gray-500 block uppercase tracking-widest">
              {data.statHeroLabel.toUpperCase()}
            </span>
            <span className="text-3xl md:text-4xl font-mono font-extrabold text-white tracking-tight block text-glow-red select-all">
              {data.statHero}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-6">
            <div>
              <span className="text-gray-500 font-mono text-[8px] block uppercase">Category</span>
              <span className="text-xs font-bold text-white uppercase">{data.category}</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono text-[8px] block uppercase">Deployed</span>
              <span className="text-xs font-bold text-white">{data.year}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 font-mono text-[8px] block uppercase">Audit Lock</span>
              <span className="text-xs font-bold text-green-400 uppercase">Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-navigation tabs */}
      <div className="flex border-b border-white/10 mb-8 self-start gap-1">
        {(['OVERVIEW', 'SPECIFICATION', 'SIMULATION'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-mono text-[10px] tracking-widest uppercase transition-all relative cursor-pointer ${
              activeTab === tab
                ? 'text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-blue"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 4. Tab Content Sections */}
      <div className="min-h-[500px]">
        {activeTab === 'OVERVIEW' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left/Middle Column: Problem & Solutions */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Detailed Explanation */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="text-cyber-blue w-5 h-5" />
                  Executive Summary
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-sans">
                  {data.description}
                </p>
              </div>

              {/* Staggered Challenge vs Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div className="space-y-3 bg-white/[0.01] border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-wider font-bold">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    The Tactical Challenge
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    {data.challenge}
                  </p>
                </div>

                <div className="space-y-3 bg-cyber-blue/5 border border-cyber-blue/15 rounded-lg p-6">
                  <div className="flex items-center gap-2 text-cyber-blue font-mono text-xs uppercase tracking-wider font-bold">
                    <CheckCircle2 className="w-4 h-4 text-cyber-blue" />
                    How We Engineered It
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                    {data.solution}
                  </p>
                </div>
              </div>

              {/* Technical Takeaway */}
              <div className="bg-gradient-to-r from-cyber-gray-light to-transparent border border-white/5 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1 max-w-xl">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500">
                    Sovereign Outcome
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    "{data.keyTakeaway}"
                  </p>
                </div>
                <button
                  onClick={onBookCall}
                  className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-[10px] transition-all hover:bg-gray-100 shrink-0 cursor-pointer"
                >
                  Deploy Architecture
                </button>
              </div>

            </div>

            {/* Right Side Column: Stakeholder Metadata & Compliance Seals */}
            <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-8">
              
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  SYSTEM DISPATCH DATA
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-gray-500" /> Stakeholders
                    </span>
                    <span className="text-xs text-white font-semibold text-right max-w-[180px] truncate">{data.stakeholders}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" /> Target Date
                    </span>
                    <span className="text-xs text-white font-semibold">{data.year} UTC</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                      <BarChart3 className="w-3.5 h-3.5 text-gray-500" /> Operational Severity
                    </span>
                    <span className="text-xs text-red-500 font-extrabold uppercase font-mono">Mission Critical</span>
                  </div>
                </div>
              </div>

              {/* Compliance Seals checklist */}
              <div className="space-y-4 p-5 bg-black/40 border border-white/5 rounded-lg">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-cyber-blue font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  VERIFIED AUDITS
                </h4>
                <div className="space-y-3">
                  {data.compliance.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-400 leading-tight">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[9px] font-mono text-gray-500">
                    <span>SEAL HASH RATIO: COMPLIANT</span>
                    <span className="text-green-400">100% OK</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'SPECIFICATION' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left side: Code View Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-gray-500 tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyber-blue" />
                  CORE PROTOCOL SCHEMA
                </span>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-sm text-[9px] cursor-pointer transition-colors"
                >
                  {copiedSnippet ? 'SIGNED & COPIED ✔' : 'COPY SPEC SNIPPET'}
                </button>
              </div>

              {/* Simulated Terminal Window */}
              <div className="rounded-lg border border-white/10 bg-black overflow-hidden font-mono text-xs text-gray-300">
                <div className="bg-cyber-gray-dark px-4 py-2 flex items-center justify-between border-b border-white/5 select-none text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-gray-500">hellware_blueprint_v4.2.ts</span>
                </div>
                <pre className="p-4 overflow-x-auto selection:bg-cyber-blue/30 max-h-[420px] leading-relaxed">
                  <code>{data.codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Right side: Key Architecture Blocks */}
            <div className="space-y-6">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                ARCHITECTURAL SPEC PIERS
              </h4>
              
              <div className="space-y-4">
                {data.architecturePoints.map((item, idx) => (
                  <div key={idx} className="bg-white/[0.01] border-l-2 border-cyber-blue border-y border-r border-white/5 p-4 rounded-r-lg space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-white block">
                      0{idx + 1} — {item.title.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'SIMULATION' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Interactive Control panel (Cols 1-5) */}
            <div className="lg:col-span-5 bg-cyber-gray-dark/40 border border-white/5 rounded-xl p-6 space-y-8 h-fit">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyber-blue" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">CONTROL TUNER</span>
                </div>
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-3 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer ${
                    isSimulating 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {isSimulating ? '● ON: ACTIVE_FLOW' : '○ HALT_SIMULATOR'}
                </button>
              </div>

              {/* Slider 1: Ingress Scan Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-gray-400 uppercase tracking-wider">SECURE DETECT THRESHOLD</span>
                  <span className="text-white font-bold">{simFilterThreshold}% Rigor</span>
                </div>
                <input 
                  type="range" 
                  min="55" 
                  max="99" 
                  value={simFilterThreshold} 
                  onChange={(e) => setSimFilterThreshold(Number(e.target.value))}
                  className="w-full accent-cyber-blue cursor-ew-resize bg-white/10 h-1.5 rounded-sm"
                />
                <p className="text-[9px] text-gray-500 leading-none">Sets scanning strictness filters for dynamic intake matrices.</p>
              </div>

              {/* Slider 2: Clustered Node Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-gray-400 uppercase tracking-wider">COMPUTE NODE CLUSTERS</span>
                  <span className="text-white font-bold">{simActiveNodes} Pools</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="8" 
                  value={simActiveNodes} 
                  onChange={(e) => setSimActiveNodes(Number(e.target.value))}
                  className="w-full accent-cyber-blue cursor-ew-resize bg-white/10 h-1.5 rounded-sm"
                />
                <p className="text-[9px] text-gray-500 leading-none">Spins telemetry load instances to manage operational traffic buffers.</p>
              </div>

              {/* Parameter Select Mode */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-gray-400 block uppercase tracking-wider">{data.customParamLabel.toUpperCase()} MODE</span>
                <div className="grid grid-cols-3 gap-2">
                  {data.customParams.map((param) => (
                    <button
                      key={param}
                      onClick={() => setCustomParam(param)}
                      className={`py-1.5 rounded border font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                        customParam === param
                          ? 'border-cyber-blue bg-cyber-blue/15 text-white font-bold'
                          : 'border-white/5 hover:border-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      {param}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time calculated telemetry indicator items */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="p-3 bg-black/40 border border-white/5 rounded">
                  <span className="text-[8px] font-mono text-gray-500 block uppercase">NODE EFFICIENCY</span>
                  <span className={`text-lg font-mono font-bold ${simHealthRatio > 92 ? 'text-green-400' : 'text-orange-400'}`}>
                    {simHealthRatio}%
                  </span>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded">
                  <span className="text-[8px] font-mono text-gray-500 block uppercase">EST. SCAN LATENCY</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {(1.1 * (simActiveNodes > 0 ? (8 / simActiveNodes) : 4)).toFixed(2)} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Logs Panel Showcase (Cols 6-12) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-black border border-white/10 rounded-xl overflow-hidden font-mono h-[420px]">
              
              {/* Log Panel header */}
              <div className="bg-cyber-gray-dark px-4 py-3 border-b border-white/10 flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
                  <span className="text-white font-bold uppercase tracking-wider">LIVE TELEMETRY STACK LOG</span>
                </div>
                <span className="text-green-400 uppercase text-[9px]">SOCKET_CONN_3000: UP</span>
              </div>

              {/* Console Logs lists */}
              <div className="p-4 flex-1 overflow-y-auto space-y-1.5 text-left text-green-400 text-[10px] leading-relaxed scrollbar-thin">
                {simLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 font-mono items-start select-text selection:bg-green-500/20 selection:text-white">
                    <span className="text-gray-500 font-semibold select-none">[{idx}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Simulated network traffic graph lines */}
              <div className="h-16 border-t border-white/10 bg-cyber-gray-dark/20 p-2 flex items-end gap-1 overflow-hidden pointer-events-none select-none">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyber-blue rounded-t-sm"
                    style={{ 
                      height: `${Math.max(12, Math.floor(Math.sin((i + Date.now() / 1000)) * 25 + 40))}%`,
                      opacity: isSimulating ? 0.3 + (i / 50) : 0.08
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
