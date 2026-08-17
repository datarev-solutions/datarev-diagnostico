export interface LlmModel {
  id: string;
  name: string;
  co: string;
  pin: number;
  pc: number | null;
  pout: number;
  ctx: string;
  ctxT: number;
  params: string;
  speed: string;
  spd: number;
  eff: number;
  effSrc: "measured" | "est.";
  refs: number[];
  arenaScore?: number;
}

export interface PromptSample {
  q: string;
  a: string;
}

export interface ReferenceItem {
  id: number;
  title: string;
  url: string;
}

export const FRONTIER_MODELS: LlmModel[] = [
  { name: 'Claude Fable 5',   co: 'Anthropic',   pin: 10,    pc: 1,    pout: 50,   ctx: '1M',    ctxT: 1000000, params: 'est. ~1–2T+ MoE',            speed: '~40–70',   spd: 55,  eff: 2.3, effSrc: 'measured', refs: [1, 2, 3, 19], id: 'claude-fable-5' },
  { name: 'Claude Opus 5',    co: 'Anthropic',   pin: 5,     pc: 0.5,  pout: 25,   ctx: '1M',    ctxT: 1000000, params: 'est. ~500B–1T MoE',          speed: '~55',      spd: 55,  eff: 1.4, effSrc: 'measured', refs: [1, 2, 23, 24], id: 'claude-opus-5' },
  { name: 'GPT-5.5 Pro',      co: 'OpenAI',      pin: 30,    pc: null, pout: 180,  ctx: '1M',    ctxT: 1000000, params: 'est. ~1.5T+ MoE',            speed: '~20–40',   spd: 30,  eff: 1.8, effSrc: 'est.',     refs: [4, 5, 19], id: 'gpt-5.5-pro' },
  { name: 'GPT-5.6 Sol',      co: 'OpenAI',      pin: 5,     pc: 0.5,  pout: 30,   ctx: '1M',    ctxT: 1000000, params: 'est. ~1T+ MoE',              speed: '~69',      spd: 69,  eff: 1.0, effSrc: 'measured', refs: [5, 25, 26], id: 'gpt-5.6-sol' },
  { name: 'Gemini 3.1 Pro',   co: 'Google',      pin: 2,     pc: 0.2,  pout: 12,   ctx: '1M',    ctxT: 1000000, params: 'est. ~1.2T+ MoE',            speed: '~128',     spd: 128, eff: 1.5, effSrc: 'est.',     refs: [7, 18], id: 'gemini-3.1-pro' },
  { name: 'Gemini 3.6 Flash', co: 'Google',      pin: 1.5,   pc: 0.15, pout: 7.5,  ctx: '1M',    ctxT: 1000000, params: 'est. ~200–400B MoE',         speed: '~224',     spd: 224, eff: 0.8, effSrc: 'measured', refs: [7, 33, 34], id: 'gemini-3.6-flash' },
  { name: 'Grok 4.20',        co: 'xAI',         pin: 1.25,  pc: 0.2,  pout: 2.5,  ctx: '1M',    ctxT: 1000000, params: 'est. ~500B+ hybrid',         speed: '~150+',    spd: 150, eff: 1.5, effSrc: 'est.',     refs: [9, 10], id: 'grok-4.20' },
  { name: 'Qwen3.8 Max',      co: 'Alibaba',     pin: 2,     pc: 0.25, pout: 6,    ctx: '1M',    ctxT: 1000000, params: '2.4T MoE, 95B active',       speed: '~51',      spd: 51,  eff: 2.1, effSrc: 'measured', refs: [30, 31, 32], id: 'qwen3.8-max' },
  { name: 'DeepSeek V4 Pro',  co: 'DeepSeek',    pin: 0.435, pc: 0.003625, pout: 0.87, ctx: '1M', ctxT: 1000000, params: '~1.6T MoE, 49B active',      speed: '~85',      spd: 85,  eff: 2.8, effSrc: 'est.',     refs: [12, 13, 20, 21], id: 'deepseek-v4-pro' },
  { name: 'Kimi K3',          co: 'Moonshot AI', pin: 3,     pc: 0.3,  pout: 15,   ctx: '1M',    ctxT: 1000000, params: 'est. ~2.8T MoE',             speed: '~44',      spd: 44,  eff: 1.9, effSrc: 'measured', refs: [27, 28], id: 'kimi-k3' }
];

