/**
 * Rate card for the cost calculator.
 *
 * This tool gets shown to prospects, so a stale or invented number is a
 * credibility problem, not a rounding error. Each rate group is tagged in
 * PROVENANCE below with how solid it actually is — official, derived,
 * secondary or estimate. Do not flatten that distinction when presenting.
 *
 * Region baseline: US East (us-east-1 / us-central1 / East US 2). Mexico
 * regions run 5-20% higher — see REGION_NOTE.
 *
 * Deliberately NOT modelled: egress between clouds, private networking,
 * support plans, reserved-capacity commitments beyond the ones named, and
 * anything negotiated. Those move the number a lot and can't be guessed.
 */
import type { L } from "./framework";

export const PRICING_CHECKED = "2026-08-09";

/**
 * Provenance. Not every number here carries the same weight, and pretending
 * otherwise in front of a client is how a calculator loses its credibility.
 *
 *   official  — read off the vendor's own pricing page in this pass
 *   derived   — computed from official figures (the arithmetic is stated)
 *   secondary — consistent across independent third parties, vendor page
 *               renders the figure in JavaScript we could not read
 *   estimate  — DataRev's own assumption, not a published rate
 */
export type Provenance = "official" | "derived" | "secondary" | "estimate";

export const PRICING_SOURCES = [
  { label: "BigQuery pricing", url: "https://cloud.google.com/bigquery/pricing" },
  { label: "Amazon Redshift pricing", url: "https://aws.amazon.com/redshift/pricing/" },
  { label: "Amazon S3 pricing", url: "https://aws.amazon.com/s3/pricing/" },
  { label: "AWS Glue pricing", url: "https://aws.amazon.com/glue/pricing/" },
  { label: "Amazon QuickSight pricing", url: "https://aws.amazon.com/quicksight/pricing/" },
  { label: "Microsoft Fabric pricing", url: "https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/" },
  { label: "Fabric licenses (F64 threshold)", url: "https://learn.microsoft.com/en-us/fabric/enterprise/licenses" },
  { label: "Power BI pricing", url: "https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing" },
  { label: "Snowflake pricing", url: "https://www.snowflake.com/en/pricing-options/" },
  { label: "Databricks pricing", url: "https://www.databricks.com/product/pricing" },
  { label: "Supabase pricing", url: "https://supabase.com/pricing" },
] as const;

/**
 * What is actually verified and what is not, per rate group. Rendered in the
 * UI so the person presenting can answer "where did that number come from?"
 * without guessing.
 */
