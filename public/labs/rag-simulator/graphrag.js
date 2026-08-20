// ===================================================================
// GraphRAG tab — parallel exercise to the RAG simulator.
// Loaded after index.html's main script; reuses its globals:
//   lang, documents, emb, vdb  (vdb/emb power the "what would
//   traditional RAG retrieve" comparison in the Retrieve step).
// All identifiers here are prefixed gr/GR_ to avoid collisions.
// ===================================================================

// ========== KNOWLEDGE GRAPH DATA ==========
// Entities extracted from the same 4 documents used in the RAG tab.
// com = community id, x/y = fixed layout position in the SVG.
const GR_NODES = [
  { id:'js',         label:{es:'JavaScript', en:'JavaScript', pt:'JavaScript'},                          com:'js',    x:250, y:185, alias:['javascript','(?<!node\\.)js'] },
  { id:'nodejs',     label:{es:'Node.js', en:'Node.js', pt:'Node.js'},                                com:'js',    x:240, y:60,  alias:['node\\.?js','node'] },
  { id:'v8',         label:{es:'V8', en:'V8', pt:'V8'},                                          com:'js',    x:150, y:105, alias:['v8'] },
  { id:'chrome',     label:{es:'Chrome', en:'Chrome', pt:'Chrome'},                                  com:'js',    x:60,  y:60,  alias:['chrome'] },
  { id:'server',     label:{es:'Servidor', en:'Server', pt:'Servidor'},                                com:'js',    x:330, y:105, alias:['servidor','server'] },
  { id:'react',      label:{es:'React', en:'React', pt:'React'},                                    com:'front', x:490, y:130, alias:['react'] },
  { id:'facebook',   label:{es:'Facebook', en:'Facebook', pt:'Facebook'},                              com:'front', x:470, y:40,  alias:['facebook'] },
  { id:'vdom',       label:{es:'DOM virtual', en:'Virtual DOM', pt:'DOM virtual'},                        com:'front', x:600, y:80,  alias:['dom virtual','virtual dom','dom'] },
  { id:'components', label:{es:'Componentes', en:'Components', pt:'Componentes'},                         com:'front', x:620, y:180, alias:['componentes','components','componente','component'] },
  { id:'python',     label:{es:'Python', en:'Python', pt:'Python'},                                  com:'py',    x:140, y:330, alias:['python'] },
  { id:'ai',         label:{es:'Inteligencia Artificial', en:'Artificial Intelligence', pt:'Inteligência Artificial'},com:'py',    x:70,  y:415, alias:['inteligencia artificial','inteligência artificial','artificial intelligence','ia','ai'] },
  { id:'ds',         label:{es:'Ciencia de Datos', en:'Data Science', pt:'Ciência de Dados'},                  com:'py',    x:245, y:415, alias:['ciencia de datos','ciência de dados','data science'] },
  { id:'sql',        label:{es:'SQL', en:'SQL', pt:'SQL'},                                        com:'db',    x:470, y:300, alias:['sql'] },
  { id:'postgres',   label:{es:'PostgreSQL', en:'PostgreSQL', pt:'PostgreSQL'},                          com:'db',    x:600, y:280, alias:['postgresql','postgres'] },
  { id:'mysql',      label:{es:'MySQL', en:'MySQL', pt:'MySQL'},                                        com:'db',    x:610, y:360, alias:['mysql'] },
  { id:'mongodb',    label:{es:'MongoDB', en:'MongoDB', pt:'MongoDB'},                                com:'db',    x:430, y:400, alias:['mongodb','mongo'] },
  { id:'nosql',      label:{es:'NoSQL', en:'NoSQL', pt:'NoSQL'},                                      com:'db',    x:545, y:440, alias:['nosql'] },
  { id:'json',       label:{es:'JSON', en:'JSON', pt:'JSON'},                                      com:'db',    x:330, y:435, alias:['json'] },
];
const GR_NODE_MAP = Object.fromEntries(GR_NODES.map(n => [n.id, n]));

// Relations: s —label→ t, extracted from document index `doc` (order of DOCS).
const GR_EDGES = [
  { s:'nodejs',  t:'js',         label:{es:'entorno para', en:'runtime for', pt:'ambiente para'},      doc:0 },
  { s:'nodejs',  t:'v8',         label:{es:'construido sobre', en:'built on', pt:'construído sobre'},     doc:0 },
  { s:'v8',      t:'chrome',     label:{es:'motor de', en:'engine of', pt:'motor de'},            doc:0 },
  { s:'nodejs',  t:'server',     label:{es:'se ejecuta en', en:'runs on', pt:'roda em'},         doc:0 },
  { s:'react',   t:'js',         label:{es:'biblioteca de', en:'library of', pt:'biblioteca de'},      doc:2 },
  { s:'react',   t:'facebook',   label:{es:'creado por', en:'created by', pt:'criado por'},         doc:2 },
  { s:'react',   t:'vdom',       label:{es:'usa', en:'uses', pt:'usa'},                      doc:2 },
  { s:'react',   t:'components', label:{es:'se compone de', en:'made of', pt:'é composto de'},         doc:2 },
  { s:'python',  t:'ai',         label:{es:'usado en', en:'used in', pt:'usado em'},              doc:1 },
  { s:'python',  t:'ds',         label:{es:'usado en', en:'used in', pt:'usado em'},              doc:1 },
  { s:'sql',     t:'postgres',   label:{es:'consulta a', en:'queries', pt:'consulta'},            doc:3 },
  { s:'sql',     t:'mysql',      label:{es:'consulta a', en:'queries', pt:'consulta'},            doc:3 },
  { s:'mongodb', t:'nosql',      label:{es:'es una BD', en:'is a', pt:'é um BD'},                doc:3 },
  { s:'mongodb', t:'json',       label:{es:'almacena', en:'stores', pt:'armazena'},               doc:3 },
];

const GR_COMMUNITIES = {
  js: {
    color:'#e0506a',
    name:{es:'Ecosistema JavaScript (backend)', en:'JavaScript ecosystem (backend)', pt:'Ecossistema JavaScript (backend)'},
    kw:['javascript'],
    summary:{
      es:'Comunidad centrada en JavaScript fuera del navegador: Node.js es un entorno de ejecución construido sobre el motor V8 de Chrome que permite ejecutar JavaScript en el servidor con un modelo de I/O sin bloqueo, liviano y eficiente.',
      en:"Community centered on JavaScript outside the browser: Node.js is a runtime built on Chrome's V8 engine that runs JavaScript on the server with a non-blocking, lightweight and efficient I/O model.",
      pt:'Comunidade centrada em JavaScript fora do navegador: Node.js é um ambiente de execução construído sobre o motor V8 do Chrome que permite rodar JavaScript no servidor com um modelo de I/O sem bloqueio, leve e eficiente.'
    }
  },
  front: {
    color:'#f472b6',
    name:{es:'Frontend / React', en:'Frontend / React', pt:'Frontend / React'},
    kw:['react','frontend','interfaz','interface'],
    summary:{
      es:'Comunidad centrada en React, la biblioteca de JavaScript creada por Facebook para construir interfaces de usuario: usa un DOM virtual para optimizar actualizaciones y se organiza en componentes con estado propio.',
      en:'Community centered on React, the JavaScript library created by Facebook for building user interfaces: it uses a virtual DOM to optimize updates and is organized into components with their own state.',
      pt:'Comunidade centrada em React, a biblioteca de JavaScript criada pelo Facebook para construir interfaces de usuário: usa um DOM virtual para otimizar atualizações e se organiza em componentes com estado próprio.'
    }
  },
  py: {
    color:'#34d399',
    name:{es:'Python & IA', en:'Python & AI', pt:'Python & IA'},
    kw:['python','inteligencia artificial','inteligência artificial','artificial intelligence','ciencia de datos','ciência de dados','data science'],
    summary:{
      es:'Python es un lenguaje interpretado de alto nivel, con sintaxis clara y soporte multiparadigma; es la opción dominante en ciencia de datos e inteligencia artificial.',
      en:'Python is a high-level interpreted language with clear syntax and multi-paradigm support; it is the dominant choice in data science and artificial intelligence.',
      pt:'Python é uma linguagem interpretada de alto nível, com sintaxe clara e suporte multiparadigma; é a opção dominante em ciência de dados e inteligência artificial.'
    }
  },
  db: {
    color:'#fbbf24',
    name:{es:'Bases de Datos', en:'Databases', pt:'Bancos de Dados'},
    kw:['bases de datos','base de datos','bancos de dados','banco de dados','database','databases','sql'],
    summary:{
      es:'Existen dos familias de bases de datos: las relacionales (PostgreSQL, MySQL), que organizan datos en tablas y se consultan con SQL, y las NoSQL (MongoDB), que almacenan documentos JSON flexibles.',
      en:'There are two families of databases: relational ones (PostgreSQL, MySQL), which organize data in tables and are queried with SQL, and NoSQL ones (MongoDB), which store flexible JSON documents.',
      pt:'Existem duas famílias de bancos de dados: os relacionais (PostgreSQL, MySQL), que organizam dados em tabelas e são consultados com SQL, e os NoSQL (MongoDB), que armazenam documentos JSON flexíveis.'
    }
  }
};

