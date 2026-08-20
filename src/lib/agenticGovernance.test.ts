import { describe, it, expect } from 'vitest';
import {
  evaluateAgenticFeasibility,
  AgenticFeasibilityInputs,
} from './agenticGovernance';

describe('Agentic Feasibility Scorer', () => {
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

});
