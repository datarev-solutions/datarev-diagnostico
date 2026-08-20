import { describe, it, expect } from 'vitest';
import { assessCompliance, rank, ComplianceInputs, RegimeId } from './compliance';

/** Internal analytics, human in the loop, staff-facing — the calmest baseline. */
const base: ComplianceInputs = {
  jurisdictions: ['mexico'],
  dataCategory: 'personal',
  domain: 'internal_analytics',
  autonomousDecisioning: false,
  userExposure: 'internal_employee',
};

const ids = (inputs: ComplianceInputs): RegimeId[] =>
  assessCompliance(inputs).regimes.map((regime) => regime.id);

const find = (inputs: ComplianceInputs, id: RegimeId) =>
  assessCompliance(inputs).regimes.find((regime) => regime.id === id);

describe('scoping — which regimes come into play at all', () => {
  it('returns nothing when no jurisdiction is selected', () => {
    const result = assessCompliance({ ...base, jurisdictions: [] });
    expect(result.regimes).toHaveLength(0);
    expect(result.highestSeverity).toBe('not_applicable');
  });

  it('drops every data protection regime when no personal data is processed', () => {
    expect(ids({ ...base, dataCategory: 'none' })).toEqual([]);
  });

  it('still applies the AI Act with no personal data, because it governs the system not the data', () => {
    const result = ids({ ...base, jurisdictions: ['eu'], dataCategory: 'none' });
    expect(result).toContain('eu_ai_act');
    expect(result).not.toContain('gdpr');
  });

  it('keeps regimes confined to their own jurisdiction', () => {
    expect(ids({ ...base, jurisdictions: ['mexico'] })).toEqual(['lfpdppp']);
    expect(ids({ ...base, jurisdictions: ['brazil'] })).toEqual(['lgpd']);
  });

  it('stacks regimes across multiple jurisdictions', () => {
    const result = ids({ ...base, jurisdictions: ['mexico', 'eu', 'us', 'brazil'] });
    expect(result).toContain('lfpdppp');
    expect(result).toContain('gdpr');
    expect(result).toContain('eu_ai_act');
    expect(result).toContain('ccpa_cpra');
    expect(result).toContain('lgpd');
  });
});

describe('Mexico — LFPDPPP', () => {
  it('treats ordinary personal data as baseline', () => {
    expect(find(base, 'lfpdppp')?.severity).toBe('baseline');
  });

  it('escalates for sensitive categories and demands written consent', () => {
    const regime = find({ ...base, dataCategory: 'biometric' }, 'lfpdppp');
    expect(regime?.severity).toBe('elevated');
    expect(regime?.obligations.some((o) => /por escrito/.test(o.es))).toBe(true);
  });

  it('escalates for financial data via the express-consent route', () => {
    const regime = find({ ...base, dataCategory: 'financial' }, 'lfpdppp');
    expect(regime?.severity).toBe('elevated');
    expect(regime?.obligations.some((o) => /patrimoniales/.test(o.es))).toBe(true);
  });

  it('leads with the current authority and mentions INAI only as dissolved', () => {
    const regime = find(base, 'lfpdppp');
    // The new authority must come first: a reader skimming the line should not
    // take away that INAI is still who they answer to.
    expect(regime?.authority?.es).toMatch(/^Secretaría Anticorrupción y Buen Gobierno/);
    expect(regime?.authority?.es).toMatch(/desaparición del INAI/);
    expect(regime?.timing?.en).toMatch(/2025/);
  });
});

describe('European Union — GDPR', () => {
  const eu = { ...base, jurisdictions: ['eu'] as const };

  it('raises Article 22 the moment decisioning becomes autonomous', () => {
    const regime = find({ ...eu, autonomousDecisioning: true }, 'gdpr');
    expect(regime?.severity).toBe('elevated');
    expect(regime?.obligations.some((o) => /Art\. 22/.test(o.en))).toBe(true);
  });

  it('requires an Article 9 condition for special categories', () => {
    const regime = find({ ...eu, dataCategory: 'health' }, 'gdpr');
    expect(regime?.obligations.some((o) => /Article 9/.test(o.en))).toBe(true);
  });

  it('reaches high only when automation and sensitive data combine', () => {
    expect(find({ ...eu, dataCategory: 'health', autonomousDecisioning: true }, 'gdpr')?.severity).toBe('high');
  });

  it('asks for a DPIA whenever it is elevated or worse', () => {
    const regime = find({ ...eu, autonomousDecisioning: true }, 'gdpr');
    expect(regime?.obligations.some((o) => /DPIA/.test(o.en))).toBe(true);
  });
});

