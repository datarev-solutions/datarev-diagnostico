import { describe, it, expect } from 'vitest';
import {
  evaluateAgenticFeasibility,
  classifyEuAiActRisk,
  AgenticFeasibilityInputs,
  EuAiActInputs,
} from './agenticGovernance';

describe('Agentic Feasibility & EU AI Act Governance Classifier', () => {
  describe('Agentic Feasibility Engine', () => {
    it('evaluates Copilot model for zero tolerance error and no APIs', () => {
      const inputs: AgenticFeasibilityInputs = {
        determinism: 'unstructured_creative',
        apiMaturity: 'none',
        structuredData: 'raw_unstructured',
        errorTolerance: 'zero_tolerance',
        humanInTheLoop: 'mandatory_approval',
      };

      const result = evaluateAgenticFeasibility(inputs);
      expect(result.model).toBe('copilot_augmentation');
      expect(result.riskWarnings.length).toBeGreaterThan(0);
    });

    it('evaluates Multi-Agent Orchestration for full OpenAPI and high tolerance', () => {
      const inputs: AgenticFeasibilityInputs = {
        determinism: 'rule_based',
        apiMaturity: 'full_openapi',
        structuredData: 'clean_sql',
        errorTolerance: 'high_creative',
        humanInTheLoop: 'autonomous',
      };

      const result = evaluateAgenticFeasibility(inputs);
      expect(result.model).toBe('multi_agent_orchestration');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });
  });

  describe('EU AI Act Risk Classifier', () => {
    it('classifies HR recruitment as High Risk (Annex III)', () => {
      const inputs: EuAiActInputs = {
        domain: 'recruitment_hr',
        autonomousDecisioning: false,
        userExposure: 'internal_employee',
      };

      const result = classifyEuAiActRisk(inputs);
      expect(result.tier).toBe('high_risk_annex3');
      expect(result.mandatoryComplianceChecklist.length).toBeGreaterThan(3);
    });

    it('classifies customer support chatbot as Specific Transparency (Art 50)', () => {
      const inputs: EuAiActInputs = {
        domain: 'customer_support',
        autonomousDecisioning: false,
        userExposure: 'public_consumer',
      };

      const result = classifyEuAiActRisk(inputs);
      expect(result.tier).toBe('transparency_art50');
    });

    it('classifies autonomous biometric evaluation as Prohibited (Art 5)', () => {
      const inputs: EuAiActInputs = {
        domain: 'biometric_identification',
        autonomousDecisioning: true,
        userExposure: 'public_consumer',
      };

      const result = classifyEuAiActRisk(inputs);
      expect(result.tier).toBe('prohibited_art5');
    });
  });
});
