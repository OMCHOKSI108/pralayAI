/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export default function TechGrid() {
  return (
    <>
      {/* Decorative Left Rail Bar (OceanLab-like) */}
      <div id="tech-rail-left" className="fixed top-0 left-0 h-full w-4 md:w-12 border-r border-white/5 pointer-events-none hidden lg:flex flex-col items-center justify-between py-24 z-20">
        <span className="font-mono text-[9px] tracking-[0.3em] text-gray-500 transform -rotate-90 origin-center select-none uppercase">
          HELLWARE // ENG_UNIT
        </span>
        <div className="flex flex-col gap-8 opacity-45">
          <Cpu className="w-3.5 h-3.5 text-gray-500" />
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <Shield className="w-3.5 h-3.5 text-cyber-blue" />
        </div>
        <span className="font-mono text-[9px] text-gray-600 select-none">
          EST.05
        </span>
      </div>

      {/* Decorative Right Rail Bar (OceanLab-like) */}
      <div id="tech-rail-right" className="fixed top-0 right-0 h-full w-4 md:w-12 border-l border-white/5 pointer-events-none hidden lg:flex flex-col items-center justify-between py-24 z-20">
        <span className="font-mono text-[9px] tracking-[0.3em] text-gray-500 transform rotate-90 origin-center select-none uppercase">
          SECURE_SHIELD_V2.0
        </span>
        <div className="flex flex-col gap-8 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping" />
          <div className="w-1 h-12 bg-white/10 rounded-full" />
        </div>
        <span className="font-mono text-[9px] text-gray-600 select-none">
          07:11:43
        </span>
      </div>
    </>
  );
}
