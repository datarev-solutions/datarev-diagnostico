"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ===================================================================
   CALENDLY DIALOG / POPUP HELPER
   =================================================================== */
const CALENDLY_URL = "https://calendly.com/admin-datarev/30min";

function openCalendly() {
  if (typeof window === "undefined") return;
  if ((window as any).Calendly) {
    (window as any).Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    // Inject widget scripts dynamically if not loaded
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Calendly) {
        (window as any).Calendly.initPopupWidget({ url: CALENDLY_URL });
      } else {
        window.open(CALENDLY_URL, "_blank", "noopener");
      }
    };
    script.onerror = () => {
      window.open(CALENDLY_URL, "_blank", "noopener");
    };
    document.body.appendChild(script);
  }
}

/* ===================================================================
   DICTIONARY (ES / EN)
   =================================================================== */
type Lang = "es" | "en";

interface DictEntry {
  es: string;
  en: string;
}

const DICT: Record<string, DictEntry> = {
  nav_enfoque: { es: "Enfoque", en: "Approach" },
  nav_servicios: { es: "Servicios", en: "Services" },
  nav_talento: { es: "Talento", en: "Talent" },
  nav_diferencia: { es: "Diferencia", en: "Difference" },
  nav_proceso: { es: "Proceso", en: "Process" },
  nav_diag: { es: "Diagnóstico", en: "Assessment" },
  nav_impacto: { es: "Impacto", en: "Impact" },
  nav_contacto: { es: "Contacto", en: "Contact" },
  nav_cta: { es: "Agenda una llamada", en: "Book a call" },
  nav_assess: { es: "Diagnóstico", en: "Assessment" },

  hero_badge: { es: "Bienvenido a la Revolución de Datos", en: "Welcome to the Data Revolution" },
  hero_h1_1: { es: "Impulsa tu negocio con ", en: "Power your business with " },
  hero_h1_2: { es: "IA y analítica avanzada", en: "AI and advanced analytics" },
  hero_sub: {
    es: "Estrategias para líderes que buscan decisiones más rápidas, mayor productividad y resultados medibles. Pasamos a tu organización de tener datos a usarlos estratégicamente.",
    en: "Strategies for leaders who want faster decisions, higher productivity and measurable results. We move your organization from having data to using it strategically.",
  },
  hero_cta1: { es: "Haz tu diagnóstico express", en: "Take express assessment" },
  hero_cta2: { es: "Por qué DataRev", en: "Why DataRev" },
  hero_m1: { es: "ya usa IA en alguna función del negocio", en: "already use AI in at least one function" },
  hero_m2: { es: "de los pilotos de IA realmente genera valor", en: "of AI pilots actually deliver value" },
  hero_m3b: { es: "Semanas", en: "Weeks" },
  hero_m3: { es: "a tu primer resultado medible", en: "to your first measurable result" },

  ten_eye: { es: "El verdadero reto", en: "The real challenge" },
  ten_h2_1: { es: "La estrategia importa. Pero ", en: "Strategy matters. But " },
  ten_h2_2: { es: "la ejecución", en: "execution" },
  ten_h2_3: { es: " es la que transforma el negocio.", en: " is what transforms the business." },
  ten_p: {
    es: "La mayoría de las iniciativas de datos no fracasan por falta de herramientas, sino por falta de adopción y ejecución. Ahí es exactamente donde entramos.",
    en: "Most data initiatives don't fail for lack of tools, but for lack of adoption and execution. That's exactly where we come in.",
  },
  ten_s1: {
    es: "de los pilotos de IA generativa no logran un impacto medible en el negocio. El problema no es la tecnología: es la ejecución.",
    en: "of generative-AI pilots fail to deliver measurable business impact. The problem isn't technology — it's execution.",
  },
  ten_s2: {
    es: "de los proyectos de IA generativa se abandonan tras el POC por mala calidad de datos y bases poco sólidas.",
    en: "of generative-AI projects are abandoned after POC due to poor data quality and weak foundations.",
  },
  ten_s3: {
    es: "de las empresas que usan IA reporta un impacto real en sus resultados. La adopción es masiva; el valor, escaso.",
    en: "of companies using AI report real bottom-line impact. Adoption is massive; value is scarce.",
  },
  ten_c1: { es: "MIT, 2025", en: "MIT, 2025" },
  ten_c2: { es: "Gartner", en: "Gartner" },
  ten_c3: { es: "McKinsey, 2025", en: "McKinsey, 2025" },
  ten_punch: { es: "Tú lideras la Revolución. Nosotros la hacemos realidad.", en: "You lead the Revolution. We make it real." },

  srv_eye: { es: "Nuestro alcance", en: "What we do" },
  srv_h2: { es: "Servicios diseñados para generar valor, no presentaciones", en: "Services built to deliver value, not slideware" },
  srv_p: {
    es: "Desde dashboards ejecutivos hasta copilotos de IA: un portafolio completo para convertir tus datos en decisiones.",
    en: "From executive dashboards to AI copilots: a full portfolio to turn your data into decisions.",
  },
  srv_1t: { es: "Analítica Avanzada", en: "Advanced Analytics" },
  srv_1d: { es: "KPIs ejecutivos y dashboards que habilitan decisiones más rápidas y alineadas con el negocio.", en: "Executive KPIs and dashboards that enable faster, business-aligned decisions." },
  srv_2t: { es: "Gobernanza y Alfabetización", en: "Governance & Data Literacy" },
  srv_2d: { es: "Datos confiables y definiciones compartidas que los equipos pueden utilizar con seguridad y autonomía.", en: "Trustworthy data and shared definitions your teams can use with confidence and autonomy." },
  srv_3t: { es: "IA y Machine Learning", en: "AI & Machine Learning" },
  srv_3d: { es: "Predicción y optimización prácticas, enfocadas en generar resultados medibles desde el inicio.", en: "Practical prediction and optimization, focused on measurable results from day one." },
  srv_4t: { es: "Servicios en la Nube", en: "Cloud Services" },
  srv_4d: { es: "Bases escalables que unifican los datos, aceleran los procesos y reducen cuellos de botella.", en: "Scalable foundations that unify data, speed up processes and remove bottlenecks." },
  srv_5t: { es: "GenAI, Agentes y Automatización", en: "GenAI, Agents & Automation" },
  srv_5d: { es: "Agentes de IA, copilotos, RAG y fine-tuning: automatizamos procesos y llevamos la IA generativa a tu operación diaria.", en: "AI agents, copilots, RAG and fine-tuning: we automate processes and bring generative AI into your daily operation." },
  srv_6t: { es: "Decision Intelligence", en: "Decision Intelligence" },
  srv_6d: { es: "Insights accionables conectados a la operación: cada métrica con un responsable y un siguiente paso.", en: "Actionable insights wired into operations: every metric with an owner and a next step." },

  tal_eye: { es: "Talento y Staffing de Datos", en: "Data Talent & Staffing" },
  tal_h2: { es: "¿Te falta el talento? Lo formamos, seleccionamos y asignamos", en: "Missing the talent? We train, select and staff it for you" },
  tal_p: {
    es: "Además de ejecutar proyectos, construimos y colocamos los equipos de datos que tu operación necesita: del aula a tu proyecto.",
    en: "Beyond delivering projects, we build and place the data teams your operations need — from the classroom to your project.",
  },
  tal_1t: { es: "Formación", en: "Training" },
  tal_1d: { es: "Capacitamos a tu equipo y a nuevos perfiles en analítica, BI, IA generativa y agentes, con rutas prácticas aplicadas a tu negocio.", en: "We train your team and new hires in analytics, BI, generative AI and agents, with practical paths applied to your business." },
  tal_2t: { es: "Selección de talento", en: "Talent selection" },
  tal_2d: { es: "Identificamos y evaluamos a los especialistas adecuados —ingenieros de datos, analistas y científicos de datos— para cada necesidad.", en: "We identify and assess the right specialists —data engineers, analysts and data scientists— for each need." },
  tal_3t: { es: "Asignación a proyectos (staffing)", en: "Project staffing" },
  tal_3d: { es: "Asignamos perfiles listos para ejecutar, integrados a tus proyectos y con el acompañamiento de DataRev.", en: "We assign ready-to-deliver profiles, embedded in your projects and backed by DataRev." },

  dif_eye: { es: "La diferencia DataRev", en: "The DataRev difference" },
  dif_quote1: { es: "No vendemos transformación.", en: "We don't sell transformation." },
  dif_quote2: { es: "Entregamos ", en: "We deliver " },
  dif_quote3: { es: "progreso", en: "progress" },
  dif_1t: { es: "Preparación antes que ambición", en: "Readiness before ambition" },
  dif_1d: { es: "Iniciativas alineadas a tus capacidades actuales para asegurar entrega confiable y ROI real.", en: "Initiatives aligned to your current capabilities to ensure reliable delivery and real ROI." },
  dif_2t: { es: "Resultados sobre horas", en: "Outcomes over hours" },
  dif_2d: { es: "Entregables claros, responsables claros y métricas claras. Sin estrategia eterna sin ejecución.", en: "Clear deliverables, clear owners, clear metrics. No endless strategy without execution." },
  dif_3t: { es: "Adopción desde el diseño", en: "Adoption by design" },
  dif_3d: { es: "Soluciones que los equipos sí usan: gobernanza, alfabetización y experiencias simples.", en: "Solutions teams actually use: governance, literacy and simple experiences." },
  dif_4t: { es: "Alcance honesto", en: "Honest scope" },
  dif_4d: { es: "Si algo no es viable hoy, te mostramos el camino más rápido y realista para lograrlo.", en: "If something isn't viable today, we show you the fastest, most realistic path to get there." },
  dif_5t: { es: "Responsabilidad total", en: "Full accountability" },
  dif_5d: { es: "Siempre sabrás qué está hecho, qué sigue y qué valor se está generando.", en: "You'll always know what's done, what's next and what value is being created." },
  dif_6t: { es: "Enfoque empresarial", en: "Business-first focus" },
  dif_6d: { es: "Nos centramos en resultados, adopción y retorno de inversión medible, desde el primer día.", en: "We focus on outcomes, adoption and measurable ROI, from day one." },

  prc_eye: { es: "Cómo trabajamos", en: "How we work" },
  prc_h2: { es: "Un camino claro, del diagnóstico al valor sostenido", en: "A clear path, from diagnosis to lasting value" },
  prc_p: { es: "Empezamos seguro y pequeño, demostramos impacto rápido y escalamos lo que funciona.", en: "We start safe and small, prove impact fast and scale what works." },
  prc_1t: { es: "Seguridad y confianza", en: "Security & trust" },
  prc_1d: { es: "Un entorno seguro que garantiza privacidad de datos y cumplimiento normativo.", en: "A secure environment that guarantees data privacy and regulatory compliance." },
  prc_2t: { es: "Diagnóstico", en: "Diagnosis" },
  prc_2d: { es: "Analizamos fuentes, definimos KPIs clave e identificamos oportunidades de alto impacto.", en: "We analyze sources, define key KPIs and identify high-impact opportunities." },
  prc_3t: { es: "Piloto (MVP)", en: "Pilot (MVP)" },
  prc_3d: { es: "Desarrollamos rápidamente 1 a 3 dashboards o casos de uso de IA con impacto tangible.", en: "We rapidly build 1–3 dashboards or AI use cases with tangible impact." },
  prc_4t: { es: "Escalamiento y adopción", en: "Scaling & adoption" },
  prc_4d: { es: "Extendemos a más áreas, integramos nuevas fuentes y habilitamos a los equipos.", en: "We extend to more areas, integrate new sources and enable your teams." },
  prc_5t: { es: "Optimización continua", en: "Continuous optimization" },
  prc_5d: { es: "Mejoramos desempeño, gobernanza y aseguramos generación sostenida de valor.", en: "We improve performance, governance and ensure sustained value creation." },

  dg_eye: { es: "Diagnóstico Express", en: "Express Assessment" },
  dg_h2: { es: "Descubre tu madurez de datos e IA en 2 minutos", en: "Discover your data & AI maturity in 2 minutes" },
  dg_it: { es: "Tu diagnóstico de madurez, al instante", en: "Your maturity assessment, instantly" },
  dg_ip: {
    es: "Responde 7 preguntas y recibe al instante tu nivel de madurez, tus principales brechas y las acciones recomendadas para tu negocio.",
    en: "Answer 7 questions and instantly get your maturity level, your main gaps and the recommended actions for your business.",
  },
  dg_f1: { es: "7 preguntas", en: "7 questions" },
  dg_f2: { es: "2 minutos", en: "2 minutes" },
  dg_f3: { es: "Sin registro", en: "No sign-up" },
  dg_f4: { es: "Resultado personalizado", en: "Personalized result" },
  dg_start: { es: "Comenzar diagnóstico", en: "Start assessment" },
  dg_back: { es: "Atrás", en: "Back" },
  dg_lvl: { es: "Tu nivel de madurez", en: "Your maturity level" },
  dg_recs: { es: "Dónde podemos ayudarte primero", en: "Where we can help you first" },
  dg_rcta: { es: "Calculadora Build vs Buy & Diagnóstico", en: "Build vs Buy Calculator & Assessment" },
  dg_email: { es: "Envíanos tu resultado", en: "Email us your result" },
  dg_restart: { es: "↺ Repetir", en: "↺ Retake" },
  dg_pts: { es: "de 21 pts", en: "of 21 pts" },

  imp_eye: { es: "Áreas donde generamos impacto", en: "Where we create impact" },
  imp_h2: { es: "Valor concreto en cada área del negocio", en: "Concrete value in every area of the business" },
  imp_p: { es: "Casos de uso comprobados, listos para adaptarse a tu operación.", en: "Proven use cases, ready to adapt to your operations." },
  imp_1t: { es: "Finanzas", en: "Finance" },
  imp_1a: { es: "Visibilidad del flujo de efectivo", en: "Cash-flow visibility" },
  imp_1b: { es: "Presupuesto vs. resultados", en: "Budget vs. actuals" },
  imp_1c: { es: "Pronóstico y alertas de riesgo", en: "Forecasting & risk alerts" },
  imp_2t: { es: "Ventas y Marketing", en: "Sales & Marketing" },
  imp_2a: { es: "Gestión del embudo y conversión", en: "Funnel & conversion management" },
  imp_2b: { es: "Scoring de leads", en: "Lead scoring" },
  imp_2c: { es: "Medición de ROI de campañas", en: "Campaign ROI measurement" },
  imp_3t: { es: "Operaciones", en: "Operations" },
  imp_3a: { es: "KPIs operativos", en: "Operational KPIs" },
  imp_3b: { es: "Identificación de cuellos de botella", en: "Bottleneck identification" },
  imp_3c: { es: "Gestión del desempeño", en: "Performance management" },
  imp_4t: { es: "Compras e Inventarios", en: "Procurement & Inventory" },
  imp_4a: { es: "Desempeño de proveedores", en: "Supplier performance" },
  imp_4b: { es: "Análisis de gasto", en: "Spend analysis" },
  imp_4c: { es: "Optimización de inventarios", en: "Inventory optimization" },
  imp_5t: { es: "Recursos Humanos", en: "Human Resources" },
  imp_5a: { es: "Indicadores de rotación", en: "Turnover metrics" },
  imp_5b: { es: "Analítica de plantilla (headcount)", en: "Headcount analytics" },
  imp_5c: { es: "Tableros de engagement", en: "Engagement dashboards" },
  imp_6t: { es: "Vista Ejecutiva / Holding", en: "Executive / Holding view" },
  imp_6a: { es: "Cockpit ejecutivo multiempresa", en: "Multi-company executive cockpit" },
  imp_6b: { es: "Métricas estandarizadas", en: "Standardized metrics" },
  imp_6c: { es: "Gobernanza y alineación", en: "Governance & alignment" },

  tec_eye: { es: "Tecnologías con las que trabajamos", en: "Technologies we work with" },
  tec_h2: { es: "El stack moderno de datos, dominado de extremo a extremo", en: "The modern data stack, mastered end to end" },
  tec_sub: { es: "De la fuente al insight: una sola capacidad integral, no piezas sueltas.", en: "From source to insight: one end-to-end capability, not scattered parts." },
  tl1_num: { es: "01 — Fundación", en: "01 — Foundation" },
  tl1_name: { es: "Datos, Nube e Ingeniería", en: "Data, Cloud & Engineering" },
  tl1_desc: { es: "Donde tus datos viven, se integran y se mueven con confianza.", en: "Where your data lives, integrates and moves with confidence." },
  tl2_num: { es: "02 — Gobernanza", en: "02 — Governance" },
  tl2_name: { es: "Gobernanza y Catálogo de Datos", en: "Data Governance & Catalog" },
  tl2_desc: { es: "Datos confiables, documentados y bajo control en toda la organización.", en: "Trustworthy, documented data under control across the organization." },
  tl3_num: { es: "03 — Insight", en: "03 — Insight" },
  tl3_name: { es: "Analítica y Visualización", en: "Analytics & Visualization" },
  tl3_desc: { es: "KPIs y dashboards que convierten datos en decisiones.", en: "KPIs and dashboards that turn data into decisions." },
  tl4_num: { es: "04 — Inteligencia", en: "04 — Intelligence" },
  tl4_name: { es: "IA, ML y LLMs", en: "AI, ML & LLMs" },
  tl4_desc: { es: "Modelos como Claude (Anthropic), GPT (OpenAI) o Gemini (Google), aplicados en copilotos, agentes y automatización.", en: "Models like Claude (Anthropic), GPT (OpenAI) or Gemini (Google), applied in copilots, agents and automation." },

  cta_eye: { es: "Empecemos", en: "Let's start" },
  cta_h2: { es: "¿Listo para convertir los datos en crecimiento?", en: "Ready to turn data into growth?" },
  cta_p: {
    es: "Alineemos prioridades y logremos un primer resultado rápido, medible y de alto impacto. Sin compromisos eternos: empezamos con un diagnóstico.",
    en: "Let's align priorities and land a first quick, measurable, high-impact result. No endless commitments — we start with an assessment.",
  },
  cta_1: { es: "Agenda una llamada", en: "Book a call" },
  cta_2: { es: "Ir a la Calculadora Build vs Buy", en: "Go to Build vs Buy Calculator" },

  con_eye: { es: "Contacto", en: "Contact" },
  con_h2: { es: "Hablemos de tu caso", en: "Let's talk about your case" },
  con_p: {
    es: "Cuéntanos dónde estás hoy con tus datos. Te respondemos con un plan concreto y un primer resultado a la vista.",
    en: "Tell us where you are today with your data. We'll reply with a concrete plan and a first result in sight.",
  },
  con_tel: { es: "Teléfono", en: "Phone" },
  con_mail: { es: "Correo", en: "Email" },
  con_cal: { es: "Agenda en línea", en: "Book online" },
  con_cal_b: { es: "Reserva una llamada", en: "Reserve a call" },
  foot_copy: {
    es: "DataRev — Data Revolution. Tú lideras la Revolución. Nosotros la hacemos realidad.",
    en: "DataRev — Data Revolution. You lead the Revolution. We make it real.",
  },
};