// ========== I18N ==========
const GR_I18N = {
  es: {
    subtitle: 'GraphRAG &mdash; RAG con grafos de conocimiento, paso a paso',
    stepLabels: ['Intro','Documentos','Extracción','Grafo','Comunidades','Query','Retrieve','Generate'],
    prev: '← Anterior', next: 'Siguiente →', end: 'Fin',
    search: 'Buscar en el grafo 🕸️', restart: '🔄 Reiniciar simulación',
    counter: (c,n) => `Paso ${c} de ${n}`,
    stepOf: (n) => `Paso ${n} de 7`,
    analogyLabel: '💡 Analogía',
    words: 'palabras',
    // Intro
    introNum: 'Introducción',
    introTitle: '¿Qué es GraphRAG?',
    introDesc: 'GraphRAG es una evolución de RAG que no trata tus documentos como fragmentos sueltos: extrae las <strong>entidades</strong> y <strong>relaciones</strong> que contienen y construye un <strong>grafo de conocimiento</strong> sobre el que buscar.',
    introAnalogy: 'RAG tradicional es buscar en <strong>fichas de estudio sueltas</strong>. GraphRAG es el <strong>tablero de un detective</strong>: fotos (entidades) conectadas con hilos (relaciones). Para responder no lees una sola ficha — <strong>sigues los hilos</strong> de una foto a otra.',
    introCallout: '<strong>El problema que resuelve:</strong> RAG tradicional falla en dos tipos de pregunta: <strong>multi-salto</strong> («¿qué conecta A con B?») cuando la respuesta está repartida entre documentos que nunca se mencionan entre sí, y <strong>globales</strong> («dame un panorama general») cuando ningún chunk contiene la respuesta completa.',
    cmpTitle: 'RAG tradicional vs GraphRAG:',
    cmpHeaders: ['', '🔍 RAG tradicional', '🕸️ GraphRAG'],
    cmpRows: [
      ['Qué indexa', 'Chunks de texto + embeddings', 'Entidades + relaciones (+ comunidades)'],
      ['Cómo busca', 'Similitud coseno entre vectores', 'Entity linking + recorrido del grafo'],
      ['Pregunta puntual', '✅ Excelente', '✅ Bien (búsqueda local)'],
      ['Pregunta multi-salto', '❌ Solo si todo cae en el mismo chunk', '✅ Sigue el camino A → B → C'],
      ['«Resume todo el corpus»', '❌ Ningún chunk tiene la visión global', '✅ Resúmenes de comunidades'],
      ['Explicabilidad', 'Scores de similitud', 'Camino de relaciones visible'],
      ['Costo de indexar', 'Bajo (solo embeddings)', 'Alto (el LLM extrae el grafo)'],
    ],
    introFlowTitle: 'El flujo GraphRAG que vamos a recorrer:',
    flowCards: ['📄 Documentos','🕸️ Extracción','🌐 Grafo','👥 Comunidades','❓ Query','🔍 Retrieve','🤖 Generate'],
    // Docs
    docsTitle: '📄 Los mismos documentos',
    docsDesc: 'Partimos exactamente de los mismos 4 documentos que en la pestaña RAG, para que puedas comparar los dos enfoques con el mismo material.',
    docsAnalogy: 'Los mismos <strong>informes sobre la mesa del detective</strong>. La diferencia no está en los documentos — está en <strong>cómo los organizamos</strong>.',
    docsCallout: '<strong>Observa algo:</strong> el documento de Node.js y el de React <strong>nunca se mencionan entre sí</strong>, pero ambos hablan de JavaScript. RAG tradicional nunca conectará esos dos textos. GraphRAG sí — y esa será la gran diferencia en este ejercicio.',
    // Extraction
    extractTitle: '🕸️ Extracción de entidades y relaciones',
    extractDesc: 'Un LLM lee cada documento y extrae tripletas <strong>(entidad) —relación→ (entidad)</strong>. Esta fase reemplaza (o complementa) al chunking de RAG tradicional.',
    extractAnalogy: 'El detective lee cada informe <strong>subrayando nombres</strong> y anota en su libreta: «Node.js está construido sobre V8», «React fue creado por Facebook»…',
    extractCallout: '<strong>Cómo se hace en producción:</strong> por cada chunk se le pide al LLM algo como <code>Extrae (sujeto, relación, objeto) del texto</code>. Es la fase más cara de GraphRAG: <strong>una llamada al LLM por chunk</strong> durante la indexación. En RAG tradicional, indexar solo cuesta calcular embeddings.',
    extractTriples: 'Tripletas extraídas:',
    extractFound: (e,r) => `Extraídas: <strong style="color:#e2e8f0;">${e} entidades</strong> y <strong style="color:#e2e8f0;">${r} relaciones</strong> de 4 documentos`,
    ontoBtn: '¿Por qué el grafo necesita una ontología?',
    ontology: {
      eyebrow: '📐 Ontología · el contrato de realidad del grafo',
      title: '¿Por qué el grafo necesita una ontología?',
      sub: 'Sin reglas explícitas sobre qué entidades y relaciones existen, el grafo se llena de sinónimos sueltos, duplicados y conexiones sin lógica de negocio.',
      pillars: [
        { color: '#5b9bd5', name: '🏷️ Naturaleza de la relación', q: 'La etiqueta del edge', items: [
          ['Sin ontología', 'El LLM etiqueta lo mismo como «es dueño de», «adquirió», «compró» — tres rutas distintas para el agente.'],
          ['Con ontología', 'El catálogo define UNA relación formal (p. ej. COMPRÓ) y normaliza los sinónimos hacia ella.']
        ]},
        { color: '#f59e0b', name: '🔗 Transitividad', q: 'El amigo de mi amigo', items: [
          ['Sin ontología', 'El agente ve los nodos pero no puede inferir el puente lógico entre ellos.'],
          ['Con ontología', 'Reglas explícitas (si A ES SUBSIDIARIA DE B, y B TIENE CONTRATO CON C → A puede servir a C) permiten el razonamiento multi-salto.']
        ]},
        { color: '#a970d0', name: '🧩 Consolidación global', q: 'Resolver identidades', items: [
          ['Sin ontología', '«Dante Téllez», «D. Téllez» y «User_4102» quedan como 3 nodos-fantasma distintos.'],
          ['Con ontología', 'Define un identificador único de entidad (RFC, email) para fusionar todo en un solo nodo consolidado.']
        ]}
      ],
      tie: '<strong>Taxonomía vs. Ontología:</strong> la taxonomía solo clasifica en árbol (Producto → Electrónicos → Smartphones). La ontología conecta múltiples taxonomías entre sí (Cliente —COMPRÓ→ Producto —FABRICADO POR→ Empresa) y añade reglas lógicas. <strong>El catálogo de datos</strong> (Dataplex, Collibra, Atlas) es donde hoy se documenta y gobierna esa ontología antes de que la ingesta la convierta en nodos y edges.',
      cite: 'Sin gobierno de datos y ontología estricta, GraphRAG sufre "alucinación estructural": conecta nodos con hilos lógicos que no tienen sentido de negocio.',
      close: 'Cerrar'
    },
    // Graph
    graphTitle: '🌐 Grafo de conocimiento',
    graphDesc: 'Las tripletas de todos los documentos se fusionan en un único grafo: los <strong>nodos</strong> son entidades y las <strong>aristas</strong> son relaciones.',
    graphAnalogy: 'Todas las anotaciones de la libreta pasan al <strong>tablero con hilos</strong>. Ahora la información de 4 informes distintos es <strong>una sola red conectada</strong>.',
    graphCallout: '<strong>El momento clave:</strong> fíjate en el nodo <strong>JavaScript</strong>. El documento de Node.js y el de React aportaron aristas que llegan a él. En la vector DB de RAG cada chunk era una isla — aquí los documentos <strong>se conectan a través de las entidades que comparten</strong>.',
    graphStats: (n,e) => `${n} nodos · ${e} aristas · construido desde 4 documentos`,
    // Communities
    comTitle: '👥 Detección de comunidades',
    comDesc: 'Un algoritmo de clustering (Leiden, en el GraphRAG de Microsoft) agrupa los nodos densamente conectados en <strong>comunidades</strong>, y un LLM escribe un <strong>resumen</strong> de cada una.',
    comAnalogy: 'El detective organiza el tablero en <strong>casos</strong>: cada grupo de fotos muy conectadas forma un caso con su propio <strong>expediente-resumen</strong>.',
    comCallout: '<strong>¿Para qué sirven?</strong> Los resúmenes de comunidad responden preguntas <strong>globales</strong> («¿de qué tratan mis documentos?») que RAG tradicional no puede responder, porque ningún chunk individual contiene esa visión de conjunto.',
    comMembers: 'Miembros:',
    // Query
    queryTitle: '❓ Tu pregunta',
    queryDesc: 'Llega la pregunta del usuario. En vez de solo vectorizarla, GraphRAG identifica <strong>qué entidades del grafo menciona</strong> (entity linking) y decide qué tipo de búsqueda usar.',
    queryAnalogy: 'El detective escucha tu pregunta y piensa: «¿de qué fotos del tablero me están hablando?» — y va directo a esos puntos del tablero.',
    queryCallout: '<strong>Prueba la primera pregunta sugerida:</strong> «¿Qué relación hay entre React y Node.js?». La respuesta <strong>no está escrita en ningún documento</strong> — React y Node.js nunca aparecen juntos. Es el caso donde RAG tradicional falla y GraphRAG brilla.',
    queryWrite: 'Escribe tu pregunta:',
    queryPlaceholder: '¿Qué quieres saber?',
    defaultQuery: '¿Qué relación hay entre React y Node.js?',
    presets: [
      { label: 'React ↔ Node.js (multi-salto)', q: '¿Qué relación hay entre React y Node.js?' },
      { label: 'Vecinos de JavaScript', q: '¿Qué tecnologías están conectadas con JavaScript?' },
      { label: 'Global: bases de datos', q: 'Dame un resumen del tema bases de datos' },
      { label: 'Python', q: '¿Para qué se usa Python?' }
    ],
    // Retrieve
    retTitle: '🔍 Graph Retrieval (búsqueda en el grafo)',
    retDesc: 'En vez de comparar vectores, GraphRAG <strong>ancla la pregunta a nodos del grafo</strong> y recorre sus relaciones para armar el contexto.',
    retAnalogy: 'El detective pone el dedo en las fotos que mencionaste y <strong>sigue los hilos</strong>: recoge todas las notas por las que pasa. Si mencionaste dos fotos, busca <strong>el camino que las une</strong>.',
    retCalloutLocal: '<strong>Búsqueda LOCAL:</strong> tu pregunta menciona entidades concretas → anclamos esos nodos, recorremos sus vecinos y (si hay dos) buscamos el camino que los conecta. El contexto son las <strong>tripletas recorridas</strong>, no chunks.',
    retCalloutGlobal: '<strong>Búsqueda GLOBAL:</strong> tu pregunta pide una visión de conjunto → no anclamos nodos individuales; usamos los <strong>resúmenes de comunidad</strong> como contexto. RAG tradicional no tiene un equivalente a esto.',
    retModeLocal: '🔎 Modo: búsqueda LOCAL (por entidades)',
    retModeGlobal: '🌍 Modo: búsqueda GLOBAL (por comunidades)',
    retLinked: 'Entidades detectadas en tu pregunta:',
    retNoLinked: 'No se detectaron entidades concretas — se usan los resúmenes de comunidad.',
    retPathTitle: '🧵 Camino encontrado entre tus entidades:',
    retTriplesTitle: 'Contexto recuperado (tripletas del grafo):',
    retComTitle: 'Resúmenes de comunidad incluidos:',
    retVsTitle: '⚔️ ¿Qué habría recuperado RAG tradicional con esta misma pregunta?',
    retVsNoteMultiHop: 'Recupera los chunks de React y de Node.js <strong>por separado</strong> — ninguno menciona al otro, así que el LLM tendría que adivinar la conexión. El grafo, en cambio, la entrega <strong>explícita</strong>: ambos se conectan a través de JavaScript.',
    retVsNoteDefault: 'Estos chunks se recuperan por similitud de palabras. Compara: el grafo entrega <strong>relaciones explícitas y resúmenes</strong>; los chunks entregan texto crudo que puede o no contener la conexión que buscas.',
    similarity: 'similitud',
    // Generate
    genTitle: '🤖 Generation (respuesta con contexto de grafo)',
    genDesc: 'El LLM recibe tu pregunta junto con las <strong>tripletas</strong> y <strong>resúmenes de comunidad</strong> recuperados — no chunks sueltos — y genera la respuesta.',
    genAnalogy: 'El detective ya no te pasa un montón de informes: te entrega <strong>el hilo exacto</strong> que conecta las fotos y el expediente del caso. La respuesta casi se escribe sola.',
    genCallout: (q) => `<strong>El prompt al LLM se ve así:</strong><br><br><code>System: Responde usando SOLO el conocimiento del grafo proporcionado.</code><br><code>Grafo: (React) —[biblioteca de]→ (JavaScript) …</code><br><code>Comunidades: [resumen 1] [resumen 2]</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Contexto de grafo enviado al LLM:',
    genFlow1: 'Pregunta + Grafo',
    genFlow2: 'Respuesta',
    genThinking: '🤖 LLM generando respuesta con contexto GraphRAG...',
    genSources: '📎 Documentos que aportaron las relaciones usadas:',
    genAdvantages: '<strong style="color:#34d399;">✅ Cuándo usar GraphRAG:</strong><br>• Preguntas multi-salto que cruzan varios documentos<br>• Preguntas globales tipo «resume el corpus»<br>• Cuando necesitas explicar el porqué (el camino de relaciones es visible)<br><br><strong style="color:#fbbf24;">⚠️ Cuándo basta RAG tradicional:</strong><br>• Preguntas puntuales sobre un solo tema<br>• Corpus pequeños o presupuesto limitado (indexar GraphRAG requiere muchas llamadas al LLM)<br>• Cuando la velocidad y el costo de indexación importan'
  },
  en: {
    subtitle: 'GraphRAG &mdash; knowledge-graph RAG, step by step',
    stepLabels: ['Intro','Documents','Extraction','Graph','Communities','Query','Retrieve','Generate'],
    prev: '← Previous', next: 'Next →', end: 'End',
    search: 'Search the graph 🕸️', restart: '🔄 Restart simulation',
    counter: (c,n) => `Step ${c} of ${n}`,
    stepOf: (n) => `Step ${n} of 7`,
    analogyLabel: '💡 Analogy',
    words: 'words',
    // Intro
    introNum: 'Introduction',
    introTitle: 'What is GraphRAG?',
    introDesc: "GraphRAG is an evolution of RAG that doesn't treat your documents as loose fragments: it extracts the <strong>entities</strong> and <strong>relationships</strong> they contain and builds a <strong>knowledge graph</strong> to search over.",
    introAnalogy: "Traditional RAG is searching through <strong>loose study cards</strong>. GraphRAG is a <strong>detective's evidence board</strong>: photos (entities) connected with strings (relationships). To answer, you don't read a single card — you <strong>follow the strings</strong> from one photo to another.",
    introCallout: '<strong>The problem it solves:</strong> traditional RAG fails on two kinds of question: <strong>multi-hop</strong> ("what connects A and B?") when the answer is spread across documents that never mention each other, and <strong>global</strong> ("give me the big picture") when no single chunk contains the full answer.',
    cmpTitle: 'Traditional RAG vs GraphRAG:',
    cmpHeaders: ['', '🔍 Traditional RAG', '🕸️ GraphRAG'],
    cmpRows: [
      ['What it indexes', 'Text chunks + embeddings', 'Entities + relationships (+ communities)'],
      ['How it searches', 'Cosine similarity between vectors', 'Entity linking + graph traversal'],
      ['Specific question', '✅ Excellent', '✅ Good (local search)'],
      ['Multi-hop question', '❌ Only if everything falls in one chunk', '✅ Follows the path A → B → C'],
      ['"Summarize the whole corpus"', '❌ No chunk holds the global view', '✅ Community summaries'],
      ['Explainability', 'Similarity scores', 'Visible relationship path'],
      ['Indexing cost', 'Low (embeddings only)', 'High (an LLM extracts the graph)'],
    ],
    introFlowTitle: "The GraphRAG flow we'll walk through:",
    flowCards: ['📄 Documents','🕸️ Extraction','🌐 Graph','👥 Communities','❓ Query','🔍 Retrieve','🤖 Generate'],
    // Docs
    docsTitle: '📄 The same documents',
    docsDesc: 'We start from exactly the same 4 documents as the RAG tab, so you can compare both approaches on the same material.',
    docsAnalogy: "The same <strong>reports on the detective's desk</strong>. The difference is not in the documents — it's in <strong>how we organize them</strong>.",
    docsCallout: "<strong>Notice something:</strong> the Node.js document and the React document <strong>never mention each other</strong>, but both talk about JavaScript. Traditional RAG will never connect those two texts. GraphRAG will — and that will be the big difference in this exercise.",
    // Extraction
    extractTitle: '🕸️ Entity & relationship extraction',
    extractDesc: 'An LLM reads each document and extracts <strong>(entity) —relation→ (entity)</strong> triples. This phase replaces (or complements) the chunking of traditional RAG.',
    extractAnalogy: 'The detective reads each report <strong>underlining names</strong> and writes in a notebook: "Node.js is built on V8", "React was created by Facebook"…',
    extractCallout: '<strong>How it works in production:</strong> for each chunk, the LLM is asked something like <code>Extract (subject, relation, object) from the text</code>. This is the most expensive phase of GraphRAG: <strong>one LLM call per chunk</strong> at indexing time. In traditional RAG, indexing only costs computing embeddings.',
    extractTriples: 'Extracted triples:',
    extractFound: (e,r) => `Extracted: <strong style="color:#e2e8f0;">${e} entities</strong> and <strong style="color:#e2e8f0;">${r} relationships</strong> from 4 documents`,
    ontoBtn: 'Why does the graph need an ontology?',
    ontology: {
      eyebrow: '📐 Ontology · the graph\'s reality contract',
      title: 'Why does the graph need an ontology?',
      sub: 'Without explicit rules about which entities and relationships exist, the graph fills up with loose synonyms, duplicates, and connections with no business logic.',
      pillars: [
        { color: '#5b9bd5', name: '🏷️ Nature of the relation', q: 'The edge label', items: [
          ['Without ontology', 'The LLM labels the same fact as "owns", "acquired", "bought" — three different routes for the agent.'],
          ['With ontology', 'The catalog defines ONE formal relation (e.g. BOUGHT) and normalizes synonyms into it.']
        ]},
        { color: '#f59e0b', name: '🔗 Transitivity', q: 'The friend of my friend', items: [
          ['Without ontology', 'The agent sees the nodes but cannot infer the logical bridge between them.'],
          ['With ontology', 'Explicit rules (if A IS SUBSIDIARY OF B, and B HAS CONTRACT WITH C → A can serve C) enable multi-hop reasoning.']
        ]},
        { color: '#a970d0', name: '🧩 Global consolidation', q: 'Resolving identities', items: [
          ['Without ontology', '"Dante Téllez", "D. Téllez" and "User_4102" stay as 3 distinct ghost nodes.'],
          ['With ontology', 'It defines a unique entity identifier (tax ID, email) to merge everything into one consolidated node.']
        ]}
      ],
      tie: '<strong>Taxonomy vs. Ontology:</strong> a taxonomy only classifies in a tree (Product → Electronics → Smartphones). An ontology connects multiple taxonomies together (Customer —BOUGHT→ Product —MANUFACTURED BY→ Company) and adds logical rules. <strong>The data catalog</strong> (Dataplex, Collibra, Atlas) is where that ontology is documented and governed today, before ingestion turns it into nodes and edges.',
      cite: 'Without data governance and a strict ontology, GraphRAG suffers "structural hallucination": it connects nodes with logical threads that make no business sense.',
      close: 'Close'
    },
    // Graph
    graphTitle: '🌐 Knowledge graph',
    graphDesc: 'The triples from all documents are merged into a single graph: <strong>nodes</strong> are entities and <strong>edges</strong> are relationships.',
    graphAnalogy: "All the notebook entries go onto the <strong>board with strings</strong>. Information from 4 separate reports is now <strong>one connected network</strong>.",
    graphCallout: '<strong>The key moment:</strong> look at the <strong>JavaScript</strong> node. The Node.js document and the React document both contributed edges pointing to it. In the RAG vector DB every chunk was an island — here, documents <strong>connect through the entities they share</strong>.',
    graphStats: (n,e) => `${n} nodes · ${e} edges · built from 4 documents`,
    // Communities
    comTitle: '👥 Community detection',
    comDesc: "A clustering algorithm (Leiden, in Microsoft's GraphRAG) groups densely connected nodes into <strong>communities</strong>, and an LLM writes a <strong>summary</strong> of each one.",
    comAnalogy: 'The detective organizes the board into <strong>cases</strong>: each tightly connected group of photos becomes a case with its own <strong>summary file</strong>.',
    comCallout: '<strong>What are they for?</strong> Community summaries answer <strong>global</strong> questions ("what are my documents about?") that traditional RAG cannot answer, because no individual chunk contains that bird\'s-eye view.',
    comMembers: 'Members:',
    // Query
    queryTitle: '❓ Your question',
    queryDesc: 'A user question arrives. Instead of only vectorizing it, GraphRAG identifies <strong>which graph entities it mentions</strong> (entity linking) and decides which kind of search to use.',
    queryAnalogy: 'The detective hears your question and thinks: "which photos on the board are they talking about?" — and goes straight to those spots on the board.',
    queryCallout: '<strong>Try the first suggested question:</strong> "What is the relationship between React and Node.js?". The answer <strong>is not written in any document</strong> — React and Node.js never appear together. This is where traditional RAG fails and GraphRAG shines.',
    queryWrite: 'Type your question:',
    queryPlaceholder: 'What do you want to know?',
    defaultQuery: 'What is the relationship between React and Node.js?',
    presets: [
      { label: 'React ↔ Node.js (multi-hop)', q: 'What is the relationship between React and Node.js?' },
      { label: 'JavaScript neighbors', q: 'Which technologies are connected to JavaScript?' },
      { label: 'Global: databases', q: 'Give me a summary of the databases topic' },
      { label: 'Python', q: 'What is Python used for?' }
    ],
    // Retrieve
    retTitle: '🔍 Graph Retrieval',
    retDesc: 'Instead of comparing vectors, GraphRAG <strong>anchors the question to graph nodes</strong> and traverses their relationships to build the context.',
    retAnalogy: 'The detective puts a finger on the photos you mentioned and <strong>follows the strings</strong>, collecting every note along the way. If you mentioned two photos, they look for <strong>the path that links them</strong>.',
    retCalloutLocal: '<strong>LOCAL search:</strong> your question mentions specific entities → we anchor those nodes, traverse their neighbors and (if there are two) find the path that connects them. The context is the <strong>traversed triples</strong>, not chunks.',
    retCalloutGlobal: '<strong>GLOBAL search:</strong> your question asks for the big picture → we don\'t anchor individual nodes; we use the <strong>community summaries</strong> as context. Traditional RAG has no equivalent of this.',
    retModeLocal: '🔎 Mode: LOCAL search (by entities)',
    retModeGlobal: '🌍 Mode: GLOBAL search (by communities)',
    retLinked: 'Entities detected in your question:',
    retNoLinked: 'No specific entities detected — community summaries are used instead.',
    retPathTitle: '🧵 Path found between your entities:',
    retTriplesTitle: 'Retrieved context (graph triples):',
    retComTitle: 'Community summaries included:',
    retVsTitle: '⚔️ What would traditional RAG have retrieved for this same question?',
    retVsNoteMultiHop: 'It retrieves the React chunk and the Node.js chunk <strong>separately</strong> — neither mentions the other, so the LLM would have to guess the connection. The graph hands it over <strong>explicitly</strong>: both connect through JavaScript.',
    retVsNoteDefault: 'These chunks are retrieved by word similarity. Compare: the graph delivers <strong>explicit relationships and summaries</strong>; the chunks deliver raw text that may or may not contain the connection you need.',
    similarity: 'similarity',
    // Generate
    genTitle: '🤖 Generation (answer with graph context)',
    genDesc: 'The LLM receives your question along with the retrieved <strong>triples</strong> and <strong>community summaries</strong> — not loose chunks — and generates the answer.',
    genAnalogy: "The detective no longer hands you a pile of reports: they hand you <strong>the exact string</strong> connecting the photos, plus the case file. The answer almost writes itself.",
    genCallout: (q) => `<strong>The prompt to the LLM looks like this:</strong><br><br><code>System: Answer using ONLY the provided graph knowledge.</code><br><code>Graph: (React) —[library of]→ (JavaScript) …</code><br><code>Communities: [summary 1] [summary 2]</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Graph context sent to the LLM:',
    genFlow1: 'Question + Graph',
    genFlow2: 'Answer',
    genThinking: '🤖 LLM generating an answer with GraphRAG context...',
    genSources: '📎 Documents that contributed the relationships used:',
    genAdvantages: '<strong style="color:#34d399;">✅ When to use GraphRAG:</strong><br>• Multi-hop questions that span several documents<br>• Global questions like "summarize the corpus"<br>• When you need to explain the why (the relationship path is visible)<br><br><strong style="color:#fbbf24;">⚠️ When traditional RAG is enough:</strong><br>• Specific questions about a single topic<br>• Small corpora or tight budgets (indexing GraphRAG requires many LLM calls)<br>• When indexing speed and cost matter'
  },
  pt: {
    subtitle: 'GraphRAG &mdash; RAG com grafos de conhecimento, passo a passo',
    stepLabels: ['Intro','Documentos','Extração','Grafo','Comunidades','Query','Retrieve','Generate'],
    prev: '← Anterior', next: 'Próximo →', end: 'Fim',
    search: 'Buscar no grafo 🕸️', restart: '🔄 Reiniciar simulação',
    counter: (c,n) => `Passo ${c} de ${n}`,
    stepOf: (n) => `Passo ${n} de 7`,
    analogyLabel: '💡 Analogia',
    words: 'palavras',
    introNum: 'Introdução',
    introTitle: 'O que é GraphRAG?',
    introDesc: 'GraphRAG é uma evolução do RAG que não trata seus documentos como fragmentos soltos: extrai as <strong>entidades</strong> e <strong>relações</strong> que eles contêm e constrói um <strong>grafo de conhecimento</strong> para buscar.',
    introAnalogy: 'RAG tradicional é buscar em <strong>fichas de estudo soltas</strong>. GraphRAG é o <strong>quadro de um detetive</strong>: fotos (entidades) conectadas com barbantes (relações). Para responder você não lê uma única ficha — você <strong>segue os barbantes</strong> de uma foto a outra.',
    introCallout: '<strong>O problema que resolve:</strong> o RAG tradicional falha em dois tipos de pergunta: <strong>multi-hop</strong> («o que conecta A e B?») quando a resposta está espalhada por documentos que nunca se mencionam, e <strong>globais</strong> («me dê um panorama geral») quando nenhum chunk contém a resposta completa.',
    cmpTitle: 'RAG tradicional vs GraphRAG:',
    cmpHeaders: ['', '🔍 RAG tradicional', '🕸️ GraphRAG'],
    cmpRows: [
      ['O que indexa', 'Chunks de texto + embeddings', 'Entidades + relações (+ comunidades)'],
      ['Como busca', 'Similaridade de cosseno entre vetores', 'Entity linking + percurso do grafo'],
      ['Pergunta pontual', '✅ Excelente', '✅ Bem (busca local)'],
      ['Pergunta multi-hop', '❌ Só se tudo cair no mesmo chunk', '✅ Segue o caminho A → B → C'],
      ['«Resuma todo o corpus»', '❌ Nenhum chunk tem a visão global', '✅ Resumos de comunidades'],
      ['Explicabilidade', 'Scores de similaridade', 'Caminho de relações visível'],
      ['Custo de indexar', 'Baixo (só embeddings)', 'Alto (o LLM extrai o grafo)'],
    ],
    introFlowTitle: 'O fluxo GraphRAG que vamos percorrer:',
    flowCards: ['📄 Documentos','🕸️ Extração','🌐 Grafo','👥 Comunidades','❓ Query','🔍 Retrieve','🤖 Generate'],
    docsTitle: '📄 Os mesmos documentos',
    docsDesc: 'Partimos exatamente dos mesmos 4 documentos da aba RAG, para você comparar as duas abordagens com o mesmo material.',
    docsAnalogy: 'Os mesmos <strong>relatórios na mesa do detetive</strong>. A diferença não está nos documentos — está em <strong>como os organizamos</strong>.',
    docsCallout: '<strong>Repare:</strong> o documento do Node.js e o do React <strong>nunca se mencionam</strong>, mas ambos falam de JavaScript. O RAG tradicional nunca conectará esses dois textos. O GraphRAG conectará — e essa será a grande diferença neste exercício.',
    extractTitle: '🕸️ Extração de entidades e relações',
    extractDesc: 'Um LLM lê cada documento e extrai triplas <strong>(entidade) —relação→ (entidade)</strong>. Esta fase substitui (ou complementa) o chunking do RAG tradicional.',
    extractAnalogy: 'O detetive lê cada relatório <strong>sublinhando nomes</strong> e anota no caderno: «Node.js é construído sobre o V8», «React foi criado pelo Facebook»…',
    extractCallout: '<strong>Como se faz em produção:</strong> para cada chunk pede-se ao LLM algo como <code>Extraia (sujeito, relação, objeto) do texto</code>. É a fase mais cara do GraphRAG: <strong>uma chamada ao LLM por chunk</strong> na indexação. No RAG tradicional, indexar só custa calcular embeddings.',
    extractTriples: 'Triplas extraídas:',
    extractFound: (e,r) => `Extraídas: <strong style="color:#e2e8f0;">${e} entidades</strong> e <strong style="color:#e2e8f0;">${r} relações</strong> de 4 documentos`,
    ontoBtn: 'Por que o grafo precisa de uma ontologia?',
    ontology: {
      eyebrow: '📐 Ontologia · o contrato de realidade do grafo',
      title: 'Por que o grafo precisa de uma ontologia?',
      sub: 'Sem regras explícitas sobre quais entidades e relações existem, o grafo se enche de sinônimos soltos, duplicados e conexões sem lógica de negócio.',
      pillars: [
        { color: '#5b9bd5', name: '🏷️ Natureza da relação', q: 'A etiqueta do edge', items: [
          ['Sem ontologia', 'O LLM rotula a mesma coisa como «é dono de», «adquiriu», «comprou» — três rotas distintas para o agente.'],
          ['Com ontologia', 'O catálogo define UMA relação formal (ex. COMPROU) e normaliza os sinônimos para ela.']
        ]},
        { color: '#f59e0b', name: '🔗 Transitividade', q: 'O amigo do meu amigo', items: [
          ['Sem ontologia', 'O agente vê os nós mas não consegue inferir a ponte lógica entre eles.'],
          ['Com ontologia', 'Regras explícitas (se A É SUBSIDIÁRIA DE B, e B TEM CONTRATO COM C → A pode atender C) permitem o raciocínio multi-hop.']
        ]},
        { color: '#a970d0', name: '🧩 Consolidação global', q: 'Resolver identidades', items: [
          ['Sem ontologia', '«Dante Téllez», «D. Téllez» e «User_4102» ficam como 3 nós-fantasma distintos.'],
          ['Com ontologia', 'Define um identificador único de entidade (CPF, email) para fundir tudo em um só nó consolidado.']
        ]}
      ],
      tie: '<strong>Taxonomia vs. Ontologia:</strong> a taxonomia só classifica em árvore (Produto → Eletrônicos → Smartphones). A ontologia conecta várias taxonomias entre si (Cliente —COMPROU→ Produto —FABRICADO POR→ Empresa) e adiciona regras lógicas. <strong>O catálogo de dados</strong> (Dataplex, Collibra, Atlas) é onde hoje se documenta e governa essa ontologia antes que a ingestão a transforme em nós e edges.',
      cite: 'Sem governança de dados e ontologia estrita, o GraphRAG sofre de "alucinação estrutural": conecta nós com fios lógicos que não fazem sentido de negócio.',
      close: 'Fechar'
    },
    graphTitle: '🌐 Grafo de conhecimento',
    graphDesc: 'As triplas de todos os documentos são fundidas em um único grafo: os <strong>nós</strong> são entidades e as <strong>arestas</strong> são relações.',
    graphAnalogy: 'Todas as anotações do caderno vão para o <strong>quadro com barbantes</strong>. A informação de 4 relatórios distintos agora é <strong>uma só rede conectada</strong>.',
    graphCallout: '<strong>O momento-chave:</strong> observe o nó <strong>JavaScript</strong>. O documento do Node.js e o do React aportaram arestas que chegam a ele. No vector DB do RAG cada chunk era uma ilha — aqui os documentos <strong>se conectam através das entidades que compartilham</strong>.',
    graphStats: (n,e) => `${n} nós · ${e} arestas · construído a partir de 4 documentos`,
    comTitle: '👥 Detecção de comunidades',
    comDesc: 'Um algoritmo de clustering (Leiden, no GraphRAG da Microsoft) agrupa os nós densamente conectados em <strong>comunidades</strong>, e um LLM escreve um <strong>resumo</strong> de cada uma.',
    comAnalogy: 'O detetive organiza o quadro em <strong>casos</strong>: cada grupo de fotos muito conectadas forma um caso com seu próprio <strong>dossiê-resumo</strong>.',
    comCallout: '<strong>Para que servem?</strong> Os resumos de comunidade respondem perguntas <strong>globais</strong> («do que tratam meus documentos?») que o RAG tradicional não consegue responder, porque nenhum chunk individual contém essa visão de conjunto.',
    comMembers: 'Membros:',
    queryTitle: '❓ Sua pergunta',
    queryDesc: 'Chega a pergunta do usuário. Em vez de só vetorizá-la, o GraphRAG identifica <strong>quais entidades do grafo ela menciona</strong> (entity linking) e decide que tipo de busca usar.',
    queryAnalogy: 'O detetive ouve sua pergunta e pensa: «de quais fotos do quadro estão falando?» — e vai direto a esses pontos do quadro.',
    queryCallout: '<strong>Teste a primeira pergunta sugerida:</strong> «Qual é a relação entre React e Node.js?». A resposta <strong>não está escrita em nenhum documento</strong> — React e Node.js nunca aparecem juntos. É o caso onde o RAG tradicional falha e o GraphRAG brilha.',
    queryWrite: 'Escreva sua pergunta:',
    queryPlaceholder: 'O que você quer saber?',
    defaultQuery: 'Qual é a relação entre React e Node.js?',
    presets: [
      { label: 'React ↔ Node.js (multi-hop)', q: 'Qual é a relação entre React e Node.js?' },
      { label: 'Vizinhos do JavaScript', q: 'Quais tecnologias estão conectadas ao JavaScript?' },
      { label: 'Global: bancos de dados', q: 'Me dê um resumo do tema bancos de dados' },
      { label: 'Python', q: 'Para que o Python é usado?' }
    ],
    retTitle: '🔍 Graph Retrieval (busca no grafo)',
    retDesc: 'Em vez de comparar vetores, o GraphRAG <strong>ancora a pergunta em nós do grafo</strong> e percorre suas relações para montar o contexto.',
    retAnalogy: 'O detetive põe o dedo nas fotos que você mencionou e <strong>segue os barbantes</strong>, recolhendo todas as notas pelo caminho. Se você mencionou duas fotos, ele busca <strong>o caminho que as une</strong>.',
    retCalloutLocal: '<strong>Busca LOCAL:</strong> sua pergunta menciona entidades concretas → ancoramos esses nós, percorremos seus vizinhos e (se houver dois) buscamos o caminho que os conecta. O contexto são as <strong>triplas percorridas</strong>, não chunks.',
    retCalloutGlobal: '<strong>Busca GLOBAL:</strong> sua pergunta pede uma visão de conjunto → não ancoramos nós individuais; usamos os <strong>resumos de comunidade</strong> como contexto. O RAG tradicional não tem equivalente a isto.',
    retModeLocal: '🔎 Modo: busca LOCAL (por entidades)',
    retModeGlobal: '🌍 Modo: busca GLOBAL (por comunidades)',
    retLinked: 'Entidades detectadas na sua pergunta:',
    retNoLinked: 'Nenhuma entidade concreta detectada — usam-se os resumos de comunidade.',
    retPathTitle: '🧵 Caminho encontrado entre suas entidades:',
    retTriplesTitle: 'Contexto recuperado (triplas do grafo):',
    retComTitle: 'Resumos de comunidade incluídos:',
    retVsTitle: '⚔️ O que o RAG tradicional teria recuperado para esta mesma pergunta?',
    retVsNoteMultiHop: 'Ele recupera o chunk do React e o do Node.js <strong>separadamente</strong> — nenhum menciona o outro, então o LLM teria que adivinhar a conexão. O grafo, ao contrário, a entrega <strong>explícita</strong>: ambos se conectam através do JavaScript.',
    retVsNoteDefault: 'Esses chunks são recuperados por similaridade de palavras. Compare: o grafo entrega <strong>relações explícitas e resumos</strong>; os chunks entregam texto cru que pode ou não conter a conexão que você busca.',
    similarity: 'similaridade',
    genTitle: '🤖 Generation (resposta com contexto de grafo)',
    genDesc: 'O LLM recebe sua pergunta junto com as <strong>triplas</strong> e os <strong>resumos de comunidade</strong> recuperados — não chunks soltos — e gera a resposta.',
    genAnalogy: 'O detetive já não te entrega uma pilha de relatórios: te entrega <strong>o barbante exato</strong> que conecta as fotos e o dossiê do caso. A resposta quase se escreve sozinha.',
    genCallout: (q) => `<strong>O prompt ao LLM fica assim:</strong><br><br><code>System: Responda usando SOMENTE o conhecimento do grafo fornecido.</code><br><code>Grafo: (React) —[biblioteca de]→ (JavaScript) …</code><br><code>Comunidades: [resumo 1] [resumo 2]</code><br><code>User: ${q}</code>`,
    genContextLabel: 'Contexto de grafo enviado ao LLM:',
    genFlow1: 'Pergunta + Grafo',
    genFlow2: 'Resposta',
    genThinking: '🤖 LLM gerando resposta com contexto GraphRAG...',
    genSources: '📎 Documentos que aportaram as relações usadas:',
    genAdvantages: '<strong style="color:#34d399;">✅ Quando usar GraphRAG:</strong><br>• Perguntas multi-hop que cruzam vários documentos<br>• Perguntas globais tipo «resuma o corpus»<br>• Quando você precisa explicar o porquê (o caminho de relações é visível)<br><br><strong style="color:#fbbf24;">⚠️ Quando o RAG tradicional basta:</strong><br>• Perguntas pontuais sobre um só tema<br>• Corpora pequenos ou orçamento limitado (indexar GraphRAG exige muitas chamadas ao LLM)<br>• Quando a velocidade e o custo de indexação importam'
  }
};

