import type {
  ComplianceInputs,
  RegimeAssessment,
  Severity,
} from "./compliance";
import { isSensitive, processesPersonalData } from "./compliance";

/**
 * One evaluator per regime. Each returns `null` when the regime is out of
 * scope, so the orchestrator never has to know which axis a regime sits on.
 *
 * Obligations are written as the thing a client would have to *do*, not as
 * article numbers — a checklist that reads "Art. 30" helps nobody in a sales
 * conversation. Article references stay as supporting detail inside the line.
 *
 * Nothing here is legal advice, and the UI says so. These are the well-settled
 * obligations of each regime, at the altitude a diagnostic can responsibly
 * assert; anything genuinely contested is left out rather than guessed.
 */
export type RegimeEvaluator = (inputs: ComplianceInputs) => RegimeAssessment | null;

const inScope = (inputs: ComplianceInputs, jurisdiction: ComplianceInputs["jurisdictions"][number]) =>
  inputs.jurisdictions.includes(jurisdiction);

// -----------------------------------------------------------------------------
// Mexico — LFPDPPP
// -----------------------------------------------------------------------------

/**
 * The 2025 statute, not the 2010 one. This matters more than it looks: the law
 * was fully replaced on 21 March 2025 and INAI was dissolved, so any material
 * still naming INAI as the regulator dates itself instantly to a Mexican
 * reader — which is the opposite of what a credibility tool should do.
 */
const evaluateLfpdppp: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "mexico") || !processesPersonalData(inputs.dataCategory)) return null;

  const sensitive = isSensitive(inputs.dataCategory);
  const financial = inputs.dataCategory === "financial";

  const obligations = [
    {
      es: "Aviso de privacidad disponible en el punto de recolección, con las finalidades desglosadas.",
      en: "Privacy notice (aviso de privacidad) available at the point of collection, with purposes itemised.",
    },
    sensitive
      ? {
          es: "Consentimiento expreso y por escrito — los datos sensibles no admiten consentimiento tácito.",
          en: "Express written consent — sensitive data cannot rely on tacit consent.",
        }
      : financial
        ? {
            es: "Consentimiento expreso para datos patrimoniales o financieros.",
            en: "Express consent for patrimonial or financial data.",
          }
        : {
            es: "Base de consentimiento documentada para cada finalidad declarada.",
            en: "Documented consent basis for each stated purpose.",
          },
    {
      es: "Procedimiento y contacto para ejercer derechos ARCO (acceso, rectificación, cancelación y oposición).",
      en: "Procedure and contact point for ARCO rights (access, rectification, cancellation, objection).",
    },
    {
      es: "Medidas de seguridad administrativas, físicas y técnicas proporcionales al riesgo.",
      en: "Administrative, physical and technical security measures proportional to risk.",
    },
    {
      es: "Reglas de transferencia a terceros, incluidos proveedores de modelos fuera de México.",
      en: "Third-party transfer rules, including model providers outside Mexico.",
    },
    {
      es: "Notificación de vulneraciones que afecten significativamente los derechos de los titulares.",
      en: "Breach notification where the incident materially affects data subjects' rights.",
    },
  ];

  if (sensitive) {
    obligations.push({
      es: "Justificación reforzada: la ley exige un esfuerzo mayor para tratar datos sensibles y limita su uso al fin declarado.",
      en: "Heightened justification: the law demands a stronger showing to process sensitive data and confines it to the stated purpose.",
    });
  }

  const severity: Severity = sensitive ? "elevated" : financial ? "elevated" : "baseline";

  return {
    id: "lfpdppp",
    shortName: "LFPDPPP",
    fullName: {
      es: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025)",
      en: "Mexican Federal Law on Protection of Personal Data Held by Private Parties (2025)",
    },
    jurisdiction: "mexico",
    family: "data_protection",
    severity,
    summary: sensitive
      ? {
          es: "El flujo trata datos sensibles bajo la ley mexicana, lo que activa consentimiento expreso y por escrito además del régimen general.",
          en: "The workflow processes sensitive data under Mexican law, which triggers express written consent on top of the general regime.",
        }
      : {
          es: "El tratamiento de datos personales en México activa el régimen general con independencia de si hay IA de por medio.",
          en: "Processing personal data in Mexico triggers the general regime whether or not AI is involved.",
        },
    obligations,
    timing: {
      es: "Vigente desde el 21 de marzo de 2025, cuando la nueva ley sustituyó por completo a la de 2010.",
      en: "In force since 21 March 2025, when the new law fully replaced the 2010 statute.",
    },
    authority: {
      es: "Secretaría Anticorrupción y Buen Gobierno — asumió la función tras la desaparición del INAI.",
      en: "Secretaría Anticorrupción y Buen Gobierno — took over the function after INAI was dissolved.",
    },
  };
};

