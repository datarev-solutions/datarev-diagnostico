// ===================================================================
// Harness Engineering tab — fourth exercise.
// Loaded after index.html, graphrag.js and advanced-rag.js, so it reuses
// arOpenModal() (generic modal builder) and shared CSS classes
// (.step-card, .vis-card, .mem-pillar, .callout, .analogy, .gr-path).
// Covers the layers that surround the LLM in production — the
// "harness" — and closes the loop back to Ontology/GraphRAG by
// explaining how they anchor a stochastic model into deterministic
// behavior. All identifiers are prefixed hr/HR_.
// ===================================================================

const HR_I18N = {
  en: {
    subtitle: 'Harness Engineering &mdash; everything that surrounds the LLM',
    stepLabels: ['Intro','Guardrails','Cognition','Execution','Observability','Determinism'],
    prev: '← Previous', next: 'Next →', end: 'End', restart: '🔄 Restart',
    counter: (c,n) => `Step ${c} of ${n}`,
    stepOf: (n) => `Step ${n} of 6`,
    analogyLabel: '💡 Analogy',
    introNum: 'Introduction',
    introTitle: 'What is Harness Engineering?',
    introDesc: 'The LLM is only the statistical engine. The <strong>harness</strong> is all the software infrastructure wrapped around it — the wiring that feeds it, filters it, gives it memory, hands it tools and measures it — so it becomes a safe, predictable, capable system.',
    introAnalogy: 'An LLM is a hyper-powerful <strong>Formula 1 engine</strong>. Left on the ground, it just makes noise and burns fuel. Harness Engineering builds the <strong>car around it</strong>: the chassis, the brakes, the aerodynamics, the fuel tank and the telemetry dashboard. Only with the harness does the engine become a working race car.',
    introCallout: '<strong>Where RAG fits:</strong> RAG / GraphRAG / Advanced RAG (the other 3 tabs) are just <em>one piece</em> of the harness — the memory/retrieval piece. Harness Engineering is the bigger picture: everything that surrounds the model, from input filtering to tool execution to cost monitoring.',
    layersTitle: 'The four layers of the harness:',
    layers: [
      { icon:'🛡️', name:'Guardrails & Regulation', desc:'Controls what goes in and what comes out.' },
      { icon:'🧠', name:'Cognition & Memory', desc:'Gives the stateless LLM continuity and reasoning.' },
      { icon:'⚙️', name:'Execution & Integration', desc:'Gives the agent hands and feet — tools, APIs, code.' },
      { icon:'📊', name:'Observability & Telemetry', desc:'Measures cost, latency and quality in production.' }
    ],
    // Guardrails layer
    gTitle: '🛡️ Layer 1 · Guardrails & Regulation',
    gDesc: 'The armor of the agent. It controls, down to the detail, what enters the LLM and what leaves it.',
    gAnalogy: 'Think of airport security (input) and customs at the destination (output): both checkpoints exist so nothing dangerous gets through in either direction.',
    gCallout: 'This is the layer most directly tied to production safety — it is often the first thing added once a RAG prototype needs to become a real product.',
    gPillars: [
      { color:'#5b9bd5', name:'Input Guardrails', q:'Before the LLM sees anything', items:[
        ['Prompt injection', 'Detect attempts to hijack the agent with hidden instructions.'],
        ['PII / banned topics', 'Filter sensitive data and out-of-scope questions before they reach the model.']
      ]},
      { color:'#f59e0b', name:'Output Guardrails', q:'Before the user sees anything', items:[
        ['Hallucination checks', 'Validate the response against the retrieved context.'],
        ['Format / safety validation', 'Ensure structured output (JSON, code) is valid and content isn\'t toxic.']
      ]},
      { color:'#a970d0', name:'Tone & Persona Managers', q:'Staying on-brand', items:[
        ['Dynamic instructions', 'Keep the model within brand voice and empathy level regardless of user frustration.']
      ]}
    ],
    // Cognition layer
    cTitle: '🧠 Layer 2 · Cognition & Memory',
    cDesc: 'The LLM is <strong>stateless</strong> — it remembers nothing between calls on its own. This layer builds the illusion of continuity and deep thought.',
    cAnalogy: 'Like a brilliant consultant with amnesia: every meeting, someone has to hand them a folder summarizing everything relevant before they can think straight.',
    cCallout: '<strong>This is where RAG lives.</strong> Long-term memory pulls facts via Vector DB (classic RAG) or Graph DB (GraphRAG) — see the other tabs. This layer is bigger than retrieval alone: it also manages the context window and orchestrates multi-step reasoning.',
    cPillars: [
      { color:'#5b9bd5', name:'Context Window Management', q:'Fitting inside the limit', items:[
        ['Trim / summarize', 'Since context is limited and costs money, the harness decides what to drop, summarize or keep.']
      ]},
      { color:'#f59e0b', name:'Short & Long-Term Memory', q:'Where facts live', items:[
        ['Short-term', 'The immediate chat history.'],
        ['Long-term', 'RAG (Vector DB) and GraphRAG (Graph DB) — plus key-value stores for fixed user facts (name, preferences).']
      ]},
      { color:'#a970d0', name:'Task Planners / Orchestrators', q:'How the agent reasons', items:[
        ['ReAct', 'Reason → Act → Observe the result → Reason again, in a loop.'],
        ['Chain-of-Thought / Plan-and-Solve', 'Forces step-by-step reasoning before producing a final answer.'],
        ['Atomic tasks', 'The planner breaks a big, ambiguous goal into small, single-responsibility steps — one tool call or one decision each. This is what makes "Observe" in ReAct possible: you can only inspect the result of a step if that step did exactly one thing. It also makes failures debuggable (you know exactly which atomic step broke) and retryable (you re-run just that step, not the whole plan).']
      ]}
    ],
    // Execution layer
    eTitle: '⚙️ Layer 3 · Execution & Integration',
    eDesc: 'Gives the agent <strong>hands and feet</strong> to act on the real world, instead of only producing text.',
    eAnalogy: 'The LLM says "I want to book a meeting on Tuesday" — this layer is the assistant who actually opens the calendar app and clicks the buttons.',
    eCallout: 'This is what turns a chatbot into an agent: the ability to actually change something in the world, not just describe it.',
    ePillars: [
      { color:'#5b9bd5', name:'Tool / API Harness', q:'Turning words into actions', items:[
        ['Intent → payload', 'Translates "book a meeting" into a real Google Calendar API call, executes it, and returns the result to the LLM.'],
        ['MCP (Model Context Protocol)', 'Today\'s standard for exposing tools, data sources and skills to an agent — one protocol instead of a custom integration per service.']
      ]},
      { color:'#f59e0b', name:'Secure Code Sandboxing', q:'When the agent writes code', items:[
        ['Isolated containers', 'If the agent can execute code (e.g. a data-analysis agent), it runs inside a sandbox — a buggy or malicious script dies there without touching production infrastructure.']
      ]}
    ],
    // Observability layer
    oTitle: '📊 Layer 4 · Observability & Telemetry',
    oDesc: 'What isn\'t measured can\'t be improved. This layer tracks the agent\'s behavior once it is live.',
    oAnalogy: 'The dashboard of the race car: speed, fuel, tire wear — without it the pit crew is flying blind.',
    oCallout: 'This layer connects directly to the <strong>Evaluation</strong> modal you saw in Advanced RAG (Ragas, faithfulness, context precision/recall) — those metrics live here.',
    oPillars: [
      { color:'#5b9bd5', name:'Real-Time Evaluation', q:'Is it still working well?', items:[
        ['Sampled scoring', 'Continuously measures RAG faithfulness, answer relevance, tool success rate.']
      ]},
      { color:'#f59e0b', name:'Cost & Latency Tracking', q:'Is it still affordable?', items:[
        ['Token / time tracking', 'Monitors consumption and response time; can kill-switch an agent stuck in an expensive infinite loop.']
      ]}
    ],
    // Determinism
    dTitle: '🎲 Closing the loop: stochastic vs. deterministic',
    dDesc: 'An LLM is a <strong>stochastic</strong> (probabilistic) engine: it predicts the statistically most likely next word. That is the opposite of <strong>deterministic</strong> — same input, same output, always.',
    dAnalogy: 'A raw LLM is like loaded dice: very likely to land the number you want, but the randomness is still built into the mechanism. Ontology + GraphRAG + the Harness don\'t remove the dice — they build a box around them with only one exit.',
    dCallout: '<strong>Four mechanisms that anchor determinism on top of a probabilistic core:</strong>',
    dMechanisms: [
      ['1. Structural rails instead of vector guesswork', 'A vector-only RAG hands the LLM loose chunks and lets it guess how they connect — that\'s where it hallucinates. GraphRAG (governed by an <strong>ontology</strong>) hands over a hard fact: Entity A —exact relation→ Entity B. The model no longer has to guess the relationship, only phrase it.'],
      ['2. Shrinking the search space (context anchoring)', 'Hallucination risk grows with ambiguous, noisy context. Removing filler words and keeping only normalized entities/relations narrows the LLM\'s probability distribution toward the correct answer.'],
      ['3. Traceability and audit', 'A graph query (Cypher/SPARQL-style) is deterministic code — you can see exactly which nodes and edges were retrieved. If the answer is wrong but the graph was right, the bug is in the LLM\'s phrasing; if the graph was wrong, the bug is in the data. That separation is the first step toward fixing it.'],
      ['4. Strict grounding via the Harness', 'The <strong>Output Guardrail</strong> is deterministic code: it checks whether the entities/relations the LLM just mentioned actually exist in the ontology/graph. If not — block the answer, no matter how confident the LLM sounded.']
    ],
    dFlow: ['Probabilistic LLM answer', 'Output Guardrail', 'Exists in Ontology/Graph?', '✅ Show to user', '❌ Block — hallucination'],
    dClosing: '<strong>The line for class:</strong> "We can\'t make the LLM\'s brain stop being probabilistic — but with an Ontology and GraphRAG, we build a maze with walls so solid and a single correct exit, that by pure probability, the LLM has no real option but to walk the right path."',
    dAdvantages: '<strong style="color:#34d399;">✅ Recap — how each piece reduces randomness:</strong><br>• <strong>Ontology</strong>: fixes what entities/relations are legal, killing synonym drift<br>• <strong>GraphRAG</strong>: replaces "guess the connection" with "read the connection"<br>• <strong>Harness (guardrails)</strong>: deterministic code double-checks a probabilistic answer before it ships'
  },
  es: {
    subtitle: 'Harness Engineering &mdash; todo lo que rodea al LLM',
    stepLabels: ['Intro','Guardrails','Cognición','Ejecución','Observabilidad','Determinismo'],
    prev: '← Anterior', next: 'Siguiente →', end: 'Fin', restart: '🔄 Reiniciar',
    counter: (c,n) => `Paso ${c} de ${n}`,
    stepOf: (n) => `Paso ${n} de 6`,
    analogyLabel: '💡 Analogía',
    introNum: 'Introducción',
    introTitle: '¿Qué es Harness Engineering?',
    introDesc: 'El LLM es solo el motor estadístico. El <strong>harness (arnés)</strong> es toda la infraestructura de software que lo rodea — lo que lo alimenta, lo filtra, le da memoria, le pone herramientas y lo mide — para que se convierta en un sistema seguro, predecible y capaz.',
    introAnalogy: 'Un LLM es un motor de <strong>Fórmula 1</strong> hiperpotente. Suelto en el piso, solo hace ruido y quema gasolina. Harness Engineering construye el <strong>coche alrededor</strong>: el chasis, los frenos, la aerodinámica, el tanque y el tablero de telemetría. Solo con el arnés el motor se vuelve un coche de carreras funcional.',
    introCallout: '<strong>Dónde encaja RAG:</strong> RAG / GraphRAG / Advanced RAG (las otras 3 pestañas) son solo <em>una pieza</em> del harness — la pieza de memoria/recuperación. Harness Engineering es el panorama completo: todo lo que rodea al modelo, desde filtrar la entrada hasta ejecutar herramientas y medir costos.',
    layersTitle: 'Las cuatro capas del harness:',
    layers: [
      { icon:'🛡️', name:'Guardrails & Regulación', desc:'Controla qué entra y qué sale.' },
      { icon:'🧠', name:'Cognición & Memoria', desc:'Le da continuidad y razonamiento al LLM sin estado.' },
      { icon:'⚙️', name:'Ejecución & Integración', desc:'Le da manos y pies al agente — herramientas, APIs, código.' },
      { icon:'📊', name:'Observabilidad & Telemetría', desc:'Mide costo, latencia y calidad en producción.' }
    ],
    gTitle: '🛡️ Capa 1 · Guardrails & Regulación',
    gDesc: 'La armadura del agente. Controla al detalle qué entra al LLM y qué sale de él.',
    gAnalogy: 'Como la seguridad del aeropuerto (entrada) y la aduana al llegar (salida): ambos filtros existen para que nada peligroso pase en ninguna dirección.',
    gCallout: 'Es la capa más ligada a seguridad en producción — suele ser lo primero que se agrega cuando un prototipo de RAG tiene que volverse un producto real.',
    gPillars: [
      { color:'#5b9bd5', name:'Input Guardrails', q:'Antes de que el LLM vea nada', items:[
        ['Prompt injection', 'Detecta intentos de secuestrar al agente con instrucciones ocultas.'],
        ['PII / temas vetados', 'Filtra datos sensibles y preguntas fuera de alcance antes de llegar al modelo.']
      ]},
      { color:'#f59e0b', name:'Output Guardrails', q:'Antes de que el usuario vea nada', items:[
        ['Chequeo de alucinaciones', 'Valida la respuesta contra el contexto recuperado.'],
        ['Validación de formato/seguridad', 'Verifica que el output estructurado (JSON, código) sea válido y no sea tóxico.']
      ]},
      { color:'#a970d0', name:'Gestores de Tono y Persona', q:'Mantenerse en marca', items:[
        ['Instrucciones dinámicas', 'Mantienen al modelo dentro de la voz de marca y nivel de empatía sin importar la frustración del usuario.']
      ]}
    ],
    cTitle: '🧠 Capa 2 · Cognición & Memoria',
    cDesc: 'El LLM es <strong>stateless</strong> (sin estado) — no recuerda nada entre llamadas por sí mismo. Esta capa construye la ilusión de continuidad y pensamiento profundo.',
    cAnalogy: 'Como un consultor brillante con amnesia: en cada reunión, alguien tiene que entregarle una carpeta con el resumen de todo lo relevante antes de que pueda pensar con claridad.',
    cCallout: '<strong>Aquí vive RAG.</strong> La memoria de largo plazo trae hechos vía Vector DB (RAG clásico) o Graph DB (GraphRAG) — ve las otras pestañas. Esta capa es más grande que solo recuperación: también gestiona la ventana de contexto y orquesta el razonamiento multi-paso.',
    cPillars: [
      { color:'#5b9bd5', name:'Gestión de la Ventana de Contexto', q:'Caber dentro del límite', items:[
        ['Recortar / resumir', 'Como el contexto es limitado y cuesta dinero, el harness decide qué botar, resumir o conservar.']
      ]},
      { color:'#f59e0b', name:'Memoria Corto y Largo Plazo', q:'Dónde viven los hechos', items:[
        ['Corto plazo', 'El historial inmediato del chat.'],
        ['Largo plazo', 'RAG (Vector DB) y GraphRAG (Graph DB) — más bases clave-valor para datos fijos del usuario (nombre, preferencias).']
      ]},
      { color:'#a970d0', name:'Planificadores / Orquestadores', q:'Cómo razona el agente', items:[
        ['ReAct', 'Pensar → Actuar → Observar el resultado → Volver a pensar, en un ciclo.'],
        ['Chain-of-Thought / Plan-and-Solve', 'Fuerza un razonamiento paso a paso antes de dar la respuesta final.'],
        ['Tareas atómicas', 'El planificador rompe un objetivo grande y ambiguo en pasos pequeños de una sola responsabilidad — una llamada a herramienta o una decisión cada uno. Esto es lo que hace posible el «Observar» de ReAct: solo puedes inspeccionar el resultado de un paso si ese paso hizo exactamente una cosa. También vuelve los fallos depurables (sabes exactamente qué paso atómico se rompió) y reintentables (reintentas solo ese paso, no todo el plan).']
      ]}
    ],
    eTitle: '⚙️ Capa 3 · Ejecución & Integración',
    eDesc: 'Le da al agente <strong>manos y pies</strong> para actuar en el mundo real, en vez de solo producir texto.',
    eAnalogy: 'El LLM dice «quiero agendar una junta el martes» — esta capa es el asistente que de verdad abre el calendario y hace clic en los botones.',
    eCallout: 'Esto es lo que convierte un chatbot en un agente: la capacidad de cambiar algo en el mundo real, no solo describirlo.',
    ePillars: [
      { color:'#5b9bd5', name:'Tool / API Harness', q:'Convertir palabras en acciones', items:[
        ['Intención → payload', 'Traduce «agendar una junta» en una llamada real a la API de Google Calendar, la ejecuta y regresa el resultado al LLM.'],
        ['MCP (Model Context Protocol)', 'El estándar actual para exponer herramientas, fuentes de datos y skills a un agente — un solo protocolo en vez de una integración a medida por cada servicio.']
      ]},
      { color:'#f59e0b', name:'Sandboxing de Código Seguro', q:'Cuando el agente escribe código', items:[
        ['Contenedores aislados', 'Si el agente puede ejecutar código (p. ej. un agente de análisis de datos), corre dentro de un sandbox — un script con bug o malicioso muere ahí sin tocar la infraestructura de producción.']
      ]}
    ],
    oTitle: '📊 Capa 4 · Observabilidad & Telemetría',
    oDesc: 'Lo que no se mide no se puede mejorar. Esta capa rastrea el comportamiento del agente ya en producción.',
    oAnalogy: 'El tablero del coche de carreras: velocidad, gasolina, desgaste de llantas — sin él, el equipo de pits está volando a ciegas.',
    oCallout: 'Esta capa conecta directo con el modal de <strong>Evaluación</strong> que viste en Advanced RAG (Ragas, fidelidad, context precision/recall) — esas métricas viven aquí.',
    oPillars: [
      { color:'#5b9bd5', name:'Evaluación en Tiempo Real', q:'¿Sigue funcionando bien?', items:[
        ['Puntuación muestreada', 'Mide continuamente la fidelidad del RAG, la relevancia de la respuesta, la tasa de éxito de herramientas.']
      ]},
      { color:'#f59e0b', name:'Monitoreo de Costo y Latencia', q:'¿Sigue siendo costeable?', items:[
        ['Rastreo de tokens/tiempo', 'Monitorea consumo y tiempo de respuesta; puede activar un kill-switch si el agente entra en un loop infinito costoso.']
      ]}
    ],
    dTitle: '🎲 Cerrando el círculo: estocástico vs. determinista',
    dDesc: 'Un LLM es un motor <strong>estocástico</strong> (probabilístico): predice la palabra siguiente estadísticamente más probable. Eso es lo opuesto a <strong>determinista</strong> — misma entrada, misma salida, siempre.',
    dAnalogy: 'Un LLM crudo es como dados cargados: muy probable que caiga el número que quieres, pero la aleatoriedad sigue en el mecanismo. Ontología + GraphRAG + el Harness no quitan los dados — construyen una caja alrededor con una sola salida.',
    dCallout: '<strong>Cuatro mecanismos que anclan el determinismo sobre un núcleo probabilístico:</strong>',
    dMechanisms: [
      ['1. Vías estructurales en vez de adivinanza vectorial', 'Un RAG solo-vectorial le da al LLM chunks sueltos y lo deja adivinar cómo se conectan — ahí alucina. GraphRAG (gobernado por una <strong>ontología</strong>) entrega un hecho duro: Entidad A —relación exacta→ Entidad B. El modelo ya no adivina la relación, solo la traduce a lenguaje natural.'],
      ['2. Reducir el espacio de búsqueda (context anchoring)', 'El riesgo de alucinar crece con contexto ambiguo y ruidoso. Quitar palabras de relleno y dejar solo entidades/relaciones normalizadas estrecha la distribución de probabilidad del LLM hacia la respuesta correcta.'],
      ['3. Trazabilidad y auditoría', 'Una consulta al grafo (estilo Cypher/SPARQL) es código determinista — puedes ver exactamente qué nodos y edges se recuperaron. Si la respuesta está mal pero el grafo tenía el dato correcto, el error es de cómo lo redactó el LLM; si el grafo estaba mal, el error es de los datos. Esa separación es el primer paso para arreglarlo.'],
      ['4. Grounding estricto vía el Harness', 'El <strong>Output Guardrail</strong> es código determinista: revisa si las entidades/relaciones que el LLM acaba de mencionar existen de verdad en la ontología/grafo. Si no — bloquea la respuesta, sin importar qué tan seguro sonara el LLM.']
    ],
    dFlow: ['Respuesta probabilística del LLM', 'Output Guardrail', '¿Existe en Ontología/Grafo?', '✅ Mostrar al usuario', '❌ Bloquear — alucinación'],
    dClosing: '<strong>La frase para la clase:</strong> «No podemos hacer que el cerebro del LLM deje de ser probabilístico — pero con una Ontología y GraphRAG, construimos un laberinto con paredes tan sólidas y una única salida correcta, que por pura probabilidad, el LLM no tiene más opción que caminar por el camino correcto.»',
    dAdvantages: '<strong style="color:#34d399;">✅ Resumen — cómo cada pieza reduce la aleatoriedad:</strong><br>• <strong>Ontología</strong>: fija qué entidades/relaciones son legales, matando la deriva de sinónimos<br>• <strong>GraphRAG</strong>: reemplaza «adivinar la conexión» por «leer la conexión»<br>• <strong>Harness (guardrails)</strong>: código determinista revisa dos veces una respuesta probabilística antes de mostrarla'
  },
  pt: {
    subtitle: 'Harness Engineering &mdash; tudo o que envolve o LLM',
    stepLabels: ['Intro','Guardrails','Cognição','Execução','Observabilidade','Determinismo'],
    prev: '← Anterior', next: 'Próximo →', end: 'Fim', restart: '🔄 Reiniciar',
    counter: (c,n) => `Passo ${c} de ${n}`,
    stepOf: (n) => `Passo ${n} de 6`,
    analogyLabel: '💡 Analogia',
    introNum: 'Introdução',
    introTitle: 'O que é Harness Engineering?',
    introDesc: 'O LLM é só o motor estatístico. O <strong>harness (arnês)</strong> é toda a infraestrutura de software ao redor dele — o que o alimenta, filtra, dá memória, entrega ferramentas e mede — para que se torne um sistema seguro, previsível e capaz.',
    introAnalogy: 'Um LLM é um motor de <strong>Fórmula 1</strong> hiperpotente. Solto no chão, só faz barulho e queima combustível. Harness Engineering constrói o <strong>carro ao redor</strong>: o chassi, os freios, a aerodinâmica, o tanque e o painel de telemetria. Só com o arnês o motor vira um carro de corrida funcional.',
    introCallout: '<strong>Onde o RAG se encaixa:</strong> RAG / GraphRAG / Advanced RAG (as outras 3 abas) são só <em>uma peça</em> do harness — a peça de memória/recuperação. Harness Engineering é o panorama completo: tudo o que envolve o modelo, desde filtrar a entrada até executar ferramentas e medir custos.',
    layersTitle: 'As quatro camadas do harness:',
    layers: [
      { icon:'🛡️', name:'Guardrails & Regulação', desc:'Controla o que entra e o que sai.' },
      { icon:'🧠', name:'Cognição & Memória', desc:'Dá continuidade e raciocínio ao LLM sem estado.' },
      { icon:'⚙️', name:'Execução & Integração', desc:'Dá mãos e pés ao agente — ferramentas, APIs, código.' },
      { icon:'📊', name:'Observabilidade & Telemetria', desc:'Mede custo, latência e qualidade em produção.' }
    ],
    gTitle: '🛡️ Camada 1 · Guardrails & Regulação',
    gDesc: 'A armadura do agente. Controla em detalhe o que entra no LLM e o que sai dele.',
    gAnalogy: 'Como a segurança do aeroporto (entrada) e a alfândega no destino (saída): ambos os filtros existem para que nada perigoso passe em nenhuma direção.',
    gCallout: 'É a camada mais ligada à segurança em produção — costuma ser a primeira coisa adicionada quando um protótipo de RAG precisa virar um produto real.',
    gPillars: [
      { color:'#5b9bd5', name:'Input Guardrails', q:'Antes de o LLM ver qualquer coisa', items:[
        ['Prompt injection', 'Detecta tentativas de sequestrar o agente com instruções ocultas.'],
        ['PII / temas proibidos', 'Filtra dados sensíveis e perguntas fora do escopo antes de chegar ao modelo.']
      ]},
      { color:'#f59e0b', name:'Output Guardrails', q:'Antes de o usuário ver qualquer coisa', items:[
        ['Checagem de alucinações', 'Valida a resposta contra o contexto recuperado.'],
        ['Validação de formato/segurança', 'Verifica se o output estruturado (JSON, código) é válido e não é tóxico.']
      ]},
      { color:'#a970d0', name:'Gestores de Tom e Persona', q:'Manter-se na marca', items:[
        ['Instruções dinâmicas', 'Mantêm o modelo dentro da voz da marca e nível de empatia, seja qual for a frustração do usuário.']
      ]}
    ],
    cTitle: '🧠 Camada 2 · Cognição & Memória',
    cDesc: 'O LLM é <strong>stateless</strong> (sem estado) — não lembra de nada entre chamadas por si só. Esta camada constrói a ilusão de continuidade e pensamento profundo.',
    cAnalogy: 'Como um consultor brilhante com amnésia: em cada reunião, alguém precisa entregar uma pasta com o resumo de tudo relevante antes que ele consiga pensar direito.',
    cCallout: '<strong>Aqui vive o RAG.</strong> A memória de longo prazo traz fatos via Vector DB (RAG clássico) ou Graph DB (GraphRAG) — veja as outras abas. Esta camada é maior que só recuperação: também gerencia a janela de contexto e orquestra o raciocínio multi-etapas.',
    cPillars: [
      { color:'#5b9bd5', name:'Gestão da Janela de Contexto', q:'Caber dentro do limite', items:[
        ['Cortar / resumir', 'Como o contexto é limitado e custa dinheiro, o harness decide o que descartar, resumir ou manter.']
      ]},
      { color:'#f59e0b', name:'Memória Curto e Longo Prazo', q:'Onde os fatos vivem', items:[
        ['Curto prazo', 'O histórico imediato do chat.'],
        ['Longo prazo', 'RAG (Vector DB) e GraphRAG (Graph DB) — mais bancos chave-valor para dados fixos do usuário (nome, preferências).']
      ]},
      { color:'#a970d0', name:'Planejadores / Orquestradores', q:'Como o agente raciocina', items:[
        ['ReAct', 'Pensar → Agir → Observar o resultado → Pensar de novo, em ciclo.'],
        ['Chain-of-Thought / Plan-and-Solve', 'Força um raciocínio passo a passo antes de dar a resposta final.'],
        ['Tarefas atômicas', 'O planejador quebra um objetivo grande e ambíguo em passos pequenos de responsabilidade única — uma chamada de ferramenta ou uma decisão cada. É isso que torna possível o «Observar» do ReAct: só dá para inspecionar o resultado de um passo se esse passo fez exatamente uma coisa. Também torna as falhas depuráveis (você sabe exatamente qual passo atômico quebrou) e retentáveis (você refaz só esse passo, não o plano inteiro).']
      ]}
    ],
    eTitle: '⚙️ Camada 3 · Execução & Integração',
    eDesc: 'Dá ao agente <strong>mãos e pés</strong> para agir no mundo real, em vez de só produzir texto.',
    eAnalogy: 'O LLM diz «quero agendar uma reunião na terça» — esta camada é o assistente que de fato abre o calendário e clica nos botões.',
    eCallout: 'Isso é o que transforma um chatbot em um agente: a capacidade de mudar algo no mundo real, não só descrevê-lo.',
    ePillars: [
      { color:'#5b9bd5', name:'Tool / API Harness', q:'Transformar palavras em ações', items:[
        ['Intenção → payload', 'Traduz «agendar uma reunião» em uma chamada real à API do Google Calendar, executa e devolve o resultado ao LLM.'],
        ['MCP (Model Context Protocol)', 'O padrão atual para expor ferramentas, fontes de dados e skills a um agente — um único protocolo em vez de uma integração sob medida por serviço.']
      ]},
      { color:'#f59e0b', name:'Sandboxing de Código Seguro', q:'Quando o agente escreve código', items:[
        ['Contêineres isolados', 'Se o agente pode executar código (ex. um agente de análise de dados), ele roda dentro de um sandbox — um script com bug ou malicioso morre ali sem tocar a infraestrutura de produção.']
      ]}
    ],
    oTitle: '📊 Camada 4 · Observabilidade & Telemetria',
    oDesc: 'O que não se mede não se pode melhorar. Esta camada rastreia o comportamento do agente já em produção.',
    oAnalogy: 'O painel do carro de corrida: velocidade, combustível, desgaste dos pneus — sem ele, a equipe de boxes está voando às cegas.',
    oCallout: 'Esta camada conecta direto com o modal de <strong>Avaliação</strong> que você viu no Advanced RAG (Ragas, fidelidade, context precision/recall) — essas métricas vivem aqui.',
    oPillars: [
      { color:'#5b9bd5', name:'Avaliação em Tempo Real', q:'Ainda funciona bem?', items:[
        ['Pontuação amostrada', 'Mede continuamente a fidelidade do RAG, a relevância da resposta, a taxa de sucesso das ferramentas.']
      ]},
      { color:'#f59e0b', name:'Monitoramento de Custo e Latência', q:'Ainda é viável financeiramente?', items:[
        ['Rastreio de tokens/tempo', 'Monitora consumo e tempo de resposta; pode acionar um kill-switch se o agente entrar em um loop infinito caro.']
      ]}
    ],
    dTitle: '🎲 Fechando o ciclo: estocástico vs. determinista',
    dDesc: 'Um LLM é um motor <strong>estocástico</strong> (probabilístico): prevê a palavra seguinte estatisticamente mais provável. Isso é o oposto de <strong>determinista</strong> — mesma entrada, mesma saída, sempre.',
    dAnalogy: 'Um LLM cru é como dados viciados: muito provável que caia o número que você quer, mas a aleatoriedade continua no mecanismo. Ontologia + GraphRAG + o Harness não tiram os dados — constroem uma caixa ao redor com uma única saída.',
    dCallout: '<strong>Quatro mecanismos que ancoram o determinismo sobre um núcleo probabilístico:</strong>',
    dMechanisms: [
      ['1. Trilhos estruturais em vez de adivinhação vetorial', 'Um RAG só-vetorial dá ao LLM chunks soltos e o deixa adivinhar como se conectam — é aí que ele alucina. O GraphRAG (governado por uma <strong>ontologia</strong>) entrega um fato duro: Entidade A —relação exata→ Entidade B. O modelo não adivinha mais a relação, só a traduz para linguagem natural.'],
      ['2. Reduzir o espaço de busca (context anchoring)', 'O risco de alucinar cresce com contexto ambíguo e ruidoso. Remover palavras de preenchimento e manter só entidades/relações normalizadas estreita a distribuição de probabilidade do LLM rumo à resposta correta.'],
      ['3. Rastreabilidade e auditoria', 'Uma consulta ao grafo (estilo Cypher/SPARQL) é código determinista — você vê exatamente quais nós e edges foram recuperados. Se a resposta está errada mas o grafo tinha o dado certo, o erro é de como o LLM redigiu; se o grafo estava errado, o erro é dos dados. Essa separação é o primeiro passo para consertar.'],
      ['4. Grounding estrito via o Harness', 'O <strong>Output Guardrail</strong> é código determinista: verifica se as entidades/relações que o LLM acabou de mencionar existem de fato na ontologia/grafo. Se não — bloqueia a resposta, não importa quão confiante o LLM parecesse.']
    ],
    dFlow: ['Resposta probabilística do LLM', 'Output Guardrail', 'Existe na Ontologia/Grafo?', '✅ Mostrar ao usuário', '❌ Bloquear — alucinação'],
    dClosing: '<strong>A frase para a aula:</strong> «Não podemos fazer o cérebro do LLM deixar de ser probabilístico — mas com uma Ontologia e GraphRAG, construímos um labirinto com paredes tão sólidas e uma única saída correta, que por pura probabilidade, o LLM não tem outra opção a não ser caminhar pelo caminho certo.»',
    dAdvantages: '<strong style="color:#34d399;">✅ Resumo — como cada peça reduz a aleatoriedade:</strong><br>• <strong>Ontologia</strong>: fixa quais entidades/relações são legais, matando a deriva de sinônimos<br>• <strong>GraphRAG</strong>: substitui «adivinhar a conexão» por «ler a conexão»<br>• <strong>Harness (guardrails)</strong>: código determinista revisa duas vezes uma resposta probabilística antes de exibi-la'
  }
};