function GT() { return GR_I18N[lang]; }
function grLabel(id) { return GR_NODE_MAP[id].label[lang]; }

// ========== GRAPH ENGINE ==========
function grEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function grLinkEntities(q) {
  return GR_NODES
    .filter(n => n.alias.some(a => new RegExp('\\b' + a + '\\b', 'i').test(q)))
    .map(n => n.id);
}

function grShortestPath(a, b) {
  const adj = {};
  GR_NODES.forEach(n => adj[n.id] = []);
  GR_EDGES.forEach(e => { adj[e.s].push(e.t); adj[e.t].push(e.s); });
  const prev = { [a]: null };
  const queue = [a];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === b) {
      const path = []; let c = b;
      while (c !== null) { path.unshift(c); c = prev[c]; }
      return path;
    }
    for (const nb of adj[cur]) if (!(nb in prev)) { prev[nb] = cur; queue.push(nb); }
  }
  return [];
}

function grRetrieve(q) {
  const ql = q.toLowerCase();
  const seeds = grLinkEntities(q);
  const globalQ = /\b(resumen|resume|resumo|summary|summarize|overview|panorama|global|general)\b/i.test(ql);

  if (globalQ || seeds.length === 0) {
    const coms = new Set();
    Object.entries(GR_COMMUNITIES).forEach(([id, c]) => { if (c.kw.some(k => ql.includes(k))) coms.add(id); });
    seeds.forEach(s => coms.add(GR_NODE_MAP[s].com));
    if (!coms.size) Object.keys(GR_COMMUNITIES).forEach(k => coms.add(k));
    const nodes = new Set(GR_NODES.filter(n => coms.has(n.com)).map(n => n.id));
    const edges = new Set();
    GR_EDGES.forEach((e, i) => { if (nodes.has(e.s) && nodes.has(e.t)) edges.add(i); });
    return { mode: 'global', seeds, coms: [...coms], nodes, edges, path: [] };
  }

  const nodes = new Set(seeds);
  const edges = new Set();
  let path = [];
  if (seeds.length >= 2) {
    path = grShortestPath(seeds[0], seeds[1]);
    path.forEach(p => nodes.add(p));
  }
  GR_EDGES.forEach((e, i) => {
    if (seeds.includes(e.s) || seeds.includes(e.t)) { edges.add(i); nodes.add(e.s); nodes.add(e.t); }
  });
  GR_EDGES.forEach((e, i) => {
    for (let j = 0; j < path.length - 1; j++) {
      if ((e.s === path[j] && e.t === path[j+1]) || (e.t === path[j] && e.s === path[j+1])) edges.add(i);
    }
  });
  const coms = new Set();
  nodes.forEach(id => coms.add(GR_NODE_MAP[id].com));
  return { mode: 'local', seeds, coms: [...coms], nodes, edges, path };
}

