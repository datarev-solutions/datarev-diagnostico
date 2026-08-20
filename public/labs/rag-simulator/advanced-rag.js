// ===================================================================
// Advanced RAG (Agentic RAG) tab — third exercise.
// Loaded after index.html's main script AND graphrag.js, so it reuses:
//   from index.html: lang, documents, emb, vdb, generateAnswer
//   from graphrag.js: GR_NODES, GR_EDGES, GR_COMMUNITIES, GR_NODE_MAP,
//                     grRetrieve, grLabel, grRenderGraph, grGenerateAnswer
// Models the "Advanced RAG" architecture: a router picks a strategy per
// question, specialized agents retrieve in parallel from a Vector DB AND
// a Graph DB, a reranker re-scores the merged candidates, and generation
// is wrapped with guardrails + an evaluation score.
// All identifiers are prefixed ar/AR_ to avoid collisions.
// ===================================================================

// ========== I18N ==========
const AR_I18N = {
  es: {
    subtitle: 'Advanced RAG (Agéntico) &mdash; router, agentes y reranking, paso a paso',
    stepLabels: ['Intro','Documentos','Indexar+','Query','Routing','Agentes','Rerank','Generate'],
    prev: '← Anterior', next: 'Siguiente →', end: 'Fin',
    search: 'Ejecutar pipeline ⚙️', restart: '🔄 Reiniciar simulación',
    counter: (c,n) => `Paso ${c} de ${n}`,
    stepOf: (n) => `Paso ${n} de 7`,
    analogyLabel: '💡 Analogía',
    words: 'palabras',
    // Intro
    introNum: 'Introducción',
    introTitle: '¿Qué es Advanced RAG (RAG Agéntico)?',
    introDesc: 'Advanced RAG es RAG llevado a producción: en vez de un pipeline fijo, un <strong>router</strong> decide la estrategia para cada pregunta y <strong>agentes especializados</strong> recuperan en paralelo de un Vector DB <em>y</em> un Graph DB, con <strong>reranking</strong>, guardrails y evaluación.',
    introAnalogy: 'Si RAG es un <strong>estudiante con fichas</strong> y GraphRAG un <strong>detective con su tablero</strong>, Advanced RAG es una <strong>redacción completa</strong>: un editor (router) reparte la pregunta a reporteros especializados (agentes) que consultan todos los archivos (vector + grafo + herramientas), y un verificador (reranker) revisa antes de publicar.',
    introCallout: '<strong>El problema que resuelve:</strong> un pipeline fijo no se adapta. Unas preguntas necesitan búsqueda vectorial, otras recorrer un grafo, otras datos en vivo vía herramientas. Y en producción hace falta <strong>reordenar</strong> resultados, poner <strong>guardrails</strong> y <strong>medir</strong> la calidad. Advanced RAG añade una capa de decisión encima de RAG y GraphRAG.',
    cmpTitle: 'Los tres enfoques, lado a lado:',
    cmpHeaders: ['', '🔍 RAG', '🕸️ GraphRAG', '⚙️ Advanced RAG'],
    cmpRows: [
      ['Qué indexa', 'Chunks + embeddings', 'Entidades + relaciones', 'Ambos: Vector DB + Graph DB (+ metadata)'],
      ['En la query', '1 búsqueda vectorial', 'Recorrido del grafo', 'Router + agentes en paralelo'],
      ['Adaptación', 'Pipeline fijo', 'Pipeline fijo', 'Estrategia dinámica por pregunta'],
      ['Post-proceso', 'Ninguno', 'Ninguno', 'Reranker + reroute/retry'],
      ['Garantías', 'Citas', 'Camino visible', 'Guardrails + evaluación (Ragas)'],
      ['Costo / complejidad', 'Bajo', 'Medio-alto', 'Alto (orquestación de agentes)'],
    ],
    introFlowTitle: 'El flujo Advanced RAG que vamos a recorrer:',
    flowCards: ['📄 Documentos','🏗️ Indexar+','❓ Query','🔀 Routing','🤖 Agentes','🎯 Rerank','🤖 Generate'],
    archTitle: 'Arquitectura: dónde encaja cada pieza',
    archCaption: '🔍 <strong style="color:#e0506a;">RAG</strong> (Vector DB) y 🕸️ <strong style="color:#5eead4;">GraphRAG</strong> (Graph DB) son <strong>componentes internos</strong>, no rivales. El router decide en cada pregunta cuál usar — y añade agentes, reranking, guardrails y evaluación por encima.',
    arch: {
      container: '⚙️ ADVANCED RAG · orquesta todo',
      query: 'Pregunta', router: 'Router', agents: 'Agentes',
      retrieval: 'Recuperación híbrida', vectorDB: 'Vector DB', graphDB: 'Graph DB',
      ragBadge: '= RAG', graphragBadge: '= GraphRAG',
      docs: 'Documentos', index: 'indexa', rerank: 'Reranker', llm: 'LLM', output: 'Respuesta',
      tools: 'Tools & APIs', toolsSub: 'vía MCP',
      guardChip: '🛡️ Guardrails', evalChip: '📊 Evaluación', memoryChip: '🧠 Memoria', reroute: 'reroute / retry'
    },
    memoryBtn: '¿Dónde encaja RAG en la memoria del agente?',
    archHint: 'Pasa el cursor (o toca) cualquier caja del diagrama para ver qué hace.',
    memory: {
      eyebrow: '🧠 Memoria del agente · más allá de RAG',
      title: '¿Dónde encaja RAG en la memoria de un agente?',
      sub: 'La memoria del agente es un tema más amplio que la recuperación: se organiza en tres pilares, y RAG es solo una casilla dentro del mapa.',
      pillars: [
        { color: '#5b9bd5', name: 'Forms · Formas', q: '¿Qué carga la memoria? (el «cómo»)', items: [
          ['Token-level', 'Texto/contexto explícito (chunks, prompts). Transparente y rápido de actualizar. ← aquí vive RAG.'],
          ['Paramétrica', 'Guardada en los pesos del modelo. Generalizable pero costosa de cambiar.'],
          ['Latente', 'Vectores/estados internos. Eficiente pero opaca (no legible por humanos).']
        ]},
        { color: '#f59e0b', name: 'Functions · Funciones', q: '¿Para qué sirve? (el «qué»)', items: [
          ['Factual', 'Lo que el agente SABE: hechos, perfil del usuario, entorno. ← RAG sirve a esta.'],
          ['Experiencial', 'Cómo MEJORA: experiencias pasadas, estrategias, habilidades.'],
          ['Working', 'En qué está PENSANDO ahora: memoria de trabajo, corto plazo.']
        ]},
        { color: '#a970d0', name: 'Dynamics · Dinámicas', q: '¿Cómo evoluciona? (el «cuándo»)', items: [
          ['Formación', 'La memoria se crea a partir de datos crudos.'],
          ['Evolución', 'Se consolida, se actualiza y se olvida (¡olvidar es una feature!).'],
          ['Recuperación', 'Traer el recuerdo correcto: qué, cuándo y cómo. ← RAG es esto.']
        ]}
      ],
      tie: '<strong>Dónde encaja RAG:</strong> lo que viste en las otras pestañas es <strong>recuperación</strong> sobre memoria <strong>factual / token-level</strong>. RAG toca 3 casillas de este mapa — pero la memoria del agente también incluye <em>cómo se forma, evoluciona y olvida</em>, y formas <em>paramétrica</em> y <em>latente</em> que RAG ni toca.',
      frontiers: 'Fronteras emergentes: automatización + RL · memoria multimodal y multi-agente · confiabilidad y seguridad.',
      cite: 'Basado en Hu et al., «Memory in the Age of AI Agents» — arXiv:2512.13564 (CC BY 4.0).',
      close: 'Cerrar'
    },
    guardrailsInfo: {
      eyebrow: '🛡️ Guardrails · controles de seguridad',
      title: 'Guardrails: que el sistema no se salga del carril',
      sub: 'Reglas y filtros que protegen la entrada, la salida y el acceso — para que el agente sea seguro y confiable en producción.',
      pillars: [
        { color: '#5b9bd5', name: '🛡️ Entrada', q: 'Antes de procesar la pregunta', items: [
          ['Prompt injection', 'Detectar intentos de manipular al modelo con instrucciones ocultas.'],
          ['PII / temas vetados', 'Bloquear datos sensibles o preguntas fuera de alcance.']
        ]},
        { color: '#f59e0b', name: '📤 Salida', q: 'Antes de mostrar la respuesta', items: [
          ['Grounding', 'Responder SOLO desde el contexto recuperado y citar fuentes.'],
          ['Toxicidad / fugas', 'Filtrar contenido dañino o que revele datos privados.']
        ]},
        { color: '#a970d0', name: '🔑 Acceso', q: 'Quién puede ver qué', items: [
          ['RBAC / ABAC', 'Permisos por rol o por atributos; filtrar documentos por usuario (row-level security).']
        ]}
      ],
      tie: '<strong>Herramientas típicas:</strong> NeMo Guardrails, Guardrails AI, Llama Guard, Rebuff. En el diagrama, los guardrails envuelven al LLM: revisan lo que entra y lo que sale.',
      cite: 'Parte de la capa de producción de Advanced RAG.',
      close: 'Cerrar'
    },
    evalInfo: {
      eyebrow: '📊 Evaluación · ¿tu RAG es bueno?',
      title: '¿Cómo mides si tu RAG funciona?',
      sub: 'No basta con que «responda»: hay que medir la recuperación y la generación con métricas, no a ojo.',
      pillars: [
        { color: '#5b9bd5', name: '🔍 Recuperación', q: '¿Trajo lo relevante?', items: [
          ['Context precision', 'De lo recuperado, ¿cuánto es realmente relevante?'],
          ['Context recall', 'De lo relevante que existía, ¿cuánto recuperó?']
        ]},
        { color: '#f59e0b', name: '✍️ Generación', q: '¿La respuesta es buena?', items: [
          ['Fidelidad', '¿La respuesta se apega al contexto, sin inventar?'],
          ['Relevancia', '¿La respuesta contesta de verdad la pregunta?']
        ]},
        { color: '#a970d0', name: '📈 En producción', q: 'Con usuarios reales', items: [
          ['LLM-as-judge', 'Un LLM califica las respuestas a escala.'],
          ['Feedback / A-B', 'Señales de usuarios, pruebas A/B, monitoreo.']
        ]}
      ],
      tie: '<strong>Frameworks:</strong> Ragas, TruLens, DeepEval, LangSmith. La <em>fidelidad</em> (faithfulness) que ves en el paso Generate es justo una de estas métricas.',
      cite: 'Parte de la capa de producción de Advanced RAG.',
      close: 'Cerrar'
    },
    // Docs
    docsTitle: '📄 Los mismos documentos',
    docsDesc: 'Otra vez los mismos 4 documentos, para comparar los tres enfoques con el mismo material.',
    docsAnalogy: 'Los mismos <strong>informes</strong> — pero esta redacción los va a archivar de <strong>dos formas a la vez</strong> y a repartirlos entre varios reporteros.',
    docsCallout: '<strong>Clave de Advanced RAG:</strong> no elige un solo índice. Indexa los documentos <strong>en un Vector DB y en un Graph DB al mismo tiempo</strong>, para poder usar el que convenga a cada pregunta (o ambos).',
    // Ingest+
    ingTitle: '🏗️ Indexación enriquecida (Vector + Graph)',
    ingDesc: 'La fase de ingesta hace más que trocear y embeber: enriquece metadata, hace chunking semántico, genera un grafo con un LLM y guarda todo en <strong>dos bases a la vez</strong>.',
    ingAnalogy: 'La redacción archiva cada informe <strong>dos veces</strong>: en un buscador por palabras (Vector DB) y en un tablero de relaciones (Graph DB). Así puede responder tanto «busca lo parecido» como «sigue el hilo».',
    ingCallout: '<strong>Pasos de ingesta avanzada (slide de producción):</strong> <strong>parse &amp; clean</strong> (extraer + limpiar, igual que en la pestaña RAG) · enriquecer metadata · chunking basado en modelo · múltiples embeddings · grafo generado por LLM · <em>human-in-the-loop</em>. Salida: <strong>Vector DB + Graph DB</strong> poblados y sincronizados.<br><br>Sí: antes de indexar, el texto también pasa por <strong>parse &amp; clean</strong> — no se puede trocear ni embeber basura.',
    ingVectorTitle: '💾 Vector DB',
    ingGraphTitle: '🕸️ Graph DB',
    ingVectorDone: (n) => `${n} vectores (embeddings TF-IDF)`,
    ingGraphDone: (n,e) => `${n} entidades · ${e} relaciones`,
    // Query
    queryTitle: '❓ Tu pregunta',
    queryDesc: 'Llega la pregunta. En Advanced RAG no va directo a una búsqueda: primero pasa por el <strong>router</strong>, que decide qué estrategia y qué agentes usar.',
    queryAnalogy: 'La pregunta llega a la mesa del <strong>editor</strong>, no directo al archivo. El editor decidirá a quién asignarla.',
    queryCallout: 'Prueba las distintas preguntas sugeridas: cada una hará que el <strong>router elija una estrategia diferente</strong> (vectorial, multi-salto por grafo, o global por comunidades). Ese es el corazón de Advanced RAG.',
    queryWrite: 'Escribe tu pregunta:',
    queryPlaceholder: '¿Qué quieres saber?',
    defaultQuery: '¿Qué relación hay entre React y Node.js?',
    presets: [
      { label: 'Multi-salto → Graph+Vector', q: '¿Qué relación hay entre React y Node.js?' },
      { label: 'Una entidad → Local', q: '¿Qué es el DOM virtual?' },
      { label: 'Global → Comunidades', q: 'Dame un resumen del tema bases de datos' },
      { label: 'Factual → Vectorial', q: '¿Qué es una interfaz de usuario?' }
    ],
    // Routing
    routeTitle: '🔀 Routing (transformación + estrategia)',
    routeDesc: 'El router <strong>reescribe/expande</strong> la query y <strong>decide la ruta</strong>: ¿basta con el Vector DB, hace falta el grafo, o es una pregunta global?',
    routeAnalogy: 'El editor reformula el encargo con más contexto y decide: «esto es para el reportero de datos», «esto necesita el tablero de relaciones», «esto es un panorama general».',
    routeCallout: '<strong>Query transform + planning:</strong> se expande la pregunta con sinónimos/entidades para mejorar el recall, y una política de ruteo elige la estrategia. En producción esto lo hace un LLM planificador; aquí usamos reglas sobre las entidades detectadas.',
    routeTransformLabel: 'Query transform:',
    routeOriginal: 'Original',
    routeRewritten: 'Reescrita (expandida)',
    routeDecisionLabel: 'Decisión de ruteo:',
    routeReason: 'Motivo',
    routes: {
      multihop: { name: '🕸️ Ruta multi-salto (Graph + Vector)', reason: 'La pregunta menciona 2+ entidades y busca una relación → hace falta recorrer el grafo.' },
      local:    { name: '🕸️ Ruta local (Graph + Vector)', reason: 'La pregunta gira en torno a una entidad concreta → grafo para sus relaciones, vector como apoyo.' },
      global:   { name: '🌍 Ruta global (Comunidades + Vector)', reason: 'La pregunta pide un panorama → resúmenes de comunidad.' },
      vector:   { name: '🔍 Ruta vectorial (Vector DB)', reason: 'Pregunta factual sobre un tema puntual → basta la búsqueda por similitud.' }
    },
    // Agents
    agTitle: '🤖 Agentes en paralelo',
    agDesc: 'Según la ruta, el router lanza <strong>agentes especializados en paralelo</strong>. Cada uno usa su herramienta (búsqueda vectorial, recorrido de grafo) y devuelve candidatos.',
    agAnalogy: 'El editor manda a <strong>varios reporteros a la vez</strong>: uno rebusca en el buscador, otro sigue los hilos del tablero. Trabajan en paralelo y traen sus hallazgos.',
    agCallout: '<strong>Specialized agents + tools:</strong> cada agente tiene un rol y funciones propias. Aquí corren el <strong>Vector Agent</strong> y el <strong>Graph Agent</strong>; un <strong>Tool Agent</strong> podría llamar APIs externas (precios, clima, cálculos) cuando la pregunta lo requiera.',
    agVectorTitle: '🔍 Vector Agent',
    agGraphTitle: '🕸️ Graph Agent',
    agToolTitle: '🛠️ Tool Agent',
    agToolNote: 'Inactivo para esta pregunta (no requiere datos externos ni acciones).',
    agVectorSub: 'Búsqueda por similitud coseno',
    agGraphSub: 'Entity linking + recorrido de relaciones',
    agFound: (n) => `${n} candidatos`,
    agNoGraph: 'Sin entidades ancladas → el Graph Agent no aporta candidatos en esta ruta.',
    // Rerank
    rrTitle: '🎯 Reranking (post-proceso)',
    rrDesc: 'Los candidatos de todos los agentes se <strong>fusionan y se reordenan</strong> con un reranker que puntúa relevancia real. Si la confianza es baja, se <strong>reroutea y reintenta</strong>.',
    rrAnalogy: 'El <strong>verificador</strong> junta todo lo que trajeron los reporteros y lo <strong>reordena por calidad real</strong>, no por quién llegó primero. Si nada convence, pide reformular y volver a buscar.',
    rrCallout: '<strong>Custom reranker + reroute/retry:</strong> un modelo de reranking (p. ej. cross-encoder, Cohere Rerank) reevalúa cada candidato contra la pregunta. Fíjate cómo cambia el orden respecto a lo que trajeron los agentes.',
    rrBefore: 'Antes (orden de los agentes):',
    rrAfter: 'Después (reordenado por el reranker):',
    rrRelevance: 'relevancia',
    rrRetry: '🔁 Reroute/retry: confianza baja en el mejor candidato → el agente reformula la query y reintenta (aquí solo lo señalamos).',
    rrOk: '✅ Confianza suficiente → pasa a generación.',
    tagVector: 'vector', tagGraph: 'grafo',
    // Generate
    genTitle: '🤖 Generation (con guardrails + evaluación)',
    genDesc: 'El LLM recibe la pregunta y el contexto ya <strong>reordenado</strong> (vector + grafo), genera la respuesta y se le aplican <strong>guardrails</strong> y una <strong>evaluación</strong> de fidelidad.',
    genAnalogy: 'El redactor escribe la nota con el material ya verificado y ordenado. Antes de publicar pasa por <strong>control editorial</strong> (guardrails) y se le mide la <strong>fidelidad a las fuentes</strong>.',
    genCallout: (q) => `<strong>El prompt al LLM combina ambas fuentes:</strong><br><br><code>System: Responde con el contexto; respeta guardrails (RBAC, seguridad).</code><br><code>Vector: [chunks top-k reordenados]</code><br><code>Graph: (React) —[biblioteca de]→ (JavaScript) …</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Contexto reordenado enviado al LLM:',
    genFlow1: 'Pregunta + contexto híbrido',
    genFlow2: 'Respuesta',
    genThinking: '🤖 LLM generando respuesta con contexto híbrido (vector + grafo)...',
    genGuardrails: '🛡️ Guardrails: RBAC/ABAC · filtros de seguridad · respuesta solo desde el contexto',
    genEvalLabel: 'Evaluación (Ragas-style):',
    genFaithfulness: 'Fidelidad',
    genSources: '📎 Fuentes utilizadas:',
    genAdvantages: '<strong style="color:#34d399;">✅ Cuándo usar Advanced RAG:</strong><br>• Cuando conviven preguntas factuales, multi-salto y globales en el mismo producto<br>• Cuando necesitas herramientas/acciones (APIs, cálculos) además de recuperar texto<br>• En producción: reranking, guardrails, evaluación y aprendizaje adaptativo<br><br><strong style="color:#fbbf24;">⚠️ El costo:</strong><br>• Orquestar router + agentes + reranker es mucho más complejo y caro<br>• Más latencia y más piezas que monitorear<br>• Para un caso simple, RAG básico sigue siendo la mejor opción'
  },
  en: {
    subtitle: 'Advanced RAG (Agentic) &mdash; router, agents & reranking, step by step',
    stepLabels: ['Intro','Documents','Index+','Query','Routing','Agents','Rerank','Generate'],
    prev: '← Previous', next: 'Next →', end: 'End',
    search: 'Run the pipeline ⚙️', restart: '🔄 Restart simulation',
    counter: (c,n) => `Step ${c} of ${n}`,
    stepOf: (n) => `Step ${n} of 7`,
    analogyLabel: '💡 Analogy',
    words: 'words',
    // Intro
    introNum: 'Introduction',
    introTitle: 'What is Advanced RAG (Agentic RAG)?',
    introDesc: 'Advanced RAG is RAG taken to production: instead of a fixed pipeline, a <strong>router</strong> decides the strategy for each question and <strong>specialized agents</strong> retrieve in parallel from a Vector DB <em>and</em> a Graph DB, with <strong>reranking</strong>, guardrails and evaluation.',
    introAnalogy: 'If RAG is a <strong>student with study cards</strong> and GraphRAG a <strong>detective with an evidence board</strong>, Advanced RAG is a <strong>full newsroom</strong>: an editor (router) assigns the question to specialized reporters (agents) who consult every archive (vector + graph + tools), and a fact-checker (reranker) reviews before publishing.',
    introCallout: '<strong>The problem it solves:</strong> a fixed pipeline does not adapt. Some questions need vector search, some need graph traversal, some need live data via tools. And production needs to <strong>rerank</strong> results, add <strong>guardrails</strong> and <strong>measure</strong> quality. Advanced RAG adds a decision layer on top of RAG and GraphRAG.',
    cmpTitle: 'The three approaches, side by side:',
    cmpHeaders: ['', '🔍 RAG', '🕸️ GraphRAG', '⚙️ Advanced RAG'],
    cmpRows: [
      ['What it indexes', 'Chunks + embeddings', 'Entities + relationships', 'Both: Vector DB + Graph DB (+ metadata)'],
      ['At query time', '1 vector search', 'Graph traversal', 'Router + agents in parallel'],
      ['Adaptation', 'Fixed pipeline', 'Fixed pipeline', 'Dynamic strategy per question'],
      ['Post-processing', 'None', 'None', 'Reranker + reroute/retry'],
      ['Guarantees', 'Citations', 'Visible path', 'Guardrails + evaluation (Ragas)'],
      ['Cost / complexity', 'Low', 'Medium-high', 'High (agent orchestration)'],
    ],
    introFlowTitle: "The Advanced RAG flow we'll walk through:",
    flowCards: ['📄 Documents','🏗️ Index+','❓ Query','🔀 Routing','🤖 Agents','🎯 Rerank','🤖 Generate'],
    archTitle: 'Architecture: where each piece fits',
    archCaption: '🔍 <strong style="color:#e0506a;">RAG</strong> (Vector DB) and 🕸️ <strong style="color:#5eead4;">GraphRAG</strong> (Graph DB) are <strong>internal components</strong>, not rivals. The router decides per question which to use — and adds agents, reranking, guardrails and evaluation on top.',
    arch: {
      container: '⚙️ ADVANCED RAG · orchestrates everything',
      query: 'Query', router: 'Router', agents: 'Agents',
      retrieval: 'Hybrid retrieval', vectorDB: 'Vector DB', graphDB: 'Graph DB',
      ragBadge: '= RAG', graphragBadge: '= GraphRAG',
      docs: 'Documents', index: 'indexes', rerank: 'Reranker', llm: 'LLM', output: 'Answer',
      tools: 'Tools & APIs', toolsSub: 'via MCP',
      guardChip: '🛡️ Guardrails', evalChip: '📊 Evaluation', memoryChip: '🧠 Memory', reroute: 'reroute / retry'
    },
    memoryBtn: 'Where does RAG fit in agent memory?',
    archHint: 'Hover (or tap) any box in the diagram to see what it does.',
    memory: {
      eyebrow: '🧠 Agent memory · beyond RAG',
      title: 'Where does RAG fit in an agent\'s memory?',
      sub: 'Agent memory is a broader topic than retrieval: it is organized into three pillars, and RAG is just one cell inside the map.',
      pillars: [
        { color: '#5b9bd5', name: 'Forms', q: 'What carries memory? (the «how»)', items: [
          ['Token-level', 'Explicit text/context (chunks, prompts). Transparent and fast to update. ← RAG lives here.'],
          ['Parametric', 'Stored in the model weights. Generalizable but costly to change.'],
          ['Latent', 'Internal vectors/states. Efficient but opaque (not human-readable).']
        ]},
        { color: '#f59e0b', name: 'Functions', q: 'Why agents need it (the «what»)', items: [
          ['Factual', 'What the agent KNOWS: facts, user profile, environment. ← RAG serves this.'],
          ['Experiential', 'How it IMPROVES: past experiences, strategies, skills.'],
          ['Working', 'What it is THINKING about now: working memory, short-term.']
        ]},
        { color: '#a970d0', name: 'Dynamics', q: 'How it evolves (the «when»)', items: [
          ['Formation', 'Memory is created from raw data.'],
          ['Evolution', 'It consolidates, updates and forgets (forgetting is a feature!).'],
          ['Retrieval', 'Bringing back the right memory: what, when and how. ← RAG is this.']
        ]}
      ],
      tie: '<strong>Where RAG fits:</strong> what you saw in the other tabs is <strong>retrieval</strong> over <strong>factual / token-level</strong> memory. RAG touches 3 cells of this map — but agent memory also covers <em>how it forms, evolves and forgets</em>, plus <em>parametric</em> and <em>latent</em> forms that RAG never touches.',
      frontiers: 'Emerging frontiers: automation + RL · multimodal & multi-agent memory · trustworthiness & safety.',
      cite: 'Based on Hu et al., “Memory in the Age of AI Agents” — arXiv:2512.13564 (CC BY 4.0).',
      close: 'Close'
    },
    guardrailsInfo: {
      eyebrow: '🛡️ Guardrails · safety controls',
      title: 'Guardrails: keeping the system on the rails',
      sub: 'Rules and filters that protect the input, the output and access — so the agent is safe and trustworthy in production.',
      pillars: [
        { color: '#5b9bd5', name: '🛡️ Input', q: 'Before processing the question', items: [
          ['Prompt injection', 'Detect attempts to manipulate the model with hidden instructions.'],
          ['PII / banned topics', 'Block sensitive data or out-of-scope questions.']
        ]},
        { color: '#f59e0b', name: '📤 Output', q: 'Before showing the answer', items: [
          ['Grounding', 'Answer ONLY from the retrieved context and cite sources.'],
          ['Toxicity / leaks', 'Filter harmful content or anything that leaks private data.']
        ]},
        { color: '#a970d0', name: '🔑 Access', q: 'Who can see what', items: [
          ['RBAC / ABAC', 'Role- or attribute-based permissions; filter documents per user (row-level security).']
        ]}
      ],
      tie: '<strong>Typical tools:</strong> NeMo Guardrails, Guardrails AI, Llama Guard, Rebuff. In the diagram, guardrails wrap the LLM: they check what goes in and what comes out.',
      cite: "Part of Advanced RAG's production layer.",
      close: 'Close'
    },
    evalInfo: {
      eyebrow: '📊 Evaluation · is your RAG any good?',
      title: 'How do you measure if your RAG works?',
      sub: "It's not enough that it 'answers': you measure retrieval and generation with metrics, not by eye.",
      pillars: [
        { color: '#5b9bd5', name: '🔍 Retrieval', q: 'Did it bring the relevant stuff?', items: [
          ['Context precision', 'Of what was retrieved, how much is actually relevant?'],
          ['Context recall', 'Of the relevant info that existed, how much did it retrieve?']
        ]},
        { color: '#f59e0b', name: '✍️ Generation', q: 'Is the answer good?', items: [
          ['Faithfulness', 'Does the answer stick to the context, without making things up?'],
          ['Relevance', 'Does the answer actually address the question?']
        ]},
        { color: '#a970d0', name: '📈 In production', q: 'With real users', items: [
          ['LLM-as-judge', 'An LLM grades answers at scale.'],
          ['Feedback / A-B', 'User signals, A/B tests, monitoring.']
        ]}
      ],
      tie: '<strong>Frameworks:</strong> Ragas, TruLens, DeepEval, LangSmith. The <em>faithfulness</em> score you see in the Generate step is exactly one of these metrics.',
      cite: "Part of Advanced RAG's production layer.",
      close: 'Close'
    },
    // Docs
    docsTitle: '📄 The same documents',
    docsDesc: 'The same 4 documents again, to compare all three approaches on the same material.',
    docsAnalogy: 'The same <strong>reports</strong> — but this newsroom will file them <strong>two ways at once</strong> and hand them to several reporters.',
    docsCallout: "<strong>Advanced RAG's key move:</strong> it doesn't pick a single index. It indexes the documents <strong>into a Vector DB and a Graph DB at the same time</strong>, so it can use whichever fits each question (or both).",
    // Ingest+
    ingTitle: '🏗️ Enriched indexing (Vector + Graph)',
    ingDesc: 'Ingestion does more than split and embed: it enriches metadata, does semantic chunking, generates a graph with an LLM, and stores everything in <strong>two databases at once</strong>.',
    ingAnalogy: 'The newsroom files each report <strong>twice</strong>: in a keyword search index (Vector DB) and on a relationship board (Graph DB). So it can answer both "find similar" and "follow the thread".',
    ingCallout: '<strong>Advanced ingestion steps (production slide):</strong> <strong>parse &amp; clean</strong> (extract + clean, same as the RAG tab) · enrich metadata · model-based chunking · multiple embeddings · LLM-generated graph · <em>human-in-the-loop</em>. Output: populated, synced <strong>Vector DB + Graph DB</strong>.<br><br>Yes: before indexing, the text also goes through <strong>parse &amp; clean</strong> — you can\'t chunk or embed garbage.',
    ingVectorTitle: '💾 Vector DB',
    ingGraphTitle: '🕸️ Graph DB',
    ingVectorDone: (n) => `${n} vectors (TF-IDF embeddings)`,
    ingGraphDone: (n,e) => `${n} entities · ${e} relationships`,
    // Query
    queryTitle: '❓ Your question',
    queryDesc: "The question arrives. In Advanced RAG it doesn't go straight to a search: first it goes through the <strong>router</strong>, which decides which strategy and which agents to use.",
    queryAnalogy: "The question lands on the <strong>editor's</strong> desk, not straight into the archive. The editor will decide whom to assign it to.",
    queryCallout: 'Try the different suggested questions: each one makes the <strong>router pick a different strategy</strong> (vector, multi-hop via graph, or global via communities). That is the heart of Advanced RAG.',
    queryWrite: 'Type your question:',
    queryPlaceholder: 'What do you want to know?',
    defaultQuery: 'What is the relationship between React and Node.js?',
    presets: [
      { label: 'Multi-hop → Graph+Vector', q: 'What is the relationship between React and Node.js?' },
      { label: 'Single entity → Local', q: 'What is the virtual DOM?' },
      { label: 'Global → Communities', q: 'Give me a summary of the databases topic' },
      { label: 'Factual → Vector', q: 'What is a user interface?' }
    ],
    // Routing
    routeTitle: '🔀 Routing (transform + strategy)',
    routeDesc: 'The router <strong>rewrites/expands</strong> the query and <strong>decides the route</strong>: is the Vector DB enough, is the graph needed, or is it a global question?',
    routeAnalogy: 'The editor rephrases the assignment with more context and decides: "this goes to the data reporter", "this needs the relationship board", "this is a big-picture overview".',
    routeCallout: '<strong>Query transform + planning:</strong> the question is expanded with synonyms/entities to improve recall, and a routing policy picks the strategy. In production a planner LLM does this; here we use rules over the detected entities.',
    routeTransformLabel: 'Query transform:',
    routeOriginal: 'Original',
    routeRewritten: 'Rewritten (expanded)',
    routeDecisionLabel: 'Routing decision:',
    routeReason: 'Reason',
    routes: {
      multihop: { name: '🕸️ Multi-hop route (Graph + Vector)', reason: 'The question mentions 2+ entities and asks for a relationship → the graph must be traversed.' },
      local:    { name: '🕸️ Local route (Graph + Vector)', reason: 'The question revolves around one specific entity → graph for its relations, vector as support.' },
      global:   { name: '🌍 Global route (Communities + Vector)', reason: 'The question asks for the big picture → community summaries.' },
      vector:   { name: '🔍 Vector route (Vector DB)', reason: 'Factual question about a specific topic → similarity search is enough.' }
    },
    // Agents
    agTitle: '🤖 Agents in parallel',
    agDesc: 'Based on the route, the router launches <strong>specialized agents in parallel</strong>. Each uses its tool (vector search, graph traversal) and returns candidates.',
    agAnalogy: 'The editor sends <strong>several reporters at once</strong>: one digs through the search index, another follows the threads on the board. They work in parallel and bring back their findings.',
    agCallout: '<strong>Specialized agents + tools:</strong> each agent has its own role and functions. Here the <strong>Vector Agent</strong> and <strong>Graph Agent</strong> run; a <strong>Tool Agent</strong> could call external APIs (prices, weather, calculations) when the question needs it.',
    agVectorTitle: '🔍 Vector Agent',
    agGraphTitle: '🕸️ Graph Agent',
    agToolTitle: '🛠️ Tool Agent',
    agToolNote: 'Idle for this question (no external data or actions required).',
    agVectorSub: 'Cosine similarity search',
    agGraphSub: 'Entity linking + relationship traversal',
    agFound: (n) => `${n} candidates`,
    agNoGraph: 'No anchored entities → the Graph Agent contributes no candidates on this route.',
    // Rerank
    rrTitle: '🎯 Reranking (post-processing)',
    rrDesc: 'Candidates from all agents are <strong>merged and reordered</strong> by a reranker that scores real relevance. If confidence is low, it <strong>reroutes and retries</strong>.',
    rrAnalogy: 'The <strong>fact-checker</strong> gathers everything the reporters brought and <strong>reorders it by real quality</strong>, not by who arrived first. If nothing is convincing, they ask to rephrase and search again.',
    rrCallout: '<strong>Custom reranker + reroute/retry:</strong> a reranking model (e.g. cross-encoder, Cohere Rerank) re-scores each candidate against the question. Notice how the order changes versus what the agents brought.',
    rrBefore: 'Before (agent order):',
    rrAfter: 'After (reranked):',
    rrRelevance: 'relevance',
    rrRetry: '🔁 Reroute/retry: low confidence in the top candidate → the agent rephrases the query and retries (we only flag it here).',
    rrOk: '✅ Enough confidence → moves on to generation.',
    tagVector: 'vector', tagGraph: 'graph',
    // Generate
    genTitle: '🤖 Generation (with guardrails + evaluation)',
    genDesc: 'The LLM receives the question and the already <strong>reranked</strong> context (vector + graph), generates the answer, and <strong>guardrails</strong> plus a faithfulness <strong>evaluation</strong> are applied.',
    genAnalogy: 'The writer drafts the story with material already verified and ordered. Before publishing it goes through <strong>editorial control</strong> (guardrails) and its <strong>faithfulness to the sources</strong> is measured.',
    genCallout: (q) => `<strong>The prompt to the LLM combines both sources:</strong><br><br><code>System: Answer from the context; respect guardrails (RBAC, safety).</code><br><code>Vector: [reranked top-k chunks]</code><br><code>Graph: (React) —[library of]→ (JavaScript) …</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Reranked context sent to the LLM:',
    genFlow1: 'Question + hybrid context',
    genFlow2: 'Answer',
    genThinking: '🤖 LLM generating an answer with hybrid context (vector + graph)...',
    genGuardrails: '🛡️ Guardrails: RBAC/ABAC · safety filters · answer only from context',
    genEvalLabel: 'Evaluation (Ragas-style):',
    genFaithfulness: 'Faithfulness',
    genSources: '📎 Sources used:',
    genAdvantages: '<strong style="color:#34d399;">✅ When to use Advanced RAG:</strong><br>• When factual, multi-hop and global questions coexist in the same product<br>• When you need tools/actions (APIs, calculations) beyond retrieving text<br>• In production: reranking, guardrails, evaluation and adaptive learning<br><br><strong style="color:#fbbf24;">⚠️ The cost:</strong><br>• Orchestrating router + agents + reranker is far more complex and expensive<br>• More latency and more moving parts to monitor<br>• For a simple use case, basic RAG is still the best choice'
  },
  pt: {
    subtitle: 'Advanced RAG (Agêntico) &mdash; router, agentes e reranking, passo a passo',
    stepLabels: ['Intro','Documentos','Indexar+','Query','Routing','Agentes','Rerank','Generate'],
    prev: '← Anterior', next: 'Próximo →', end: 'Fim',
    search: 'Executar pipeline ⚙️', restart: '🔄 Reiniciar simulação',
    counter: (c,n) => `Passo ${c} de ${n}`,
    stepOf: (n) => `Passo ${n} de 7`,
    analogyLabel: '💡 Analogia',
    words: 'palavras',
    introNum: 'Introdução',
    introTitle: 'O que é Advanced RAG (RAG Agêntico)?',
    introDesc: 'Advanced RAG é RAG levado à produção: em vez de um pipeline fixo, um <strong>router</strong> decide a estratégia para cada pergunta e <strong>agentes especializados</strong> recuperam em paralelo de um Vector DB <em>e</em> um Graph DB, com <strong>reranking</strong>, guardrails e avaliação.',
    introAnalogy: 'Se RAG é um <strong>estudante com fichas</strong> e GraphRAG um <strong>detetive com seu quadro</strong>, Advanced RAG é uma <strong>redação completa</strong>: um editor (router) distribui a pergunta a repórteres especializados (agentes) que consultam todos os arquivos (vetor + grafo + ferramentas), e um verificador (reranker) revisa antes de publicar.',
    introCallout: '<strong>O problema que resolve:</strong> um pipeline fixo não se adapta. Umas perguntas precisam de busca vetorial, outras percorrer um grafo, outras dados ao vivo via ferramentas. E em produção é preciso <strong>reordenar</strong> resultados, pôr <strong>guardrails</strong> e <strong>medir</strong> a qualidade. Advanced RAG adiciona uma camada de decisão sobre RAG e GraphRAG.',
    cmpTitle: 'As três abordagens, lado a lado:',
    cmpHeaders: ['', '🔍 RAG', '🕸️ GraphRAG', '⚙️ Advanced RAG'],
    cmpRows: [
      ['O que indexa', 'Chunks + embeddings', 'Entidades + relações', 'Ambos: Vector DB + Graph DB (+ metadata)'],
      ['Na query', '1 busca vetorial', 'Percurso do grafo', 'Router + agentes em paralelo'],
      ['Adaptação', 'Pipeline fixo', 'Pipeline fixo', 'Estratégia dinâmica por pergunta'],
      ['Pós-processamento', 'Nenhum', 'Nenhum', 'Reranker + reroute/retry'],
      ['Garantias', 'Citações', 'Caminho visível', 'Guardrails + avaliação (Ragas)'],
      ['Custo / complexidade', 'Baixo', 'Médio-alto', 'Alto (orquestração de agentes)'],
    ],
    introFlowTitle: 'O fluxo Advanced RAG que vamos percorrer:',
    flowCards: ['📄 Documentos','🏗️ Indexar+','❓ Query','🔀 Routing','🤖 Agentes','🎯 Rerank','🤖 Generate'],
    archTitle: 'Arquitetura: onde cada peça se encaixa',
    archCaption: '🔍 <strong style="color:#e0506a;">RAG</strong> (Vector DB) e 🕸️ <strong style="color:#5eead4;">GraphRAG</strong> (Graph DB) são <strong>componentes internos</strong>, não rivais. O router decide em cada pergunta qual usar — e adiciona agentes, reranking, guardrails e avaliação por cima.',
    arch: {
      container: '⚙️ ADVANCED RAG · orquestra tudo',
      query: 'Pergunta', router: 'Router', agents: 'Agentes',
      retrieval: 'Recuperação híbrida', vectorDB: 'Vector DB', graphDB: 'Graph DB',
      ragBadge: '= RAG', graphragBadge: '= GraphRAG',
      docs: 'Documentos', index: 'indexa', rerank: 'Reranker', llm: 'LLM', output: 'Resposta',
      tools: 'Tools & APIs', toolsSub: 'via MCP',
      guardChip: '🛡️ Guardrails', evalChip: '📊 Avaliação', memoryChip: '🧠 Memória', reroute: 'reroute / retry'
    },
    memoryBtn: 'Onde o RAG se encaixa na memória do agente?',
    archHint: 'Passe o cursor (ou toque) em qualquer caixa do diagrama para ver o que ela faz.',
    memory: {
      eyebrow: '🧠 Memória do agente · além do RAG',
      title: 'Onde o RAG se encaixa na memória de um agente?',
      sub: 'A memória do agente é um tema mais amplo que a recuperação: organiza-se em três pilares, e o RAG é só uma casa dentro do mapa.',
      pillars: [
        { color: '#5b9bd5', name: 'Forms · Formas', q: 'O que carrega a memória? (o «como»)', items: [
          ['Token-level', 'Texto/contexto explícito (chunks, prompts). Transparente e rápido de atualizar. ← aqui vive o RAG.'],
          ['Paramétrica', 'Guardada nos pesos do modelo. Generalizável mas cara de mudar.'],
          ['Latente', 'Vetores/estados internos. Eficiente mas opaca (não legível por humanos).']
        ]},
        { color: '#f59e0b', name: 'Functions · Funções', q: 'Para que serve? (o «quê»)', items: [
          ['Factual', 'O que o agente SABE: fatos, perfil do usuário, ambiente. ← o RAG serve a esta.'],
          ['Experiencial', 'Como MELHORA: experiências passadas, estratégias, habilidades.'],
          ['Working', 'No que está PENSANDO agora: memória de trabalho, curto prazo.']
        ]},
        { color: '#a970d0', name: 'Dynamics · Dinâmicas', q: 'Como evolui? (o «quando»)', items: [
          ['Formação', 'A memória é criada a partir de dados crus.'],
          ['Evolução', 'Consolida, atualiza e esquece (esquecer é uma feature!).'],
          ['Recuperação', 'Trazer a lembrança certa: o quê, quando e como. ← o RAG é isto.']
        ]}
      ],
      tie: '<strong>Onde o RAG se encaixa:</strong> o que você viu nas outras abas é <strong>recuperação</strong> sobre memória <strong>factual / token-level</strong>. O RAG toca 3 casas deste mapa — mas a memória do agente também inclui <em>como se forma, evolui e esquece</em>, e formas <em>paramétrica</em> e <em>latente</em> que o RAG nem toca.',
      frontiers: 'Fronteiras emergentes: automação + RL · memória multimodal e multi-agente · confiabilidade e segurança.',
      cite: 'Baseado em Hu et al., «Memory in the Age of AI Agents» — arXiv:2512.13564 (CC BY 4.0).',
      close: 'Fechar'
    },
    guardrailsInfo: {
      eyebrow: '🛡️ Guardrails · controles de segurança',
      title: 'Guardrails: manter o sistema nos trilhos',
      sub: 'Regras e filtros que protegem a entrada, a saída e o acesso — para que o agente seja seguro e confiável em produção.',
      pillars: [
        { color: '#5b9bd5', name: '🛡️ Entrada', q: 'Antes de processar a pergunta', items: [
          ['Prompt injection', 'Detectar tentativas de manipular o modelo com instruções ocultas.'],
          ['PII / temas proibidos', 'Bloquear dados sensíveis ou perguntas fora do escopo.']
        ]},
        { color: '#f59e0b', name: '📤 Saída', q: 'Antes de mostrar a resposta', items: [
          ['Grounding', 'Responder SOMENTE a partir do contexto recuperado e citar fontes.'],
          ['Toxicidade / vazamentos', 'Filtrar conteúdo nocivo ou que revele dados privados.']
        ]},
        { color: '#a970d0', name: '🔑 Acesso', q: 'Quem pode ver o quê', items: [
          ['RBAC / ABAC', 'Permissões por papel ou por atributos; filtrar documentos por usuário (row-level security).']
        ]}
      ],
      tie: '<strong>Ferramentas típicas:</strong> NeMo Guardrails, Guardrails AI, Llama Guard, Rebuff. No diagrama, os guardrails envolvem o LLM: revisam o que entra e o que sai.',
      cite: 'Parte da camada de produção do Advanced RAG.',
      close: 'Fechar'
    },
    evalInfo: {
      eyebrow: '📊 Avaliação · seu RAG é bom?',
      title: 'Como você mede se o seu RAG funciona?',
      sub: 'Não basta que «responda»: você mede a recuperação e a geração com métricas, não no olho.',
      pillars: [
        { color: '#5b9bd5', name: '🔍 Recuperação', q: 'Trouxe o que é relevante?', items: [
          ['Context precision', 'Do que foi recuperado, quanto é realmente relevante?'],
          ['Context recall', 'Do relevante que existia, quanto foi recuperado?']
        ]},
        { color: '#f59e0b', name: '✍️ Geração', q: 'A resposta é boa?', items: [
          ['Fidelidade', 'A resposta se apega ao contexto, sem inventar?'],
          ['Relevância', 'A resposta realmente responde à pergunta?']
        ]},
        { color: '#a970d0', name: '📈 Em produção', q: 'Com usuários reais', items: [
          ['LLM-as-judge', 'Um LLM avalia as respostas em escala.'],
          ['Feedback / A-B', 'Sinais de usuários, testes A/B, monitoramento.']
        ]}
      ],
      tie: '<strong>Frameworks:</strong> Ragas, TruLens, DeepEval, LangSmith. A <em>fidelidade</em> (faithfulness) que você vê no passo Generate é justamente uma dessas métricas.',
      cite: 'Parte da camada de produção do Advanced RAG.',
      close: 'Fechar'
    },
    docsTitle: '📄 Os mesmos documentos',
    docsDesc: 'Os mesmos 4 documentos de novo, para comparar as três abordagens com o mesmo material.',
    docsAnalogy: 'Os mesmos <strong>relatórios</strong> — mas esta redação vai arquivá-los de <strong>duas formas ao mesmo tempo</strong> e distribuí-los a vários repórteres.',
    docsCallout: '<strong>A jogada-chave do Advanced RAG:</strong> ele não escolhe um único índice. Indexa os documentos <strong>em um Vector DB e em um Graph DB ao mesmo tempo</strong>, para poder usar o que couber a cada pergunta (ou ambos).',
    ingTitle: '🏗️ Indexação enriquecida (Vetor + Grafo)',
    ingDesc: 'A ingestão faz mais do que trocear e embeber: enriquece metadata, faz chunking semântico, gera um grafo com um LLM e guarda tudo em <strong>dois bancos ao mesmo tempo</strong>.',
    ingAnalogy: 'A redação arquiva cada relatório <strong>duas vezes</strong>: em um índice de busca por palavras (Vector DB) e em um quadro de relações (Graph DB). Assim pode responder tanto «busque o parecido» quanto «siga o fio».',
    ingCallout: '<strong>Passos de ingestão avançada (slide de produção):</strong> <strong>parse &amp; clean</strong> (extrair + limpar, igual à aba RAG) · enriquecer metadata · chunking baseado em modelo · múltiplos embeddings · grafo gerado por LLM · <em>human-in-the-loop</em>. Saída: <strong>Vector DB + Graph DB</strong> populados e sincronizados.<br><br>Sim: antes de indexar, o texto também passa por <strong>parse &amp; clean</strong> — não dá para trocear nem embeber lixo.',
    ingVectorTitle: '💾 Vector DB',
    ingGraphTitle: '🕸️ Graph DB',
    ingVectorDone: (n) => `${n} vetores (embeddings TF-IDF)`,
    ingGraphDone: (n,e) => `${n} entidades · ${e} relações`,
    queryTitle: '❓ Sua pergunta',
    queryDesc: 'Chega a pergunta. No Advanced RAG ela não vai direto a uma busca: primeiro passa pelo <strong>router</strong>, que decide qual estratégia e quais agentes usar.',
    queryAnalogy: 'A pergunta chega à mesa do <strong>editor</strong>, não direto ao arquivo. O editor vai decidir a quem atribuí-la.',
    queryCallout: 'Teste as diferentes perguntas sugeridas: cada uma faz o <strong>router escolher uma estratégia diferente</strong> (vetorial, multi-hop via grafo, ou global via comunidades). Esse é o coração do Advanced RAG.',
    queryWrite: 'Escreva sua pergunta:',
    queryPlaceholder: 'O que você quer saber?',
    defaultQuery: 'Qual é a relação entre React e Node.js?',
    presets: [
      { label: 'Multi-hop → Graph+Vector', q: 'Qual é a relação entre React e Node.js?' },
      { label: 'Uma entidade → Local', q: 'O que é o DOM virtual?' },
      { label: 'Global → Comunidades', q: 'Me dê um resumo do tema bancos de dados' },
      { label: 'Factual → Vetorial', q: 'O que é uma interface de usuário?' }
    ],
    routeTitle: '🔀 Routing (transformação + estratégia)',
    routeDesc: 'O router <strong>reescreve/expande</strong> a query e <strong>decide a rota</strong>: basta o Vector DB, é preciso o grafo, ou é uma pergunta global?',
    routeAnalogy: 'O editor reformula o trabalho com mais contexto e decide: «isto é para o repórter de dados», «isto precisa do quadro de relações», «isto é um panorama geral».',
    routeCallout: '<strong>Query transform + planning:</strong> a pergunta é expandida com sinônimos/entidades para melhorar o recall, e uma política de roteamento escolhe a estratégia. Em produção quem faz isso é um LLM planejador; aqui usamos regras sobre as entidades detectadas.',
    routeTransformLabel: 'Query transform:',
    routeOriginal: 'Original',
    routeRewritten: 'Reescrita (expandida)',
    routeDecisionLabel: 'Decisão de roteamento:',
    routeReason: 'Motivo',
    routes: {
      multihop: { name: '🕸️ Rota multi-hop (Graph + Vector)', reason: 'A pergunta menciona 2+ entidades e busca uma relação → é preciso percorrer o grafo.' },
      local:    { name: '🕸️ Rota local (Graph + Vector)', reason: 'A pergunta gira em torno de uma entidade concreta → grafo para suas relações, vetor como apoio.' },
      global:   { name: '🌍 Rota global (Comunidades + Vector)', reason: 'A pergunta pede um panorama → resumos de comunidade.' },
      vector:   { name: '🔍 Rota vetorial (Vector DB)', reason: 'Pergunta factual sobre um tema pontual → basta a busca por similaridade.' }
    },
    agTitle: '🤖 Agentes em paralelo',
    agDesc: 'Conforme a rota, o router lança <strong>agentes especializados em paralelo</strong>. Cada um usa sua ferramenta (busca vetorial, percurso de grafo) e devolve candidatos.',
    agAnalogy: 'O editor manda <strong>vários repórteres de uma vez</strong>: um vasculha o índice de busca, outro segue os fios do quadro. Trabalham em paralelo e trazem seus achados.',
    agCallout: '<strong>Agentes especializados + ferramentas:</strong> cada agente tem seu papel e funções próprias. Aqui rodam o <strong>Vector Agent</strong> e o <strong>Graph Agent</strong>; um <strong>Tool Agent</strong> poderia chamar APIs externas (preços, clima, cálculos) quando a pergunta exigir.',
    agVectorTitle: '🔍 Vector Agent',
    agGraphTitle: '🕸️ Graph Agent',
    agToolTitle: '🛠️ Tool Agent',
    agToolNote: 'Inativo para esta pergunta (não requer dados externos nem ações).',
    agVectorSub: 'Busca por similaridade de cosseno',
    agGraphSub: 'Entity linking + percurso de relações',
    agFound: (n) => `${n} candidatos`,
    agNoGraph: 'Nenhuma entidade ancorada → o Graph Agent não aporta candidatos nesta rota.',
    rrTitle: '🎯 Reranking (pós-processamento)',
    rrDesc: 'Os candidatos de todos os agentes são <strong>fundidos e reordenados</strong> por um reranker que pontua relevância real. Se a confiança for baixa, ele <strong>reroteia e retenta</strong>.',
    rrAnalogy: 'O <strong>verificador</strong> junta tudo o que os repórteres trouxeram e <strong>reordena por qualidade real</strong>, não por quem chegou primeiro. Se nada convence, pede para reformular e buscar de novo.',
    rrCallout: '<strong>Custom reranker + reroute/retry:</strong> um modelo de reranking (p. ex. cross-encoder, Cohere Rerank) reavalia cada candidato contra a pergunta. Repare como a ordem muda em relação ao que os agentes trouxeram.',
    rrBefore: 'Antes (ordem dos agentes):',
    rrAfter: 'Depois (reordenado):',
    rrRelevance: 'relevância',
    rrRetry: '🔁 Reroute/retry: baixa confiança no melhor candidato → o agente reformula a query e retenta (aqui só sinalizamos).',
    rrOk: '✅ Confiança suficiente → segue para a geração.',
    tagVector: 'vetor', tagGraph: 'grafo',
    genTitle: '🤖 Generation (com guardrails + avaliação)',
    genDesc: 'O LLM recebe a pergunta e o contexto já <strong>reordenado</strong> (vetor + grafo), gera a resposta, e aplicam-se <strong>guardrails</strong> mais uma <strong>avaliação</strong> de fidelidade.',
    genAnalogy: 'O redator escreve a matéria com material já verificado e ordenado. Antes de publicar passa pelo <strong>controle editorial</strong> (guardrails) e mede-se sua <strong>fidelidade às fontes</strong>.',
    genCallout: (q) => `<strong>O prompt ao LLM combina as duas fontes:</strong><br><br><code>System: Responda a partir do contexto; respeite guardrails (RBAC, segurança).</code><br><code>Vector: [chunks top-k reordenados]</code><br><code>Graph: (React) —[biblioteca de]→ (JavaScript) …</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Contexto reordenado enviado ao LLM:',
    genFlow1: 'Pergunta + contexto híbrido',
    genFlow2: 'Resposta',
    genThinking: '🤖 LLM gerando resposta com contexto híbrido (vetor + grafo)...',
    genGuardrails: '🛡️ Guardrails: RBAC/ABAC · filtros de segurança · responder só a partir do contexto',
    genEvalLabel: 'Avaliação (estilo Ragas):',
    genFaithfulness: 'Fidelidade',
    genSources: '📎 Fontes utilizadas:',
    genAdvantages: '<strong style="color:#34d399;">✅ Quando usar Advanced RAG:</strong><br>• Quando convivem perguntas factuais, multi-hop e globais no mesmo produto<br>• Quando você precisa de ferramentas/ações (APIs, cálculos) além de recuperar texto<br>• Em produção: reranking, guardrails, avaliação e aprendizado adaptativo<br><br><strong style="color:#fbbf24;">⚠️ O custo:</strong><br>• Orquestrar router + agentes + reranker é muito mais complexo e caro<br>• Mais latência e mais peças a monitorar<br>• Para um caso simples, o RAG básico continua sendo a melhor opção'
  }
};

function AT() { return AR_I18N[lang]; }

// Short definitions for each box in the architecture diagram (hover/tap popover).
const AR_ARCHDEF = {
  es: {
    query: 'La pregunta del usuario. Aún no busca nada: primero pasa por el router.',
    router: 'Decide, para cada pregunta, qué estrategia usar (vectorial, grafo o global) y qué agentes lanzar.',
    agents: 'Agentes especializados que corren en paralelo; cada uno usa su herramienta (buscar en vector, recorrer el grafo).',
    hybrid: 'Recuperación híbrida: combina el Vector DB y el Graph DB en la misma consulta.',
    vector: 'Vector DB — guarda embeddings y busca por similitud coseno. Es el índice que usa el RAG clásico.',
    graph: 'Graph DB — guarda entidades y relaciones. Es el índice que usa GraphRAG.',
    docs: 'Tus documentos. Se indexan a la vez en el Vector DB y en el Graph DB.',
    tools: 'Tools & APIs — funciones y servicios externos (calendario, CRM, cálculos, búsqueda web…) que el agente puede invocar. Hoy se conectan sobre todo vía MCP (Model Context Protocol), el estándar que expone herramientas y datos a un agente sin integraciones a medida por cada servicio. Aquí aparece "disponible" porque la pregunta de ejemplo no necesita datos en vivo — pero es el mismo Tool Agent que viste en el paso Agentes.',
    rerank: 'Reordena los candidatos de todos los agentes por relevancia real; reintenta si la confianza es baja.',
    llm: 'El modelo de lenguaje que redacta la respuesta con el contexto ya recuperado y reordenado.',
    answer: 'La respuesta final, con citas, guardrails y una puntuación de fidelidad.'
  },
  en: {
    query: "The user's question. It doesn't search yet: first it goes through the router.",
    router: 'Decides, per question, which strategy to use (vector, graph or global) and which agents to launch.',
    agents: 'Specialized agents running in parallel; each uses its tool (vector search, graph traversal).',
    hybrid: 'Hybrid retrieval: combines the Vector DB and the Graph DB in the same query.',
    vector: 'Vector DB — stores embeddings and searches by cosine similarity. The index classic RAG uses.',
    graph: 'Graph DB — stores entities and relationships. The index GraphRAG uses.',
    docs: 'Your documents. Indexed into both the Vector DB and the Graph DB at once.',
    tools: 'Tools & APIs — external functions and services (calendar, CRM, calculations, web search…) the agent can call. Today these connect mostly via MCP (Model Context Protocol), the standard that exposes tools and data to an agent without custom per-service integrations. It shows as "available" here because the example question needs no live data — but it\'s the same Tool Agent you saw in the Agents step.',
    rerank: "Reorders all agents' candidates by real relevance; retries if confidence is low.",
    llm: 'The language model that writes the answer using the retrieved, reranked context.',
    answer: 'The final answer, with citations, guardrails and a faithfulness score.'
  },
  pt: {
    query: 'A pergunta do usuário. Ainda não busca nada: primeiro passa pelo router.',
    router: 'Decide, para cada pergunta, qual estratégia usar (vetorial, grafo ou global) e quais agentes lançar.',
    agents: 'Agentes especializados que rodam em paralelo; cada um usa sua ferramenta (buscar no vetor, percorrer o grafo).',
    hybrid: 'Recuperação híbrida: combina o Vector DB e o Graph DB na mesma consulta.',
    vector: 'Vector DB — guarda embeddings e busca por similaridade de cosseno. É o índice que o RAG clássico usa.',
    graph: 'Graph DB — guarda entidades e relações. É o índice que o GraphRAG usa.',
    docs: 'Seus documentos. São indexados ao mesmo tempo no Vector DB e no Graph DB.',
    tools: 'Tools & APIs — funções e serviços externos (calendário, CRM, cálculos, busca na web…) que o agente pode invocar. Hoje se conectam principalmente via MCP (Model Context Protocol), o padrão que expõe ferramentas e dados a um agente sem integrações sob medida por serviço. Aparece "disponível" aqui porque a pergunta de exemplo não precisa de dados ao vivo — mas é o mesmo Tool Agent que você viu no passo Agentes.',
    rerank: 'Reordena os candidatos de todos os agentes por relevância real; retenta se a confiança for baixa.',
    llm: 'O modelo de linguagem que redige a resposta com o contexto já recuperado e reordenado.',
    answer: 'A resposta final, com citações, guardrails e uma pontuação de fidelidade.'
  }
};

// Floating popover for architecture-diagram boxes.
function arShowTip(evt, key) {
  const def = AR_ARCHDEF[lang] && AR_ARCHDEF[lang][key];
  if (!def) return;
  let tip = document.getElementById('archTip');
  if (!tip) { tip = document.createElement('div'); tip.id = 'archTip'; tip.className = 'arch-tip'; document.body.appendChild(tip); }
  tip.textContent = def;
  tip.style.display = 'block';
  const r = tip.getBoundingClientRect();
  let x = evt.clientX - r.width / 2;
  let y = evt.clientY - r.height - 14;
  x = Math.max(8, Math.min(x, window.innerWidth - r.width - 8));
  if (y < 8) y = evt.clientY + 18;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}
function arHideTip() { const t = document.getElementById('archTip'); if (t) t.style.display = 'none'; }
// Tap-outside dismiss (mobile): boxes call arShowTip on click; clicks elsewhere hide it.
document.addEventListener('click', (e) => { if (!(e.target.closest && e.target.closest('.arch-box'))) arHideTip(); });

// Architecture diagram (SVG): shows RAG (Vector DB) and GraphRAG (Graph DB)
// as components nested inside the Advanced RAG orchestration.
function arArchDiagram() {
  const A = AT().arch;
  const box = (x, y, w, h, stroke, emoji, label, sub, subColor, key) => {
    const inner =
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#0f172a" stroke="${stroke}" stroke-width="1.6"/>` +
      `<text x="${x + w/2}" y="${y + (sub ? h/2 - 1 : h/2 + 5)}" text-anchor="middle" font-size="12.5" fill="#e2e8f0" font-weight="600">${emoji} ${label}</text>` +
      (sub ? `<text x="${x + w/2}" y="${y + h/2 + 15}" text-anchor="middle" font-size="10" font-weight="700" fill="${subColor}">${sub}</text>` : '');
    return key
      ? `<g class="arch-box" style="cursor:pointer" onmouseenter="arShowTip(event,'${key}')" onmouseleave="arHideTip()" onclick="arShowTip(event,'${key}')">${inner}</g>`
      : inner;
  };
  const arw = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e0506a" stroke-width="1.8" marker-end="url(#arHead)"/>`;
  return `
  <svg viewBox="0 0 720 430" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    <defs>
      <marker id="arHead" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#e0506a"/></marker>
      <marker id="arHeadD" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#e07a8a"/></marker>
    </defs>
    <rect x="6" y="24" width="708" height="400" rx="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="7 5" opacity="0.9"/>
    <text x="20" y="16" font-size="13" font-weight="700" fill="#f59e0b">${A.container}</text>

    ${box(26, 50, 104, 46, '#334155', '❓', A.query, null, null, 'query')}
    ${box(156, 50, 120, 46, '#f59e0b', '🔀', A.router, null, null, 'router')}
    ${box(302, 50, 120, 46, '#f59e0b', '🤖', A.agents, null, null, 'agents')}
    ${arw(130, 73, 153, 73)}
    ${arw(276, 73, 299, 73)}
    ${arw(362, 96, 362, 130)}

    ${box(26, 172, 158, 70, '#a970d0', '🛠️', A.tools, A.toolsSub, '#c4b5fd', 'tools')}
    ${arw(301, 90, 188, 178)}

    <rect x="214" y="132" width="296" height="120" rx="10" fill="rgba(15,23,42,0.5)" stroke="#64748b" stroke-width="1.3"/>
    <g class="arch-box" style="cursor:pointer" onmouseenter="arShowTip(event,'hybrid')" onmouseleave="arHideTip()" onclick="arShowTip(event,'hybrid')"><text x="362" y="150" text-anchor="middle" font-size="11" fill="#94a3b8" text-decoration="underline">${A.retrieval}</text></g>
    ${box(232, 162, 120, 60, '#e0506a', '💾', A.vectorDB, A.ragBadge, '#e0506a', 'vector')}
    ${box(372, 162, 120, 60, '#0d9488', '🕸️', A.graphDB, A.graphragBadge, '#5eead4', 'graph')}

    ${box(560, 162, 128, 60, '#334155', '📄', A.docs, null, null, 'docs')}
    <line x1="558" y1="192" x2="513" y2="192" stroke="#e0506a" stroke-width="1.8" marker-end="url(#arHead)"/>
    <text x="535" y="184" text-anchor="middle" font-size="9" fill="#64748b">${A.index}</text>

    ${arw(362, 252, 362, 286)}

    ${box(302, 288, 120, 46, '#f59e0b', '🎯', A.rerank, null, null, 'rerank')}
    ${box(448, 288, 96, 46, '#334155', '🤖', A.llm, null, null, 'llm')}
    ${box(568, 288, 120, 46, '#34d399', '✅', A.output, null, null, 'answer')}
    ${arw(422, 311, 445, 311)}
    ${arw(544, 311, 565, 311)}

    <rect x="150" y="352" width="424" height="26" rx="13" fill="none" stroke="#0d9488" stroke-width="1.1" opacity="0.8"/>
    <text x="362" y="369" text-anchor="middle" font-size="10.5" fill="#64748b"><tspan class="ar-mem-link" onclick="arOpenGuardrails()" style="cursor:pointer;text-decoration:underline;" fill="#f0a3ad" font-weight="700">${A.guardChip} &#9432;</tspan> · <tspan class="ar-mem-link" onclick="arOpenEval()" style="cursor:pointer;text-decoration:underline;" fill="#f0a3ad" font-weight="700">${A.evalChip} &#9432;</tspan> · <tspan class="ar-mem-link" onclick="arOpenMemory()" style="cursor:pointer;text-decoration:underline;" fill="#f0a3ad" font-weight="700">${A.memoryChip} &#9432;</tspan></text>

    <path d="M688,311 H700 V40 H216 V47" fill="none" stroke="#e07a8a" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.75" marker-end="url(#arHeadD)"/>
    <text x="440" y="35" text-anchor="middle" font-size="10" fill="#e07a8a">${A.reroute}</text>
  </svg>`;
}

// ========== ENGINE ==========
// Runs the whole advanced pipeline for a question and returns everything
// the step renderers need. Reuses vdb/emb (RAG) and grRetrieve (GraphRAG).
function arRun(q) {
  const vec = vdb.search(emb.embed(q), 4).map(v => ({
    type: 'vector', src: v.metadata.source, text: v.metadata.text, base: v.score
  }));
  const R = grRetrieve(q);

  // Router decides the strategy from entity linking + a "global" intent check,
  // independently of grRetrieve's internal mode (which collapses 0-entity
  // queries into global). This keeps all four routes reachable.
  const linked = grLinkEntities(q);
  const isGlobal = /\b(resumen|resume|resúmen|resumo|summary|summarize|overview|panorama|general)\b/i.test(q);
  let route;
  if (isGlobal) route = 'global';
  else if (linked.length >= 2) route = 'multihop';
  else if (linked.length === 1) route = 'local';
  else route = 'vector';

  // Query transform: expand with detected entity names + a generic hint.
  const entityNames = R.seeds.map(id => grLabel(id));
  const rewritten = entityNames.length
    ? `${q}  [+ ${entityNames.join(', ')}]`
    : `${q}  [+ ${route === 'global' ? (lang === 'es' ? 'panorama, resumen' : lang === 'pt' ? 'panorama, resumo' : 'overview, summary') : (lang === 'es' ? 'definición, cómo funciona' : lang === 'pt' ? 'definição, como funciona' : 'definition, how it works')}]`;

  // Graph agent candidates (only when there are anchored entities).
  const graphActive = route !== 'vector';
  const graphCands = graphActive
    ? [...R.edges].slice(0, 4).map(i => {
        const e = GR_EDGES[i];
        const onPath = R.path.length > 1 &&
          R.path.some((p, k) => k < R.path.length - 1 &&
            ((e.s === R.path[k] && e.t === R.path[k+1]) || (e.t === R.path[k] && e.s === R.path[k+1])));
        return {
          type: 'graph',
          src: documents[e.doc].source,
          text: `${grLabel(e.s)} —${e.label[lang]}→ ${grLabel(e.t)}`,
          onPath
        };
      })
    : [];

  // Reranker: assign a 0..100 relevance. Graph evidence is weighted high on
  // graph routes and low on the vector route (that's what reorders the list).
  const seedLabels = R.seeds.map(id => grLabel(id).toLowerCase());
  vec.forEach(c => {
    const containsSeed = seedLabels.some(s => c.text.toLowerCase().includes(s));
    c.rel = Math.round(c.base * 100) + (containsSeed ? 8 : 0);
  });
  graphCands.forEach(c => {
    c.rel = graphActive ? (c.onPath ? 93 : 80) : 26;
  });

  // "Before" = what agents returned, agent by agent (vector first, then graph).
  const before = [...vec].concat(graphCands);
  // "After" = merged + reranked by relevance.
  const after = [...before].sort((a, b) => b.rel - a.rel);

  const topRel = after.length ? after[0].rel : 0;
  const lowConfidence = topRel < 30;
  const faithfulness = Math.min(98, Math.round(62 + topRel * 0.38));

  return { q, R, route, rewritten, vec, graphCands, graphActive, before, after, topRel, lowConfidence, faithfulness };
}

function arContextChip(c) {
  const isGraph = c.type === 'graph';
  const color = isGraph ? '#f472b6' : '#e0506a';
  const tag = isGraph ? AT().tagGraph : AT().tagVector;
  return `
    <div class="vis-card" style="margin-bottom:6px; padding:9px 12px; border-left:3px solid ${color};">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:${color}; font-weight:700;">${tag} · ${c.src}</span>
        <span style="font-size:11px; color:#94a3b8; font-family:monospace;">${AT().rrRelevance}: <strong style="color:#e2e8f0;">${c.rel}</strong></span>
      </div>
      <div style="font-size:12.5px; color:#cbd5e1; margin-top:4px; line-height:1.5;">${isGraph ? c.text : '"' + c.text.slice(0, 120) + '..."'}</div>
    </div>
  `;
}

// ========== STATE ==========
const AR_STEPS = [
  { icon:'📖' }, { icon:'📄' }, { icon:'🏗️' }, { icon:'❓' },
  { icon:'🔀' }, { icon:'🤖' }, { icon:'🎯' }, { icon:'🤖' },
];
let arStep = 0;
let arQuery = '';

function arOnLangChange() {
  arQuery = '';
  if (arStep > 3) arStep = 3; // routing..generate depend on a stored query
}

// ========== RENDER SHELL ==========
function arRenderPipeline() {
  const el = document.getElementById('pipeline');
  const labels = AT().stepLabels;
  el.innerHTML = AR_STEPS.map((s, i) => {
    const cls = i < arStep ? 'done' : i === arStep ? 'active' : 'locked';
    return (i > 0 ? '<span class="pip-arrow">→</span>' : '') +
      `<div class="pip ${cls}" onclick="${i <= arStep ? 'arGoStep(' + i + ')' : ''}">${s.icon} ${labels[i]}</div>`;
  }).join('');
}

function arRenderStep() {
  document.getElementById('subtitle').innerHTML = AT().subtitle;
  arRenderPipeline();
  const renderers = [arRenderIntro, arRenderDocs, arRenderIngest, arRenderQuery, arRenderRouting, arRenderAgents, arRenderRerank, arRenderGenerate];
  const m = document.getElementById('main');
  m.innerHTML = '';
  renderers[arStep]();
  m.innerHTML += arRenderControls();
  arAttachControlEvents();
}

function arRenderControls() {
  const L = AT();
  const isFirst = arStep === 0;
  const isLast = arStep === AR_STEPS.length - 1;
  const isQuery = arStep === 3;
  return `
    <div class="controls">
      <button class="btn btn-ghost" id="arPrevBtn" ${isFirst ? 'disabled' : ''}>${L.prev}</button>
      <span class="step-counter">${L.counter(arStep + 1, AR_STEPS.length)}</span>
      ${isQuery
        ? `<button class="btn btn-primary" id="arNextBtn" onclick="arSubmitQuery()">${L.search}</button>`
        : `<button class="btn btn-primary" id="arNextBtn" ${isLast ? 'disabled' : ''}>${isLast ? L.end : L.next}</button>`
      }
    </div>
    ${isLast ? `
      <div style="text-align:center; margin-top:16px;">
        <button class="btn btn-reset" onclick="arRestart()">${L.restart}</button>
      </div>
    ` : ''}
  `;
}

function arAttachControlEvents() {
  const prev = document.getElementById('arPrevBtn');
  const next = document.getElementById('arNextBtn');
  if (prev) prev.onclick = () => { if (arStep > 0) { arStep--; arRenderStep(); } };
  if (next && arStep !== 3) next.onclick = () => { if (arStep < AR_STEPS.length - 1) { arStep++; arRenderStep(); } };
}

function arGoStep(i) { arStep = i; arRenderStep(); }
function arRestart() { arStep = 0; arQuery = ''; arRenderStep(); }

// ========== STEP 0: INTRO ==========
function arRenderIntro() {
  const L = AT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.introNum}</div>
        <div class="step-title">${L.introTitle}</div>
        <div class="step-desc">${L.introDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.introAnalogy}
        </div>

        <div class="callout">${L.introCallout}</div>

        <div style="color:#f59e0b; font-weight:600; margin:16px 0 4px;">${L.cmpTitle}</div>
        <div style="overflow-x:auto;">
          <table class="cmp-table">
            <thead><tr>${L.cmpHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${L.cmpRows.map(r => `<tr>${r.map((c, ci) => `<td${ci === 3 ? ' style="color:#fbbf24;"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>

        <div style="color:#f59e0b; font-weight:600; margin:18px 0 4px;">${L.archTitle}</div>
        <div class="gr-svg-wrap" style="border-color:rgba(245,158,11,0.4);">${arArchDiagram()}</div>
        <div style="text-align:center; font-size:11.5px; color:#64748b; margin:4px 0 2px;">💡 ${L.archHint}</div>
        <div style="font-size:12.5px; color:#94a3b8; text-align:center; margin:-2px 0 6px; line-height:1.55;">${L.archCaption}</div>
        <div style="text-align:center; margin:2px 0 6px;">
          <button class="btn btn-ghost" style="font-size:12.5px; padding:8px 16px;" onclick="arOpenMemory()">🧠 ${L.memoryBtn}</button>
        </div>

        <div style="margin-top:16px;">
          <div style="color:#f59e0b; font-weight:600; margin-bottom:10px;">${L.introFlowTitle}</div>
          <div class="vis-grid" style="grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));">
            ${L.flowCards.map(s =>
              `<div class="vis-card" style="text-align:center; padding:14px 8px;"><div style="font-size:24px;">${s.split(' ')[0]}</div><div style="font-size:12px; color:#94a3b8; margin-top:4px;">${s.split(' ').slice(1).join(' ')}</div></div>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 1: DOCUMENTS ==========
function arRenderDocs() {
  const L = AT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(1)}</div>
        <div class="step-title">${L.docsTitle}</div>
        <div class="step-desc">${L.docsDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.docsAnalogy}
        </div>

        <div class="callout">${L.docsCallout}</div>

        <div class="vis-grid" style="grid-template-columns: 1fr 1fr;">
          ${documents.map((d) => `
            <div class="vis-card">
              <div class="vis-label">📄 ${d.source}</div>
              <div class="vis-text">${d.text}</div>
              <div style="margin-top:8px; font-size:11px; color:#64748b;">${d.text.split(/\s+/).length} ${L.words}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 2: ENRICHED INDEXING (Vector + Graph) ==========
function arRenderIngest() {
  const L = AT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(2)}</div>
        <div class="step-title">${L.ingTitle}</div>
        <div class="step-desc">${L.ingDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.ingAnalogy}
        </div>

        <div class="callout">${L.ingCallout}</div>

        <div class="vis-grid" style="grid-template-columns: 1fr 1fr; align-items:start;">
          <div class="vis-card" style="border-color:#8e1b2c;">
            <div class="vis-label" style="color:#f0a3ad;">${L.ingVectorTitle}</div>
            <table class="vdb-table" style="margin-top:8px;">
              <tbody>
                ${vdb.vectors.slice(0, 6).map(v => {
                  const topVals = [...v.embedding].sort((a,b)=>b-a).slice(0,10);
                  const maxV = Math.max(...topVals) || 1;
                  return `
                    <tr>
                      <td style="color:#e0506a; font-family:monospace; font-size:10px;">${v.id}</td>
                      <td style="font-size:10px;">${v.metadata.source}</td>
                      <td><div class="vdb-mini">${topVals.map(val => `<div class="vdb-mini-bar" style="height:${Math.max(2,val/maxV*14)}px;"></div>`).join('')}</div></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div style="margin-top:8px; font-size:11px; color:#34d399; text-align:center;">${L.ingVectorDone(vdb.vectors.length)}</div>
          </div>
          <div class="vis-card" style="border-color:#0d9488;">
            <div class="vis-label" style="color:#5eead4;">${L.ingGraphTitle}</div>
            ${grRenderGraph({ byCom: true })}
            <div style="margin-top:4px; font-size:11px; color:#34d399; text-align:center;">${L.ingGraphDone(GR_NODES.length, GR_EDGES.length)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 3: QUERY ==========
function arRenderQuery() {
  const L = AT();
  const val = (arQuery || L.defaultQuery).replace(/"/g, '&quot;');
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(3)}</div>
        <div class="step-title">${L.queryTitle}</div>
        <div class="step-desc">${L.queryDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.queryAnalogy}
        </div>

        <div class="callout">${L.queryCallout}</div>

        <div class="query-section">
          <div style="color:#f59e0b; font-weight:600; margin-bottom:8px;">${L.queryWrite}</div>
          <div class="query-box">
            <input class="query-input" id="arQueryInput" placeholder="${L.queryPlaceholder}" value="${val}" />
          </div>
          <div class="presets">
            ${L.presets.map(p => `<span class="preset" onclick="document.getElementById('arQueryInput').value=${JSON.stringify(p.q).replace(/"/g, '&quot;')}">${p.label}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function arSubmitQuery() {
  arQuery = document.getElementById('arQueryInput').value.trim();
  if (!arQuery) return;
  arStep = 4;
  arRenderStep();
}

// ========== STEP 4: ROUTING ==========
function arRenderRouting() {
  const L = AT();
  const q = arQuery || L.defaultQuery;
  const A = arRun(q);
  window._arLast = A;
  const r = L.routes[A.route];

  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(4)}</div>
        <div class="step-title">${L.routeTitle}</div>
        <div class="step-desc">${L.routeDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.routeAnalogy}
        </div>

        <div class="callout">${L.routeCallout}</div>

        <div style="color:#f59e0b; font-weight:600; margin:14px 0 6px;">${L.routeTransformLabel}</div>
        <div class="vis-card" style="margin-bottom:6px;">
          <div style="font-size:11px; color:#64748b;">${L.routeOriginal}</div>
          <div style="font-size:13px; color:#cbd5e1; margin:2px 0 10px;">"${q}"</div>
          <div style="font-size:11px; color:#64748b;">${L.routeRewritten}</div>
          <div style="font-size:13px; color:#fbbf24; font-family:monospace;">"${A.rewritten}"</div>
        </div>

        <div style="color:#f59e0b; font-weight:600; margin:14px 0 6px;">${L.routeDecisionLabel}</div>
        <div class="gr-path" style="border-color:#ea580c; color:#fdba74; text-align:left;">
          <div style="font-size:15px; font-weight:700; margin-bottom:6px;">${r.name}</div>
          <div style="font-size:12.5px; color:#cbd5e1; font-family:'Segoe UI',system-ui,sans-serif;"><strong style="color:#fdba74;">${L.routeReason}:</strong> ${r.reason}</div>
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 5: AGENTS ==========
function arRenderAgents() {
  const L = AT();
  const A = window._arLast || arRun(arQuery || L.defaultQuery);

  const vectorCol = `
    <div class="vis-card" style="border-color:#8e1b2c;">
      <div class="vis-label" style="color:#f0a3ad;">${L.agVectorTitle}</div>
      <div style="font-size:11px; color:#64748b; margin-bottom:8px;">${L.agVectorSub} · ${L.agFound(A.vec.length)}</div>
      ${A.vec.map(c => `
        <div style="background:#0f172a; border-radius:6px; padding:8px 10px; margin-bottom:5px;">
          <div style="font-size:10px; color:#e0506a;">${c.src}</div>
          <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">"${c.text.slice(0, 70)}..."</div>
        </div>
      `).join('')}
    </div>
  `;

  const graphCol = `
    <div class="vis-card" style="border-color:#0d9488;">
      <div class="vis-label" style="color:#5eead4;">${L.agGraphTitle}</div>
      <div style="font-size:11px; color:#64748b; margin-bottom:8px;">${L.agGraphSub} · ${L.agFound(A.graphCands.length)}</div>
      ${A.graphActive
        ? A.graphCands.map(c => `
            <div style="background:#0f172a; border-radius:6px; padding:8px 10px; margin-bottom:5px;">
              <div style="font-size:10px; color:#5eead4;">${c.src}</div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">${c.text}</div>
            </div>
          `).join('')
        : `<div style="font-size:12px; color:#64748b; padding:8px 0;">${L.agNoGraph}</div>`
      }
    </div>
  `;

  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(5)}</div>
        <div class="step-title">${L.agTitle}</div>
        <div class="step-desc">${L.agDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.agAnalogy}
        </div>

        <div class="callout">${L.agCallout}</div>

        <div class="arrow-flow" style="margin:8px 0 14px;">
          <span>🔀 Router</span>
          <span class="arrow">→</span>
          <span style="color:#f0a3ad;">${L.agVectorTitle}</span>
          <span style="color:#475569;">+</span>
          <span style="color:#5eead4;">${L.agGraphTitle}</span>
          <span style="color:#475569;">||</span>
          <span style="color:#94a3b8;">${L.agToolTitle}</span>
        </div>

        <div class="vis-grid" style="grid-template-columns: 1fr 1fr; align-items:start;">
          ${vectorCol}
          ${graphCol}
        </div>

        <div class="vis-card" style="margin-top:10px; border-style:dashed; opacity:0.75;">
          <div class="vis-label" style="color:#94a3b8;">${L.agToolTitle}</div>
          <div style="font-size:12px; color:#64748b;">${L.agToolNote}</div>
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 6: RERANK ==========
function arRenderRerank() {
  const L = AT();
  const A = window._arLast || arRun(arQuery || L.defaultQuery);

  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(6)}</div>
        <div class="step-title">${L.rrTitle}</div>
        <div class="step-desc">${L.rrDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.rrAnalogy}
        </div>

        <div class="callout">${L.rrCallout}</div>

        <div class="vis-grid" style="grid-template-columns: 1fr 1fr; align-items:start; gap:14px;">
          <div>
            <div style="color:#64748b; font-weight:600; margin-bottom:8px; font-size:13px;">${L.rrBefore}</div>
            ${A.before.map((c, i) => `
              <div class="vis-card" style="margin-bottom:5px; padding:8px 10px; display:flex; gap:8px; align-items:center;">
                <span style="color:#475569; font-weight:700; font-size:12px;">${i+1}</span>
                <span style="font-size:10px; text-transform:uppercase; color:${c.type === 'graph' ? '#f472b6' : '#e0506a'}; font-weight:700;">${c.type === 'graph' ? L.tagGraph : L.tagVector}</span>
                <span style="font-size:11px; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${c.type === 'graph' ? c.text : c.src}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <div style="color:#f59e0b; font-weight:600; margin-bottom:8px; font-size:13px;">${L.rrAfter}</div>
            ${A.after.map((c, i) => `
              <div class="vis-card" style="margin-bottom:5px; padding:8px 10px; display:flex; gap:8px; align-items:center; ${i === 0 ? 'border-color:#f59e0b;' : ''}">
                <span style="color:${i === 0 ? '#fbbf24' : '#475569'}; font-weight:700; font-size:12px;">${i+1}</span>
                <span style="font-size:10px; text-transform:uppercase; color:${c.type === 'graph' ? '#f472b6' : '#e0506a'}; font-weight:700;">${c.type === 'graph' ? L.tagGraph : L.tagVector}</span>
                <span style="font-size:11px; color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${c.type === 'graph' ? c.text : c.src}</span>
                <span style="font-size:11px; color:#e2e8f0; font-family:monospace;">${c.rel}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="callout" style="margin-top:14px; border-left-color:${A.lowConfidence ? '#fbbf24' : '#34d399'};">
          ${A.lowConfidence ? L.rrRetry : L.rrOk}
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 7: GENERATE ==========
function arRenderGenerate() {
  const L = AT();
  const A = window._arLast || arRun(arQuery || L.defaultQuery);
  const q = A.q;
  const topCtx = A.after.slice(0, 4);

  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(7)}</div>
        <div class="step-title">${L.genTitle}</div>
        <div class="step-desc">${L.genDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.genAnalogy}
        </div>

        <div class="callout">${L.genCallout(q)}</div>

        <div style="color:#f59e0b; font-weight:600; margin:16px 0 8px;">${L.genContextLabel}</div>
        ${topCtx.map(arContextChip).join('')}

        <div class="arrow-flow" style="margin:16px 0;">
          <span>${L.genFlow1}</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span>🤖 LLM</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span>${L.genFlow2}</span>
        </div>

        <div class="llm-box" style="border-color:#ea580c;">
          <div class="llm-thinking" style="color:#fdba74;">${L.genThinking}</div>
          <div class="llm-answer">${arGenerateAnswer(A)}</div>

          <div style="margin-top:14px; padding-top:12px; border-top:1px solid #334155;">
            <div style="font-size:11px; color:#5eead4; margin-bottom:8px;">${L.genGuardrails}</div>

            <div style="font-size:11px; color:#64748b; margin-bottom:4px;">${L.genEvalLabel}</div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
              <span style="font-size:12px; color:#94a3b8; width:80px;">${L.genFaithfulness}</span>
              <div class="sim-bar" style="flex:1; height:8px;"><div class="sim-bar-fill" style="width:${A.faithfulness}%; background:linear-gradient(90deg,#ea580c,#f59e0b);"></div></div>
              <span style="font-size:13px; color:#fbbf24; font-weight:700; font-family:monospace;">${A.faithfulness}%</span>
            </div>

            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${L.genSources}</div>
            ${[...new Set(topCtx.map(c => c.src))].map(src => `<span class="llm-source" style="border-color:#ea580c; color:#fdba74;">${src}</span>`).join('')}
          </div>
        </div>

        <div class="callout" style="margin-top:16px; border-left-color:#34d399;">
          ${L.genAdvantages}
        </div>
      </div>
    </div>
  `;
}

// Reuse the answer generators from the other tabs, picking by route.
function arGenerateAnswer(A) {
  // Graph/global routes answer from the knowledge graph; the vector route
  // falls back to the RAG-tab generator over the retrieved chunks.
  if (A.route !== 'vector' && typeof grGenerateAnswer === 'function') {
    return grGenerateAnswer(A.q, A.R);
  }
  const vecResults = A.vec.map(c => ({ metadata: { source: c.src, text: c.text }, score: c.base }));
  return generateAnswer(A.q, vecResults);
}

// ========== MEMORY SUMMARY MODAL ==========
// Opened from the "🧠 Memory" chip in the architecture diagram. Shows a visual
// summary of the agent-memory framework (Forms / Functions / Dynamics) and where
// RAG fits within it. Source: Hu et al., arXiv:2512.13564.
// Generic modal builder used by the Memory / Guardrails / Evaluation chips.
// `M` = { eyebrow, title, sub, pillars:[{color,name,q,items:[[k,v]]}], tie?, frontiers?, cite, close }.
function arOpenModal(M) {
  if (!M || document.getElementById('memOverlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'mem-overlay';
  overlay.id = 'memOverlay';
  overlay.innerHTML = `
    <div class="mem-card" role="dialog" aria-modal="true" aria-label="${M.title}">
      <button class="mem-close" aria-label="${M.close}" onclick="arCloseMemory()">&#10005;</button>
      <div class="mem-eyebrow">${M.eyebrow}</div>
      <h2>${M.title}</h2>
      <p class="mem-sub">${M.sub}</p>
      <div class="mem-pillars">
        ${M.pillars.map(p => `
          <div class="mem-pillar" style="border-top-color:${p.color};">
            <h3 style="color:${p.color};">${p.name}</h3>
            <div class="pq">${p.q}</div>
            ${p.items.map(it => `<div class="mem-item"><div class="k">${it[0]}</div><div class="v">${it[1]}</div></div>`).join('')}
          </div>
        `).join('')}
      </div>
      ${M.tie ? `<div class="mem-tie">${M.tie}</div>` : ''}
      ${M.frontiers ? `<div class="mem-frontiers">${M.frontiers}</div>` : ''}
      <div class="mem-cite">${M.cite}</div>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) arCloseMemory(); });
  document.addEventListener('keydown', arMemEsc);
  document.body.appendChild(overlay);
}
function arOpenMemory() { arOpenModal(AT().memory); }
function arOpenGuardrails() { arOpenModal(AT().guardrailsInfo); }
function arOpenEval() { arOpenModal(AT().evalInfo); }
function arCloseMemory() {
  const o = document.getElementById('memOverlay');
  if (o) o.remove();
  document.removeEventListener('keydown', arMemEsc);
}
function arMemEsc(e) { if (e.key === 'Escape') arCloseMemory(); }
