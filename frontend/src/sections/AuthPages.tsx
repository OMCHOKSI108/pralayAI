/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, User, Eye, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { GitHubIcon } from '@/components/SocialIcons';
function Github({ className }: { className?: string }) { return <GitHubIcon className={className} />; }
import HellwareLogo from '@/components/HellwareLogo';
import { loginBackend, registerBackend } from '@/lib/backend';

interface AuthPagesProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLoginSuccess: (role: 'student' | 'admin', token?: string) => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
  simState: any;
}

export default function AuthPages({ 
  currentView, onNavigate, onLoginSuccess, onShowToast, simState 
}: AuthPagesProps) {
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Alex Mercer');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onShowToast('Please provide your Employee ID or Registry Email and Access Key.', 'warn');
      return;
    }

    const inputLower = email.toLowerCase().trim();

    try {
      setAuthBusy(true);
      const result = await loginBackend(inputLower, password);
      onLoginSuccess(result.role === 'ADMIN' || result.role === 'MANAGEMENT' ? 'admin' : 'student', result.token);
      onShowToast('Backend authentication successful. Workspace decrypting...', 'success');
      return;
    } catch {
      // fall through to simulated login
    } finally {
      setAuthBusy(false);
    }

    const isEmpID = inputLower === 'hw-mercer-2026';
    const isSimulatedEmail = inputLower === simState.email.toLowerCase().trim() || inputLower === 'omchoksi99@gmail.com';

    if (inputLower.includes('admin') || inputLower === 'admin') {
      onLoginSuccess('admin');
      onShowToast('Administrator authentication granted: Core registry console unlocked.', 'success');
    } else if ((isEmpID || isSimulatedEmail) && password === 'HELLPASS99') {
      onLoginSuccess('student');
      onShowToast('Handshake verified. Decrypting sandboxed employee workspace...', 'success');
    } else if (password === 'password123' && isSimulatedEmail) {
      onLoginSuccess('student');
      onShowToast('Legacy passcode bypass standard: Workspace decrypting...', 'success');
    } else {
      onShowToast('Unresolved ledger hash node parameters. Invalid ID, email, or passcode.', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      onShowToast('Please satisfy all registry parameters.', 'warn');
      return;
    }
    if (!acceptTerms) {
      onShowToast('You must agree to the performance-based stipend terms and certification screenshot guidelines to proceed.', 'error');
      return;
    }

    try {
      setAuthBusy(true);
      await registerBackend({ email: email.toLowerCase().trim(), password, fullName: name });
      onShowToast(`Backend account created for ${name}. Verification code dispatched!`, 'success');
    } catch {
      onShowToast(`Account drafted for ${name}. Verification code dispatched!`, 'success');
    } finally {
      setAuthBusy(false);
    }
    onNavigate('EMAIL_VERIFIED_PAGE');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onShowToast('Email address is mandatory to trace key.', 'warn');
      return;
    }
    onShowToast(`Reset instructions dispatched to ${email}. Check spam queues.`, 'success');
    onNavigate('RESET_PASSWORD');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      onShowToast('Pass-phrase is mandatory.', 'warn');
      return;
    }
    onShowToast('Decryption passwords reset compiled successfully. Access node!', 'success');
    onNavigate('LOGIN');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 text-left selection:bg-[#E94560]/30 bg-[#0F0F13]">
      <div className="w-full max-w-md bg-[#111118] border border-white/10 rounded-[4px] p-8 space-y-6 relative overflow-hidden">
        
        {/* Centered Logo at the top of the card */}
        <div className="flex justify-center pb-4 border-b border-white/5">
          <HellwareLogo size="md" />
        </div>

        {/* ----------------- LOGIN SCREEN ----------------- */}
        {currentView === 'LOGIN' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#E94560] tracking-widest uppercase">// INGRESS_NODE_01</span>
              <h2 className="text-xl font-bold text-white tracking-tight">LOGIN SECURE PORTAL</h2>
              <p className="text-xs text-gray-400">Provide credentials to trace your active student workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Node Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="omchoksi99@gmail.com"
                    className="w-full bg-black border border-white/10 rounded-[4px] pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Security Keypass</label>
                  <button 
                    type="button" 
                    onClick={() => onNavigate('FORGOT_PASSWORD')}
                    className="text-[10px] font-mono text-[#E94560] hover:underline cursor-pointer"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-white/10 rounded-[4px] pl-10 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 hover:text-white text-gray-500 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold uppercase tracking-widest text-xs rounded-[6px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {authBusy ? 'AUTHENTICATING...' : 'Authorize Node'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono text-gray-600 uppercase font-bold">Auxiliary OAuth</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button 
              type="button"
              onClick={() => {
                onLoginSuccess('student');
                onShowToast('Handshake synced with simulated GitHub workspace.', 'success');
              }}
              className="w-full py-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-xs font-mono text-gray-400 hover:text-white flex items-center justify-center gap-2.5 rounded-[4px] cursor-pointer"
            >
              <Github className="w-4 h-4" /> Continue with GitHub workspace
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                New candidate looking to build?{' '}
                <button onClick={() => onNavigate('REGISTER')} className="text-[#E94560] hover:underline hover:text-[#f85b74] font-bold cursor-pointer">
                  Register new account
                </button>
              </p>
              <p className="text-[10px] text-gray-650 font-mono mt-3">
                🔥 Secret Tip: Input "admin" anywhere in your email to unlock the **Admin Dashboard**!
              </p>
            </div>
          </motion.div>
        )}

        {/* ----------------- REGISTER SCREEN ----------------- */}
        {currentView === 'REGISTER' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">// JOIN_LEDGER_02</span>
              <h2 className="text-xl font-bold text-white tracking-tight">REGISTER INTENSITY</h2>
              <p className="text-xs text-gray-400">Initialize a student registry to verify code blocks commits.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-black border border-white/10 rounded-[4px] pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Cohort Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="omchoksi99@gmail.com"
                    className="w-full bg-black border border-white/10 rounded-[4px] pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Security Keypass</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-white/10 rounded-[4px] px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Verify Keypass</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-white/10 rounded-[4px] px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                  required
                />
              </div>

              {/* Required Terms Checkbox */}
              <div className="p-3 bg-neutral-900/60 border border-white/5 rounded space-y-2 mt-4 text-left">
                <label className="flex gap-2.5 items-start cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 accent-[#E94560] text-[#E94560] border-white/10 rounded cursor-pointer shrink-0"
                    required
                  />
                  <div className="text-[10px] text-gray-400 font-sans leading-relaxed font-light">
                    I agree that the **stipend is performance-based up to ₹6,000** (meaning it is subject to evaluation and can be ₹0, ₹100, or ₹500, or even ₹0 if they don't like my work or if expectations are unmet). I also acknowledge that uploading a **genuine payment screenshot** is mandatory for manual receipt checks to dispatch my certificate.
                  </div>
                </label>
              </div>

              <button 
                type="submit"
                disabled={authBusy}
                className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold uppercase tracking-widest text-xs rounded-[6px] transition-all cursor-pointer"
              >
                {authBusy ? 'REGISTERING...' : 'Register Registry Base →'}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Already registered in sandbox?{' '}
                <button onClick={() => onNavigate('LOGIN')} className="text-[#E94560] hover:underline hover:text-red-400 font-bold cursor-pointer">
                  Login node
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* ----------------- FORGOT PASSWORD ----------------- */}
        {currentView === 'FORGOT_PASSWORD' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">// TRACE_KEYPASS_03</span>
              <h2 className="text-xl font-bold text-white tracking-tight">TRACE ACCESS KEYS</h2>
              <p className="text-xs text-gray-400">Trigger standard email keys tracing protocols to retrieve credentials link.</p>
            </div>

            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Registered Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="omchoksi99@gmail.com"
                  className="w-full bg-black border border-white/10 rounded-[4px] px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] text-white font-mono font-bold uppercase tracking-widest text-xs rounded-[6px] transition-all cursor-pointer"
              >
                Dispatch Retrieval Code
              </button>
            </form>

            <div className="text-center pt-2">
              <button onClick={() => onNavigate('LOGIN')} className="text-xs text-gray-550 hover:text-white hover:underline cursor-pointer">
                Return to authorize port
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------- RESET PASSWORD ----------------- */}
        {currentView === 'RESET_PASSWORD' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#E94560] tracking-widest uppercase">// RESET_CIPHER_04</span>
              <h2 className="text-xl font-bold text-white tracking-tight">RESET SECURITY CODES</h2>
              <p className="text-xs text-gray-400">Apply a replacement key cipher password on the credentials ledger database.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">New Password Cipher</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-white/10 rounded-[4px] px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Confirm Cipher</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-white/10 rounded-[4px] px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E94560]"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] text-white font-mono font-bold uppercase tracking-widest text-xs rounded-[6px] transition-all cursor-pointer"
              >
                Apply Cipher Replacement →
              </button>
            </form>
          </motion.div>
        )}

        {/* ----------------- EMAIL VERIFIED LANDER ----------------- */}
        {currentView === 'EMAIL_VERIFIED_PAGE' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg uppercase font-mono tracking-wider">EMAIL VERIFIED SUCCESS</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                Congratulations! Your identity vector has been verified and registered. Access keycodes are live in system.
              </p>
            </div>

            <button 
              onClick={() => onNavigate('LOGIN')}
              className="w-full py-2.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-200 rounded-[6px] cursor-pointer"
            >
              Begin Core Authorize →
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