// Highlight entity mentions inside document text, colored by community.
function grMarkEntities(text) {
  const sorted = [...GR_NODES].sort((a, b) => b.label[lang].length - a.label[lang].length);
  const stash = [];
  let out = text;
  for (const n of sorted) {
    const re = new RegExp(grEsc(n.label[lang]), 'gi');
    out = out.replace(re, m => {
      stash.push(`<span class="gr-ent" style="color:${GR_COMMUNITIES[n.com].color};">${m}</span>`);
      return '\u0001' + (stash.length - 1) + '\u0002';
    });
  }
  return out.replace(/\u0001(\d+)\u0002/g, (_, i) => stash[+i]);
}

// ========== SVG GRAPH ==========
function grRenderGraph(opts = {}) {
  const { byCom = true, hl = null } = opts;
  let svg = `<svg viewBox="0 0 720 490" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">`;
  GR_EDGES.forEach((e, i) => {
    const a = GR_NODE_MAP[e.s], b = GR_NODE_MAP[e.t];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const on = hl && hl.edges.has(i);
    const op = hl && !on ? 0.12 : 1;
    svg += `<g opacity="${op}">
      <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${on ? '#f0a3ad' : '#475569'}" stroke-width="${on ? 2.5 : 1.3}"/>
      <text x="${mx}" y="${my - 5}" text-anchor="middle" font-size="9" fill="${on ? '#f2b0ba' : '#64748b'}" style="paint-order:stroke; stroke:#0f172a; stroke-width:3px;">${e.label[lang]}</text>
    </g>`;
  });
  GR_NODES.forEach(n => {
    const color = byCom ? GR_COMMUNITIES[n.com].color : '#e0506a';
    const seed = hl && hl.seeds.has(n.id);
    const op = hl && !hl.nodes.has(n.id) ? 0.12 : 1;
    svg += `<g opacity="${op}">
      <circle cx="${n.x}" cy="${n.y}" r="${seed ? 16 : 13}" fill="#0f172a" stroke="${seed ? '#fde047' : color}" stroke-width="${seed ? 3 : 2}"/>
      <circle cx="${n.x}" cy="${n.y}" r="4.5" fill="${color}"/>
      <text x="${n.x}" y="${n.y + (seed ? 31 : 28)}" text-anchor="middle" font-size="10" font-weight="${seed ? 700 : 400}" fill="${seed ? '#fde68a' : '#cbd5e1'}" style="paint-order:stroke; stroke:#0f172a; stroke-width:3px;">${n.label[lang]}</text>
    </g>`;
  });
  svg += '</svg>';
  return `<div class="gr-svg-wrap">${svg}</div>`;
}

