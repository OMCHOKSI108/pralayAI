/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  compliance: string[];
  description: string;
  techStack: string[];
  metrics: { label: string; value: string }[];
  graphicType: 'pipeline' | 'transaction' | 'ledger' | 'shield';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  iconName: string;
  technicalSpecs: string[];
  frameworks: string[];
}

export interface ProcessPhase {
  phase: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
  iconName: string;
}

export interface Booking {
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  preferredTime: string;
  complianceNeeds: string[];
}
