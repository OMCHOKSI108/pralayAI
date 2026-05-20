/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  ExternalLink, Code, ShieldCheck, Award, 
  MapPin, Calendar, Heart, Terminal, Cpu, Clock, CheckCircle2 
} from 'lucide-react';
import { GitHubIcon, LinkedinIcon } from '@/components/SocialIcons';
import { REQ_CERTIFICATE, INITIAL_PROJECTS, REQ_BADGES } from '@/data/mockData';

function Github({ className }: { className?: string }) { return <GitHubIcon className={className} />; }
function Linkedin({ className }: { className?: string }) { return <LinkedinIcon className={className} />; }

interface PublicProfileProps {
  username?: string;
  onNavigateHome: () => void;
}

export default function PublicProfile({ 
  username = 'alex_mercer', onNavigateHome 
}: PublicProfileProps) {
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-left select-none space-y-12">
      
      {/* Top action header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">// SECURED PUBLIC PROOF-OF-WORK LEDGER</span>
        <button 
          onClick={onNavigateHome}
          className="text-[10px] font-mono text-gray-400 hover:text-white hover:underline cursor-pointer"
        >
          [ Return to Main Portal ]
        </button>
      </div>

      {/* Main card representation containing biodata and picture */}
      <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        
        {/* Subtle decorative absolute indicators */}
        <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black tracking-wider">
          VERIFIED FELLOW // COHORT 01
        </span>

        {/* Profile Image with ambient drop shadows */}
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" 
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-neutral-950 shadow-[0_0_40px_rgba(255,255,255,0.05)]" 
            alt="Alex Mercer Profile"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-neutral-950 flex items-center justify-center" title="Systems Check Approved">
            <CheckCircle2 className="w-4 h-4 text-black font-black" />
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">ALEXANDER MERCER</h2>
            <span className="text-[10px] font-mono text-red-500 uppercase font-black tracking-widest block font-display">// CYBERSECURITY ENGINEERING SPECIALIST</span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed font-light max-w-lg">
            Undergraduate software development practitioner modeling zero-trust access tunnels, isolated decryption ring allocations, gRPC telemetry synchronizations and private networks compliance matrices.
          </p>

          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500 uppercase">
              <MapPin className="w-3 h-3 text-red-500" /> Delhi, BBL
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500 uppercase">
              <Calendar className="w-3 h-3 text-cyan-400" /> Active since May 2026
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 justify-center md:justify-start pt-2">
            <a href="https://github.com/alex-mercer" target="_blank" rel="noreferrer" className="p-2 bg-neutral-900 border border-white/10 hover:border-white/30 rounded text-gray-400 hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com/in/alex-mercer" target="_blank" rel="noreferrer" className="p-2 bg-neutral-900 border border-white/10 hover:border-white/30 rounded text-gray-400 hover:text-white transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Skills tags and general details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
        
        {/* Left pane: Skills and Unlocked Badges (Cols 1-4) */}
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-2">
            <span className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">OPERATIONAL SKILL MAPS</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['React', 'TypeScript', 'Node.js', 'Rust', 'Docker', 'Linux network security', 'HMAC SHA256', 'gRPC Protocol'].map((sk) => (
                <span key={sk} className="bg-white/5 border border-white/5 font-mono text-[9.5px] text-gray-400 px-2 py-0.5 rounded uppercase">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Unlocked badges list */}
          <div className="space-y-3 pt-4 border-t border-white/5 text-left">
            <span className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">COMPILER STAMP STAMPS</span>
            <div className="grid grid-cols-2 gap-2">
              {REQ_BADGES.slice(0, 3).map((bdg) => (
                <div key={bdg.id} className="p-3 bg-neutral-900/40 border border-white/5 rounded-lg flex flex-col justify-between h-20">
                  <Award className="w-5 h-5 text-red-500" />
                  <span className="text-[9px] font-mono text-gray-300 uppercase truncate font-bold leading-tight mt-1">{bdg.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: Completed Projects items (Cols 5-12) */}
        <div className="md:col-span-8 space-y-6">
          <span className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">COMPLETED PROJECT BUILDS REGISTER</span>
          
          <div className="space-y-4">
            {INITIAL_PROJECTS.slice(0, 2).map((p) => (
              <div key={p.id} className="p-6 bg-neutral-950/60 border border-white/5 rounded-xl space-y-4 hover:border-red-500/20 transition-all flex flex-col justify-between h-52 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-red-500 uppercase font-black">
                    <span>{p.domain}</span>
                    <span className="text-gray-500">[ COMPLIANT APPROVED ]</span>
                  </div>
                  <h4 className="font-bold text-base text-white uppercase tracking-tight">{p.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-light truncate">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex gap-1">
                    {p.techStack.map((ts, index) => (
                      <span key={index} className="text-[8.5px] font-mono bg-white/5 text-gray-400 px-1.5 rounded">{ts}</span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors" title="View Code">
                      <Code className="w-4 h-4" />
                    </a>
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors" title="Open Deployed Proxy">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verification certificate snippet signature */}
          <div className="p-6 bg-neutral-900 border border-amber-500/20 rounded-xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 border-l border-b border-amber-500/20 px-2 py-0.5 text-[8px] font-mono uppercase font-black tracking-wider">
              DYNAMIC PROOF-OF-WORK VERIFIED
            </div>
            <div className="flex gap-2 items-center text-[9.5px] font-mono text-amber-500 font-bold uppercase">
              <ShieldCheck className="w-4 h-4" /> SECURE SHIELD HASH Handshake:
            </div>
            <p className="text-xs text-gray-300 font-mono select-all truncate block">
              {REQ_CERTIFICATE.hash}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