function grPathHTML(path) {
  let out = `<strong>${grLabel(path[0])}</strong>`;
  for (let i = 0; i < path.length - 1; i++) {
    const e = GR_EDGES.find(e => (e.s === path[i] && e.t === path[i+1]) || (e.t === path[i] && e.s === path[i+1]));
    const fwd = e.s === path[i];
    out += fwd ? ` <span style="color:#f472b6;">—${e.label[lang]}→</span> ` : ` <span style="color:#f472b6;">←${e.label[lang]}—</span> `;
    out += `<strong>${grLabel(path[i+1])}</strong>`;
  }
  return out;
}

// ========== STATE ==========
const GR_STEPS = [
  { icon:'📖' }, { icon:'📄' }, { icon:'🕸️' }, { icon:'🌐' },
  { icon:'👥' }, { icon:'❓' }, { icon:'🔍' }, { icon:'🤖' },
];
let grStep = 0;
let grQuery = '';

function grOnLangChange() {
  grQuery = '';
  if (grStep > 5) grStep = 5; // retrieve/generate depend on a stored query
}

// ========== RENDER SHELL ==========
function grRenderPipeline() {
  const el = document.getElementById('pipeline');
  const labels = GT().stepLabels;
  el.innerHTML = GR_STEPS.map((s, i) => {
    const cls = i < grStep ? 'done' : i === grStep ? 'active' : 'locked';
    return (i > 0 ? '<span class="pip-arrow">→</span>' : '') +
      `<div class="pip ${cls}" onclick="${i <= grStep ? 'grGoStep(' + i + ')' : ''}">${s.icon} ${labels[i]}</div>`;
  }).join('');
}

