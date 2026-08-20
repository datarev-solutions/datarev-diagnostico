/**
 * Agentic Feasibility Scorer — DataRev AI Strategy
 *
 * Evaluates process determinism, API maturity, data structure, error tolerance,
 * and human-in-the-loop points to determine readiness for:
 *   - Augmentation (Copilot)
 *   - Semi-Autonomous Agent
 *   - Fully Autonomous Multi-Agent Orchestration
 *
 * This asks "can it be automated", which is a separate question from "may it
 * be". Regulatory classification lives in `compliance.ts`, which covers every
 * jurisdiction rather than only the EU AI Act — an earlier version of this file
 * carried a single EU-only classifier and it has been retired, so that AI Act
 * tiering exists in exactly one place and cannot drift out of date twice over.
 */

export type ProcessDeterminism = 'rule_based' | 'semi_structured' | 'unstructured_creative';
export type ApiMaturity = 'none' | 'partial_rest' | 'full_openapi';
export type StructuredDataLevel = 'clean_sql' | 'semi_json' | 'raw_unstructured';
export type ErrorTolerance = 'zero_tolerance' | 'moderate' | 'high_creative';
export type HumanInTheLoopLevel = 'mandatory_approval' | 'sampling_audit' | 'autonomous';

export interface AgenticFeasibilityInputs {
  determinism: ProcessDeterminism;
  apiMaturity: ApiMaturity;
  structuredData: StructuredDataLevel;
  errorTolerance: ErrorTolerance;
  humanInTheLoop: HumanInTheLoopLevel;
}

export type AgenticModel = 'copilot_augmentation' | 'semi_autonomous' | 'multi_agent_orchestration';

export interface AgenticFeasibilityResult {
  score: number; // 0-100
  model: AgenticModel;
  modelTitle: string;
  description: string;
  technicalPrerequisites: string[];
  riskWarnings: string[];
}

// -----------------------------------------------------------------------------
// 1. Agentic Feasibility Evaluator
// -----------------------------------------------------------------------------

export function evaluateAgenticFeasibility(inputs: AgenticFeasibilityInputs): AgenticFeasibilityResult {
  let score = 50;
  const technicalPrerequisites: string[] = [];
  const riskWarnings: string[] = [];

  // Determinism
  if (inputs.determinism === 'rule_based') {
    score += 15;
  } else if (inputs.determinism === 'unstructured_creative') {
    score -= 15;
    riskWarnings.push('High creative variance increases hallucination risk in autonomous workflows.');
  }

  // API Maturity
  if (inputs.apiMaturity === 'full_openapi') {
    score += 25;
    technicalPrerequisites.push('OpenAPI/Swagger schemas available for agent tool calling.');
  } else if (inputs.apiMaturity === 'none') {
    score -= 30;
    riskWarnings.push('Lack of REST/OpenAPI endpoints blocks automated agent function execution.');
  } else {
    score += 10;
    technicalPrerequisites.push('Partial REST APIs require adapter wrappers for agent integration.');
  }

  // Structured Data
  if (inputs.structuredData === 'clean_sql') {
    score += 20;
    technicalPrerequisites.push('Clean SQL/relational schemas support precise retrieval and validation.');
  } else if (inputs.structuredData === 'raw_unstructured') {
    score -= 15;
    riskWarnings.push('Raw unstructured data requires advanced RAG pipelines before agent orchestration.');
  }

  // Error Tolerance
  if (inputs.errorTolerance === 'zero_tolerance') {
    score -= 25;
    riskWarnings.push('Zero-tolerance domain requires mandatory human-in-the-loop validation step.');
  } else if (inputs.errorTolerance === 'high_creative') {
    score += 15;
  }

  // Human in the Loop
  if (inputs.humanInTheLoop === 'mandatory_approval') {
    score -= 10;
    technicalPrerequisites.push('Human approval queue integrated prior to state mutations.');
  } else if (inputs.humanInTheLoop === 'autonomous') {
    score += 20;
  }

  // Bound score 0-100
  const normalizedScore = Math.max(10, Math.min(98, score));

  let model: AgenticModel = 'semi_autonomous';
  let modelTitle = 'Semi-Autonomous Agent (Human-in-the-Loop)';
  let description = 'The workflow is best deployed as a semi-autonomous assistant that executes tasks and draft states, requiring human approval for final execution.';

  if (normalizedScore >= 75 && inputs.apiMaturity !== 'none' && inputs.errorTolerance !== 'zero_tolerance') {
    model = 'multi_agent_orchestration';
    modelTitle = 'Fully Autonomous Multi-Agent Orchestration';
    description = 'High API maturity and error tolerance enable autonomous multi-agent teams with tool-calling capabilities and automatic retry loops.';
  } else if (normalizedScore < 50 || inputs.errorTolerance === 'zero_tolerance' || inputs.apiMaturity === 'none') {
    model = 'copilot_augmentation';
    modelTitle = 'Human-Augmented Copilot';
    description = 'Deploy as an inline AI copilot that assists human operators with context synthesis and drafting without direct tool execution authority.';
  }

  return {
    score: normalizedScore,
    model,
    modelTitle,
    description,
    technicalPrerequisites,
    riskWarnings,
  };
}

