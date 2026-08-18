/**
 * Build vs. Buy vs. Hybrid Decision Engine — DataRev AI Strategy
 * Evaluates client operational constraints across 6 key variables:
 * 1. Internal Engineering Capacity (Low / Medium / High)
 * 2. Deployment Timeline Urgency (< 30 days / 1-3 months / 6+ months)
 * 3. Proprietary IP & Core Differentiation (Standard Utility vs Core Competitive IP)
 * 4. Ongoing Maintenance Capacity (None / Outsourced / Dedicated Team)
 * 5. Data Privacy & Sovereignty Sensitivity (Public Cloud / Restricted / On-Premise & Isolated)
 * 6. Annual Budget Flexibility (Low SaaS OPEX / Capitalized CAPEX / Enterprise Retainer)
 */

export type EngineeringCapacity = 'low' | 'medium' | 'high';
export type TimelineUrgency = 'immediate' | 'medium' | 'long_term';
export type IpDifferentiation = 'utility' | 'differentiator' | 'core_ip';
export type MaintenanceCapacity = 'none' | 'outsourced' | 'dedicated';
export type DataPrivacySensitivity = 'public' | 'restricted' | 'isolated';
export type BudgetFlexibility = 'low_opex' | 'capex' | 'enterprise';

export interface BuildVsBuyInputs {
  engineeringCapacity: EngineeringCapacity;
  timelineUrgency: TimelineUrgency;
  ipDifferentiation: IpDifferentiation;
  maintenanceCapacity: MaintenanceCapacity;
  dataPrivacy: DataPrivacySensitivity;
  budgetFlexibility: BudgetFlexibility;
}

export type ArchitectureRecommendation = 'pure_saas' | 'hybrid_api' | 'custom_build';

export interface TradeOffItem {
  dimension: string;
  saasScore: number; // 1-10
  hybridScore: number; // 1-10
  customScore: number; // 1-10
  explanation: string;
}

export interface BuildVsBuyResult {
  recommendation: ArchitectureRecommendation;
  recommendationTitle: string;
  confidenceScore: number; // 0-100%
  executiveSummary: string;
  scores: {
    saas: number;
    hybrid: number;
    custom: number;
  };
  tradeOffs: TradeOffItem[];
  keyDrivers: string[];
  recommendedRoadmap: {
    phase: string;
    focus: string;
  }[];
}