export const PROVENANCE: { group: L; level: Provenance; detail: L }[] = [
  {
    group: { es: "Capacidad Fabric y umbral F64", en: "Fabric capacity and the F64 threshold" },
    level: "official",
    detail: {
      es: "F2, F4, F64 y F2048 vienen de la página de Azure. Los SKU intermedios (F8 a F256) están derivados: la escalera es exactamente lineal a $131.40 por CU-mes, comprobado contra los cuatro puntos publicados. El umbral F64 lo confirma la nota al pie 3 de la página de Power BI.",
      en: "F2, F4, F64 and F2048 come from the Azure page. The intermediate SKUs (F8 to F256) are derived: the ladder is exactly linear at $131.40 per CU-month, checked against all four published points. The F64 threshold is confirmed by footnote 3 on the Power BI pricing page.",
    },
  },
  {
    group: { es: "Licencias por usuario", en: "Per-user licences" },
    level: "official",
    detail: {
      es: "Power BI Pro $14 y PPU $24 de microsoft.com. QuickSight Author $24 y Reader $3 de aws.amazon.com.",
      en: "Power BI Pro $14 and PPU $24 from microsoft.com. QuickSight Author $24 and Reader $3 from aws.amazon.com.",
    },
  },
  {
    group: { es: "Almacenamiento y ETL en AWS", en: "AWS storage and ETL" },
    level: "official",
    detail: {
      es: "S3 Standard $0.023/GB y Glue $0.44/DPU-hora, ambos de las páginas de AWS. Redshift Managed Storage $0.024/GB de la misma fuente; el $0.375/RPU-hora está derivado del mínimo publicado de $1.50/hora sobre 4 RPU.",
      en: "S3 Standard $0.023/GB and Glue $0.44/DPU-hour, both from the AWS pages. Redshift Managed Storage $0.024/GB from the same source; the $0.375/RPU-hour is derived from the published $1.50/hour minimum over 4 RPUs.",
    },
  },
  {
    group: { es: "Créditos Snowflake y DBU Databricks", en: "Snowflake credits and Databricks DBUs" },
    level: "official",
    detail: {
      es: "Créditos de Snowflake ($2/$3/$4) y almacenamiento a $23/TB de snowflake.com. Tarifas base por DBU de databricks.com. El desglose fino de SKU de Databricks SQL ($0.70 serverless) es de un tercero.",
      en: "Snowflake credits ($2/$3/$4) and $23/TB storage from snowflake.com. Base DBU rates from databricks.com. The fine-grained Databricks SQL SKU breakdown ($0.70 serverless) comes from a third party.",
    },
  },
  {
    group: { es: "Consulta y almacenamiento en BigQuery", en: "BigQuery query and storage" },
    level: "secondary",
    detail: {
      es: "El slot-hora de $0.06 sí está en la página de Google. El $6.25 por TiB escaneado y el almacenamiento de $0.02/$0.01 por GB no: esa tabla se renderiza en JavaScript. Coinciden tres fuentes independientes, pero conviene confirmarlos antes de cotizar.",
      en: "The $0.06 slot-hour is on Google's page. The $6.25 per TiB scanned and the $0.02/$0.01 per GB storage are not: that table renders in JavaScript. Three independent sources agree, but confirm before quoting.",
    },
  },
  {
    group: { es: "Orquestación, VMs y horas de operación", en: "Orchestration, VMs and ops hours" },
    level: "estimate",
    detail: {
      es: "Composer, MWAA, las VMs de la pila abierta y las horas mensuales de operación son supuestos de DataRev, no tarifas publicadas. Son también las líneas que más conviene sustituir por datos reales del cliente.",
      en: "Composer, MWAA, the open-stack VMs and the monthly ops hours are DataRev assumptions, not published rates. They are also the lines most worth replacing with the client's real figures.",
    },
  },
  {
    group: { es: "Factores de conversión de carga", en: "Workload conversion factors" },
    level: "estimate",
    detail: {
      es: "Cuántos créditos consume escanear un TiB, cuántos DBU procesa un TB, cuántas horas al mes queda encendido un warehouse, y los días por fuente en la migración. Son órdenes de magnitud razonados, no medidas. Aquí es donde más se mueve el resultado.",
      en: "Credits per TiB scanned, DBUs per TB processed, hours a warehouse stays awake, and migration days per source. Reasoned orders of magnitude, not measurements. This is where the result moves most.",
    },
  },
  {
    group: { es: "Tarifas por día del equipo de migración", en: "Migration team day rates" },
    level: "estimate",
    detail: {
      es: "Arquitecto/líder $1,400, ingeniero de datos $900, analista BI $650 — tarifas propias de DataRev, editables en pantalla. No son un cotización, son un punto de partida para la conversación de alcance.",
      en: "Architect/lead $1,400, data engineer $900, BI analyst $650 — DataRev's own rates, editable on screen. Not a quote — a starting point for the scoping conversation.",
    },
  },
];

/* ------------------------------------------------------------------ GCP */

export const GCP = {
  /** Per TiB scanned, on-demand. First 1 TiB/month free. */
  queryPerTib: 6.25,
  freeQueryTib: 1,
  /** Enterprise edition, pay-as-you-go. Standard is 0.04, Plus is 0.10. */
  slotHour: 0.06,
  /** Logical storage, per GB-month. */
  storageActive: 0.02,
  storageLongTerm: 0.01,
  /** Cloud Storage standard, per GB-month. */
  objectStorage: 0.02,
  /** Storage Write API, per GiB. First 2 TiB/month free. */
  streamingPerGb: 0.025,
  freeStreamingGb: 2048,
  /** Cloud Composer 2 small environment, rough monthly floor. */
  orchestrationMonthly: 300,
  /** Looker Studio Pro, per user-month. Studio itself is free. */
  biProPerUser: 9,
} as const;

/* ------------------------------------------------------------------ AWS */

