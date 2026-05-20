/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Shield, Check, Send, AlertTriangle } from 'lucide-react';
import { Booking } from '@/data/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPLIANCE_OPTIONS = ['SOC 2', 'HIPAA', 'ISO 27001', 'PCI DSS', 'GDPR', 'CMMC'];
const TIME_SLOTS = ['09:00 AM', '11:00 AM', '01:30 PM', '03:30 PM', '05:00 PM'];
// Mock available workdays in May 2026
const AVAILABLE_DAYS = [21, 22, 25, 26, 27, 28, 29];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form & Compliance, 2: Date & Time, 3: Success Screen
  const [formData, setFormData] = useState<Booking>({
    name: '',
    email: '',
    company: '',
    projectDescription: '',
    preferredTime: '',
    complianceNeeds: [],
  });
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sysLog, setSysLog] = useState<string[]>([]);

  const toggleCompliance = (item: string) => {
    setFormData(prev => ({
      ...prev,
      complianceNeeds: prev.complianceNeeds.includes(item)
        ? prev.complianceNeeds.filter(i => i !== item)
        : [...prev.complianceNeeds, item]
    }));
  };

  const handleStep1Next = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;
    setStep(2);
  };

  const executeSecureBooking = async () => {
    if (!selectedDay || !selectedTime) return;
    setIsSubmitting(true);
    
    // Simulate high-security terminal logging logs
    const logs = [
      'Establishing secure TLS/AES negotiation tunnel...',
      'Mapping cryptographic key exchange pairs...',
      'Ingesting target project architecture briefs...',
      `Validating regulatory compliance requirements: [ ${formData.complianceNeeds.join(', ') || 'None'} ]`,
      `Syncing secure slot calendars for May ${selectedDay}, 2026 at ${selectedTime}...`,
      'Configuring dual-signature handshake state...',
      'Deployment schedule committed to decentralized ledger.',
      'SUCCESS: Secure Handshake Established.'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setSysLog(prev => [...prev, logs[i]]);
    }

    setIsSubmitting(false);
    setStep(3);
  };

  const resetModal = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      company: '',
      projectDescription: '',
      preferredTime: '',
      complianceNeeds: [],
    });
    setSelectedDay(null);
    setSelectedTime('');
    setSysLog([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="booking-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { onClose(); resetModal(); }}
            className="absolute inset-0 bg-cyber-dark/95 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-cyber-gray-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-cyber-blue/5 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-cyber-dark/40">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-cyber-blue animate-pulse rounded-full" />
                <h3 className="font-mono text-sm tracking-widest text-white uppercase">
                  HELLWARE // SECURE MEETING DISPATCH
                </h3>
              </div>
              <button
                onClick={() => { onClose(); resetModal(); }}
                className="text-gray-400 hover:text-white transition-colors duration-150 p-1 rounded-md hover:bg-white/5 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress bar */}
            {step < 3 && (
              <div className="h-1 bg-white/5 w-full relative flex">
                <div 
                  className="h-full bg-cyber-blue transition-all duration-300" 
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            )}

            {/* Content body */}
            <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleStep1Next}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-xl font-display font-semibold text-white mb-2">
                        What system are we engineering?
                      </h4>
                      <p className="text-sm text-gray-400">
                        Share details about your compliance, regulatory scope, or mission-critical tech ambitions. All data transmitted is encrypted end-to-end.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase text-gray-400">Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          placeholder="Agent Name"
                          className="w-full bg-cyber-dark border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all duration-150"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase text-gray-400">Company / Organization</label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                          placeholder="Company, Corp, Agency"
                          className="w-full bg-cyber-dark border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all duration-150"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-gray-400">Secure Direct Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="agent@company.com"
                        className="w-full bg-cyber-dark border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all duration-150"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-gray-400">
                        Required Compliance Regimes (Optional)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {COMPLIANCE_OPTIONS.map(item => {
                          const active = formData.complianceNeeds.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleCompliance(item)}
                              className={`flex items-center justify-between border rounded px-3 py-2 text-xs font-mono transition-all duration-150 ${
                                active
                                  ? 'border-cyber-blue bg-cyber-blue/10 text-white shadow-sm shadow-cyber-blue/20'
                                  : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                              }`}
                            >
                              <span>{item}</span>
                              {active && <Check className="w-3.5 h-3.5 text-cyber-blue" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-gray-400">
                        Project Ambition & Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={formData.projectDescription}
                        onChange={e => setFormData(p => ({ ...p, projectDescription: e.target.value }))}
                        placeholder="E.g., SOC 2 compliant LLM search microservice or High frequency trading block..."
                        className="w-full bg-cyber-dark border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none resize-none transition-all duration-150"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="w-full md:w-auto bg-cyber-blue hover:bg-cyber-blue/90 text-white font-mono text-xs uppercase px-8 py-3.5 rounded font-semibold flex items-center justify-center gap-2 transition-all duration-150 pointer-events-auto cursor-pointer shadow-lg hover:shadow-cyber-blue/20 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <span>Select Date & Time</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-xl font-display font-semibold text-white mb-2">
                        Select Secure Time Slot
                      </h4>
                      <p className="text-sm text-gray-400">
                        Choose an available date in May 2026. Greyed out dates are already booked or reserved for high-priority live ops.
                      </p>
                    </div>

                    {/* Date Picker Grid */}
                    <div className="space-y-3">
                      <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyber-blue" />
                        May 2026 Calendar
                      </span>
                      <div className="grid grid-cols-7 gap-1 border border-white/5 p-4 rounded-lg bg-cyber-dark/60">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center font-mono text-xs font-bold text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                        {/* Empty squares for offsets in May 2026 (Starts on a Friday) */}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={`offset-${i}`} />
                        ))}
                        {Array.from({ length: 31 }).map((_, i) => {
                          const dayNum = i + 1;
                          const isAvailable = AVAILABLE_DAYS.includes(dayNum);
                          const isSelected = selectedDay === dayNum;
                          return (
                            <button
                              key={`day-${dayNum}`}
                              disabled={!isAvailable}
                              onClick={() => setSelectedDay(dayNum)}
                              className={`text-center py-2 text-xs font-mono rounded transition-all duration-150 ${
                                isSelected
                                  ? 'bg-cyber-blue text-white font-bold scale-105'
                                  : isAvailable
                                    ? 'hover:bg-white/10 text-white cursor-pointer'
                                    : 'text-gray-600 cursor-not-allowed opacity-35'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Picker */}
                    {selectedDay && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyber-blue" />
                          Available Times on May {selectedDay}, 2026
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {TIME_SLOTS.map(time => {
                            const active = selectedTime === time;
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`border rounded py-2.5 text-[11px] font-mono transition-all duration-150 ${
                                  active
                                    ? 'border-cyber-blue bg-cyber-blue/15 text-white font-bold'
                                    : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* System Log / Submitting Terminal simulation */}
                    {isSubmitting && (
                      <div className="bg-black/80 font-mono text-xs p-4 rounded-md border border-white/5 space-y-1 text-green-400 h-32 overflow-y-auto">
                        {sysLog.map((log, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-gray-500">[{i}]</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase py-3.5 rounded border border-white/10 transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={executeSecureBooking}
                        disabled={isSubmitting || !selectedDay || !selectedTime}
                        className="flex-1 bg-cyber-blue hover:bg-cyber-blue/90 disabled:bg-gray-700 disabled:text-gray-400 text-white font-mono text-xs uppercase py-3.5 rounded font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed shadow-lg"
                      >
                        {isSubmitting ? 'SECURE CONTRACT...' : 'COMMIT DISPATCH LOCK'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-6"
                  >
                    <div className="w-16 h-16 bg-cyber-blue/15 border border-cyber-blue/40 rounded-full flex items-center justify-center mx-auto text-cyber-blue animate-pulse">
                      <Shield className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-2xl font-display font-semibold text-white">
                        Discovery Session Dispatch Locked
                      </h4>
                      <p className="text-sm text-gray-400 max-w-md mx-auto">
                        Your secure session handshake on May {selectedDay}, 2026 at {selectedTime} is registered. A cryptographically signed calendar invite has been dispatched to <span className="text-white font-mono">{formData.email}</span>.
                      </p>
                    </div>

                    {/* Technical payload summary */}
                    <div className="bg-cyber-dark border border-white/5 rounded-lg p-5 max-w-sm mx-auto text-left space-y-1.5 font-mono text-[11px] text-gray-400 shadow-inner">
                      <div className="flex justify-between border-b border-white/5 pb-1 mb-2">
                        <span className="text-white font-bold">MUTUAL DEPLOY PROTOCOL</span>
                        <span className="text-cyber-blue">ACTIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CLIENT:</span>
                        <span className="text-white">{formData.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ENGINEERED SECURE WINDOW:</span>
                        <span className="text-white">MAY {selectedDay}, {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>COMPLIANCE LAYERS:</span>
                        <span className="text-white">{formData.complianceNeeds.join(', ') || 'NONE DETECTED'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SIGNATURE STATUS:</span>
                        <span className="text-green-500 font-bold">VERIFIED_HANDSHAKE</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => { onClose(); resetModal(); }}
                        className="w-full max-w-xs bg-white text-cyber-dark hover:bg-gray-200 font-mono text-xs uppercase px-8 py-3.5 rounded font-bold transition-all duration-150 cursor-pointer"
                      >
                        CLOSE SECURE SHELL
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