/* ===================================================================
   QUESTIONS FOR EXPRESS ASSESSMENT
   =================================================================== */
interface Question {
  dim: string;
  q: DictEntry;
  opts: { text: DictEntry; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    dim: "cloud",
    q: {
      es: "¿Qué tan fácil es para tu equipo obtener los datos que necesita para decidir?",
      en: "How easily can your team get the data it needs to make decisions?",
    },
    opts: [
      { text: { es: "Casi imposible, están dispersos en muchos sistemas", en: "Almost impossible — scattered across many systems" }, score: 0 },
      { text: { es: "Con esfuerzo manual y demoras", en: "With manual effort and delays" }, score: 1 },
      { text: { es: "Disponibles, pero poco confiables", en: "Available, but not very reliable" }, score: 2 },
      { text: { es: "Rápido y confiable, en un solo lugar", en: "Fast and reliable, in one place" }, score: 3 },
    ],
  },
  {
    dim: "gov",
    q: {
      es: "¿Cómo describes la gobernanza de tus datos (estándares, responsables y seguridad)?",
      en: "How would you describe your data governance (standards, owners and security)?",
    },
    opts: [
      { text: { es: "Sin estándares ni responsables definidos", en: "No defined standards or owners" }, score: 0 },
      { text: { es: "Reglas informales que varían por equipo", en: "Informal rules that vary by team" }, score: 1 },
      { text: { es: "Políticas definidas en las áreas clave", en: "Defined policies in key areas" }, score: 2 },
      { text: { es: "Gobernanza formal y catálogo de datos", en: "Formal governance and a data catalog" }, score: 3 },
    ],
  },
  {
    dim: "truth",
    q: {
      es: "¿Los KPIs de todas las áreas son consistentes y comparten una única fuente de verdad?",
      en: "Are KPIs across all areas consistent and based on a single source of truth?",
    },
    opts: [
      { text: { es: "Cada área tiene su propia verdad y los números no coinciden", en: "Each area has its own truth and numbers don't match" }, score: 0 },
      { text: { es: "Hay muchas discrepancias; conciliamos a mano", en: "Many discrepancies; we reconcile manually" }, score: 1 },
      { text: { es: "Las métricas clave están alineadas, con algunas excepciones", en: "Key metrics are aligned, with some exceptions" }, score: 2 },
      { text: { es: "Una sola fuente de verdad para toda la empresa", en: "A single source of truth across the whole company" }, score: 3 },
    ],
  },
  {
    dim: "analytics",
    q: {
      es: "¿Cómo visualizan hoy sus indicadores (KPIs)?",
      en: "How do you track your KPIs today?",
    },
    opts: [
      { text: { es: "Hojas de cálculo manuales", en: "Manual spreadsheets" }, score: 0 },
      { text: { es: "Reportes estáticos periódicos", en: "Periodic static reports" }, score: 1 },
      { text: { es: "Algunos dashboards, no integrados", en: "Some dashboards, not integrated" }, score: 2 },
      { text: { es: "Dashboards integrados en tiempo real", en: "Integrated, real-time dashboards" }, score: 3 },
    ],
  },
  {
    dim: "ai",
    q: {
      es: "¿Qué tanto usan IA o automatización en la operación?",
      en: "How much do you use AI or automation in operations?",
    },
    opts: [
      { text: { es: "Nada todavía", en: "Not at all yet" }, score: 0 },
      { text: { es: "Pruebas aisladas o POCs", en: "Isolated tests or POCs" }, score: 1 },
      { text: { es: "En 1 o 2 procesos clave", en: "In 1–2 key processes" }, score: 2 },
      { text: { es: "Integrada en varias áreas", en: "Embedded across several areas" }, score: 3 },
    ],
  },
  {
    dim: "culture",
    q: {
      es: "¿Las decisiones del negocio se toman con datos?",
      en: "Are business decisions driven by data?",
    },
    opts: [
      { text: { es: "Sobre todo por intuición", en: "Mostly by intuition" }, score: 0 },
      { text: { es: "Datos solo para reportar el pasado", en: "Data only to report the past" }, score: 1 },
      { text: { es: "Datos en las decisiones importantes", en: "Data in important decisions" }, score: 2 },
      { text: { es: "Cultura data-driven en todos los niveles", en: "Data-driven culture at every level" }, score: 3 },
    ],
  },
  {
    dim: "speed",
    q: {
      es: "Cuando surge una pregunta de negocio, ¿qué tan rápido obtienen la respuesta?",
      en: "When a business question arises, how fast do you get the answer?",
    },
    opts: [
      { text: { es: "Días o semanas", en: "Days or weeks" }, score: 0 },
      { text: { es: "Varias horas, y depende de alguien", en: "Several hours, and it depends on someone" }, score: 1 },
      { text: { es: "El mismo día", en: "The same day" }, score: 2 },
      { text: { es: "En minutos, en autoservicio", en: "In minutes, self-served" }, score: 3 },
    ],
  },
];