export function evaluateBuildVsBuy(inputs: BuildVsBuyInputs): BuildVsBuyResult {
  let saasScore = 50;
  let hybridScore = 50;
  let customScore = 50;
  const keyDrivers: string[] = [];

  // 1. Engineering Capacity
  if (inputs.engineeringCapacity === 'low') {
    saasScore += 25;
    hybridScore += 15;
    customScore -= 30;
    keyDrivers.push('Low internal dev team capacity favors SaaS or managed API integration over custom builds.');
  } else if (inputs.engineeringCapacity === 'high') {
    customScore += 25;
    hybridScore += 20;
    saasScore -= 10;
    keyDrivers.push('Strong internal engineering team enables custom architecture and proprietary API orchestration.');
  } else {
    hybridScore += 15;
  }

  // 2. Timeline Urgency
  if (inputs.timelineUrgency === 'immediate') {
    saasScore += 30;
    hybridScore += 15;
    customScore -= 35;
    keyDrivers.push('Urgent deployment timeline (<30 days) requires instant SaaS or pre-built API connectors.');
  } else if (inputs.timelineUrgency === 'long_term') {
    customScore += 20;
    hybridScore += 15;
    keyDrivers.push('Flexible 6+ month roadmap allows for ground-up custom model deployment.');
  } else {
    hybridScore += 10;
  }

  // 3. IP Differentiation
  if (inputs.ipDifferentiation === 'core_ip') {
    customScore += 35;
    hybridScore += 20;
    saasScore -= 30;
    keyDrivers.push('Core competitive IP requirements necessitate proprietary model ownership or fine-tuned weights.');
  } else if (inputs.ipDifferentiation === 'utility') {
    saasScore += 25;
    hybridScore += 10;
    customScore -= 20;
    keyDrivers.push('Standard commodity workflows (e.g. basic document OCR, generic chat) do not justify custom engineering.');
  } else {
    hybridScore += 25;
    keyDrivers.push('Differentiating capabilities benefit from Hybrid API orchestration balancing speed and IP control.');
  }

  // 4. Maintenance Capacity
  if (inputs.maintenanceCapacity === 'none') {
    saasScore += 25;
    customScore -= 30;
  } else if (inputs.maintenanceCapacity === 'dedicated') {
    customScore += 20;
    hybridScore += 15;
  } else {
    hybridScore += 15;
  }

  // 5. Data Privacy & Sovereignty
  if (inputs.dataPrivacy === 'isolated') {
    customScore += 30;
    hybridScore += 15;
    saasScore -= 35;
    keyDrivers.push('Strict air-gapped or isolated data privacy rules mandate VPC or on-premise model hosting.');
  } else if (inputs.dataPrivacy === 'public') {
    saasScore += 15;
    hybridScore += 15;
  } else {
    hybridScore += 20;
  }

  // 6. Budget Flexibility
  if (inputs.budgetFlexibility === 'low_opex') {
    saasScore += 15;
    hybridScore += 15;
    customScore -= 20;
  } else if (inputs.budgetFlexibility === 'capex') {
    customScore += 20;
  }

  // Normalize scores 0-100
  const maxRaw = Math.max(saasScore, hybridScore, customScore);
  const totalRaw = saasScore + hybridScore + customScore;
  
  const normSaas = Math.round((saasScore / totalRaw) * 100);
  const normHybrid = Math.round((hybridScore / totalRaw) * 100);
  const normCustom = Math.round((customScore / totalRaw) * 100);

  let recommendation: ArchitectureRecommendation = 'hybrid_api';
  let recommendationTitle = 'Hybrid API Orchestration (Recommended)';
  let executiveSummary = 'Combine pre-built SaaS models with custom orchestration API layers to achieve speed while retaining core IP control.';

  if (saasScore >= hybridScore && saasScore >= customScore) {
    recommendation = 'pure_saas';
    recommendationTitle = 'Off-the-Shelf SaaS & Managed Services';
    executiveSummary = 'Deploy proven enterprise SaaS applications (e.g., Microsoft Copilot, Salesforce Einstein, ChatGPT Enterprise) to minimize time-to-market and engineering overhead.';
  } else if (customScore > saasScore && customScore > hybridScore) {
    recommendation = 'custom_build';
    recommendationTitle = 'Custom Proprietary Engineering';
    executiveSummary = 'Build custom model architectures, fine-tuned open-weight models, or proprietary agent pipelines deployed on dedicated cloud infrastructure.';
  }

  const confidenceScore = Math.min(98, Math.max(70, Math.round((maxRaw / totalRaw) * 220)));

  const tradeOffs: TradeOffItem[] = [
    {
      dimension: 'Time-to-Market',
      saasScore: 9,
      hybridScore: 7,
      customScore: 3,
      explanation: 'SaaS deploys in days; Hybrid in 4-8 weeks; Custom requires 3-6+ months of MLOps & training.',
    },
    {
      dimension: 'IP Ownership & moat',
      saasScore: 2,
      hybridScore: 6,
      customScore: 10,
      explanation: 'Custom engineering builds defensible enterprise assets; SaaS provides no unique competitive moat.',
    },
    {
      dimension: 'Security & Sovereignty',
      saasScore: 5,
      hybridScore: 8,
      customScore: 10,
      explanation: 'Custom/Hybrid models on private VPCs allow zero third-party data retention and local compliance.',
    },
    {
      dimension: 'Total Cost of Ownership (3-Yr)',
      saasScore: 6,
      hybridScore: 8,
      customScore: 4,
      explanation: 'SaaS per-seat fees scale aggressively; Custom builds have high upfront CAPEX but lower marginal cost at scale.',
    },
    {
      dimension: 'Maintenance Overhead',
      saasScore: 10,
      hybridScore: 7,
      customScore: 3,
      explanation: 'SaaS vendor handles all updates & SLA; Custom requires dedicated in-house MLOps engineers.',
    },
  ];

  const recommendedRoadmap = [
    {
      phase: 'Phase 1 (Days 1–30)',
      focus: recommendation === 'pure_saas'
        ? 'Vendor Evaluation & SaaS Pilot Onboarding'
        : recommendation === 'hybrid_api'
        ? 'API Gateway Setup & Pre-built LLM Evaluation'
        : 'Data Pipeline Audit & Model Architecture Specification',
    },
    {
      phase: 'Phase 2 (Days 30–60)',
      focus: recommendation === 'pure_saas'
        ? 'Role-based Access & Enterprise SSO Integration'
        : recommendation === 'hybrid_api'
        ? 'Custom Middleware Development & Retrieval (RAG) Integration'
        : 'Sandbox Model Fine-Tuning & MLOps Infrastructure Provisioning',
    },
    {
      phase: 'Phase 3 (Days 60–90)',
      focus: recommendation === 'pure_saas'
        ? 'Organization-wide Upskilling & Workflow Change Management'
        : recommendation === 'hybrid_api'
        ? 'Production API Deployment, Guardrails & Evaluation Setup'
        : 'Private VPC Deployment, Air-gap Audit & Performance Optimization',
    },
  ];

  return {
    recommendation,
    recommendationTitle,
    confidenceScore,
    executiveSummary,
    scores: {
      saas: normSaas,
      hybrid: normHybrid,
      custom: normCustom,
    },
    tradeOffs,
    keyDrivers,
    recommendedRoadmap,
  };
}