describe('European Union — AI Act', () => {
  const eu = { ...base, jurisdictions: ['eu'] as const };

  it('flags autonomous biometric categorisation as a prohibited practice', () => {
    const regime = find(
      { ...eu, domain: 'biometric_identification', autonomousDecisioning: true },
      'eu_ai_act',
    );
    expect(regime?.severity).toBe('prohibited');
    expect(regime?.timing?.en).toMatch(/2 February 2025/);
  });

  it('classifies Annex III domains as high risk', () => {
    expect(find({ ...eu, domain: 'recruitment_hr' }, 'eu_ai_act')?.severity).toBe('high');
    expect(find({ ...eu, domain: 'financial_credit_scoring' }, 'eu_ai_act')?.severity).toBe('high');
    expect(find({ ...eu, domain: 'critical_infrastructure' }, 'eu_ai_act')?.severity).toBe('high');
  });

  it('reports the postponed Annex III date rather than the superseded August 2026 one', () => {
    const regime = find({ ...eu, domain: 'recruitment_hr' }, 'eu_ai_act');
    expect(regime?.timing?.en).toMatch(/2 December 2027/);
  });

  it('keeps Article 50 transparency on its original August 2026 date', () => {
    const regime = find({ ...eu, domain: 'customer_support' }, 'eu_ai_act');
    expect(regime?.severity).toBe('elevated');
    expect(regime?.timing?.en).toMatch(/2 August 2026/);
  });

  it('falls back to minimal risk for supervised internal analytics', () => {
    expect(find(eu, 'eu_ai_act')?.severity).toBe('baseline');
  });
});

describe('United States', () => {
  const us = { ...base, jurisdictions: ['us'] as const };

  it('applies HIPAA only to health data, never to merely sensitive data', () => {
    expect(ids({ ...us, dataCategory: 'health' })).toContain('hipaa');
    expect(ids({ ...us, dataCategory: 'sensitive' })).not.toContain('hipaa');
    expect(ids({ ...us, dataCategory: 'biometric' })).not.toContain('hipaa');
  });

  it('asks whether the model provider will actually sign a BAA', () => {
    const regime = find({ ...us, dataCategory: 'health' }, 'hipaa');
    expect(regime?.severity).toBe('high');
    expect(regime?.obligations.some((o) => /BAA/.test(o.en))).toBe(true);
  });

  it('says out loud that the US is a state-by-state patchwork', () => {
    expect(find(us, 'ccpa_cpra')?.summary.en).toMatch(/no federal privacy statute/);
  });

  it('adds the ADMT obligations when decisioning is autonomous', () => {
    const regime = find({ ...us, autonomousDecisioning: true }, 'ccpa_cpra');
    expect(regime?.obligations.some((o) => /automated decisionmaking/.test(o.en))).toBe(true);
  });
});

describe('Brazil — LGPD', () => {
  it('surfaces the Article 20 review right for automated decisions', () => {
    const regime = find({ ...base, jurisdictions: ['brazil'], autonomousDecisioning: true }, 'lgpd');
    expect(regime?.obligations.some((o) => /Art\. 20/.test(o.en))).toBe(true);
  });

  it('requires an Article 11 basis for sensitive data', () => {
    const regime = find({ ...base, jurisdictions: ['brazil'], dataCategory: 'health' }, 'lgpd');
    expect(regime?.obligations.some((o) => /Article 11/.test(o.en))).toBe(true);
  });
});