const LEVELS = [
  {
    min: 0,
    name: { es: "Reactivo", en: "Reactive" },
    diag: {
      es: "Tus datos están dispersos y muchas decisiones se toman por intuición. Hay una gran oportunidad de obtener resultados rápidos con las bases correctas.",
      en: "Your data is scattered and many decisions rely on intuition. There's huge upside in quick wins once the right foundations are in place.",
    },
  },
  {
    min: 7,
    name: { es: "En desarrollo", en: "Developing" },
    diag: {
      es: "Ya tienes reportes y algunas iniciativas, pero falta consistencia, gobernanza y adopción para escalar el valor.",
      en: "You already have reports and some initiatives, but you lack the consistency, governance and adoption needed to scale the value.",
    },
  },
  {
    min: 13,
    name: { es: "Establecido", en: "Established" },
    diag: {
      es: "Tomas decisiones con datos en áreas clave. El siguiente salto es integrar, automatizar y aplicar IA donde más impacta.",
      en: "You make data-driven decisions in key areas. The next leap is to integrate, automate and apply AI where it matters most.",
    },
  },
  {
    min: 18,
    name: { es: "Líder", en: "Leader" },
    diag: {
      es: "Operas con una cultura data-driven madura. Nos enfocamos en IA avanzada, optimización continua y nuevas fuentes de ventaja competitiva.",
      en: "You operate with a mature data-driven culture. We focus on advanced AI, continuous optimization and new sources of competitive advantage.",
    },
  },
];