function HT() { return HR_I18N[lang]; }

// ========== STATE ==========
const HR_STEPS = [
  { icon:'📖' }, { icon:'🛡️' }, { icon:'🧠' }, { icon:'⚙️' }, { icon:'📊' }, { icon:'🎲' }
];
let hrStep = 0;
function hrOnLangChange() { /* no query-dependent state to reset */ }

function hrPillars(pillars) {
  return `
    <div class="mem-pillars" style="margin-top:12px;">
      ${pillars.map(p => `
        <div class="mem-pillar" style="border-top-color:${p.color};">
          <h3 style="color:${p.color};">${p.name}</h3>
          <div class="pq">${p.q}</div>
          ${p.items.map(it => `<div class="mem-item"><div class="k">${it[0]}</div><div class="v">${it[1]}</div></div>`).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

// ========== RENDER SHELL ==========
function hrRenderPipeline() {
  const el = document.getElementById('pipeline');
  const labels = HT().stepLabels;
  el.innerHTML = HR_STEPS.map((s, i) => {
    const cls = i < hrStep ? 'done' : i === hrStep ? 'active' : 'locked';
    return (i > 0 ? '<span class="pip-arrow">→</span>' : '') +
      `<div class="pip ${cls}" onclick="${i <= hrStep ? 'hrGoStep(' + i + ')' : ''}">${s.icon} ${labels[i]}</div>`;
  }).join('');
}

function hrRenderStep() {
  document.getElementById('subtitle').innerHTML = HT().subtitle;
  hrRenderPipeline();
  const renderers = [hrRenderIntro, hrRenderGuardrails, hrRenderCognition, hrRenderExecution, hrRenderObservability, hrRenderDeterminism];
  const m = document.getElementById('main');
  m.innerHTML = '';
  renderers[hrStep]();
  m.innerHTML += hrRenderControls();
  hrAttachControlEvents();
}

function hrRenderControls() {
  const L = HT();
  const isFirst = hrStep === 0;
  const isLast = hrStep === HR_STEPS.length - 1;
  return `
    <div class="controls">
      <button class="btn btn-ghost" id="hrPrevBtn" ${isFirst ? 'disabled' : ''}>${L.prev}</button>
      <span class="step-counter">${L.counter(hrStep + 1, HR_STEPS.length)}</span>
      <button class="btn btn-primary" id="hrNextBtn" ${isLast ? 'disabled' : ''}>${isLast ? L.end : L.next}</button>
    </div>
    ${isLast ? `
      <div style="text-align:center; margin-top:16px;">
        <button class="btn btn-reset" onclick="hrRestart()">${L.restart}</button>
      </div>
    ` : ''}
  `;
}

function hrAttachControlEvents() {
  const prev = document.getElementById('hrPrevBtn');
  const next = document.getElementById('hrNextBtn');
  if (prev) prev.onclick = () => { if (hrStep > 0) { hrStep--; hrRenderStep(); } };
  if (next) next.onclick = () => { if (hrStep < HR_STEPS.length - 1) { hrStep++; hrRenderStep(); } };
}

function hrGoStep(i) { hrStep = i; hrRenderStep(); }
function hrRestart() { hrStep = 0; hrRenderStep(); }

// ========== STEP 0: INTRO ==========
function hrRenderIntro() {
  const L = HT();
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

        <div style="color:#a970d0; font-weight:600; margin:16px 0 10px;">${L.layersTitle}</div>
        <div class="vis-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
          ${L.layers.map((ly, i) => `
            <div class="vis-card" style="cursor:pointer;" onclick="hrGoStep(${i+1})">
              <div style="font-size:22px;">${ly.icon}</div>
              <div class="vis-label" style="color:#a970d0; margin-top:4px;">${ly.name}</div>
              <div class="vis-text" style="font-size:12px;">${ly.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 1: GUARDRAILS LAYER ==========
function hrRenderGuardrails() {
  const L = HT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(1)}</div>
        <div class="step-title">${L.gTitle}</div>
        <div class="step-desc">${L.gDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy"><div class="analogy-label">${L.analogyLabel}</div>${L.gAnalogy}</div>
        <div class="callout">${L.gCallout}</div>
        ${hrPillars(L.gPillars)}
      </div>
    </div>
  `;
}

// ========== STEP 2: COGNITION & MEMORY LAYER ==========
function hrRenderCognition() {
  const L = HT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(2)}</div>
        <div class="step-title">${L.cTitle}</div>
        <div class="step-desc">${L.cDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy"><div class="analogy-label">${L.analogyLabel}</div>${L.cAnalogy}</div>
        <div class="callout" style="border-left-color:#e0506a;">${L.cCallout}</div>
        ${hrPillars(L.cPillars)}
      </div>
    </div>
  `;
}

// ========== STEP 3: EXECUTION & INTEGRATION LAYER ==========
function hrRenderExecution() {
  const L = HT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(3)}</div>
        <div class="step-title">${L.eTitle}</div>
        <div class="step-desc">${L.eDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy"><div class="analogy-label">${L.analogyLabel}</div>${L.eAnalogy}</div>
        <div class="callout">${L.eCallout}</div>
        ${hrPillars(L.ePillars)}
      </div>
    </div>
  `;
}

// ========== STEP 4: OBSERVABILITY LAYER ==========
function hrRenderObservability() {
  const L = HT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(4)}</div>
        <div class="step-title">${L.oTitle}</div>
        <div class="step-desc">${L.oDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy"><div class="analogy-label">${L.analogyLabel}</div>${L.oAnalogy}</div>
        <div class="callout" style="border-left-color:#34d399;">${L.oCallout}</div>
        ${hrPillars(L.oPillars)}
      </div>
    </div>
  `;
}

// ========== STEP 5: DETERMINISM (closing) ==========
function hrRenderDeterminism() {
  const L = HT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(5)}</div>
        <div class="step-title">${L.dTitle}</div>
        <div class="step-desc">${L.dDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy"><div class="analogy-label">${L.analogyLabel}</div>${L.dAnalogy}</div>

        <div class="callout" style="border-left-color:#a970d0;">${L.dCallout}</div>
        ${L.dMechanisms.map(m => `
          <div class="vis-card" style="margin-bottom:8px;">
            <div class="vis-label" style="color:#a970d0;">${m[0]}</div>
            <div class="vis-text">${m[1]}</div>
          </div>
        `).join('')}

        <div class="gr-path" style="border-color:#a970d0; color:#d8b4fe; margin-top:14px;">
          ${L.dFlow[0]} <span style="color:#f472b6;">→</span> <strong>${L.dFlow[1]}</strong> <span style="color:#f472b6;">→</span> ${L.dFlow[2]}<br>
          <span style="color:#34d399;">${L.dFlow[3]}</span> &nbsp;·&nbsp; <span style="color:#f87171;">${L.dFlow[4]}</span>
        </div>

        <div class="callout" style="margin-top:16px; border-left-color:#e0506a;">${L.dClosing}</div>
        <div class="callout" style="margin-top:12px; border-left-color:#34d399;">${L.dAdvantages}</div>
      </div>
    </div>
  `;
}
