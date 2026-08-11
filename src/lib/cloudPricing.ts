/**
 * Rate card for the cost calculator.
 *
 * EVERY rate here carries its source and the date it was checked. This tool
 * gets shown to prospects, so a stale number is a credibility problem, not a
 * rounding error. Re-verify before quoting anything.
 *
 * Rates checked: 2026-08-06. Region baseline: US East (us-east-1 /
 * us-central1 / East US 2). Mexico regions run 5-20% higher — see REGION_NOTE.
 *
 * Deliberately NOT modelled: egress between clouds, private networking,
 * support plans, reserved-capacity commitments beyond the ones named, and
 * anything negotiated. Those move the number a lot and can't be guessed.
 */

export const PRICING_CHECKED = "2026-08-06";

export const PRICING_SOURCES = [
  { label: "BigQuery pricing", url: "https://cloud.google.com/bigquery/pricing" },
  { label: "Amazon Redshift pricing", url: "https://aws.amazon.com/redshift/pricing/" },
  { label: "Microsoft Fabric pricing", url: "https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/" },
  { label: "Fabric licenses (F64 threshold)", url: "https://learn.microsoft.com/en-us/fabric/enterprise/licenses" },
  { label: "Snowflake pricing", url: "https://www.snowflake.com/en/pricing-options/" },
  { label: "Supabase pricing", url: "https://supabase.com/pricing" },
  { label: "Tableau pricing", url: "https://www.tableau.com/pricing" },
] as const;

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
  /**
   * QuickSight Enterprise. These two have been stable for years but are not
   * on a page we re-verified in this pass — treat as approximate.
   */
  biAuthorPerUser: 24,
  biReaderPerUser: 3,
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
  reservationDiscount: 0.41,
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
  defaultDayRate: 900,
} as const;

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
