/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Database, Terminal } from 'lucide-react';

interface CyberLoadingProps {
  onComplete: () => void;
}

export default function CyberLoading({ onComplete }: CyberLoadingProps) {
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    'BOOTING SECURE SHELL HELLWARE_V2.11...',
    'INTEGRATING ENCRYPTED TLS TRANSPORT CACHE...'
  ]);

  useEffect(() => {
    // Increment loading percent
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8 + 3);
      });
    }, 45);

    // Dynamic logging outputs matching loading bar percents
    const logList = [
      'MAP_SEC_ENV: COMPLIANCE CORE STAGING MOUNTED.',
      'INGESTING SOC 2 TYPE II AUDITING MATRICES...',
      'BINDING HIPAA MUTUAL CONTEXT PRIVACIES...',
      'ESTABLISHING IMMUTABLE TRANSACTION BLOCK VAULTS...',
      'SYNCING DIRECTORY LEDGER SYNC STATE: NOMINAL',
      'HELLWARE SECURITY SYSTEM CORE: INGRESS PORT 3000 MOUNTED RUNNING...'
    ];

    let logCounter = 0;
    const logTimer = setInterval(() => {
      if (logCounter < logList.length) {
        setLogs((prev) => [...prev, logList[logCounter]]);
        logCounter++;
      } else {
        clearInterval(logTimer);
      }
    }, 280);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  useEffect(() => {
    if (percent >= 100) {
      const wait = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(wait);
    }
  }, [percent, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        id="cyber-loading-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 bg-cyber-dark flex flex-col justify-between p-8 font-mono text-[11px] text-gray-400 select-none cursor-wait"
      >
        {/* Header corner logs */}
        <div className="flex justify-between items-center text-gray-500 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-white">
            <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
            <span className="font-bold tracking-widest uppercase">HELLWARE BIOS MODULE BOOT</span>
          </div>
          <span className="animate-pulse">SYS_GATE: OK</span>
        </div>

        {/* Real-time Loading Logs (Centered console) */}
        <div className="max-w-2xl w-full mx-auto space-y-2 h-44 overflow-y-auto pt-6 text-left text-green-400">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-600">[{idx}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Bottom Loading Progress Meter */}
        <div className="max-w-xl w-full mx-auto space-y-4">
          <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-white">
            <span>CONSTRUCTING SECURE GATEWAY</span>
            <span className="text-cyber-blue">{percent}%</span>
          </div>

          {/* Graphical Loading Bar */}
          <div className="w-full h-1.5 bg-white/5 border border-white/10 rounded overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-cyber-blue rounded-sm"
              style={{ width: `${percent}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest">
            AUTHENTICATING COMPLIATOR RUNTIME // 2026 UTC
          </p>
        </div>

        {/* Footer info lock */}
        <div className="border-t border-white/5 pt-4 text-center text-gray-600 flex justify-between items-center text-[9px]">
          <span>MUTUAL SIGNATURE CONFIRMED</span>
          <span className="text-cyan-200 uppercase font-black tracking-widest">HELLWARE SECURE CONSOL v2.11</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