const RECS: Record<string, { t: DictEntry; d: DictEntry }> = {
  cloud: { t: { es: "Servicios en la Nube", en: "Cloud Services" }, d: { es: "Unifica tus datos en una base escalable y confiable.", en: "Unify your data on a scalable, reliable foundation." } },
  gov: { t: { es: "Gobernanza y Catálogo", en: "Governance & Catalog" }, d: { es: "Estándares, responsables y datos documentados y bajo control.", en: "Standards, owners and documented data under control." } },
  truth: { t: { es: "Única Fuente de Verdad", en: "Single Source of Truth" }, d: { es: "Un modelo semántico y KPIs consistentes para toda la organización.", en: "A shared semantic model and consistent KPIs across the organization." } },
  analytics: { t: { es: "Analítica Avanzada", en: "Advanced Analytics" }, d: { es: "Dashboards ejecutivos en tiempo real para decidir más rápido.", en: "Real-time executive dashboards to decide faster." } },
  ai: { t: { es: "IA y Automatización", en: "AI & Automation" }, d: { es: "Aplica predicción y automatización en tus procesos clave.", en: "Apply prediction and automation to your key processes." } },
  culture: { t: { es: "Decision Intelligence", en: "Decision Intelligence" }, d: { es: "Conecta cada métrica con un responsable y una acción.", en: "Connect every metric to an owner and an action." } },
  speed: { t: { es: "Copilotos y Self-Service", en: "Copilots & Self-Service" }, d: { es: "Respuestas en lenguaje natural, en minutos y en autoservicio.", en: "Natural-language answers, in minutes, self-served." } },
};

/* ===================================================================
   MAIN LANDING PAGE COMPONENT
   =================================================================== */