// -----------------------------------------------------------------------------
// European Union — GDPR
// -----------------------------------------------------------------------------

const evaluateGdpr: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "eu") || !processesPersonalData(inputs.dataCategory)) return null;

  const sensitive = isSensitive(inputs.dataCategory);
  const solelyAutomated = inputs.autonomousDecisioning;

  const obligations = [
    {
      es: "Base de licitud identificada y documentada por finalidad (art. 6).",
      en: "Lawful basis identified and documented per purpose (Art. 6).",
    },
    {
      es: "Registro de actividades de tratamiento (art. 30).",
      en: "Record of processing activities (Art. 30).",
    },
    {
      es: "Mecanismo para atender derechos de los interesados dentro de plazo.",
      en: "Mechanism to serve data subject rights within statutory deadlines.",
    },
    {
      es: "Transferencias fuera del EEE amparadas por el capítulo V (cláusulas tipo o decisión de adecuación).",
      en: "Transfers outside the EEA covered under Chapter V (standard clauses or adequacy decision).",
    },
    {
      es: "Notificación de brechas a la autoridad en 72 horas.",
      en: "Breach notification to the supervisory authority within 72 hours.",
    },
  ];

  if (sensitive) {
    obligations.unshift({
      es: "Excepción del art. 9 para categorías especiales — el art. 6 por sí solo no basta.",
      en: "Article 9 condition for special categories — Article 6 alone is not enough.",
    });
  }

  if (solelyAutomated) {
    obligations.unshift({
      es: "Art. 22: una decisión exclusivamente automatizada con efectos jurídicos o significativos exige base habilitante, intervención humana y derecho a impugnar.",
      en: "Art. 22: a solely automated decision with legal or similarly significant effects requires a permitted basis, human intervention and a right to contest.",
    });
  }

  if (solelyAutomated || sensitive) {
    obligations.push({
      es: "Evaluación de impacto (DPIA, art. 35) antes de poner el sistema en producción.",
      en: "Data protection impact assessment (DPIA, Art. 35) before the system goes live.",
    });
  }

  const severity: Severity = solelyAutomated && sensitive ? "high" : solelyAutomated || sensitive ? "elevated" : "baseline";

  return {
    id: "gdpr",
    shortName: "GDPR",
    fullName: {
      es: "Reglamento General de Protección de Datos (UE) 2016/679",
      en: "General Data Protection Regulation (EU) 2016/679",
    },
    jurisdiction: "eu",
    family: "data_protection",
    severity,
    summary: solelyAutomated
      ? {
          es: "Decidir de forma exclusivamente automatizada sobre personas es el supuesto que el art. 22 restringe de manera expresa.",
          en: "Deciding about people by solely automated means is precisely what Article 22 expressly restricts.",
        }
      : {
          es: "El RGPD aplica al dato personal en sí, en paralelo y con independencia de la Ley de IA.",
          en: "The GDPR attaches to the personal data itself, in parallel with and independent of the AI Act.",
        },
    obligations,
    authority: {
      es: "Autoridad de control del Estado miembro correspondiente.",
      en: "Supervisory authority of the relevant member state.",
    },
  };
};

// -----------------------------------------------------------------------------
// European Union — AI Act
// -----------------------------------------------------------------------------

/**
 * Tiering carried over from the original single-regime classifier, with the
 * timing corrected. The Digital Omnibus agreed in June 2026 pushed Annex III
 * use-based high-risk obligations from 2 August 2026 to 2 December 2027, while
 * leaving the Article 50 transparency duties on the August 2026 date. Telling a
 * client they are late for a deadline that moved is as damaging as missing one.
 */