export const POPULAR_PROMPTS: PromptSample[] = [
  {
    q: 'Write a professional email to a client apologizing for a two-week shipment delay, offering a 10% discount on their next order, and reassuring them about our new logistics partner. Keep it under 150 words, warm but professional tone.',
    a: `Subject: Our apologies — an update on your delayed shipment

Dear Ms. Alvarez,

I want to personally apologize for the delay affecting your order #48291. Due to a disruption at our previous logistics provider, your shipment will now arrive approximately two weeks later than promised, on August 14.

We know a delay like this affects your own planning, and we take that seriously. As a gesture of goodwill, we have applied a 10% discount to your next order — no code needed; it will apply automatically at checkout.

Going forward, your orders will ship through our new logistics partner, whose network maintains a 99.2% on-time record, so you can count on reliable deliveries from here on.

Thank you for your patience and continued trust. If you have any questions, reply directly to this email or call me at the number below.

Warm regards,
Daniel Ortega
Customer Success Manager`
  },
  {
    q: 'Create a job description for a Senior People Analytics Manager: responsibilities, required skills, nice-to-haves, and a salary range for Mexico City. Format it with headers and bullet points.',
    a: `Senior People Analytics Manager
Location: Mexico City (hybrid, 3 days on-site) | Reports to: VP of People

About the role
We are looking for a Senior People Analytics Manager to turn workforce data into decisions. You will own the analytics roadmap for a 3,000-employee organization, partner with HR business partners and finance, and build the models that guide hiring, retention, and compensation strategy.

Responsibilities
- Design and maintain dashboards for headcount, attrition, engagement, and diversity metrics
- Build predictive models for turnover risk and workforce-planning scenarios
- Partner with HRBPs to translate business questions into analyses and experiments
- Lead the annual compensation benchmarking cycle with external survey vendors
- Present insights to the executive committee each quarter
- Ensure people-data privacy compliance (LFPDPPP and internal policy)

Required skills
- 6+ years in people analytics, workforce planning, or HR strategy consulting
- Advanced SQL and at least one of Python or R; strong statistics fundamentals
- Hands-on experience with an HRIS (Workday, SAP SuccessFactors, or similar)
- Executive-level communication in Spanish and English

Nice to have
- Experience deploying machine-learning models in production HR contexts
- Familiarity with organizational network analysis
- Prior experience in high-growth technology companies

Compensation
MXN $90,000–$130,000 gross monthly, plus a 15% target annual bonus, major medical insurance, and 20 vacation days. Final offer depends on experience.`
  },
  {
    q: 'Explain the difference between supervised and unsupervised machine learning for a non-technical executive audience, with one concrete business example of each and when to invest in which.',
    a: `Supervised and unsupervised learning differ in one fundamental way: whether we tell the machine what the right answer looks like.

Supervised learning learns from labeled examples. We show the model thousands of historical cases where we already know the outcome — which customers churned, which invoices were fraudulent, which candidates succeeded — and it learns the patterns connecting inputs to outcomes. It then predicts the outcome for new cases.

Business example: a bank trains a model on ten years of loan applications, each labeled "repaid" or "defaulted." The model learns which combinations of income, credit history, and behavior predict default, and scores every new application in milliseconds.

Unsupervised learning works without labels. We hand the model raw data and ask it to find structure we did not know was there — natural groupings, anomalies, hidden segments.

Business example: a retailer feeds two years of purchase data into a clustering algorithm and discovers five distinct customer segments, including a previously invisible "weekday lunch professionals" group that becomes a profitable new marketing target.

The practical rule of thumb: if you can phrase the question as "predict X," invest in supervised learning — you will need clean historical data with known outcomes. If the question is "show me what I am not seeing," start with unsupervised learning and be ready for exploratory, less predictable payoffs.`
  },
  {
    q: 'Write 3 LinkedIn post variations announcing our new AI-powered customer service bot. Each under 100 words, with a hook, one statistic, and a call to action. Vary the tone: professional, playful, data-driven.',
    a: `Variation 1 — Professional
Customer service should not keep people waiting. Today we are launching our AI-powered service assistant, available 24/7 across chat and WhatsApp. In pilot testing it resolved 68% of inquiries without human handoff — while our team focused on the complex cases that deserve human judgment. Try it today at the link below, and tell us what you think.

Variation 2 — Playful
Our new teammate never sleeps, never takes lunch, and answers in four seconds flat. Meet our AI service assistant — it handled 68% of pilot inquiries solo. The other 32%? Passed to humans, exactly as it should be. Come say hello and put it to the test.

Variation 3 — Data-driven
Pilot results from our new AI service assistant: 68% autonomous resolution, 4-second median response, satisfaction up 12 points. The playbook: let AI take the routine, route the nuanced to people. Full case study in the comments — see the numbers for yourself.`
  },
  {
    q: 'Write a SQL query that returns the top 10 customers by total revenue in 2026, including their industry and assigned account manager, joining the orders, customers, and employees tables. Briefly explain each clause.',
    a: `SELECT
  c.customer_name,
  c.industry,
  e.full_name AS account_manager,
  SUM(o.amount) AS total_revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN employees e ON e.employee_id = c.account_manager_id
WHERE o.order_date >= '2026-01-01'
  AND o.order_date < '2027-01-01'
GROUP BY c.customer_name, c.industry, e.full_name
ORDER BY total_revenue DESC
LIMIT 10;

Explanation of each clause:
- SELECT picks the customer, their industry, the account manager's name, and the summed order amounts as total_revenue.
- FROM orders with two JOINs connects each order to its customer, and each customer to the employee who manages the account.
- WHERE restricts orders to 2026 using a half-open date range, which is index-friendly and avoids timestamp edge cases.
- GROUP BY collapses the rows to one line per customer so SUM aggregates all their 2026 orders.
- ORDER BY total_revenue DESC ranks customers from highest to lowest revenue.
- LIMIT 10 keeps only the top ten.`
  }
];

