import { describe, it, expect } from 'vitest';
import { evaluateBuildVsBuy, BuildVsBuyInputs } from './buildVsBuy';

describe('Build vs Buy Decision Engine', () => {
  it('recommends Pure SaaS for low dev capacity, urgent timeline, utility IP', () => {
    const inputs: BuildVsBuyInputs = {
      engineeringCapacity: 'low',
      timelineUrgency: 'immediate',
      ipDifferentiation: 'utility',
      maintenanceCapacity: 'none',
      dataPrivacy: 'public',
      budgetFlexibility: 'low_opex',
    };

    const result = evaluateBuildVsBuy(inputs);
    expect(result.recommendation).toBe('pure_saas');
    expect(result.scores.saas).toBeGreaterThan(result.scores.custom);
    expect(result.keyDrivers.length).toBeGreaterThan(0);
  });

  it('recommends Custom Build for high dev capacity, core IP, isolated privacy', () => {
    const inputs: BuildVsBuyInputs = {
      engineeringCapacity: 'high',
      timelineUrgency: 'long_term',
      ipDifferentiation: 'core_ip',
      maintenanceCapacity: 'dedicated',
      dataPrivacy: 'isolated',
      budgetFlexibility: 'capex',
    };

    const result = evaluateBuildVsBuy(inputs);
    expect(result.recommendation).toBe('custom_build');
    expect(result.scores.custom).toBeGreaterThan(result.scores.saas);
  });

  it('recommends Hybrid API for balanced inputs', () => {
    const inputs: BuildVsBuyInputs = {
      engineeringCapacity: 'medium',
      timelineUrgency: 'medium',
      ipDifferentiation: 'differentiator',
      maintenanceCapacity: 'outsourced',
      dataPrivacy: 'restricted',
      budgetFlexibility: 'enterprise',
    };

    const result = evaluateBuildVsBuy(inputs);
    expect(result.recommendation).toBe('hybrid_api');
    expect(result.tradeOffs.length).toBe(5);
    expect(result.recommendedRoadmap.length).toBe(3);
  });
});