export const AWS = {
  /** Redshift Serverless, per RPU-hour. 60-second minimum per query. */
  rpuHour: 0.375,
  /** Minimum serverless base capacity, in RPUs. */
  minRpu: 8,
  /** Redshift Managed Storage, per GB-month. */
  warehouseStorage: 0.024,
  /** S3 Standard, per GB-month. */
  objectStorage: 0.023,
  /** Glue ETL, per DPU-hour. */
  gluePerDpuHour: 0.44,
  /** MWAA small environment, rough monthly floor. */
  orchestrationMonthly: 350,
  /** QuickSight Enterprise, verified on the AWS pricing page. */
  biAuthorPerUser: 24,
  biReaderPerUser: 3,
  /**
   * SPICE, the in-memory store nearly every QuickSight deployment uses.
   * 10 GB is included per Author; beyond that it is billed per GB-month.
   * Easy to forget and it lands squarely on the licence line.
   */
  spicePerGb: 0.38,
  spiceIncludedGbPerAuthor: 10,
} as const;

/* ---------------------------------------------------------------- AZURE */

export const AZURE = {
  /**
   * Fabric F-SKU ladder, pay-as-you-go USD/month. Reservation saves ~41%.
   * F64 is the licensing cliff: at F64+ report viewers need only a Free
   * licence; below it every viewer needs Power BI Pro.
   */
  fabricSkus: [
    { cu: 2, monthly: 262.8 },
    { cu: 4, monthly: 525.6 },
    { cu: 8, monthly: 1051.2 },
    { cu: 16, monthly: 2102.4 },
    { cu: 32, monthly: 4204.8 },
    { cu: 64, monthly: 8409.6 },
    { cu: 128, monthly: 16819.2 },
    { cu: 256, monthly: 33638.4 },
  ] as const,
  /** Microsoft's own page states 40.5%, not the ~41% the resellers quote. */
  reservationDiscount: 0.405,
  /** The SKU at which viewers stop needing a paid licence. */
  freeViewerThresholdCu: 64,
  /** OneLake storage, per GB-month. */
  storage: 0.023,
  /** Power BI per-user licences, USD/month. */
  powerBiPro: 14,
  powerBiPpu: 24,
} as const;

/* ------------------------------------------------------- OPEN SOURCE */

export const OSS = {
  /** Supabase Pro, per organisation-month. Includes $10 compute credit. */
  proBase: 25,
  computeCredit: 10,
  /** Compute ladder, USD/month. Picked by working-set size. */
  computeTiers: [
    { ramGb: 1, monthly: 10, label: "Micro" },
    { ramGb: 2, monthly: 15, label: "Small" },
    { ramGb: 4, monthly: 60, label: "Medium" },
    { ramGb: 8, monthly: 110, label: "Large" },
    { ramGb: 16, monthly: 210, label: "XL" },
    { ramGb: 32, monthly: 410, label: "2XL" },
    { ramGb: 64, monthly: 960, label: "4XL" },
    { ramGb: 128, monthly: 1870, label: "8XL" },
  ] as const,
  /** Postgres disk above the 8 GB included, per GB-month. */
  dbStorage: 0.125,
  dbStorageIncludedGb: 8,
  /** Object storage for the analytical lake (S3-compatible), per GB-month. */
  objectStorage: 0.021,
  /** Self-hosted VMs: Metabase and Airbyte each need one. */
  metabaseVmMonthly: 50,
  airbyteVmMonthly: 80,
  /** A query engine over the lake (DuckDB/ClickHouse on a VM). */
  queryEngineVmMonthly: 120,
  /** Data volume above which Postgres alone stops being a sane warehouse. */
  postgresCeilingGb: 500,
} as const;

/* --------------------------------------------- PORTABLE DATA ENGINES */

/**
 * Snowflake and Databricks are NOT clouds. They are engines that run on top
 * of AWS, GCP or Azure, so they are priced as a swap for the host's native
 * warehouse — the object storage, orchestration and BI licences underneath
 * stay exactly where they were.
 */