describe('cross-axis warning — the reason this replaced a single classifier', () => {
  it('warns when the AI Act reads minimal but health data drags HIPAA in', () => {
    const result = assessCompliance({
      ...base,
      jurisdictions: ['us'],
      dataCategory: 'health',
    });
    expect(result.crossAxisWarning?.en).toMatch(/does not mean unregulated/);
    expect(result.crossAxisWarning?.en).toMatch(/HIPAA/);
  });

  it('warns when an EU workflow is minimal risk yet GDPR is elevated', () => {
    const result = assessCompliance({
      ...base,
      jurisdictions: ['eu'],
      dataCategory: 'health',
    });
    expect(assessCompliance({ ...base, jurisdictions: ['eu'], dataCategory: 'health' }).regimes
      .find((r) => r.id === 'eu_ai_act')?.severity).toBe('baseline');
    expect(result.crossAxisWarning).not.toBeNull();
  });

  it('stays silent when the AI Act is already shouting', () => {
    const result = assessCompliance({
      ...base,
      jurisdictions: ['eu'],
      dataCategory: 'health',
      domain: 'recruitment_hr',
    });
    expect(result.crossAxisWarning).toBeNull();
  });

  it('stays silent when nothing else is serious', () => {
    expect(assessCompliance({ ...base, jurisdictions: ['eu'] }).crossAxisWarning).toBeNull();
  });
});

describe('result assembly', () => {
  it('sorts the most constraining regime to the top', () => {
    const result = assessCompliance({
      jurisdictions: ['eu', 'us', 'mexico'],
      dataCategory: 'biometric',
      domain: 'biometric_identification',
      autonomousDecisioning: true,
      userExposure: 'public_consumer',
    });
    expect(result.regimes[0].id).toBe('eu_ai_act');
    expect(result.regimes[0].severity).toBe('prohibited');
    expect(result.highestSeverity).toBe('prohibited');
  });

  it('leads with the redesign message when something is prohibited', () => {
    const result = assessCompliance({
      ...base,
      jurisdictions: ['eu'],
      domain: 'biometric_identification',
      autonomousDecisioning: true,
    });
    expect(result.headline.en).toMatch(/must be redesigned/);
  });

  it('counts regimes and jurisdictions in the headline', () => {
    const result = assessCompliance({ ...base, jurisdictions: ['mexico', 'brazil'] });
    expect(result.headline.en).toMatch(/2 regimes/);
    expect(result.headline.en).toMatch(/2 jurisdictions/);
  });

  it('singularises the headline for a lone regime', () => {
    const result = assessCompliance({ ...base, jurisdictions: ['mexico'] });
    expect(result.headline.en).toMatch(/1 regime applies/);
    expect(result.headline.en).toMatch(/1 jurisdiction\./);
  });

  it('mentions sensitive data in the headline when it is in scope', () => {
    const result = assessCompliance({ ...base, dataCategory: 'health' });
    expect(result.headline.en).toMatch(/sensitive data in scope/);
    expect(result.headline.es).toMatch(/datos sensibles/);
  });

  it('orders severities so comparisons are meaningful', () => {
    expect(rank('prohibited')).toBeGreaterThan(rank('high'));
    expect(rank('high')).toBeGreaterThan(rank('elevated'));
    expect(rank('elevated')).toBeGreaterThan(rank('baseline'));
    expect(rank('baseline')).toBeGreaterThan(rank('not_applicable'));
  });

  it('gives every regime bilingual copy with no empty obligation lists', () => {
    const result = assessCompliance({
      jurisdictions: ['mexico', 'eu', 'us', 'brazil'],
      dataCategory: 'health',
      domain: 'recruitment_hr',
      autonomousDecisioning: true,
      userExposure: 'public_consumer',
    });
    expect(result.regimes.length).toBeGreaterThanOrEqual(5);
    for (const regime of result.regimes) {
      expect(regime.summary.es.length).toBeGreaterThan(0);
      expect(regime.summary.en.length).toBeGreaterThan(0);
      expect(regime.obligations.length).toBeGreaterThan(0);
      for (const obligation of regime.obligations) {
        expect(obligation.es.length).toBeGreaterThan(0);
        expect(obligation.en.length).toBeGreaterThan(0);
      }
    }
  });
});