export const LAB_SAMPLES: PromptSample[] = [
  {
    q: 'What is the process I need to go through to rent a car: prerequisites? documents to present? information to have on hand?',
    a: `Renting a car is straightforward once you have the right documents ready. Here is the typical process:

1. Prerequisites. Most rental companies require you to be at least 21 years old (25 for premium vehicles), hold a valid driver's license that has been active for at least one year, and present a credit card in your name for the security deposit. Some agencies accept debit cards, but they may run a credit check or require additional identification.

2. Documents to present. Bring your driver's license, a second form of identification such as a passport or national ID, and the credit card you will use for payment. If you are renting abroad, an International Driving Permit is often required alongside your original license. Corporate renters should bring a company authorization letter.

3. Information to have on hand. Know your pickup and return dates and times, the exact locations for both, and the details of every person who will drive the vehicle. Have your insurance information available — either proof of personal auto coverage, a credit card that includes rental insurance, or a plan to purchase the agency's coverage at the counter.

4. At the counter. You will sign the rental agreement, review the fuel policy and mileage limits, place the deposit hold, and inspect the vehicle for existing damage before driving away. Photograph the car from all angles.

When you return the car, refuel it to the agreed level, keep your receipt, and confirm the deposit release. The whole process usually takes under thirty minutes end to end.`
  },
  {
    q: 'What documents do I need to sign before my first day, and how do I enroll in health benefits?',
    a: `Welcome aboard! Before your first day you need to complete four documents in the onboarding portal: the signed offer letter, the confidentiality and IP agreement, your tax withholding form, and the direct deposit authorization. All four are electronic signatures and take about ten minutes total.

For health benefits, enrollment opens on your start date and stays open for 30 days. Log in to the benefits portal with your new employee ID, compare the three medical plans (the comparison tool shows premiums and deductibles side by side), and add any dependents with their birth dates and social security numbers. Dental and vision are separate elections on the same screen.

If you miss the 30-day window, you cannot enroll until the next open-enrollment period in November unless you have a qualifying life event. If you have questions, HR holds benefits office hours every Tuesday at 10 AM, or you can reply here and I can connect you with a specialist.`
  },
  {
    q: `My laptop won't connect to the office VPN. What should I do?`,
    a: `Let's work through the most common fixes in order:

1. Check your network first. Open a browser and confirm regular websites load. If not, the issue is your internet connection, not the VPN.

2. Restart the VPN client. Quit it completely (check the system tray), reopen it, and try connecting again. This resolves about half of all reported cases.

3. Verify your credentials. If your network password changed recently, the VPN may still be using the old one. Sign out of the client and sign back in with your current credentials and MFA code.

4. Update the client. Outdated VPN clients are blocked after security updates. Check Self Service for the latest version.

5. Try another network. If you are on hotel or cafe Wi-Fi, the network may block VPN ports. Switch to a phone hotspot to test.

If none of these work, open a ticket with the error code shown in the client and your laptop asset number, and the network team will respond within two business hours.`
  },
  {
    q: `What's the difference between your Basic and Pro plans, and can I upgrade later without losing my data?`,
    a: `Great question. Basic is designed for individuals and small teams: up to 5 users, 10 GB of storage, standard email support, and the core reporting dashboard. Pro is built for growing teams: unlimited users, 1 TB of storage, priority support with a 4-hour response target, advanced analytics, custom roles and permissions, and API access for integrations.

The most common reason customers upgrade is the API access and the custom permissions — once a team passes about ten people, most want to control who can see what.

And yes, upgrading is completely safe: your data, settings, and integrations carry over automatically, and the change takes effect immediately with prorated billing for the remainder of your cycle. You can also downgrade at the end of any billing period; if you are over the Basic limits at that point, your data stays read-only until you are back under the caps — nothing is ever deleted.`
  }
];

