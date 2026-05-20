/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, ArrowUp, Terminal, FileText, Lock, RefreshCw, Award, Mail } from 'lucide-react';
import HellwareLogo from './HellwareLogo';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrolltoTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0b0b0f] pt-16 pb-12 border-t border-white/5 overflow-hidden text-left font-sans select-none z-10 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-12">
          
          {/* Logo & Pitch */}
          <div className="md:col-span-5 space-y-4">
            <button
              onClick={() => {
                onNavigate('LANDING');
                scrolltoTop();
              }}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <HellwareLogo size="sm" />
            </button>
            
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm font-light">
              Hellware is a modern, premium, startup-level experiential learning platform for students. Connect real code repositories, deploy live sandboxes, solve rigorous engineering tasks, and earn verified credentials cards.
            </p>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-3 space-y-3 font-mono text-[11px]">
            <span className="text-gray-500 uppercase tracking-widest font-bold block">PLATFORM RECON</span>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => { onNavigate('LANDING'); scrolltoTop(); }} className="hover:text-white hover:underline transition-colors cursor-pointer">[ COHORT ENTRY ]</button></li>
              <li><button onClick={() => { onNavigate('HOW_IT_WORKS'); scrolltoTop(); }} className="hover:text-white hover:underline transition-colors cursor-pointer">[ ROADMAP SPRINT ]</button></li>
              <li><button onClick={() => { onNavigate('SHOWCASE'); scrolltoTop(); }} className="hover:text-white hover:underline transition-colors cursor-pointer">[ COMPLETED REGISTRY ]</button></li>
            </ul>
          </div>

          {/* Compliance & Legal Policies */}
          <div className="md:col-span-4 space-y-3 font-mono text-[11px]">
            <span className="text-gray-500 uppercase tracking-widest font-bold block">POLICIES LOG FILES</span>
            <div className="space-y-2 text-gray-400 text-left">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <button onClick={() => { onNavigate('TERMS'); scrolltoTop(); }} className="hover:text-white hover:underline transition-all cursor-pointer">Terms & Conditions Agreement</button>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <button onClick={() => { onNavigate('PRIVACY'); scrolltoTop(); }} className="hover:text-white hover:underline transition-all cursor-pointer">Security & Privacy Handshake</button>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <button onClick={() => { onNavigate('REFUND'); scrolltoTop(); }} className="hover:text-white hover:underline transition-all cursor-pointer">Voluntary Refund policies</button>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-red-500" />
                <button onClick={() => { onNavigate('CERT_POLICY'); scrolltoTop(); }} className="hover:text-white hover:underline transition-all cursor-pointer">Certificate Signature Policies</button>
              </div>
            </div>
          </div>

        </div>

        {/* Lower row: Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-[9px] text-gray-500 select-none">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} HELLWARE. COHORT ROSTER VERIFICATIONS ARE ENCRYPTED.</span>
            <div className="hidden sm:inline w-[1px] h-3 bg-white/10" />
            <a
              href="mailto:hellware@atomicmail.io"
              className="inline-flex items-center gap-1.5 text-[#E94560] font-bold hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              hellware@atomicmail.io
            </a>
          </div>

          <button
            onClick={scrolltoTop}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer group"
          >
            <span>BACK TO INGRESS POINT</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-150 text-[#E94560]" />
          </button>

        </div>

      </div>
    </footer>
  );
}