export function getUseCaseAgenticClassification(useCase: {
  department?: string;
  industries?: string[];
  tech: string[];
  agenticFeasibility?: 'copilot' | 'semi_autonomous' | 'multi_agent';
  euAiActRisk?: 'minimal' | 'transparency' | 'high_risk' | 'prohibited';
}) {
  let agenticModel: 'copilot' | 'semi_autonomous' | 'multi_agent' = useCase.agenticFeasibility || 'copilot';
  let euRiskTier: 'minimal' | 'transparency' | 'high_risk' | 'prohibited' = useCase.euAiActRisk || 'minimal';

  if (!useCase.agenticFeasibility) {
    if (useCase.tech.includes('agent') && useCase.tech.includes('vectordb')) {
      agenticModel = 'multi_agent';
    } else if (useCase.tech.includes('agent') || useCase.tech.includes('llm')) {
      agenticModel = 'semi_autonomous';
    } else {
      agenticModel = 'copilot';
    }
  }

  if (!useCase.euAiActRisk) {
    if (useCase.department === 'hr' || useCase.department === 'risk' || (useCase.industries && useCase.industries.includes('banking'))) {
      euRiskTier = 'high_risk';
    } else if (useCase.department === 'service' || useCase.department === 'marketing') {
      euRiskTier = 'transparency';
    } else {
      euRiskTier = 'minimal';
    }
  }

  const agenticLabels: Record<string, string> = {
    copilot: 'Copilot Augmentation',
    semi_autonomous: 'Semi-Autonomous Agent',
    multi_agent: 'Autonomous Multi-Agent',
  };

  const euRiskLabels: Record<string, string> = {
    minimal: 'Minimal Risk',
    transparency: 'Art. 50 Transparency',
    high_risk: 'Annex III High Risk',
    prohibited: 'Art. 5 Prohibited',
  };

  const euBadgeColors: Record<string, string> = {
    minimal: 'bg-[#8FBF9A]/10 text-[#8FBF9A] border-[#8FBF9A]/20',
    transparency: 'bg-[#00c2ff]/10 text-[#00c2ff] border-[#00c2ff]/20',
    high_risk: 'bg-[#C9A35A]/10 text-[#C9A35A] border-[#C9A35A]/20',
    prohibited: 'bg-[#E14B52]/10 text-[#E14B52] border-[#E14B52]/20',
  };

  return {
    agenticModel,
    agenticLabel: agenticLabels[agenticModel],
    euRiskTier,
    euRiskLabel: euRiskLabels[euRiskTier],
    euBadgeColor: euBadgeColors[euRiskTier],
  };
}
