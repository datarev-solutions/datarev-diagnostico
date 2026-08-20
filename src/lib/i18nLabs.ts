import type { L } from "./framework";

/** Copy for the Labs section — DataRev's applied AI-engineering showcase. */
export const LABS = {
  navLabel: { es: "Labs", en: "Labs" },
  title: { es: "DataRev Labs", en: "DataRev Labs" },
  lead: {
    es: "El diagnóstico te dice dónde estás. Estos laboratorios muestran cómo construimos: simuladores interactivos que enseñan la arquitectura real detrás de RAG, gobernanza de agentes y el stack de protocolos con el que operan los sistemas agénticos de producción.",
    en: "The assessment tells you where you stand. These labs show how we build: interactive simulators that teach the actual architecture behind RAG, agent governance, and the protocol stack production agentic systems run on.",
  },
  openLab: { es: "Abrir laboratorio", en: "Open lab" },
  newTab: { es: "Se abre en una pestaña nueva", en: "Opens in a new tab" },

  ragTitle: { es: "RAG & GraphRAG Simulator", en: "RAG & GraphRAG Simulator" },
  ragDesc: {
    es: "Recuperación aumentada por generación desde chunking hasta reranking, con un modo GraphRAG comparado lado a lado contra RAG tradicional. Incluye el harness de herramientas y agentes, y una explicación de MCP con ejemplos ejecutables.",
    en: "Retrieval-augmented generation from chunking through reranking, with a GraphRAG mode compared side by side against traditional RAG. Includes the tool/agent harness and an MCP walkthrough with runnable examples.",
  },

  governanceTitle: { es: "Agent Governance Simulator", en: "Agent Governance Simulator" },
  governanceDesc: {
    es: "Cómo se supervisa un agente en producción: guardarraíles, trazas, escalamiento humano y los puntos de control que separan un piloto de un sistema que se puede auditar.",
    en: "How an agent gets supervised in production: guardrails, traces, human escalation, and the checkpoints that separate a pilot from a system that can actually be audited.",
  },

  stackTitle: { es: "The Agentic Stack", en: "The Agentic Stack" },
  stackDesc: {
    es: "Mapa de referencia de los protocolos del ecosistema agéntico — MCP, A2A, A2UI, Skills y herramientas — con comparativas, casos de uso y una librería de recursos.",
    en: "Reference map of the agentic ecosystem's protocols — MCP, A2A, A2UI, Skills and tools — with comparisons, use cases, and a resource library.",
  },

  footnote: {
    es: "Los laboratorios se ejecutan como aplicaciones independientes dentro de este sitio, con la misma identidad DataRev.",
    en: "The labs run as standalone applications inside this site, under the same DataRev identity.",
  },
} satisfies Record<string, L>;