const evaluateEuAiAct: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "eu")) return null;

  const base = {
    id: "eu_ai_act" as const,
    shortName: "EU AI Act",
    fullName: {
      es: "Reglamento de Inteligencia Artificial (UE) 2024/1689",
      en: "Artificial Intelligence Act (EU) 2024/1689",
    },
    jurisdiction: "eu" as const,
    family: "ai_system" as const,
    authority: {
      es: "Oficina Europea de IA y autoridades nacionales de vigilancia del mercado.",
      en: "European AI Office and national market surveillance authorities.",
    },
  };

  if (inputs.domain === "biometric_identification" && inputs.autonomousDecisioning) {
    return {
      ...base,
      severity: "prohibited",
      summary: {
        es: "La categorización biométrica con evaluación autónoma y sin supervisión humana cae en las prácticas prohibidas del art. 5.",
        en: "Biometric categorisation with autonomous evaluation and no human oversight falls within the Article 5 prohibited practices.",
      },
      obligations: [
        {
          es: "Rediseñar el flujo para eliminar la evaluación biométrica autónoma.",
          en: "Redesign the workflow to remove autonomous biometric evaluation.",
        },
        {
          es: "Reintroducir supervisión humana con capacidad real de anular la decisión.",
          en: "Reintroduce human oversight with genuine power to override the decision.",
        },
      ],
      timing: {
        es: "Las prohibiciones del art. 5 aplican desde el 2 de febrero de 2025 — este plazo ya venció.",
        en: "Article 5 prohibitions have applied since 2 February 2025 — this deadline has already passed.",
      },
    };
  }

  const highRiskDomain =
    inputs.domain === "recruitment_hr" ||
    inputs.domain === "financial_credit_scoring" ||
    inputs.domain === "critical_infrastructure";

  if (highRiskDomain || (inputs.autonomousDecisioning && inputs.userExposure === "public_consumer")) {
    return {
      ...base,
      severity: "high",
      summary: {
        es: "Empleo, scoring crediticio y servicios esenciales son casos de uso de alto riesgo del anexo III.",
        en: "Employment, credit scoring and essential services are Annex III high-risk use cases.",
      },
      obligations: [
        {
          es: "Evaluación de impacto en derechos fundamentales (FRIA).",
          en: "Fundamental Rights Impact Assessment (FRIA).",
        },
        {
          es: "Sistema de gestión de riesgos continuo y registro de auditorías de sesgo.",
          en: "Continuous risk management system and bias audit logging.",
        },
        {
          es: "Supervisión humana (art. 14) con capacidad de anulación.",
          en: "Human oversight (Art. 14) with override capability.",
        },
        {
          es: "Documentación técnica y registro en la base de datos europea de IA.",
          en: "Technical documentation and registration in the EU AI database.",
        },
        {
          es: "Registro de eventos conservado de forma inalterable por seis meses o más.",
          en: "Event logging retained tamper-proof for six months or more.",
        },
      ],
      timing: {
        es: "El Digital Omnibus aplazó las obligaciones de alto riesgo del anexo III del 2 de agosto de 2026 al 2 de diciembre de 2027. El aplazamiento estaba condicionado a su publicación en el Diario Oficial: confirma el estado vigente antes de fijar un plan.",
        en: "The Digital Omnibus postponed Annex III high-risk obligations from 2 August 2026 to 2 December 2027. That deferral was conditional on publication in the Official Journal — confirm the current status before committing to a plan.",
      },
    };
  }

  if (inputs.domain === "customer_support" || inputs.userExposure === "public_consumer") {
    return {
      ...base,
      severity: "elevated",
      summary: {
        es: "La interacción con público exige revelar de forma explícita que se trata de un sistema de IA (art. 50).",
        en: "Public-facing interaction requires explicit disclosure that this is an AI system (Art. 50).",
      },
      obligations: [
        {
          es: 'Aviso claro y previo: "Estás interactuando con un sistema de IA".',
          en: 'Clear upfront notice: "You are interacting with an AI system".',
        },
        {
          es: "Marcado de agua o identificación del contenido sintético generado.",
          en: "Watermarking or labelling of generated synthetic content.",
        },
        {
          es: "Salida a un agente humano disponible durante la interacción.",
          en: "Route to a human agent available during the interaction.",
        },
      ],
      timing: {
        es: "Las obligaciones de transparencia del art. 50 aplican desde el 2 de agosto de 2026 — el Digital Omnibus no movió esta fecha.",
        en: "Article 50 transparency obligations apply from 2 August 2026 — the Digital Omnibus did not move this date.",
      },
    };
  }

  return {
    ...base,
    severity: "baseline",
    summary: {
      es: "Analítica interna con supervisión humana presenta riesgo mínimo bajo la Ley de IA. Esto no dice nada sobre los regímenes de datos personales que corren en paralelo.",
      en: "Internal analytics with human oversight is minimal risk under the AI Act. This says nothing about the data protection regimes running alongside it.",
    },
    obligations: [
      {
        es: "Adhesión voluntaria a códigos de conducta.",
        en: "Voluntary adherence to codes of conduct.",
      },
      {
        es: "Alfabetización en IA para quienes operan el sistema (art. 4).",
        en: "AI literacy for the people operating the system (Art. 4).",
      },
    ],
  };
};