function grRenderStep() {
  document.getElementById('subtitle').innerHTML = GT().subtitle;
  grRenderPipeline();
  const renderers = [grRenderIntro, grRenderDocs, grRenderExtract, grRenderGraphStep, grRenderCommunities, grRenderQuery, grRenderRetrieve, grRenderGenerate];
  const m = document.getElementById('main');
  m.innerHTML = '';
  renderers[grStep]();
  m.innerHTML += grRenderControls();
  grAttachControlEvents();
}

function grRenderControls() {
  const L = GT();
  const isFirst = grStep === 0;
  const isLast = grStep === GR_STEPS.length - 1;
  const isQuery = grStep === 5;
  return `
    <div class="controls">
      <button class="btn btn-ghost" id="grPrevBtn" ${isFirst ? 'disabled' : ''}>${L.prev}</button>
      <span class="step-counter">${L.counter(grStep + 1, GR_STEPS.length)}</span>
      ${isQuery
        ? `<button class="btn btn-primary" id="grNextBtn" onclick="grSubmitQuery()">${L.search}</button>`
        : `<button class="btn btn-primary" id="grNextBtn" ${isLast ? 'disabled' : ''}>${isLast ? L.end : L.next}</button>`
      }
    </div>
    ${isLast ? `
      <div style="text-align:center; margin-top:16px;">
        <button class="btn btn-reset" onclick="grRestart()">${L.restart}</button>
      </div>
    ` : ''}
  `;
}

