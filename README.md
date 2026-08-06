# DataRev — Diagnóstico de Madurez en Datos e IA

Herramienta de captación de leads para [DataRev](https://datarev.solutions). El
diagnóstico de madurez es el gancho; el producto real son los datos de contacto
y las solicitudes de sesión con consultor que quedan en Supabase.

No sustituye al diagnóstico express de 7 preguntas que ya vive en
`datarev.solutions` — lo complementa con la versión larga y con la captura.

**Stack**: Next.js 16.2 (App Router, Turbopack) · React 19.2 · Tailwind v4 ·
TypeScript · Supabase (Postgres + Auth) · Vitest

---

## Cómo funciona el embudo

```
Landing  →  Diagnóstico (Express 16p / Completo 40p)  →  GATE  →  Reporte  →  CTA sesión
                        │                                 │                      │
                        └─ CTA "hazlo con un consultor"    │                      │
                           (1 h sin costo) ────────────────┴──────────────────────┘
                                                     consultation_requests
```

1. **El diagnóstico es gratis y sin registro.** Se guarda en `localStorage`.
2. **El reporte completo exige identificarse**: login con Google o formulario de
   correo. Ahí se escribe el lead. Es el punto de conversión.
3. **La sesión guiada de 1 hora** se ofrece dos veces: en la landing y al inicio
   del diagnóstico Completo, que es donde más pesa tener 40 preguntas por
   delante. Se registra la solicitud *antes* de abrir Calendly, así que también
   quedan los que abren el calendario y no agendan.
4. **Cierre**: al final del reporte, CTA para revisar el resultado con un
   consultor.

## Base de datos

Proyecto Supabase `datarev-diagnostico` (`xzeipsznuntnqsaawxmi`).

| Tabla | Para qué |
|---|---|
| `leads` | Un renglón por persona (`email` único, normalizado a minúsculas). Trae empresa, puesto, teléfono, sector, tamaño, UTM y consentimiento. |
| `assessments` | Cada diagnóstico terminado, con respuestas crudas **y** puntajes desnormalizados (`overall_score`, `credited_level`, `stage_id`, `dimension_scores`, `top_gaps`) para poder filtrar leads por madurez sin recalcular. |
| `consultation_requests` | Solicitudes de sesión. `kind` = `guided_full` (el diagnóstico en vivo) o `results_review` (revisar el reporte). `status` = requested / scheduled / done / dropped. |

### Cómo se escribe, y por qué así

**RLS está activo en las tres tablas y no existe ninguna política de escritura,
ni de lectura para `anon`.** Las escrituras pasan por dos funciones
`SECURITY DEFINER`:

- `capture_lead(...)` — normaliza el correo, hace upsert del lead e inserta el
  assessment. **Un valor vacío nunca sobrescribe uno bueno**, así que una
  segunda visita a medio llenar no puede borrar la primera.
- `request_consultation(...)` — registra la solicitud y garantiza que exista el
  lead.

Sólo esas dos tienen `EXECUTE` para `anon`. El visitante elige *valores*, nunca
*columnas*, y no puede leer el pipeline de vuelta. Verificado: actuando como
`anon`, las tres tablas devuelven 0 filas.

**El precio de este diseño**: cualquiera con la llave publicable (que va en el
bundle) puede llamar a `capture_lead` y meter leads falsos, igual que en
cualquier formulario público de internet. El correo se valida en Postgres y el
tamaño del assessment está topado, pero no hay defensa contra spam en volumen.
Si aparece, lo natural es Vercel BotID o Turnstile antes del submit — no cerrar
la función, que rompería la captura.

Para ver los leads: [Table Editor](https://supabase.com/dashboard/project/xzeipsznuntnqsaawxmi/editor).

---

## Puesta en marcha — 2 pasos opcionales

La app **captura leads desde el primer minuto** sin configurar nada más. Estos
dos pasos mejoran el embudo pero no lo bloquean.

### 1. Login con Google (opcional)

1. En Google Cloud Console crea un **OAuth 2.0 Client ID** de tipo *Web
   application*.
2. En *Authorized redirect URIs* pon:
   `https://xzeipsznuntnqsaawxmi.supabase.co/auth/v1/callback`
3. Pega Client ID y Client Secret en
   [Supabase → Auth → Providers → Google](https://supabase.com/dashboard/project/xzeipsznuntnqsaawxmi/auth/providers)
   y actívalo.
4. En [Auth → URL Configuration](https://supabase.com/dashboard/project/xzeipsznuntnqsaawxmi/auth/url-configuration)
   agrega a *Redirect URLs*:
   - `http://localhost:3021/auth/callback`
   - `https://<dominio-de-producción>/auth/callback`

Mientras no esté configurado, **el botón de Google ni siquiera se muestra**: la
app consulta `/auth/v1/settings` en runtime y sólo lo pinta si el proveedor está
activo. En cuanto lo enciendas aparece solo, sin redesplegar. El formulario de
correo funciona siempre.

### 2. Evento de Calendly de 1 hora (recomendado)

Crea un event type de 60 min en `calendly.com/admin-datarev` y ponlo en el env:

```
NEXT_PUBLIC_CALENDLY_GUIDED_URL=https://calendly.com/admin-datarev/60min-diagnostico
```

Si se deja vacío, los CTA caen al `/30min` público — el botón nunca queda muerto,
pero la copia promete una hora, así que conviene que el evento exista.

---

## Desarrollo

```bash
npm install
npm run dev
```

```bash
npm test          # 44 pruebas del motor de puntaje y roadmap
npx tsc --noEmit
npx eslint .
```

## Despliegue

```bash
vercel --prod
```

Las variables están en `.env.example` y todas son públicas, así que se pueden
cargar de una vez sin manejar secretos. Tras cambiar de dominio, agrega
`https://<dominio>/auth/callback` a los Redirect URLs de Supabase Auth.

---

## Decisiones que conviene no deshacer

- **La paleta se validó, no se eligió a ojo.** Superficie navy `#08123a`; el
  ramp ordinal es de un solo tono (9° de dispersión) y el trío categórico pasa
  CVD en todos los pares (peor caso deutan ΔE 9.4). Si se mueve la superficie,
  hay que volver a correr el validador de la skill `dataviz` — el navy tiene
  mucho menos margen que el casi-negro del que venía.
- **El cian nunca lleva texto blanco** (2.07:1). Los botones primarios son azul
  `#1763ff` con blanco (4.92:1); lo que se pinte de cian lleva tinta navy.
- **El logo nunca por debajo de 48 px de alto.** El lockup apila "DATA
  REVOLUTION" en trazo fino bajo el monograma; a 32 px esa línea se convierte en
  una mancha gris. Verificado en navegador a 32/40/48/56 px.
- **Dos archivos de logo, no uno recoloreado.** El blanco desaparece en claro y
  el de color se desvanece en navy. El intercambio sigue tanto `data-theme="light"`
  como `@media print`, no sólo print.
- **`leads.email` tiene restricción única simple, no índice de expresión**, y
  `capture_lead` normaliza a minúsculas. Si se cambia una cosa hay que cambiar
  la otra, o se duplican leads por diferencia de mayúsculas.
- **Zod recorta el correo ANTES de validarlo** (`z.string().trim().email()`).
  Al revés rechaza a quien pega la dirección con un espacio al final, que es
  común y cuesta un lead.
- **Un fallo al guardar el assessment no bloquea el lead.** Comercialmente el
  contacto vale más que el detalle del diagnóstico.
- **Sin librería de gráficas** — los seis SVG son a mano para que
  `window.print()` siga siendo confiable. El PDF es un entregable, no un extra.

## Sobre las fuentes del marco

El modelo compone investigación pública de MIT CISR, Gartner, NIST AI RMF,
ISO/IEC 42001 y CMMI-DMM. Se citan como fuentes —igual que los decks de DataRev
citan "MIT, 2025"— y el reporte dice explícitamente que ninguna de ellas avala
ni patrocina la herramienta. No se usa ningún logotipo de terceros.
