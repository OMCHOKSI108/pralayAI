/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu, X, LogIn, LayoutGrid, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HellwareLogo from './HellwareLogo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
  userRole: 'student' | 'admin' | null;
  onLogout: () => void;
}

export default function Navbar({ 
  currentView, onNavigate, isLoggedIn, userRole, onLogout 
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Spaced and cleaned up links to eliminate redundancy
  const links = [
    { label: 'About', view: 'ABOUT' },
    { label: 'Manifesto', view: 'ABOUT' },
    { label: 'How It Works', view: 'HOW_IT_WORKS' },
    { label: 'Projects Registry', view: 'SHOWCASE' },
    { label: 'Verify Credentials', view: 'VERIFY' }
  ];

  return (
    <>
      <nav 
        className="fixed top-0 left-0 w-full z-40 bg-black border-b border-white/[0.05] h-16 flex items-center select-none" 
        id="hellware-navbar"
      >
        {/* Alignment layout constraints matching OceanLab */}
        <div className="max-w-7xl w-full mx-auto px-8 md:px-12 flex items-center justify-between">
          
          {/* LEFT SECTION: Logo and Flat Links */}
          <div className="flex items-center gap-10">
            <button
              onClick={() => {
                onNavigate('LANDING');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none text-left"
            >
              <HellwareLogo size="sm" iconOnly />
              <span className="font-sans font-extrabold text-base text-white tracking-tight group-hover:text-[#E94560] transition-colors">
                Hellware
              </span>
            </button>

            {/* Flat, minimal navigation links right next to branding */}
            <div className="hidden md:flex items-center gap-6">
              {links.map((link, idx) => {
                const active = currentView === link.view;
                return (
                  <button
                    key={`${link.label}-${idx}`}
                    onClick={() => {
                      onNavigate(link.view);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`font-sans text-xs font-semibold cursor-pointer py-1 px-1.5 transition-colors duration-200 select-none bg-transparent focus:outline-none ${
                      active ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: CTA Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <button 
                onClick={() => onNavigate(userRole === 'admin' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD')}
                className="bg-white hover:bg-neutral-200 text-black font-sans text-xs font-bold py-2 px-5 rounded-none cursor-pointer tracking-wider transition-colors uppercase h-9 flex items-center justify-center"
              >
                Open Terminal
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => onNavigate('LOGIN')}
                  className="text-neutral-400 hover:text-white font-sans text-xs font-semibold cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                
                <button
                  onClick={() => onNavigate('APPLY')}
                  className="bg-white hover:bg-[#E94560] text-black hover:text-white font-sans text-xs font-bold py-2 px-5 rounded-none cursor-pointer tracking-wide transition-all duration-200 h-9 flex items-center justify-center"
                >
                  Developer Access
                </button>
              </div>
            )}
          </div>

          {/* MOBILE actions toggle cabinet button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-neutral-400 hover:text-white hover:bg-white/[0.02] transition-all cursor-pointer"
            aria-label="Toggle drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#E94560]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE Sliding Cabinet Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 h-auto top-16 z-30 bg-black border-b border-white/[0.06] p-6 pb-8 space-y-6 flex flex-col text-left font-sans"
            style={{ touchAction: 'none' }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.15em] mb-1 block">
                MAIN SERVICES INDEX
              </span>
              {links.map((link, idx) => {
                const active = currentView === link.view;
                return (
                  <button
                    key={`${link.label}-mob-${idx}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.view);
                    }}
                    className={`py-2 text-[11.5px] font-semibold uppercase tracking-wider cursor-pointer flex justify-between items-center transition-colors ${
                      active ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(userRole === 'admin' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD');
                  }}
                  className="w-full py-3 bg-white text-black font-bold text-center uppercase tracking-wider text-[10px] rounded-none cursor-pointer"
                >
                  Open Terminal Dashboard
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('LOGIN'); }}
                    className="w-full py-2.5 bg-neutral-900 border border-white/5 text-neutral-200 font-bold tracking-wider uppercase text-[10px] rounded-none cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('APPLY'); }}
                    className="w-full bg-white text-black font-bold py-2.5 text-center uppercase tracking-wider text-[10px] rounded-none cursor-pointer"
                  >
                    Get Access
                  </button>
                </div>
              )}
            </div>
            
            <div className="border border-white/[0.04] p-3 rounded-[4px] bg-neutral-900/30 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="font-mono text-[8px] text-neutral-500 uppercase leading-tight font-bold">
                SECURE SHA256 ALIGNMENT STATE Active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