function grAttachControlEvents() {
  const prev = document.getElementById('grPrevBtn');
  const next = document.getElementById('grNextBtn');
  if (prev) prev.onclick = () => { if (grStep > 0) { grStep--; grRenderStep(); } };
  if (next && grStep !== 5) next.onclick = () => { if (grStep < GR_STEPS.length - 1) { grStep++; grRenderStep(); } };
}

function grGoStep(i) { grStep = i; grRenderStep(); }
function grRestart() { grStep = 0; grQuery = ''; grRenderStep(); }

// ========== STEP 0: INTRO ==========
function grRenderIntro() {
  const L = GT();
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

        <div style="color:#e0506a; font-weight:600; margin:16px 0 4px;">${L.cmpTitle}</div>
        <div style="overflow-x:auto;">
          <table class="cmp-table">
            <thead><tr>${L.cmpHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${L.cmpRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>

        <div style="margin-top:16px;">
          <div style="color:#e0506a; font-weight:600; margin-bottom:10px;">${L.introFlowTitle}</div>
          <div class="vis-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
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
function grRenderDocs() {
  const L = GT();
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

// ========== STEP 2: EXTRACTION ==========
function grRenderExtract() {
  const L = GT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(2)}</div>
        <div class="step-title">${L.extractTitle}</div>
        <div class="step-desc">${L.extractDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.extractAnalogy}
        </div>

        <div class="callout">${L.extractCallout}</div>

        ${documents.map((d, di) => {
          const docEdges = GR_EDGES.filter(e => e.doc === di);
          return `
            <div class="vis-card" style="margin-bottom:12px;">
              <div class="vis-label">📄 ${d.source}</div>
              <div class="vis-text" style="margin-bottom:10px;">${grMarkEntities(d.text)}</div>
              <div style="font-size:11px; color:#64748b; margin-bottom:4px;">${L.extractTriples}</div>
              ${docEdges.map(e => `<span class="gr-triple">${grLabel(e.s)} <span class="gr-rel">—${e.label[lang]}→</span> ${grLabel(e.t)}</span>`).join('')}
            </div>
          `;
        }).join('')}

        <div style="margin-top:12px; text-align:center; color:#64748b; font-size:13px;">
          ${L.extractFound(GR_NODES.length, GR_EDGES.length)}
        </div>

        <div style="text-align:center; margin-top:16px;">
          <button class="btn btn-ghost" style="font-size:12.5px; padding:8px 16px;" onclick="grOpenOntology()">📐 ${L.ontoBtn}</button>
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 3: KNOWLEDGE GRAPH ==========
function grRenderGraphStep() {
  const L = GT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(3)}</div>
        <div class="step-title">${L.graphTitle}</div>
        <div class="step-desc">${L.graphDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.graphAnalogy}
        </div>

        <div class="callout">${L.graphCallout}</div>

        ${grRenderGraph({ byCom: false })}

        <div style="text-align:center; color:#64748b; font-size:13px;">
          ${L.graphStats(GR_NODES.length, GR_EDGES.length)}
        </div>
      </div>
    </div>
  `;
}

// ========== STEP 4: COMMUNITIES ==========
function grRenderCommunities() {
  const L = GT();
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(4)}</div>
        <div class="step-title">${L.comTitle}</div>
        <div class="step-desc">${L.comDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.comAnalogy}
        </div>

        <div class="callout">${L.comCallout}</div>

        ${grRenderGraph({ byCom: true })}

        ${Object.entries(GR_COMMUNITIES).map(([id, c]) => `
          <div class="gr-com-card" style="border-left-color:${c.color};">
            <div style="font-weight:700; color:${c.color}; font-size:13px;">● ${c.name[lang]}</div>
            <div style="font-size:11px; color:#64748b; margin:4px 0;">${L.comMembers} ${GR_NODES.filter(n => n.com === id).map(n => n.label[lang]).join(', ')}</div>
            <div style="color:#94a3b8; line-height:1.55;">📋 ${c.summary[lang]}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ========== STEP 5: QUERY ==========
function grRenderQuery() {
  const L = GT();
  const val = (grQuery || L.defaultQuery).replace(/"/g, '&quot;');
  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(5)}</div>
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
          <div style="color:#e0506a; font-weight:600; margin-bottom:8px;">${L.queryWrite}</div>
          <div class="query-box">
            <input class="query-input" id="grQueryInput" placeholder="${L.queryPlaceholder}" value="${val}" />
          </div>
          <div class="presets">
            ${L.presets.map(p => `<span class="preset" onclick="document.getElementById('grQueryInput').value=${JSON.stringify(p.q).replace(/"/g, '&quot;')}">${p.label}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function grSubmitQuery() {
  grQuery = document.getElementById('grQueryInput').value.trim();
  if (!grQuery) return;
  grStep = 6;
  grRenderStep();
}

// ========== STEP 6: GRAPH RETRIEVAL ==========
function grRenderRetrieve() {
  const L = GT();
  const q = grQuery || L.defaultQuery;
  const R = grRetrieve(q);
  window._grLast = { q, R };

  // What traditional RAG would retrieve for the same question (reuses the
  // TF-IDF engine + vector DB already built by the RAG tab).
  const trad = vdb.search(emb.embed(q), 3);
  const isMultiHop = R.seeds.includes('react') && R.seeds.includes('nodejs');
  const rankColors = ['#fbbf24', '#94a3b8', '#78716c'];

  document.getElementById('main').innerHTML = `
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">${L.stepOf(6)}</div>
        <div class="step-title">${L.retTitle}</div>
        <div class="step-desc">${L.retDesc}</div>
      </div>
      <div class="step-body">
        <div class="analogy">
          <div class="analogy-label">${L.analogyLabel}</div>
          ${L.retAnalogy}
        </div>

        <div class="callout">${R.mode === 'local' ? L.retCalloutLocal : L.retCalloutGlobal}</div>

        <div class="gr-badge ${R.mode}">${R.mode === 'local' ? L.retModeLocal : L.retModeGlobal}</div>

        <div style="margin-bottom:12px;">
          <div style="color:#e0506a; font-weight:600; margin-bottom:6px;">${L.retLinked}</div>
          ${R.seeds.length
            ? R.seeds.map(id => `<span class="vis-tag active" style="border:1px solid ${GR_COMMUNITIES[GR_NODE_MAP[id].com].color}; background:#0f172a; color:${GR_COMMUNITIES[GR_NODE_MAP[id].com].color};">📌 ${grLabel(id)}</span>`).join(' ')
            : `<span style="font-size:12px; color:#64748b;">${L.retNoLinked}</span>`
          }
        </div>

        ${R.path.length > 1 ? `
          <div style="color:#e0506a; font-weight:600; margin-bottom:4px;">${L.retPathTitle}</div>
          <div class="gr-path">${grPathHTML(R.path)}</div>
        ` : ''}

        ${grRenderGraph({ byCom: true, hl: { nodes: R.nodes, edges: R.edges, seeds: new Set(R.seeds) } })}

        <div style="color:#e0506a; font-weight:600; margin:14px 0 8px;">${L.retTriplesTitle}</div>
        ${[...R.edges].map(i => {
          const e = GR_EDGES[i];
          return `
            <div class="vis-card" style="margin-bottom:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:12.5px; color:#cbd5e1;">${grLabel(e.s)} <span class="gr-rel">—${e.label[lang]}→</span> ${grLabel(e.t)}</span>
              <span style="font-size:10px; color:#e0506a; background:#2a0e13; padding:2px 7px; border-radius:4px; white-space:nowrap;">${documents[e.doc].source}</span>
            </div>
          `;
        }).join('')}

        <div style="color:#e0506a; font-weight:600; margin:14px 0 8px;">${L.retComTitle}</div>
        ${R.coms.map(id => {
          const c = GR_COMMUNITIES[id];
          return `
            <div class="gr-com-card" style="border-left-color:${c.color}; padding:10px 12px;">
              <span style="font-weight:700; color:${c.color}; font-size:12px;">● ${c.name[lang]}</span>
              <div style="color:#94a3b8; font-size:12px; line-height:1.5; margin-top:4px;">📋 ${c.summary[lang]}</div>
            </div>
          `;
        }).join('')}

        <div style="color:#f472b6; font-weight:600; margin:18px 0 8px;">${L.retVsTitle}</div>
        ${trad.map((r, i) => `
          <div class="vis-card" style="margin-bottom:6px; border-left:3px solid ${rankColors[i]};">
            <div style="font-size:11px; color:#64748b;">${(r.score * 100).toFixed(1)}% ${L.similarity} — ${r.metadata.source}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">"${r.metadata.text}"</div>
          </div>
        `).join('')}
        <div class="callout" style="border-left-color:#f472b6;">${isMultiHop ? L.retVsNoteMultiHop : L.retVsNoteDefault}</div>
      </div>
    </div>
  `;
}

// ========== STEP 7: GENERATE ==========
function grRenderGenerate() {
  const L = GT();
  const last = window._grLast || { q: GT().defaultQuery, R: grRetrieve(GT().defaultQuery) };
  const { q, R } = last;
  const usedDocs = [...new Set([...R.edges].map(i => GR_EDGES[i].doc))];

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

        <div style="color:#e0506a; font-weight:600; margin:16px 0 8px;">${L.genContextLabel}</div>
        <div class="vis-card" style="margin-bottom:6px;">
          ${[...R.edges].slice(0, 8).map(i => {
            const e = GR_EDGES[i];
            return `<span class="gr-triple">${grLabel(e.s)} <span class="gr-rel">—${e.label[lang]}→</span> ${grLabel(e.t)}</span>`;
          }).join('')}
          ${R.coms.map(id => `<span class="gr-triple" style="border-color:${GR_COMMUNITIES[id].color}55; color:${GR_COMMUNITIES[id].color};">📋 ${GR_COMMUNITIES[id].name[lang]}</span>`).join('')}
        </div>

        <div class="arrow-flow" style="margin:16px 0;">
          <span>${L.genFlow1}</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span>🤖 LLM</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span class="arrow">→</span>
          <span>${L.genFlow2}</span>
        </div>

        <div class="llm-box">
          <div class="llm-thinking">${L.genThinking}</div>
          <div class="llm-answer">
            ${grGenerateAnswer(q, R)}
          </div>
          <div style="margin-top:14px; padding-top:12px; border-top:1px solid #334155;">
            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${L.genSources}</div>
            ${usedDocs.map(di => `<span class="llm-source">${documents[di].source}</span>`).join('')}
          </div>
        </div>

        <div class="callout" style="margin-top:16px; border-left-color:#34d399;">
          ${L.genAdvantages}
        </div>
      </div>
    </div>
  `;
}

function grGenerateAnswer(q, R) {
  const s = new Set(R.seeds);
  const reactDoc = documents[2].source, nodeDoc = documents[0].source;

  if (lang === 'en') {
    if (s.has('react') && s.has('nodejs')) {
      return `According to the knowledge graph, <strong>React and Node.js are not directly related, but they share one entity: JavaScript</strong>. React is a <em>library of</em> JavaScript (for building browser interfaces), while Node.js is a <em>runtime for</em> JavaScript (for running it on the server). They are two sides of the same language — React uses it on the frontend, Node.js takes it to the backend. This connection comes from two different documents (<strong>${reactDoc}</strong> and <strong>${nodeDoc}</strong>) that never mention each other — traditional RAG could not have stated it explicitly.`;
    }
    if (s.has('js')) {
      return `The <strong>JavaScript</strong> node is the bridge of the graph: <strong>Node.js</strong> is its server-side runtime (built on Chrome's <strong>V8</strong> engine) and <strong>React</strong> is a JavaScript library for building interfaces, created by Facebook. JavaScript connects the backend community and the frontend community — information that comes from two documents that never cite each other.`;
    }
    if (R.mode === 'global' && R.coms.includes('db')) {
      return `According to the <strong>Databases</strong> community summary: there are two families — <strong>relational</strong> databases (PostgreSQL, MySQL), which organize information in tables and are queried with <strong>SQL</strong>, and <strong>NoSQL</strong> databases like <strong>MongoDB</strong>, which store flexible <strong>JSON</strong> documents. Note: this answer comes from a pre-computed community summary, not from an individual chunk.`;
    }
    if (s.has('python')) {
      return `According to the graph, <strong>Python</strong> connects to <strong>Artificial Intelligence</strong> and <strong>Data Science</strong> through the <em>used in</em> relation: it is the dominant language in both fields thanks to its clear syntax and multi-paradigm nature.`;
    }
    if (R.mode === 'local' && R.seeds.length) {
      const first = R.seeds[0];
      const rels = [...R.edges].map(i => GR_EDGES[i]).filter(e => e.s === first || e.t === first);
      return `According to the graph, <strong>${grLabel(first)}</strong> has these relationships: ${rels.map(e => `${grLabel(e.s)} <em>${e.label[lang]}</em> ${grLabel(e.t)}`).join('; ')}.`;
    }
    return `Global view of the corpus, from the community summaries: ${R.coms.map(id => `<strong>${GR_COMMUNITIES[id].name[lang]}</strong>`).join(', ')}. Each summary condenses a group of connected entities — something no individual chunk contains.`;
  }

  if (lang === 'pt') {
    if (s.has('react') && s.has('nodejs')) {
      return `Segundo o grafo de conhecimento, <strong>React e Node.js não se relacionam diretamente, mas compartilham uma entidade: JavaScript</strong>. React é uma <em>biblioteca de</em> JavaScript (para construir interfaces no navegador), enquanto Node.js é um <em>ambiente de execução para</em> JavaScript (para rodá-lo no servidor). Ou seja: são as duas faces da mesma linguagem — React a usa no frontend e Node.js a leva ao backend. Essa conexão vem de dois documentos distintos (<strong>${reactDoc}</strong> e <strong>${nodeDoc}</strong>) que nunca se mencionam — o RAG tradicional não poderia tê-la afirmado explicitamente.`;
    }
    if (s.has('js')) {
      return `O nó <strong>JavaScript</strong> é a ponte do grafo: <strong>Node.js</strong> é seu ambiente de execução no servidor (construído sobre o motor <strong>V8</strong> do Chrome) e <strong>React</strong> é uma biblioteca de JavaScript para interfaces, criada pelo Facebook. O JavaScript conecta a comunidade backend com a comunidade frontend — informação que vem de dois documentos que nunca se citam.`;
    }
    if (R.mode === 'global' && R.coms.includes('db')) {
      return `Segundo o resumo da comunidade <strong>Bancos de Dados</strong>: existem duas famílias — os <strong>relacionais</strong> (PostgreSQL, MySQL), que organizam a informação em tabelas e são consultados com <strong>SQL</strong>, e os <strong>NoSQL</strong> como <strong>MongoDB</strong>, que armazenam documentos <strong>JSON</strong> flexíveis. Nota: esta resposta vem de um resumo de comunidade pré-computado, não de um chunk individual.`;
    }
    if (s.has('python')) {
      return `Segundo o grafo, <strong>Python</strong> se conecta com <strong>Inteligência Artificial</strong> e <strong>Ciência de Dados</strong> pela relação <em>usado em</em>: é a linguagem dominante em ambos os campos graças à sua sintaxe clara e à sua natureza multiparadigma.`;
    }
    if (R.mode === 'local' && R.seeds.length) {
      const first = R.seeds[0];
      const rels = [...R.edges].map(i => GR_EDGES[i]).filter(e => e.s === first || e.t === first);
      return `Segundo o grafo, <strong>${grLabel(first)}</strong> tem estas relações: ${rels.map(e => `${grLabel(e.s)} <em>${e.label[lang]}</em> ${grLabel(e.t)}`).join('; ')}.`;
    }
    return `Visão global do corpus, a partir dos resumos de comunidade: ${R.coms.map(id => `<strong>${GR_COMMUNITIES[id].name[lang]}</strong>`).join(', ')}. Cada resumo condensa um grupo de entidades conectadas — algo que nenhum chunk individual contém.`;
  }

  // Spanish
  if (s.has('react') && s.has('nodejs')) {
    return `Según el grafo de conocimiento, <strong>React y Node.js no se relacionan directamente, pero comparten una entidad: JavaScript</strong>. React es una <em>biblioteca de</em> JavaScript (para construir interfaces en el navegador), mientras que Node.js es un <em>entorno de ejecución para</em> JavaScript (para correrlo en el servidor). Es decir: son las dos caras del mismo lenguaje — React lo usa en el frontend y Node.js lo lleva al backend. Esta conexión proviene de dos documentos distintos (<strong>${reactDoc}</strong> y <strong>${nodeDoc}</strong>) que nunca se mencionan entre sí — RAG tradicional no podría haberla afirmado explícitamente.`;
  }
  if (s.has('js')) {
    return `El nodo <strong>JavaScript</strong> es el puente del grafo: <strong>Node.js</strong> es su entorno de ejecución en el servidor (construido sobre el motor <strong>V8</strong> de Chrome) y <strong>React</strong> es una biblioteca de JavaScript para interfaces, creada por Facebook. JavaScript conecta la comunidad backend con la comunidad frontend — información que viene de dos documentos que nunca se citan entre sí.`;
  }
  if (R.mode === 'global' && R.coms.includes('db')) {
    return `Según el resumen de la comunidad <strong>Bases de Datos</strong>: existen dos familias — las <strong>relacionales</strong> (PostgreSQL, MySQL), que organizan la información en tablas y se consultan con <strong>SQL</strong>, y las <strong>NoSQL</strong> como <strong>MongoDB</strong>, que almacenan documentos <strong>JSON</strong> flexibles. Nota: esta respuesta sale de un resumen de comunidad pre-computado, no de un chunk individual.`;
  }
  if (s.has('python')) {
    return `Según el grafo, <strong>Python</strong> se conecta con <strong>Inteligencia Artificial</strong> y <strong>Ciencia de Datos</strong> mediante la relación <em>usado en</em>: es el lenguaje dominante en ambos campos gracias a su sintaxis clara y su naturaleza multiparadigma.`;
  }
  if (R.mode === 'local' && R.seeds.length) {
    const first = R.seeds[0];
    const rels = [...R.edges].map(i => GR_EDGES[i]).filter(e => e.s === first || e.t === first);
    return `Según el grafo, <strong>${grLabel(first)}</strong> tiene estas relaciones: ${rels.map(e => `${grLabel(e.s)} <em>${e.label[lang]}</em> ${grLabel(e.t)}`).join('; ')}.`;
  }
  return `Visión global del corpus, a partir de los resúmenes de comunidad: ${R.coms.map(id => `<strong>${GR_COMMUNITIES[id].name[lang]}</strong>`).join(', ')}. Cada resumen condensa un grupo de entidades conectadas — algo que ningún chunk individual contiene.`;
}

// Opens the "why does the graph need an ontology" modal (reuses arOpenModal).
function grOpenOntology() {
  if (typeof arOpenModal === 'function') arOpenModal(GT().ontology);
}