export const REFERENCES: ReferenceItem[] = [
  { id: 1, title: 'Anthropic — Claude platform pricing', url: 'https://platform.claude.com/docs/en/about-claude/pricing' },
  { id: 2, title: 'Anthropic — prompt caching (cache reads = 0.1× input price)', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching' },
  { id: 3, title: 'OpenRouter — Claude Fable 5 (pricing, 1M context)', url: 'https://openrouter.ai/anthropic/claude-fable-5' },
  { id: 4, title: 'OpenAI — Introducing GPT-5.5 (GPT-5.5 Pro pricing)', url: 'https://openai.com/index/introducing-gpt-5-5/' },
  { id: 5, title: 'OpenAI — API pricing', url: 'https://developers.openai.com/api/docs/pricing' },
  { id: 6, title: 'OpenRouter — GPT-5.5 (1.05M context)', url: 'https://openrouter.ai/openai/gpt-5.5' },
  { id: 7, title: 'Google — Gemini API pricing', url: 'https://ai.google.dev/gemini-api/docs/pricing' },
  { id: 8, title: 'Simon Willison — Gemini 3.5 Flash pricing analysis', url: 'https://simonwillison.net/2026/May/19/gemini-35-flash/' },
  { id: 9, title: 'xAI — model documentation', url: 'https://docs.x.ai/developers/models' },
  { id: 10, title: 'xAI — Grok 4.20 model card (1M context, $0.20/1M cached input)', url: 'https://docs.x.ai/developers/models/grok-4.20-0309-reasoning' },
  { id: 11, title: 'Alibaba Cloud — Model Studio pricing (Qwen3.7 Max list price $2.50/$7.50, 1M context)', url: 'https://www.alibabacloud.com/help/en/model-studio/model-pricing' },
  { id: 12, title: 'DeepInfra — DeepSeek V4 Pro pricing guide', url: 'https://deepinfra.com/blog/deepseek-v4-pro-pricing-guide-2026-providers-cost-analysis' },
  { id: 13, title: 'GMI Cloud — DeepSeek V4 benchmarks (~1.6T parameters, 1M context)', url: 'https://www.gmicloud.ai/en/blog/deepseek-v4-is-here-we-tested-it' },
  { id: 14, title: 'CostGoat — Kimi API pricing (K2.6)', url: 'https://costgoat.com/pricing/kimi-api' },
  { id: 15, title: 'OpenRouter — Kimi K2 family (262K context)', url: 'https://openrouter.ai/moonshotai/kimi-k2.5' },
  { id: 16, title: 'TechTimes — Meta opens Muse Spark 1.1 paid API ($1.25/$4.25 per 1M tokens)', url: 'https://www.techtimes.com/articles/320088/20260710/metas-muse-spark-11-opens-paid-api-one-quarter-anthropic-openai-rates.htm' },
  { id: 17, title: 'Artificial Analysis — throughput and latency benchmarks (speed figures)', url: 'https://artificialanalysis.ai/models' },
  { id: 18, title: 'Artificial Analysis — Opus 4.8 vs Gemini 3.1 Pro (1M context confirmation)', url: 'https://artificialanalysis.ai/models/comparisons/claude-opus-4-8-vs-gemini-3-1-pro-preview' },
  { id: 19, title: 'CodingFleet — Opus 4.8 vs GPT-5.5 (verbosity: ~110M vs ~35M avg tokens on AA Intelligence Index; 2.9× on DeepSWE; 3.35× in Composio tests; context windows)', url: 'https://codingfleet.com/blog/claude-opus-4-8-vs-gpt-5-5-comparison/' },
  { id: 20, title: 'Artificial Analysis — DeepSeek V4 Pro vs GPT-5.5 (output tokens per task methodology, speeds, 1.6T/49B active parameters)', url: 'https://artificialanalysis.ai/models/comparisons/deepseek-v4-pro-high-vs-gpt-5-5-high' },
  { id: 21, title: 'DeepSeek — API pricing docs (cache-hit input $0.003625/1M)', url: 'https://api-docs.deepseek.com/quick_start/pricing/' },
  { id: 22, title: 'Artificial Analysis — Muse Spark 1.1 (Intelligence Index standing vs. Kimi K2.6)', url: 'https://artificialanalysis.ai/models/muse-spark-1-1' },
  { id: 23, title: 'Artificial Analysis — Claude Opus 5 (Intelligence Index #1 at 61; ~100M output tokens on evaluation vs. ~63M median; 1M context)', url: 'https://artificialanalysis.ai/models/claude-opus-5' },
  { id: 24, title: 'Artificial Analysis — GPT-5.5 (~72M output tokens on evaluation vs. ~63M median; Intelligence Index 55)', url: 'https://artificialanalysis.ai/models/gpt-5-5' },
  { id: 25, title: 'OpenRouter — GPT-5.6 Sol ($5/$30 per 1M, 1M context)', url: 'https://openrouter.ai/openai/gpt-5.6-sol' },
  { id: 26, title: 'Artificial Analysis — GPT-5.6 Sol (Intelligence Index 61; ~69 t/s; ~70M output tokens on evaluation vs. ~66M median)', url: 'https://artificialanalysis.ai/models/gpt-5-6-sol' },
  { id: 27, title: 'OpenRouter — Kimi K3 ($3/$0.30 cached/$15 per 1M, 1M context)', url: 'https://openrouter.ai/moonshotai/kimi-k3' },
  { id: 28, title: 'Artificial Analysis — Kimi K3 (Intelligence Index 60; ~44 t/s; ~130M output tokens on evaluation)', url: 'https://artificialanalysis.ai/models/kimi-k3' },
  { id: 29, title: 'Artificial Analysis — Muse Spark 1.2 (Intelligence Index 57; $1.25/$4.25 per 1M, $0.15 cached)', url: 'https://artificialanalysis.ai/models/muse-spark-1-2' },
  { id: 30, title: 'Forbes — Alibaba\'s Qwen3.8-Max prices frontier AI at $2/$6 per 1M tokens', url: 'https://www.forbes.com/sites/jonmarkman/2026/08/05/alibabas-qwen38-max-prices-frontier-ai-at-2-per-million-tokens/' },
  { id: 31, title: 'MarkTechPost — Qwen3.8-Max (2.4T total / 95B active MoE, 1M context)', url: 'https://www.marktechpost.com/2026/08/03/alibaba-qwen-releases-qwen3-8-max/' },
  { id: 32, title: 'Artificial Analysis — Qwen3.8-Max (Intelligence Index 58; ~51 t/s; ~150M output tokens on evaluation vs. ~70M median)', url: 'https://artificialanalysis.ai/models/qwen3-8-max' },
  { id: 33, title: '9to5Google — Google launches Gemini 3.6 Flash ($1.50/$7.50 per 1M, 1M context)', url: 'https://9to5google.com/2026/07/21/gemini-3-6-flash-launch/' },
  { id: 34, title: 'Artificial Analysis — Gemini 3.6 Flash (Intelligence Index 52; ~224 t/s; ~59M output tokens on evaluation vs. ~70M median)', url: 'https://artificialanalysis.ai/models/gemini-3-6-flash' }
];

export function tokEst(t: string) {
  const chars = t.length;
  const words = (t.trim().match(/\S+/g) || []).length;
  return { tokens: Math.round((chars / 4 + (words * 4) / 3) / 2), words, chars };
}

export function sig2(n: number): number {
  if (n <= 0) return 0;
  if (n < 10) return Math.round(n);
  const p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}