// -----------------------------------------------------------------------------
// United States — CCPA / CPRA
// -----------------------------------------------------------------------------

const evaluateCcpa: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "us") || !processesPersonalData(inputs.dataCategory)) return null;

  const sensitive = isSensitive(inputs.dataCategory) || inputs.dataCategory === "financial";

  const obligations = [
    {
      es: "Aviso en el momento de la recolección, por categoría de dato y finalidad.",
      en: "Notice at collection, broken out by data category and purpose.",
    },
    {
      es: "Derechos de conocer, eliminar y corregir, con canal designado.",
      en: "Rights to know, delete and correct, with a designated channel.",
    },
    {
      es: "Opción de exclusión de venta o de compartición de datos personales.",
      en: "Opt-out of sale or sharing of personal information.",
    },
    {
      es: "Contratos con proveedores que limiten el uso posterior de los datos.",
      en: "Service provider contracts restricting downstream use of the data.",
    },
  ];

  if (sensitive) {
    obligations.push({
      es: "Derecho a limitar el uso de información personal sensible.",
      en: "Right to limit use of sensitive personal information.",
    });
  }

  if (inputs.autonomousDecisioning) {
    obligations.push({
      es: "Reglas de la CPPA sobre tecnología de decisión automatizada: aviso previo, opción de exclusión y evaluación de riesgo documentada.",
      en: "CPPA automated decisionmaking technology rules: pre-use notice, opt-out, and a documented risk assessment.",
    });
  }

  return {
    id: "ccpa_cpra",
    shortName: "CCPA/CPRA",
    fullName: {
      es: "Ley de Privacidad del Consumidor de California, reformada por la CPRA",
      en: "California Consumer Privacy Act, as amended by the CPRA",
    },
    jurisdiction: "us",
    family: "data_protection",
    severity: inputs.autonomousDecisioning || sensitive ? "elevated" : "baseline",
    summary: {
      es: "Estados Unidos no tiene ley federal de privacidad: la exposición se evalúa estado por estado. California es la más exigente y sirve de referencia, pero Virginia, Colorado, Texas y otros imponen reglas propias.",
      en: "The United States has no federal privacy statute: exposure is assessed state by state. California is the most demanding and serves as the benchmark, but Virginia, Colorado, Texas and others impose their own rules.",
    },
    obligations,
    authority: {
      es: "California Privacy Protection Agency y Fiscalía General del estado.",
      en: "California Privacy Protection Agency and the state Attorney General.",
    },
  };
};

// -----------------------------------------------------------------------------
// United States — HIPAA
// -----------------------------------------------------------------------------

/**
 * Deliberately narrow. HIPAA does not follow health data everywhere — it
 * follows covered entities and their business associates. A wellness app
 * holding the same data is usually outside it, so the summary says who this
 * actually binds rather than implying every health record is HIPAA data.
 */