export function DataRevLanding() {
  const [lang, setLang] = useState<Lang>("es");
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Diagnostic Quiz State
  const [dxStarted, setDxStarted] = useState(false);
  const [dxIdx, setDxIdx] = useState(0);
  const [dxAnswers, setDxAnswers] = useState<{ dim: string; score: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper translation function
  const t = (key: string): string => {
    if (!DICT[key]) return key;
    return DICT[key][lang] || DICT[key].es;
  };

  // Header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Plexus particle canvas background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let running = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }

    const isMobile = window.innerWidth < 760;
    const count = isMobile ? 22 : Math.min(58, Math.floor((width * height) / 26000));
    const linkDist = isMobile ? 110 : 150;
    const linkDistSq = linkDist * linkDist;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const m = particles[j];
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;

          if (d2 < linkDistSq) {
            const alpha = (1 - d2 / linkDistSq) * 0.45;
            ctx.strokeStyle = `rgba(0, 194, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(95, 216, 255, 0.85)";
        ctx.fill();
      }

      if (running) {
        rafId = requestAnimationFrame(draw);
      }
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Calculate express assessment score
  const totalScore = dxAnswers.reduce((acc, curr) => acc + curr.score, 0);
  const maxScore = QUESTIONS.length * 3;
  const currentLevel = LEVELS.reduce((acc, curr) => (totalScore >= curr.min ? curr : acc), LEVELS[0]);

  // Determine top 3 recommendation priorities
  const sortedAnswers = [...dxAnswers].sort((a, b) => a.score - b.score);
  const seenDims = new Set<string>();
  const topPicks: string[] = [];
  sortedAnswers.forEach((ans) => {
    if (!seenDims.has(ans.dim) && topPicks.length < 3) {
      seenDims.add(ans.dim);
      topPicks.push(ans.dim);
    }
  });

  const mailtoSubject = encodeURIComponent(
    lang === "es"
      ? `Diagnóstico DataRev — Nivel ${currentLevel.name.es} (${totalScore}/${maxScore})`
      : `DataRev Assessment — ${currentLevel.name.en} level (${totalScore}/${maxScore})`
  );
  const mailtoBody = encodeURIComponent(
    lang === "es"
      ? `Hola DataRev,\n\nHice el diagnóstico express en línea y mi resultado fue:\n• Nivel: ${currentLevel.name.es}\n• Puntaje: ${totalScore}/${maxScore}\n• Prioridades sugeridas: ${topPicks.map((d) => RECS[d]?.t.es).join(", ")}\n\nMe gustaría agendar una llamada.`
      : `Hi DataRev,\n\nI took the online express assessment and my result was:\n• Level: ${currentLevel.name.en}\n• Score: ${totalScore}/${maxScore}\n• Suggested priorities: ${topPicks.map((d) => RECS[d]?.t.en).join(", ")}\n\nI'd like to book a call.`
  );

  return (
    <div className="relative min-h-screen bg-[#04081f] text-[#eaf1ff] font-sans antialiased selection:bg-[#00c2ff] selection:text-[#04081f]">
      {/* Background Interactive Plexus Canvas & Radial Glows */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" aria-hidden="true" />
      <div className="fixed top-[-180px] right-[-120px] w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,#0a3fd6,transparent_65%)] blur-[90px] opacity-40 pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed top-[40%] left-[-200px] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,#00c2ff,transparent_65%)] blur-[90px] opacity-20 pointer-events-none z-0" aria-hidden="true" />

      {/* Main Container Shell */}
      <div className="relative z-10">
        {/* ================= HEADER & NAV ================= */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-[#00B4F6] shadow-[0_9px_28px_-10px_rgba(0,28,66,0.6)]" : "bg-[#00B4F6] shadow-[0_4px_20px_-8px_rgba(0,40,90,0.45)]"
          }`}
        >
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
            <Link href="#top" className="flex items-center gap-2 group" aria-label="DataRev">
              <span className="font-bold text-xl tracking-tight text-[#04081f] group-hover:opacity-90">
                DATA<span className="text-[#0a2bb0]">REV</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-[0.92rem] font-semibold text-[#06283a]">
              <a href="#enfoque" className="hover:text-[#021019] transition-colors">{t("nav_enfoque")}</a>
              <a href="#servicios" className="hover:text-[#021019] transition-colors">{t("nav_servicios")}</a>
              <a href="#talento" className="hover:text-[#021019] transition-colors">{t("nav_talento")}</a>
              <a href="#diferencia" className="hover:text-[#021019] transition-colors">{t("nav_diferencia")}</a>
              <a href="#proceso" className="hover:text-[#021019] transition-colors">{t("nav_proceso")}</a>
              <a href="#diagnostico" className="hover:text-[#021019] transition-colors">{t("nav_diag")}</a>
              <a href="#impacto" className="hover:text-[#021019] transition-colors">{t("nav_impacto")}</a>
              <a href="#contacto" className="hover:text-[#021019] transition-colors">{t("nav_contacto")}</a>
            </nav>

            {/* CTA Buttons & Language Switcher */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#06283a]/30 rounded-full bg-white/20 text-[#06283a] font-bold text-xs hover:bg-white/40 transition"
                aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
              >
                <svg className="w-3.5 h-3.5 stroke-[#06283a] fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                  <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" strokeWidth="1.8" />
                </svg>
                <span>{lang === "es" ? "EN" : "ES"}</span>
              </button>

              <Link
                href="/calculadora#build-vs-buy"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#04081f] text-white font-semibold text-xs hover:bg-[#0a1444] transition shadow-md hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3 8-8" />
                  <path d="M21 12a9 9 0 1 1-6.2-8.5" />
                </svg>
                <span>{t("nav_assess")}</span>
              </Link>

              <button
                type="button"
                onClick={openCalendly}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-[#06283a]/40 text-[#06283a] font-semibold text-xs hover:bg-[#06283a]/10 transition"
              >
                {t("nav_cta")}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setNavOpen(!navOpen)}
                className="md:hidden p-2 rounded-lg border border-[#06283a]/30 text-[#06283a] hover:bg-white/20 transition"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d={navOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {navOpen && (
            <div className="md:hidden bg-[#04081f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 text-base font-semibold text-[#eaf1ff]">
              <a href="#enfoque" onClick={() => setNavOpen(false)}>{t("nav_enfoque")}</a>
              <a href="#servicios" onClick={() => setNavOpen(false)}>{t("nav_servicios")}</a>
              <a href="#talento" onClick={() => setNavOpen(false)}>{t("nav_talento")}</a>
              <a href="#diferencia" onClick={() => setNavOpen(false)}>{t("nav_diferencia")}</a>
              <a href="#proceso" onClick={() => setNavOpen(false)}>{t("nav_proceso")}</a>
              <a href="#diagnostico" onClick={() => setNavOpen(false)}>{t("nav_diag")}</a>
              <a href="#impacto" onClick={() => setNavOpen(false)}>{t("nav_impacto")}</a>
              <a href="#contacto" onClick={() => setNavOpen(false)}>{t("nav_contacto")}</a>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href="/calculadora#build-vs-buy"
                  onClick={() => setNavOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#1763ff] text-white font-semibold text-sm"
                >
                  {t("nav_assess")}
                </Link>
                <button
                  type="button"
                  onClick={() => { setNavOpen(false); openCalendly(); }}
                  className="w-full text-center py-2.5 rounded-full border border-white/30 text-white font-semibold text-sm"
                >
                  {t("nav_cta")}
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ================= HERO SECTION ================= */}
        <section id="top" className="pt-36 sm:pt-44 pb-16 sm:pb-24">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/15 bg-[#101c48]/45 backdrop-blur-md text-xs text-[#aab4d4] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00c2ff] shadow-[0_0_12px_#00c2ff] animate-pulse" />
              <span>{t("hero_badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl">
              {t("hero_h1_1")}
              <span className="bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] bg-clip-text text-transparent">
                {t("hero_h1_2")}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-[#aab4d4] max-w-2xl leading-relaxed">
              {t("hero_sub")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/calculadora#build-vs-buy"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] text-white font-semibold text-sm shadow-[0_12px_34px_-10px_rgba(10,63,214,0.8)] hover:shadow-[0_20px_44px_-10px_rgba(0,194,255,0.7)] hover:-translate-y-0.5 transition"
              >
                <span>{t("hero_cta1")}</span>
                <span>→</span>
              </Link>
              <a
                href="#diferencia"
                className="inline-flex items-center px-6 py-3.5 rounded-full border border-white/15 bg-white/[0.02] text-[#eaf1ff] font-semibold text-sm hover:border-[#00c2ff] hover:bg-[#00c2ff]/10 transition"
              >
                {t("hero_cta2")}
              </a>
            </div>

            {/* Metrics Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative p-5 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00c2ff] to-[#0a2bb0]" />
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  88%
                </span>
                <span className="block mt-2 text-xs sm:text-sm text-[#aab4d4]">
                  {t("hero_m1")}
                </span>
              </div>

              <div className="relative p-5 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00c2ff] to-[#0a2bb0]" />
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  5%
                </span>
                <span className="block mt-2 text-xs sm:text-sm text-[#aab4d4]">
                  {t("hero_m2")}
                </span>
              </div>

              <div className="relative p-5 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00c2ff] to-[#0a2bb0]" />
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  {t("hero_m3b")}
                </span>
                <span className="block mt-2 text-xs sm:text-sm text-[#aab4d4]">
                  {t("hero_m3")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TENSION / REAL CHALLENGE ================= */}
        <section id="enfoque" className="py-20 bg-gradient-to-b from-transparent via-[#08123a]/50 to-transparent">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("ten_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("ten_h2_1")}
                <span className="text-white font-bold">{t("ten_h2_2")}</span>
                {t("ten_h2_3")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("ten_p")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md relative overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  95%
                </span>
                <p className="mt-3 text-sm text-[#aab4d4] leading-relaxed">
                  {t("ten_s1")}
                </p>
                <cite className="block mt-4 text-xs font-mono tracking-wider text-[#7b87ad] uppercase not-italic">
                  — {t("ten_c1")}
                </cite>
              </div>

              <div className="p-6 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md relative overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  30%
                </span>
                <p className="mt-3 text-sm text-[#aab4d4] leading-relaxed">
                  {t("ten_s2")}
                </p>
                <cite className="block mt-4 text-xs font-mono tracking-wider text-[#7b87ad] uppercase not-italic">
                  — {t("ten_c2")}
                </cite>
              </div>

              <div className="p-6 rounded-2xl border border-white/15 bg-[#101c48]/45 backdrop-blur-md relative overflow-hidden group hover:border-[#00c2ff]/40 transition">
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent font-mono">
                  39%
                </span>
                <p className="mt-3 text-sm text-[#aab4d4] leading-relaxed">
                  {t("ten_s3")}
                </p>
                <cite className="block mt-4 text-xs font-mono tracking-wider text-[#7b87ad] uppercase not-italic">
                  — {t("ten_c3")}
                </cite>
              </div>
            </div>

            <p className="mt-12 text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] bg-clip-text text-transparent max-w-xl">
              {t("ten_punch")}
            </p>
          </div>
        </section>

        {/* ================= SERVICES SECTION ================= */}
        <section id="servicios" className="py-20">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("srv_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("srv_h2")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("srv_p")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t("srv_1t"), desc: t("srv_1d"), icon: "M3 3v18h18M7 15l3-4 3 2 4-6" },
                { title: t("srv_2t"), desc: t("srv_2d"), icon: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6zM9 12l2 2 4-4" },
                { title: t("srv_3t"), desc: t("srv_3d"), icon: "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" },
                { title: t("srv_4t"), desc: t("srv_4d"), icon: "M18 10a4 4 0 0 0-7.7-1.5A3.5 3.5 0 1 0 7 16h11a3 3 0 0 0 0-6z" },
                { title: t("srv_5t"), desc: t("srv_5d"), icon: "M7 9h6M7 13h4M16 20l2-2 2 2" },
                { title: t("srv_6t"), desc: t("srv_6d"), icon: "M4 6h16M4 12h10M4 18h7" },
              ].map((srv, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.035] to-white/[0.01] backdrop-blur-md hover:border-[#00c2ff]/40 transition hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c2ff]/10 border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#00c2ff]/40 transition">
                    <svg className="w-6 h-6 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path d={srv.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{srv.title}</h3>
                  <p className="text-sm text-[#aab4d4] leading-relaxed">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TALENT & STAFFING ================= */}
        <section id="talento" className="py-20 bg-gradient-to-b from-transparent via-[#08123a]/40 to-transparent">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("tal_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("tal_h2")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("tal_p")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t("tal_1t"), desc: t("tal_1d"), icon: "M3 8l9-4 9 4-9 4-9-4zM7 10.5V15c0 1.4 2.7 2.5 5 2.5s5-1.1 5-2.5v-4.5" },
                { title: t("tal_2t"), desc: t("tal_2d"), icon: "M3 21c0-4 3.5-6 7-6M15 17l2.5 2.5L22 14" },
                { title: t("tal_3t"), desc: t("tal_3d"), icon: "M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16.5 14.2c2.6.3 4.5 1.9 4.5 4.8" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.035] to-white/[0.01] backdrop-blur-md hover:border-[#00c2ff]/40 transition hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c2ff]/10 border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#00c2ff]/40 transition">
                    <svg className="w-6 h-6 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#aab4d4] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= DATAREV DIFFERENCE ================= */}
        <section id="diferencia" className="py-20">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
              {t("dif_eye")}
            </span>

            <p className="text-2xl sm:text-4xl font-bold max-w-2xl leading-tight">
              <span className="line-through text-[#7b87ad]/60 mr-3">{t("dif_quote1")}</span>
              <br />
              <span>{t("dif_quote2")}</span>
              <span className="bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent">
                {t("dif_quote3")}
              </span>
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 border border-white/15 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/15">
              {[
                { num: "01", t: t("dif_1t"), d: t("dif_1d") },
                { num: "02", t: t("dif_2t"), d: t("dif_2d") },
                { num: "03", t: t("dif_3t"), d: t("dif_3d") },
                { num: "04", t: t("dif_4t"), d: t("dif_4d") },
                { num: "05", t: t("dif_5t"), d: t("dif_5d") },
                { num: "06", t: t("dif_6t"), d: t("dif_6d") },
              ].map((p, idx) => (
                <div key={idx} className="p-6 sm:p-8 hover:bg-[#00c2ff]/5 transition">
                  <span className="font-mono text-xs font-bold text-[#00c2ff] tracking-widest">{p.num}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-2">{p.t}</h3>
                  <p className="text-sm text-[#aab4d4] leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PROCESS / HOW WE WORK ================= */}
        <section id="proceso" className="py-20 bg-gradient-to-b from-transparent via-[#08123a]/50 to-transparent">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("prc_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("prc_h2")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("prc_p")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
              {[
                { num: "01", t: t("prc_1t"), d: t("prc_1d") },
                { num: "02", t: t("prc_2t"), d: t("prc_2d") },
                { num: "03", t: t("prc_3t"), d: t("prc_3d") },
                { num: "04", t: t("prc_4t"), d: t("prc_4d") },
                { num: "05", t: t("prc_5t"), d: t("prc_5d") },
              ].map((st, idx) => (
                <div key={idx} className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#08123a] border border-[#00c2ff] text-[#00c2ff] font-bold font-mono text-sm flex items-center justify-center mb-4">
                    {st.num}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{st.t}</h3>
                  <p className="text-xs text-[#aab4d4] leading-relaxed">{st.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= EXPRESS DIAGNOSTIC HOOK ================= */}
        <section id="diagnostico" className="py-20">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("dg_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("dg_h2")}
              </h2>
            </div>

            <div className="max-w-2xl mx-auto border border-[#00c2ff]/30 rounded-3xl bg-[#101c48]/60 backdrop-blur-xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0]" />

              {!dxStarted ? (
                /* Intro state */
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#00c2ff]/10 border border-white/10 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path d="M9 11l3 3 8-8" />
                      <path d="M21 12a9 9 0 1 1-6.2-8.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{t("dg_it")}</h3>
                  <p className="text-sm text-[#aab4d4] max-w-md mx-auto mb-6 leading-relaxed">
                    {t("dg_ip")}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#7b87ad] mb-8">
                    <span>✓ {t("dg_f1")}</span>
                    <span>✓ {t("dg_f2")}</span>
                    <span>✓ {t("dg_f3")}</span>
                    <span>✓ {t("dg_f4")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDxStarted(true);
                      setDxIdx(0);
                      setDxAnswers([]);
                    }}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] text-white font-semibold text-sm shadow-[0_12px_34px_-10px_rgba(10,63,214,0.8)] hover:shadow-[0_20px_44px_-10px_rgba(0,194,255,0.7)] hover:-translate-y-0.5 transition"
                  >
                    {t("dg_start")}
                  </button>
                </div>
              ) : dxIdx < QUESTIONS.length ? (
                /* Quiz state */
                <div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-gradient-to-r from-[#00c2ff] to-[#1763ff] transition-all duration-300"
                      style={{ width: `${(dxIdx / QUESTIONS.length) * 100}%` }}
                    />
                  </div>

                  <div className="text-xs font-mono text-[#aab4d4] mb-2 tracking-wider">
                    Pregunta {dxIdx + 1} de {QUESTIONS.length}
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-6">
                    {QUESTIONS[dxIdx].q[lang] || QUESTIONS[dxIdx].q.es}
                  </h3>

                  <div className="grid gap-3">
                    {QUESTIONS[dxIdx].opts.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          const nextAnswers = [...dxAnswers, { dim: QUESTIONS[dxIdx].dim, score: opt.score }];
                          setDxAnswers(nextAnswers);
                          setDxIdx(dxIdx + 1);
                        }}
                        className="w-full text-left p-4 rounded-xl border border-white/15 bg-white/[0.02] text-sm text-[#eaf1ff] hover:border-[#00c2ff] hover:bg-[#00c2ff]/10 hover:translate-x-1 transition flex items-center gap-3"
                      >
                        <span className="w-4 h-4 rounded-full border-2 border-[#7b87ad] flex-none" />
                        <span>{opt.text[lang] || opt.text.es}</span>
                      </button>
                    ))}
                  </div>

                  {dxIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => setDxIdx(dxIdx - 1)}
                      className="mt-6 text-xs text-[#aab4d4] hover:text-white transition flex items-center gap-1"
                    >
                      ← {t("dg_back")}
                    </button>
                  )}
                </div>
              ) : (
                /* Result state */
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full border-4 border-[#00c2ff] flex items-center justify-center mx-auto mb-6 bg-[#08123a]/80 shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                    <div>
                      <span className="text-3xl font-bold font-mono">{totalScore}</span>
                      <span className="block text-[10px] text-[#7b87ad]">{t("dg_pts")}</span>
                    </div>
                  </div>

                  <span className="text-xs uppercase tracking-widest text-[#7b87ad]">{t("dg_lvl")}</span>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#1763ff] bg-clip-text text-transparent mt-1 mb-3">
                    {currentLevel.name[lang] || currentLevel.name.es}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#aab4d4] max-w-md mx-auto mb-6">
                    {currentLevel.diag[lang] || currentLevel.diag.es}
                  </p>

                  <div className="text-left bg-white/[0.02] border border-white/10 rounded-xl p-4 mb-6">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#5fd8ff] text-center mb-3">
                      {t("dg_recs")}
                    </h4>
                    <div className="space-y-2">
                      {topPicks.map((dimKey, pIdx) => (
                        <div key={pIdx} className="flex gap-3 text-xs text-[#aab4d4]">
                          <span className="font-mono font-bold text-[#00c2ff]">{pIdx + 1}.</span>
                          <div>
                            <strong className="text-white block">
                              {RECS[dimKey]?.t[lang] || RECS[dimKey]?.t.es}
                            </strong>
                            <span>{RECS[dimKey]?.d[lang] || RECS[dimKey]?.d.es}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/calculadora#build-vs-buy"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] text-white font-semibold text-xs shadow-md hover:-translate-y-0.5 transition"
                    >
                      {t("dg_rcta")} →
                    </Link>
                    <a
                      href={`mailto:hello@datarev.solutions?subject=${mailtoSubject}&body=${mailtoBody}`}
                      className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition"
                    >
                      {t("dg_email")}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDxIdx(0);
                      setDxAnswers([]);
                    }}
                    className="mt-4 text-xs text-[#7b87ad] hover:text-white transition"
                  >
                    {t("dg_restart")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= IMPACT BY BUSINESS UNIT ================= */}
        <section id="impacto" className="py-20 bg-gradient-to-b from-transparent via-[#08123a]/40 to-transparent">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("imp_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("imp_h2")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("imp_p")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { t: t("imp_1t"), items: [t("imp_1a"), t("imp_1b"), t("imp_1c")] },
                { t: t("imp_2t"), items: [t("imp_2a"), t("imp_2b"), t("imp_2c")] },
                { t: t("imp_3t"), items: [t("imp_3a"), t("imp_3b"), t("imp_3c")] },
                { t: t("imp_4t"), items: [t("imp_4a"), t("imp_4b"), t("imp_4c")] },
                { t: t("imp_5t"), items: [t("imp_5a"), t("imp_5b"), t("imp_5c")] },
                { t: t("imp_6t"), items: [t("imp_6a"), t("imp_6b"), t("imp_6c")] },
              ].map((imp, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-white/15 bg-white/[0.02] backdrop-blur-md">
                  <h3 className="text-base font-semibold mb-4 text-[#00c2ff]">{imp.t}</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#aab4d4]">
                    {imp.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00c2ff] flex-none" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TECH STACK ================= */}
        <section id="tech" className="py-20">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                {t("tec_eye")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold mt-3 leading-tight">
                {t("tec_h2")}
              </h2>
              <p className="mt-4 text-[#aab4d4] text-sm sm:text-base leading-relaxed">
                {t("tec_sub")}
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  num: t("tl1_num"),
                  name: t("tl1_name"),
                  desc: t("tl1_desc"),
                  logos: ["AWS", "Microsoft Azure", "Oracle Cloud", "Snowflake", "Vertica", "Pentaho", "Python", "SQL", "APIs"],
                },
                {
                  num: t("tl2_num"),
                  name: t("tl2_name"),
                  desc: t("tl2_desc"),
                  logos: ["Collibra", "Alation", "Calidad de Datos", "Linaje de Datos"],
                },
                {
                  num: t("tl3_num"),
                  name: t("tl3_name"),
                  desc: t("tl3_desc"),
                  logos: ["Power BI", "Tableau", "Qlik", "Looker", "Amazon QuickSight"],
                },
                {
                  num: t("tl4_num"),
                  name: t("tl4_name"),
                  desc: t("tl4_desc"),
                  logos: [
                    "Anthropic · Claude",
                    "OpenAI · GPT",
                    "Google · Gemini",
                    "Meta · Llama",
                    "Mistral",
                    "Dataiku",
                    "Copilotos",
                    "IA Agéntica",
                    "RAG",
                    "Automatización",
                    "MCP",
                  ],
                },
              ].map((layer, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 pt-6 border-t border-white/15">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#00c2ff] tracking-wider uppercase">{layer.num}</span>
                    <h3 className="text-lg font-semibold mt-1">{layer.name}</h3>
                    <p className="text-xs text-[#7b87ad] mt-2 max-w-xs">{layer.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {layer.logos.map((lg, lIdx) => (
                      <span
                        key={lIdx}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-[#aab4d4] hover:border-[#00c2ff]/50 hover:bg-[#00c2ff]/10 hover:text-white transition"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5fd8ff]" />
                        <span>{lg}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA BAND ================= */}
        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="relative rounded-3xl p-8 sm:p-14 border border-[#00c2ff]/30 bg-gradient-to-r from-[#08123a] via-[#101c48] to-[#04081f] overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase">{t("cta_eye")}</span>
                <h2 className="text-2xl sm:text-4xl font-bold mt-2 leading-tight">{t("cta_h2")}</h2>
                <p className="text-sm sm:text-base text-[#aab4d4] mt-4 leading-relaxed">{t("cta_p")}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={openCalendly}
                    className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00c2ff] via-[#1763ff] to-[#0a2bb0] text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition"
                  >
                    {t("cta_1")} →
                  </button>
                  <Link
                    href="/calculadora#build-vs-buy"
                    className="px-6 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition"
                  >
                    {t("cta_2")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT SECTION ================= */}
        <section id="contacto" className="py-20">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-semibold tracking-widest text-[#5fd8ff] uppercase flex items-center gap-2">
                  <span className="w-6 h-px bg-gradient-to-r from-[#00c2ff] to-transparent" />
                  {t("con_eye")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-3 leading-tight">{t("con_h2")}</h2>
                <p className="mt-4 text-[#aab4d4] text-base leading-relaxed max-w-md">{t("con_p")}</p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+525591996815"
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/15 bg-[#101c48]/45 hover:border-[#00c2ff] hover:translate-x-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c2ff]/10 flex items-center justify-center flex-none">
                    <svg className="w-6 h-6 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                    </svg>
                  </div>
                  <div>
                    <small className="text-xs uppercase tracking-wider text-[#7b87ad] block">{t("con_tel")}</small>
                    <b className="text-base text-white">+52 (55) 9199-6815</b>
                  </div>
                </a>

                <a
                  href="mailto:hello@datarev.solutions"
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/15 bg-[#101c48]/45 hover:border-[#00c2ff] hover:translate-x-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c2ff]/10 flex items-center justify-center flex-none">
                    <svg className="w-6 h-6 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <div>
                    <small className="text-xs uppercase tracking-wider text-[#7b87ad] block">{t("con_mail")}</small>
                    <b className="text-base text-white">hello@datarev.solutions</b>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={openCalendly}
                  className="w-full text-left flex items-center gap-4 p-5 rounded-xl border border-white/15 bg-[#101c48]/45 hover:border-[#00c2ff] hover:translate-x-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00c2ff]/10 flex items-center justify-center flex-none">
                    <svg className="w-6 h-6 stroke-[#00c2ff] fill-none" viewBox="0 0 24 24" strokeWidth="1.7">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M3 9h18M8 2v4M16 2v4M9 14l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <small className="text-xs uppercase tracking-wider text-[#7b87ad] block">{t("con_cal")}</small>
                    <b className="text-base text-white">{t("con_cal_b")}</b>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/15 py-12 bg-[#04081f]">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <Link href="#top" className="font-bold text-xl tracking-tight text-white">
                DATA<span className="text-[#00c2ff]">REV</span>
              </Link>
              <nav className="flex flex-wrap items-center gap-6 text-sm text-[#aab4d4]">
                <a href="#servicios" className="hover:text-white transition">{t("nav_servicios")}</a>
                <a href="#talento" className="hover:text-white transition">{t("nav_talento")}</a>
                <a href="#diferencia" className="hover:text-white transition">{t("nav_diferencia")}</a>
                <a href="#diagnostico" className="hover:text-white transition">{t("nav_diag")}</a>
                <a href="#impacto" className="hover:text-white transition">{t("nav_impacto")}</a>
                <a href="#contacto" className="hover:text-white transition">{t("nav_contacto")}</a>
              </nav>
            </div>
            <p className="mt-8 text-center text-xs text-[#7b87ad] border-t border-white/10 pt-6">
              © {new Date().getFullYear()} {t("foot_copy")}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