export const SNOWFLAKE = {
  /** Per credit, AWS us-east-1. Standard 2.00, Business Critical 4.00. */
  creditEnterprise: 3.0,
  creditStandard: 2.0,
  /** Per TB-month, capacity (pre-purchase) rate. On-demand is ~$40. */
  storagePerTb: 23,
  /**
   * Credits per hour by warehouse size. Each step doubles both the compute
   * and the bill, which is why right-sizing matters more here than anywhere.
   */
  warehouseSizes: [
    { name: "XS", creditsPerHour: 1 },
    { name: "S", creditsPerHour: 2 },
    { name: "M", creditsPerHour: 4 },
    { name: "L", creditsPerHour: 8 },
    { name: "XL", creditsPerHour: 16 },
    { name: "2XL", creditsPerHour: 32 },
  ] as const,
  /**
   * Rough credits burned scanning 1 TiB. An order-of-magnitude figure, not a
   * published rate — Snowflake does not bill per byte scanned.
   */
  creditsPerTibScanned: 1.5,
} as const;

export const DATABRICKS = {
  /** SQL Serverless — the rate already includes the underlying VM. */
  sqlServerlessDbu: 0.7,
  /** SQL Classic — cheaper per DBU, but you also pay the cloud for VMs. */
  sqlClassicDbu: 0.22,
  /** Jobs Compute (classic) for scheduled ETL. */
  jobsDbu: 0.15,
  /** All-purpose interactive clusters — 3-4x jobs compute for the same work. */
  allPurposeDbu: 0.55,
  /**
   * SQL warehouse sizes, in DBU per hour. There is no smaller unit than
   * 2X-Small: a warehouse that is awake costs this much whether one analyst
   * or thirty are querying it. Modelling only marginal per-TiB consumption
   * understates a real Databricks bill by orders of magnitude.
   */
  sqlWarehouseSizes: [
    { name: "2X-Small", dbuPerHour: 4 },
    { name: "X-Small", dbuPerHour: 6 },
    { name: "Small", dbuPerHour: 12 },
    { name: "Medium", dbuPerHour: 24 },
    { name: "Large", dbuPerHour: 40 },
    { name: "X-Large", dbuPerHour: 80 },
  ] as const,
  /** Extra DBUs on top of the awake warehouse, per TiB actually scanned. */
  dbuPerTibScanned: 2.2,
  /** Rough DBUs to process 1 TB through a jobs cluster. */
  dbuPerTbProcessed: 12,
  /**
   * A jobs cluster has a minimum viable size too — a driver plus a worker,
   * for at least a few minutes per run. Small pipelines are floor-bound, not
   * volume-bound.
   */
  minJobDbuPerRun: 0.5,
} as const;

/* ------------------------------------------------------------ MIGRATION */

/**
 * One-time cost to get onto any of these platforms. Deliberately expressed
 * in consultant-days rather than a dollar total, because the day rate is the
 * number DataRev actually negotiates.
 *
 * Different work needs different seniority. Pricing architecture, source
 * integration and report rebuilds at one flat rate understates who actually
 * does discovery (a lead/architect, priced highest) and overstates what a
 * BI rebuild costs (an analyst, priced lowest) — so each line carries its
 * own role and rate rather than a single day rate applied to everything.
 */
export const MIGRATION = {
  discoveryDays: 5,
  /** Connect, model and validate one source system. */
  perSourceDays: 3,
  /** Rebuilding existing reports on the new semantic layer. */
  perAnalystDays: 1.5,
  /** Extra days as volume grows — history backfill and reconciliation. */
  volumeDaysPerTb: 0.4,
  maxVolumeDays: 30,
  /**
   * DataRev's own blended day rates by role — an assumption, not a published
   * rate, and the number most worth swapping for a real negotiated figure.
   */
  dayRates: {
    architect: 1400,
    engineer: 900,
    analyst: 650,
  },
} as const;

export type MigrationRole = keyof typeof MIGRATION.dayRates;

/* ------------------------------------------------------- SHARED / OPS */

/**
 * Monthly engineering hours to keep each stack running: patching, upgrades,
 * pipeline babysitting, access reviews. This is the line that decides whether
 * open source is actually cheaper, and the one most calculators omit.
 *
 * Managed platforms are not zero — someone still owns cost governance and
 * pipeline failures.
 */
export const OPS_HOURS = {
  oss: 20,
  gcp: 6,
  aws: 8,
  azure: 6,
} as const;

export const REGION_NOTE = {
  es: "Tarifas de referencia en región US East. México Central y otras regiones de LATAM corren típicamente entre 5% y 20% más caro.",
  en: "Reference rates are US East. Mexico Central and other LATAM regions typically run 5-20% higher.",
};