const evaluateHipaa: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "us") || inputs.dataCategory !== "health") return null;

  return {
    id: "hipaa",
    shortName: "HIPAA",
    fullName: {
      es: "Ley de Portabilidad y Responsabilidad del Seguro Médico (EE. UU.)",
      en: "Health Insurance Portability and Accountability Act (US)",
    },
    jurisdiction: "us",
    family: "sectoral",
    severity: "high",
    summary: {
      es: "Si la contraparte es una entidad cubierta, el proveedor de IA actúa como business associate y necesita contrato antes de tocar un solo registro.",
      en: "If the counterparty is a covered entity, the AI vendor acts as a business associate and needs a contract in place before touching a single record.",
    },
    obligations: [
      {
        es: "Business Associate Agreement firmado antes de procesar información de salud protegida.",
        en: "Signed Business Associate Agreement before processing protected health information.",
      },
      {
        es: "Principio de mínimo necesario aplicado a lo que el modelo recibe como contexto.",
        en: "Minimum necessary principle applied to whatever the model receives as context.",
      },
      {
        es: "Salvaguardas administrativas, físicas y técnicas de la Security Rule, con cifrado y control de acceso.",
        en: "Security Rule administrative, physical and technical safeguards, with encryption and access control.",
      },
      {
        es: "Desidentificación por Safe Harbor o determinación de experto si se usa para entrenar o evaluar.",
        en: "De-identification via Safe Harbor or expert determination if used for training or evaluation.",
      },
      {
        es: "Notificación de brechas a los individuos, a HHS y, según el alcance, a medios.",
        en: "Breach notification to individuals, to HHS and, depending on scale, to the media.",
      },
      {
        es: "Verificar que el proveedor del modelo acepte firmar un BAA — varios no lo hacen en sus planes estándar.",
        en: "Confirm the model provider will sign a BAA — several will not on standard plans.",
      },
    ],
    authority: {
      es: "Office for Civil Rights del Departamento de Salud y Servicios Humanos.",
      en: "Office for Civil Rights, Department of Health and Human Services.",
    },
  };
};

// -----------------------------------------------------------------------------
// Brazil — LGPD
// -----------------------------------------------------------------------------

const evaluateLgpd: RegimeEvaluator = (inputs) => {
  if (!inScope(inputs, "brazil") || !processesPersonalData(inputs.dataCategory)) return null;

  const sensitive = isSensitive(inputs.dataCategory);

  const obligations = [
    {
      es: sensitive
        ? "Hipótesis legal del art. 11 para datos sensibles — el art. 7 no alcanza."
        : "Hipótesis legal del art. 7 documentada por finalidad.",
      en: sensitive
        ? "Article 11 legal basis for sensitive data — Article 7 is not sufficient."
        : "Article 7 legal basis documented per purpose.",
    },
    {
      es: "Encargado (DPO) designado y publicado.",
      en: "Encarregado (DPO) appointed and publicly identified.",
    },
    {
      es: "Informe de impacto a la protección de datos personales (RIPD).",
      en: "Data protection impact report (RIPD).",
    },
    {
      es: "Transferencia internacional amparada en un mecanismo del capítulo V.",
      en: "International transfer covered by a Chapter V mechanism.",
    },
  ];

  if (inputs.autonomousDecisioning) {
    obligations.unshift({
      es: "Art. 20: derecho a solicitar revisión de decisiones tomadas únicamente por tratamiento automatizado.",
      en: "Art. 20: right to request review of decisions taken solely by automated processing.",
    });
  }

  return {
    id: "lgpd",
    shortName: "LGPD",
    fullName: {
      es: "Lei Geral de Proteção de Dados Pessoais (Brasil), Lei 13.709/2018",
      en: "Brazilian General Data Protection Law, Law 13.709/2018",
    },
    jurisdiction: "brazil",
    family: "data_protection",
    severity: inputs.autonomousDecisioning || sensitive ? "elevated" : "baseline",
    summary: {
      es: "La LGPD sigue de cerca al RGPD en estructura, pero con su propia autoridad, plazos y catálogo de bases legales.",
      en: "The LGPD tracks the GDPR closely in structure, but with its own authority, deadlines and catalogue of legal bases.",
    },
    obligations,
    authority: {
      es: "Autoridade Nacional de Proteção de Dados (ANPD).",
      en: "Autoridade Nacional de Proteção de Dados (ANPD).",
    },
  };
};

export const REGIME_EVALUATORS: readonly RegimeEvaluator[] = [
  evaluateEuAiAct,
  evaluateGdpr,
  evaluateLfpdppp,
  evaluateCcpa,
  evaluateHipaa,
  evaluateLgpd,
];
