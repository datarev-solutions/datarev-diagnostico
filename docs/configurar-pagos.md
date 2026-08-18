# Activar los pagos

Todo el código está listo. Faltan tres cosas que sólo puedes hacer tú, porque
requieren tus llaves y tu cuenta. Son unos 20 minutos.

Mientras no lo hagas, la app **no se rompe**: la página de precios muestra los
planes sin precio y sin botón, igual que el botón de Google no aparece hasta que
el proveedor está activo. Un control muerto es peor que ningún control.

---

## 1. Crear los productos en Stripe

En el dashboard de Stripe → **Productos** → crear tres, todos con precio
**único** (no recurrente) y moneda **MXN**:

| Producto | Precio | Para qué es |
|---|---|---|
| DataRev · Diagnóstico | **$490 MXN** | Filtro. A precio de comida corrida, pero pedir tarjeta elimina a los mirones. |
| DataRev · Plan | **$2,900 MXN** | El prospecto con proyecto real. |
| DataRev · Sesión guiada | **$5,900 MXN** | El que ya está listo para hablar. Incluye 60 min de consultor. |

> **Por qué la sesión no puede costar menos.** Una hora de consultor te cuesta
> entre 52 y 73 USD sólo en entrega, y con preparación y seguimiento realista se
> va a 100–150. Los números salen de `src/lib/rateCard.ts`, que deriva la tarifa
> del salario publicado pasando por carga patronal y utilización. Si pones los
> 60 minutos en un tier barato, pierdes dinero en cada venta.

Cada producto te da un **price id** que empieza con `price_`. Cópialos.

---

## 2. Configurar el webhook

Stripe → **Desarrolladores** → **Webhooks** → añadir endpoint:

- URL: `https://datarev-diagnostico.vercel.app/api/stripe/webhook`
- Evento: `checkout.session.completed`

Te da un **signing secret** que empieza con `whsec_`. Cópialo.

Sin esto, alguien puede pagar y no recibir nada: el webhook es lo único que
escribe la suscripción.

---

## 3. Pegar las variables en Vercel

Vercel → el proyecto → **Settings** → **Environment Variables**:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_DIAGNOSTIC=price_...
STRIPE_PRICE_PLAN=price_...
STRIPE_PRICE_GUIDED=price_...
NEXT_PUBLIC_SITE_URL=https://datarev-diagnostico.vercel.app
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` la sacas de Supabase → Settings → API. **Es la única
llave con la que el webhook puede escribir la suscripción**, y por eso nunca
debe aparecer en el navegador ni en el repo.

Redespliega después de pegarlas.

---

## Prueba antes de cobrarle a alguien real

1. Usa las llaves de **test** primero (`sk_test_...`).
2. Stripe CLI: `stripe listen --forward-to localhost:3021/api/stripe/webhook`
3. Compra con la tarjeta de prueba `4242 4242 4242 4242`.
4. Confirma en Supabase que apareció la fila en `subscriptions` con el tier
   correcto y `status = 'active'`.
5. Recarga la app: la calculadora debe abrirse sola.

---

## Lo que falta y no es código

**Factura (CFDI).** Stripe **no** emite factura mexicana. Tu comprador B2B la
necesita para deducir, y es el detalle que más descarrila lanzamientos en
México. Opciones: Facturama o Bind con su API, o emitir manual mientras el
volumen sea bajo. Decídelo antes de cobrarle al primer cliente, no después.

**OXXO.** Stripe lo soporta en México. Si vas a vender fuera de tarjeta
corporativa, vale la pena activarlo.

**Google OAuth.** Sigue pendiente y es tu primera barrera: sin login no hay
correo capturado. El código ya está; falta crear el client en Google Cloud y
pegarlo en Supabase Auth.

---

## Una nota sobre el proyecto de Supabase

El 17 de agosto de 2026 el proyecto apareció **pausado** y la app no estaba
capturando nada. Supabase pausa proyectos del plan gratuito tras unos 7 días sin
actividad. Se restauró y los datos estaban intactos, pero va a volver a pasar:
o subes de plan, o le pones un ping semanal.
