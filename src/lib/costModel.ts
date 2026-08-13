import {
  AWS,
  AZURE,
  DATABRICKS,
  GCP,
  MIGRATION,
  OPS_HOURS,
  OSS,
  SNOWFLAKE,
  type MigrationRole,
} from "./cloudPricing";
import type { L } from "./framework";

export type StackId = "oss" | "gcp" | "aws" | "azure";
export type Refresh = "daily" | "hourly" | "realtime";

export interface CostInputs {
  /** Source systems to integrate: ERPs, CRMs, databases, APIs. */
  sources: number;
  /** Total data under management today, in GB. */
  dataGb: number;
  /** Compound monthly growth, as a percentage. */
  growthPct: number;
  /** How often the pipelines run. Drives both compute and reprocessing. */
  refresh: Refresh;
  /** Data scanned by analytics per month, in GB. */
  queryGbPerMonth: number;
  /** People who only read dashboards. */
  viewers: number;
  /** People who explore and edit existing reports. */
  analysts: number;
  /** People who build models and pipelines. */
  creators: number;
  /** Count the engineering hours each stack costs to run. */
  includeOps: boolean;
  /** Blended internal cost per engineering hour, USD. */
  opsHourlyRate: number;
}

export interface CostLine {
  key: string;
  label: L;
  usd: number;
  /** Shown under the line — how the number was reached. */
  detail?: L;
}

export type LineGroup = "platform" | "licenses" | "ops";

export interface StackCost {
  id: StackId;
  name: string;
  /** One-line description of what was actually priced. */
  shape: L;
  groups: Record<LineGroup, CostLine[]>;
  platform: number;
  licenses: number;
  ops: number;
  total: number;
  /** Things a consultant should say out loud when showing this column. */
  notes: L[];
}

export const DEFAULT_INPUTS: CostInputs = {
  sources: 5,
  dataGb: 500,
  growthPct: 4,
  refresh: "daily",
  queryGbPerMonth: 2000,
  viewers: 40,
  analysts: 8,
  creators: 3,
  includeOps: true,
  opsHourlyRate: 45,
};

/* ------------------------------------------------------------- helpers */

/** Pipeline runs per month, by cadence. */
function runsPerMonth(refresh: Refresh): number {
  if (refresh === "daily") return 30;
  if (refresh === "hourly") return 730;
  return 730; // realtime is continuous; hours is the useful unit
}

/**
 * Fraction of the whole dataset reprocessed each month. Frequent refreshes
 * re-read far more than the delta, which is what actually drives ETL cost.
 */
function churnFactor(refresh: Refresh): number {
  if (refresh === "daily") return 0.05;
  if (refresh === "hourly") return 0.15;
  return 0.3;
}

/** New + reprocessed data per month, in GB. */
export function ingestGbPerMonth(input: CostInputs): number {
  const growth = input.dataGb * (input.growthPct / 100);
  return growth + input.dataGb * churnFactor(input.refresh);
}

/** Project the dataset forward with compound monthly growth. */
export function projectDataGb(dataGb: number, growthPct: number, months: number): number {
  return dataGb * Math.pow(1 + growthPct / 100, months);
}

const round = (n: number) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------------- GCP */

function gcpCost(input: CostInputs, dataGb: number): StackCost {
  const queryTib = input.queryGbPerMonth / 1024;
  const billableTib = Math.max(0, queryTib - GCP.freeQueryTib);
  const onDemand = billableTib * GCP.queryPerTib;

  // A 100-slot Enterprise reservation is the usual first commitment step.
  // Below the crossover on-demand wins; above it the reservation does.
  const reservation = 100 * 730 * GCP.slotHour;
  const useReservation = reservation < onDemand;
  const compute = Math.min(onDemand, reservation);

  // Untouched-for-90-days tables fall to long-term rates automatically.
  const storage = dataGb * (0.7 * GCP.storageActive + 0.3 * GCP.storageLongTerm);
  const raw = dataGb * 0.4 * GCP.objectStorage;

  const ingest = ingestGbPerMonth(input);
  const streaming =
    input.refresh === "realtime"
      ? Math.max(0, ingest - GCP.freeStreamingGb) * GCP.streamingPerGb
      : 0;

  const biUsers = input.analysts + input.creators;
  const bi = biUsers * GCP.biProPerUser;

  const platform: CostLine[] = [
    {
      key: "storage",
      label: { es: "Almacenamiento BigQuery", en: "BigQuery storage" },
      usd: round(storage),
      detail: {
        es: `${Math.round(dataGb)} GB · 70% activo, 30% largo plazo`,
        en: `${Math.round(dataGb)} GB · 70% active, 30% long-term`,
      },
    },
    {
      key: "raw",
      label: { es: "Cloud Storage (zona cruda)", en: "Cloud Storage (raw zone)" },
      usd: round(raw),
    },
    {
      key: "compute",
      label: { es: "Cómputo de consulta", en: "Query compute" },
      usd: round(compute),
      detail: useReservation
        ? {
            es: "Reserva de 100 slots — más barata que on-demand a este volumen",
            en: "100-slot reservation — cheaper than on-demand at this volume",
          }
        : {
            es: `${queryTib.toFixed(1)} TiB escaneados · on-demand, 1 TiB gratis`,
            en: `${queryTib.toFixed(1)} TiB scanned · on-demand, 1 TiB free`,
          },
    },
    {
      key: "orchestration",
      label: { es: "Orquestación (Composer)", en: "Orchestration (Composer)" },
      usd: GCP.orchestrationMonthly,
    },
  ];

  if (streaming > 0) {
    platform.push({
      key: "streaming",
      label: { es: "Ingesta en streaming", en: "Streaming ingest" },
      usd: round(streaming),
    });
  }

  const licenses: CostLine[] = [
    {
      key: "bi",
      label: { es: "Looker Studio Pro", en: "Looker Studio Pro" },
      usd: round(bi),
      detail: {
        es: `${biUsers} usuarios que editan · los ${input.viewers} lectores no pagan licencia`,
        en: `${biUsers} editing users · the ${input.viewers} viewers pay nothing`,
      },
    },
  ];

  return assemble("gcp", "Google Cloud", {
    es: "BigQuery + Cloud Storage + Looker Studio",
    en: "BigQuery + Cloud Storage + Looker Studio",
  }, platform, licenses, input, [
    useReservation
      ? {
          es: "A este volumen conviene reservar slots. El punto de cruce con on-demand está cerca — vale la pena medirlo con datos reales antes de comprometerse.",
          en: "At this volume, reserved slots win. The crossover with on-demand is close — measure it on real usage before committing.",
        }
      : {
          es: "On-demand sigue siendo más barato. Se paga por byte escaneado, así que particionar y agrupar tablas baja la factura directamente.",
          en: "On-demand still wins. You pay per byte scanned, so partitioning and clustering cut the bill directly.",
        },
    {
      es: "Looker Studio es gratis para lectura. Es la razón principal de que la columna de licencias sea baja aquí.",
      en: "Looker Studio is free to read. That is the main reason the licence column is low here.",
    },
  ]);
}

/* ---------------------------------------------------------------- AWS */

function awsCost(input: CostInputs, dataGb: number): StackCost {
  const queryTib = input.queryGbPerMonth / 1024;

  // Hours the warehouse is actually awake, by cadence.
  const awakeHours = input.refresh === "daily" ? 60 : input.refresh === "hourly" ? 200 : 730;
  // Rough conversion: scanning 1 TiB costs about 4 RPU-hours.
  const queryRpuHours = queryTib * 4;
  const rpuHours = AWS.minRpu * awakeHours + queryRpuHours;
  const compute = rpuHours * AWS.rpuHour;

  const lake = dataGb * AWS.objectStorage;
  // Only the modelled subset lands in the warehouse, not the whole lake.
  const warehouse = dataGb * 0.6 * AWS.warehouseStorage;

  const ingest = ingestGbPerMonth(input);
  const glueDpuHours = input.sources * runsPerMonth(input.refresh) * 0.15 + ingest / 20;
  const glue = glueDpuHours * AWS.gluePerDpuHour;

  const authors = input.analysts + input.creators;
  // SPICE holds the hot subset in memory; 10 GB per Author is included.
  const spiceGb = Math.max(0, dataGb * 0.1 - authors * AWS.spiceIncludedGbPerAuthor);
  const spice = spiceGb * AWS.spicePerGb;
  const bi = authors * AWS.biAuthorPerUser + input.viewers * AWS.biReaderPerUser + spice;

  const platform: CostLine[] = [
    { key: "lake", label: { es: "S3 (data lake)", en: "S3 (data lake)" }, usd: round(lake) },
    {
      key: "warehouse",
      label: { es: "Redshift Managed Storage", en: "Redshift Managed Storage" },
      usd: round(warehouse),
      detail: {
        es: "60% del volumen — sólo el subconjunto modelado",
        en: "60% of volume — the modelled subset only",
      },
    },
    {
      key: "compute",
      label: { es: "Redshift Serverless", en: "Redshift Serverless" },
      usd: round(compute),
      detail: {
        es: `${Math.round(rpuHours)} RPU-hora · base de ${AWS.minRpu} RPU`,
        en: `${Math.round(rpuHours)} RPU-hours · ${AWS.minRpu} RPU base`,
      },
    },
    {
      key: "glue",
      label: { es: "Glue (ETL)", en: "Glue (ETL)" },
      usd: round(glue),
      detail: {
        es: `${Math.round(glueDpuHours)} DPU-hora`,
        en: `${Math.round(glueDpuHours)} DPU-hours`,
      },
    },
    {
      key: "orchestration",
      label: { es: "Orquestación (MWAA)", en: "Orchestration (MWAA)" },
      usd: AWS.orchestrationMonthly,
    },
  ];

  const licenses: CostLine[] = [
    {
      key: "bi",
      label: { es: "QuickSight", en: "QuickSight" },
      usd: round(bi),
      detail: {
        es: `${authors} autores · ${input.viewers} lectores${spice > 0 ? ` · SPICE ${Math.round(spiceGb)} GB` : ""}`,
        en: `${authors} authors · ${input.viewers} readers${spice > 0 ? ` · ${Math.round(spiceGb)} GB SPICE` : ""}`,
      },
    },
  ];

  return assemble("aws", "AWS", {
    es: "S3 + Redshift Serverless + Glue + QuickSight",
    en: "S3 + Redshift Serverless + Glue + QuickSight",
  }, platform, licenses, input, [
    {
      es: "Redshift Serverless cobra por segundo mientras trabaja. Si las cargas están concentradas, es de los modelos más eficientes; si el warehouse queda encendido todo el día, deja de serlo.",
      en: "Redshift Serverless bills per second while working. Concentrated workloads make it very efficient; a warehouse left awake all day does not.",
    },
    {
      es: "QuickSight cobra a los lectores, a diferencia de Looker Studio. Con muchos lectores esa línea crece rápido.",
      en: "QuickSight charges readers, unlike Looker Studio. With many readers that line grows fast.",
    },
  ]);
}

/* -------------------------------------------------------------- AZURE */

/**
 * Fabric capacity sizing. Capacity Units cover every workload — ingest,
 * transform, warehouse and Power BI refresh all draw from the same pool —
 * so the estimate has to add them up rather than price them separately.
 */
export function sizeFabricCu(input: CostInputs, dataGb: number): number {
  const queryTib = input.queryGbPerMonth / 1024;
  const ingest = ingestGbPerMonth(input);
  const concurrency = input.analysts + input.creators + input.viewers / 10;
  return 2 + queryTib * 1.5 + ingest / 200 + concurrency / 8 + dataGb / 2000;
}

function snapToSku(cuNeeded: number) {
  return (
    AZURE.fabricSkus.find((sku) => sku.cu >= cuNeeded) ??
    AZURE.fabricSkus[AZURE.fabricSkus.length - 1]
  );
}

function azureCost(input: CostInputs, dataGb: number): StackCost {
  const cuNeeded = sizeFabricCu(input, dataGb);
  const fitted = snapToSku(cuNeeded);
  const allUsers = input.viewers + input.analysts + input.creators;
  const editors = input.analysts + input.creators;

  // The F64 cliff. Below F64 every single viewer needs a paid Power BI
  // licence; at F64 and above they need none. That makes a bigger capacity
  // genuinely cheaper past a certain headcount, which is the opposite of
  // what a linear cost model would predict.
  const smallOption = fitted.monthly + allUsers * AZURE.powerBiPro;
  const f64 = AZURE.fabricSkus.find((s) => s.cu === AZURE.freeViewerThresholdCu)!;
  const f64Option = f64.monthly + editors * AZURE.powerBiPro;

  const jumpToF64 = fitted.cu < AZURE.freeViewerThresholdCu && f64Option < smallOption;
  const sku = jumpToF64 ? f64 : fitted;
  const paidSeats = sku.cu >= AZURE.freeViewerThresholdCu ? editors : allUsers;

  const storage = dataGb * AZURE.storage;
  const licenses = paidSeats * AZURE.powerBiPro;

  const platform: CostLine[] = [
    {
      key: "capacity",
      label: { es: `Capacidad Fabric F${sku.cu}`, en: `Fabric F${sku.cu} capacity` },
      usd: round(sku.monthly),
      detail: {
        es: `Estimado ${cuNeeded.toFixed(1)} CU · reservando a 1 año baja a ${Math.round(sku.monthly * (1 - AZURE.reservationDiscount)).toLocaleString("es-MX")} USD`,
        en: `Estimated ${cuNeeded.toFixed(1)} CU · a 1-year reservation drops it to ${Math.round(sku.monthly * (1 - AZURE.reservationDiscount)).toLocaleString("en-US")} USD`,
      },
    },
    {
      key: "storage",
      label: { es: "OneLake", en: "OneLake" },
      usd: round(storage),
    },
  ];

  const licenseLines: CostLine[] = [
    {
      key: "powerbi",
      label: { es: "Power BI Pro", en: "Power BI Pro" },
      usd: round(licenses),
      detail:
        sku.cu >= AZURE.freeViewerThresholdCu
          ? {
              es: `${editors} editores · los ${input.viewers} lectores no pagan (F64+)`,
              en: `${editors} editors · the ${input.viewers} viewers pay nothing (F64+)`,
            }
          : {
              es: `${allUsers} usuarios · por debajo de F64 todo lector paga licencia`,
              en: `${allUsers} users · below F64 every viewer needs a licence`,
            },
    },
  ];

  const notes: L[] = [];
  if (jumpToF64) {
    notes.push({
      es: `Aquí pasa algo que conviene enseñar en pantalla: el tamaño técnico pedía F${fitted.cu}, pero subir a F64 sale más barato. A partir de F64 los lectores dejan de necesitar licencia, y con ${input.viewers} lectores eso más que compensa la capacidad extra.`,
      en: `Worth showing on screen: the technical fit was F${fitted.cu}, but jumping to F64 costs less. At F64+ viewers stop needing licences, and with ${input.viewers} viewers that more than pays for the extra capacity.`,
    });
  } else if (sku.cu < AZURE.freeViewerThresholdCu) {
    // Solve smallOption(v) = f64Option for viewers v. Editors pay Pro either
    // way, so the editors*price term appears on both sides and cancels —
    // adding it back here (an earlier version did) overstates the breakeven
    // by exactly the editor count. Regression-tested in costModel.test.ts.
    const breakeven = Math.ceil((f64.monthly - fitted.monthly) / AZURE.powerBiPro);
    notes.push({
      es: `Con esta plantilla conviene la capacidad pequeña. El punto de cruce está alrededor de ${breakeven} usuarios: por encima de eso, saltar a F64 y dejar de pagar licencias de lectura sale más barato.`,
      en: `At this headcount the small capacity wins. The crossover sits around ${breakeven} users: past that, jumping to F64 and dropping viewer licences is cheaper.`,
    });
  }
  notes.push({
    es: "Fabric cobra una sola bolsa de cómputo para ingesta, transformación, warehouse y refresco de Power BI. Simplifica la factura pero hace que un proceso mal escrito compita con los tableros.",
    en: "Fabric bills one compute pool for ingest, transform, warehouse and Power BI refresh. It simplifies the invoice but lets one bad job starve the dashboards.",
  });

  return assemble("azure", "Microsoft Azure", {
    es: "Microsoft Fabric + OneLake + Power BI",
    en: "Microsoft Fabric + OneLake + Power BI",
  }, platform, licenseLines, input, notes);
}

/* ---------------------------------------------------------------- OSS */

function ossCost(input: CostInputs, dataGb: number): StackCost {
  // Postgres serves the hot subset; the bulk lives in object storage with a
  // query engine over it. Putting a real warehouse workload in Postgres is
  // the most common way this stack goes wrong.
  const hotGb = Math.min(dataGb * 0.15, OSS.postgresCeilingGb);
  const lakeGb = Math.max(0, dataGb - hotGb);

  const targetRam = Math.max(1, hotGb / 12);
  const tier =
    OSS.computeTiers.find((t) => t.ramGb >= targetRam) ??
    OSS.computeTiers[OSS.computeTiers.length - 1];

  const compute = Math.max(0, tier.monthly - OSS.computeCredit);
  const dbStorage = Math.max(0, hotGb - OSS.dbStorageIncludedGb) * OSS.dbStorage;
  const lake = lakeGb * OSS.objectStorage;

  const platform: CostLine[] = [
    { key: "base", label: { es: "Supabase Pro", en: "Supabase Pro" }, usd: OSS.proBase },
    {
      key: "compute",
      label: { es: `Cómputo Postgres (${tier.label})`, en: `Postgres compute (${tier.label})` },
      usd: round(compute),
      detail: {
        es: `${tier.ramGb} GB RAM para ~${Math.round(hotGb)} GB calientes · crédito de $10 aplicado`,
        en: `${tier.ramGb} GB RAM for ~${Math.round(hotGb)} GB hot · $10 credit applied`,
      },
    },
    { key: "dbStorage", label: { es: "Disco Postgres", en: "Postgres disk" }, usd: round(dbStorage) },
    {
      key: "lake",
      label: { es: "Object storage (lago)", en: "Object storage (lake)" },
      usd: round(lake),
      detail: {
        es: `${Math.round(lakeGb)} GB fuera de Postgres`,
        en: `${Math.round(lakeGb)} GB outside Postgres`,
      },
    },
    {
      key: "engine",
      label: { es: "Motor de consulta (DuckDB/ClickHouse)", en: "Query engine (DuckDB/ClickHouse)" },
      usd: OSS.queryEngineVmMonthly,
    },
    { key: "airbyte", label: { es: "Airbyte autoalojado", en: "Self-hosted Airbyte" }, usd: OSS.airbyteVmMonthly },
    { key: "metabase", label: { es: "Metabase autoalojado", en: "Self-hosted Metabase" }, usd: OSS.metabaseVmMonthly },
  ];

  const licenses: CostLine[] = [
    {
      key: "bi",
      label: { es: "Licencias de BI", en: "BI licences" },
      usd: 0,
      detail: {
        es: "Metabase y dbt Core son gratis sin importar cuántos usuarios haya",
        en: "Metabase and dbt Core are free regardless of user count",
      },
    },
  ];

  const notes: L[] = [
    {
      es: "Cero licencias por usuario: es la ventaja estructural de esta columna y crece con la plantilla.",
      en: "Zero per-user licences: the structural advantage of this column, and it grows with headcount.",
    },
    {
      es: "El costo real está en la línea de operación, no en la de plataforma. Si esa línea se ignora, esta columna parece gratis y no lo es.",
      en: "The real cost sits in the ops line, not the platform line. Ignore it and this column looks free, which it is not.",
    },
  ];

  if (dataGb > OSS.postgresCeilingGb * 4) {
    notes.push({
      es: "A este volumen la pila abierta deja de ser un atajo: requiere un equipo que sepa operar el motor de consulta y el lago. Sin esa capacidad instalada, no la recomendaríamos.",
      en: "At this volume the open stack stops being a shortcut: it needs a team that can operate the query engine and the lake. Without that capability in-house, we would not recommend it.",
    });
  }

  return assemble("oss", "Open source", {
    es: "Supabase + Airbyte + dbt + Metabase",
    en: "Supabase + Airbyte + dbt + Metabase",
  }, platform, licenses, input, notes);
}

/* ------------------------------------------------------------ assembly */

function assemble(
  id: StackId,
  name: string,
  shape: L,
  platform: CostLine[],
  licenses: CostLine[],
  input: CostInputs,
  notes: L[],
): StackCost {
  const opsHours = OPS_HOURS[id];
  const opsUsd = input.includeOps ? opsHours * input.opsHourlyRate : 0;
  const ops: CostLine[] = [
    {
      key: "ops",
      label: { es: "Operación y mantenimiento", en: "Operations and maintenance" },
      usd: round(opsUsd),
      detail: {
        es: `${opsHours} h/mes estimadas × ${input.opsHourlyRate} USD`,
        en: `${opsHours} h/month estimated × ${input.opsHourlyRate} USD`,
      },
    },
  ];

  const sum = (lines: CostLine[]) => round(lines.reduce((a, l) => a + l.usd, 0));
  const platformTotal = sum(platform);
  const licenseTotal = sum(licenses);
  const opsTotal = sum(ops);

  return {
    id,
    name,
    shape,
    groups: { platform, licenses, ops },
    platform: platformTotal,
    licenses: licenseTotal,
    ops: opsTotal,
    total: round(platformTotal + licenseTotal + opsTotal),
    notes,
  };
}

/** Every stack priced against the same inputs, cheapest first. */
export function estimateAll(input: CostInputs, dataGb = input.dataGb): StackCost[] {
  return [
    ossCost(input, dataGb),
    gcpCost(input, dataGb),
    awsCost(input, dataGb),
    azureCost(input, dataGb),
  ];
}

/* ------------------------------------------- portable engines (layer) */

export type HostCloud = "gcp" | "aws" | "azure";
export type EngineId = "native" | "snowflake" | "databricks";

export interface EngineCost {
  id: EngineId;
  name: string;
  /** What the engine itself charges: compute plus its own storage. */
  engineUsd: number;
  /** What the host cloud still charges underneath it. */
  hostUsd: number;
  total: number;
  lines: CostLine[];
  note: L;
}

const HOST_LABEL: Record<HostCloud, string> = {
  gcp: "Google Cloud",
  aws: "AWS",
  azure: "Microsoft Azure",
};

const HOST_OBJECT_RATE: Record<HostCloud, number> = {
  gcp: GCP.objectStorage,
  aws: AWS.objectStorage,
  azure: AZURE.storage,
};

const HOST_ORCHESTRATION: Record<HostCloud, number> = {
  gcp: GCP.orchestrationMonthly,
  aws: AWS.orchestrationMonthly,
  // Fabric's own capacity covers orchestration; an F2 is the realistic floor.
  azure: AZURE.fabricSkus[0].monthly,
};

/** Hours the warehouse is awake, by cadence. Shared by both engines. */
function awakeHours(refresh: Refresh): number {
  return refresh === "daily" ? 60 : refresh === "hourly" ? 200 : 730;
}

/** Snowflake warehouse size, snapped to the doubling ladder. */
export function sizeSnowflakeWarehouse(dataGb: number, concurrency: number) {
  const needed = 1 + dataGb / 2000 + concurrency / 12;
  return (
    SNOWFLAKE.warehouseSizes.find((w) => w.creditsPerHour >= needed) ??
    SNOWFLAKE.warehouseSizes[SNOWFLAKE.warehouseSizes.length - 1]
  );
}

function snowflakeEngine(input: CostInputs, dataGb: number, host: HostCloud): EngineCost {
  const queryTib = input.queryGbPerMonth / 1024;
  const concurrency = input.analysts + input.creators + input.viewers / 10;
  const warehouse = sizeSnowflakeWarehouse(dataGb, concurrency);
  const hours = awakeHours(input.refresh);

  const credits = warehouse.creditsPerHour * hours + queryTib * SNOWFLAKE.creditsPerTibScanned;
  const compute = credits * SNOWFLAKE.creditEnterprise;
  const storage = (dataGb / 1024) * SNOWFLAKE.storagePerTb;

  // Raw landing zone stays on the host; Snowflake holds the modelled copy.
  const hostStorage = dataGb * 0.4 * HOST_OBJECT_RATE[host];
  const orchestration = HOST_ORCHESTRATION[host];

  const lines: CostLine[] = [
    {
      key: "compute",
      label: { es: "Cómputo Snowflake", en: "Snowflake compute" },
      usd: round(compute),
      detail: {
        es: `Warehouse ${warehouse.name} · ${Math.round(credits)} créditos × $${SNOWFLAKE.creditEnterprise} (Enterprise)`,
        en: `${warehouse.name} warehouse · ${Math.round(credits)} credits × $${SNOWFLAKE.creditEnterprise} (Enterprise)`,
      },
    },
    {
      key: "storage",
      label: { es: "Almacenamiento Snowflake", en: "Snowflake storage" },
      usd: round(storage),
      detail: {
        es: `${(dataGb / 1024).toFixed(1)} TB × $${SNOWFLAKE.storagePerTb} (tarifa de capacidad)`,
        en: `${(dataGb / 1024).toFixed(1)} TB × $${SNOWFLAKE.storagePerTb} (capacity rate)`,
      },
    },
    {
      key: "hostStorage",
      label: { es: `Object storage en ${HOST_LABEL[host]}`, en: `Object storage on ${HOST_LABEL[host]}` },
      usd: round(hostStorage),
    },
    {
      key: "orchestration",
      label: { es: "Orquestación en la nube anfitriona", en: "Orchestration on the host cloud" },
      usd: round(orchestration),
    },
  ];

  return {
    id: "snowflake",
    name: "Snowflake",
    engineUsd: round(compute + storage),
    hostUsd: round(hostStorage + orchestration),
    total: round(compute + storage + hostStorage + orchestration),
    lines,
    note: {
      es: "Cobra por segundo mientras el warehouse está encendido, no por dato leído. El auto-suspend es la palanca: bajarlo de 10 a 1 minuto suele recortar la factura sin que nadie lo note.",
      en: "Bills per second while the warehouse is awake, not per byte read. Auto-suspend is the lever: dropping it from 10 minutes to 1 usually cuts the bill without anyone noticing.",
    },
  };
}

/**
 * Databricks SQL warehouse size, snapped to the published ladder.
 *
 * The base has to sit below the smallest tier's 4 DBU/hour, or 2X-Small
 * becomes unreachable and every workload — including a 100 GB one with three
 * analysts — gets sized up a notch it does not need.
 */
export function sizeDatabricksWarehouse(dataGb: number, concurrency: number) {
  const needed = 2 + dataGb / 500 + concurrency / 3;
  return (
    DATABRICKS.sqlWarehouseSizes.find((w) => w.dbuPerHour >= needed) ??
    DATABRICKS.sqlWarehouseSizes[DATABRICKS.sqlWarehouseSizes.length - 1]
  );
}

function databricksEngine(input: CostInputs, dataGb: number, host: HostCloud): EngineCost {
  const queryTib = input.queryGbPerMonth / 1024;
  const ingestTb = ingestGbPerMonth(input) / 1024;
  const concurrency = input.analysts + input.creators + input.viewers / 10;
  const hours = awakeHours(input.refresh);

  // The warehouse costs its size for every hour it is awake, plus a marginal
  // amount for what it actually scans. Pricing only the marginal part is the
  // classic way these estimates come out 100x too low.
  const warehouse = sizeDatabricksWarehouse(dataGb, concurrency);
  const sqlDbus = warehouse.dbuPerHour * hours + queryTib * DATABRICKS.dbuPerTibScanned;
  const sqlCost = sqlDbus * DATABRICKS.sqlServerlessDbu;

  // Scheduled ETL on jobs compute, the cheapest DBU tier. Small pipelines are
  // bound by the per-run minimum rather than by data volume.
  const runs = runsPerMonth(input.refresh);
  const jobDbus = Math.max(
    ingestTb * DATABRICKS.dbuPerTbProcessed,
    runs * DATABRICKS.minJobDbuPerRun,
  );
  const jobCost = jobDbus * DATABRICKS.jobsDbu;

  // Delta tables live directly on the host's object storage — no separate
  // storage markup, which is the structural difference against Snowflake.
  const hostStorage = dataGb * HOST_OBJECT_RATE[host];
  const orchestration = HOST_ORCHESTRATION[host];

  const lines: CostLine[] = [
    {
      key: "sql",
      label: { es: "Databricks SQL Serverless", en: "Databricks SQL Serverless" },
      usd: round(sqlCost),
      detail: {
        es: `Warehouse ${warehouse.name} · ${Math.round(sqlDbus)} DBU × $${DATABRICKS.sqlServerlessDbu} · incluye el cómputo subyacente`,
        en: `${warehouse.name} warehouse · ${Math.round(sqlDbus)} DBU × $${DATABRICKS.sqlServerlessDbu} · underlying compute included`,
      },
    },
    {
      key: "jobs",
      label: { es: "Jobs Compute (ETL)", en: "Jobs Compute (ETL)" },
      usd: round(jobCost),
      detail: {
        es: `${Math.round(jobDbus)} DBU × $${DATABRICKS.jobsDbu} · 3-4× más barato que un cluster interactivo`,
        en: `${Math.round(jobDbus)} DBU × $${DATABRICKS.jobsDbu} · 3-4× cheaper than an interactive cluster`,
      },
    },
    {
      key: "hostStorage",
      label: { es: `Delta Lake sobre ${HOST_LABEL[host]}`, en: `Delta Lake on ${HOST_LABEL[host]}` },
      usd: round(hostStorage),
      detail: {
        es: "Sin sobreprecio de almacenamiento: los datos viven en tu propio object storage",
        en: "No storage markup: the data lives in your own object storage",
      },
    },
    {
      key: "orchestration",
      label: { es: "Orquestación en la nube anfitriona", en: "Orchestration on the host cloud" },
      usd: round(orchestration),
    },
  ];

  return {
    id: "databricks",
    name: "Databricks",
    engineUsd: round(sqlCost + jobCost),
    hostUsd: round(hostStorage + orchestration),
    total: round(sqlCost + jobCost + hostStorage + orchestration),
    lines,
    note: {
      es: "El error caro aquí es correr pipelines de producción en clusters interactivos: son 3-4× el costo por el mismo trabajo. En AWS y GCP además llegan dos facturas, la de Databricks y la de la nube.",
      en: "The expensive mistake here is running production pipelines on interactive clusters: 3-4× the cost for the same work. On AWS and GCP you also get two invoices, one from Databricks and one from the cloud.",
    },
  };
}

/** The host's own engine, pulled from the full stack estimate for comparison. */
function nativeEngine(input: CostInputs, dataGb: number, host: HostCloud): EngineCost {
  const stack = estimateAll(input, dataGb).find((s) => s.id === host)!;
  // Licences and ops are identical across engines, so compare platform only.
  const lines = stack.groups.platform;
  const total = stack.platform;

  const names: Record<HostCloud, string> = {
    gcp: "BigQuery",
    aws: "Redshift",
    azure: "Fabric",
  };

  return {
    id: "native",
    name: names[host],
    engineUsd: total,
    hostUsd: 0,
    total,
    lines,
    note: {
      es: "El motor nativo de la nube anfitriona. Integración más simple y una sola factura, a cambio de quedar amarrado a ese proveedor.",
      en: "The host cloud's own engine. Simpler integration and a single invoice, at the price of being tied to that vendor.",
    },
  };
}

/**
 * The same workload on one host cloud, with three interchangeable engines.
 * Licences and operations are excluded on purpose: they do not change with
 * the engine, so including them would only blur the comparison.
 */
export function estimateEngines(
  input: CostInputs,
  dataGb: number,
  host: HostCloud,
): EngineCost[] {
  return [
    nativeEngine(input, dataGb, host),
    snowflakeEngine(input, dataGb, host),
    databricksEngine(input, dataGb, host),
  ];
}

/* --------------------------------------------------------- migration */

// Widened from `typeof MIGRATION.dayRates`, which — being `as const` —
// would otherwise type each field as its literal default (e.g. `1400`) and
// reject any other number, including a value typed into the rate input.
export type MigrationRates = Record<MigrationRole, number>;
export type MigrationCategory = "technical" | "process";

export interface MigrationLine {
  label: L;
  role: L;
  roleKey: MigrationRole;
  category: MigrationCategory;
  days: number;
  rate: number;
  cost: number;
}

export interface MigrationEstimate {
  days: number;
  cost: number;
  low: number;
  high: number;
  lines: MigrationLine[];
  /** Same lines, split by what they buy — technical delivery vs. adoption. */
  technical: MigrationLine[];
  process: MigrationLine[];
}

const ROLE_LABEL: Record<MigrationRole, L> = {
  architect: { es: "Arquitecto / líder técnico", en: "Architect / tech lead" },
  engineer: { es: "Ingeniero de datos", en: "Data engineer" },
  analyst: { es: "Analista BI", en: "BI analyst" },
};

/**
 * One-time cost to land on any of these platforms, priced by who actually
 * does each piece of work rather than one flat day rate for everyone.
 *
 * A project is gente + procesos + tecnología, not just "cloud bill + a pile
 * of engineering days." This function prices the "gente" building the
 * "tecnología" (technical delivery: discovery, integration, backfill,
 * report rebuild) AND the "procesos" that make it actually get adopted
 * (governance/security setup, change management and training, and the PM
 * overhead of coordinating all of it). Skipping the process lines is the
 * most common way a migration estimate comes in low — enterprise data
 * projects commonly spend 15-25% of total effort there.
 *
 * Quoted as a range because a point estimate for migration work is always
 * wrong.
 */
export function estimateMigration(
  input: CostInputs,
  rates: MigrationRates = MIGRATION.dayRates,
): MigrationEstimate {
  const volumeDays = Math.min(
    MIGRATION.maxVolumeDays,
    (input.dataGb / 1024) * MIGRATION.volumeDaysPerTb,
  );
  const sourceDays = input.sources * MIGRATION.perSourceDays;
  const reportDays = input.analysts * MIGRATION.perAnalystDays;
  const totalUsers = input.viewers + input.analysts + input.creators;

  const governanceDays =
    MIGRATION.governance.baseDays + input.sources * MIGRATION.governance.daysPerSource;
  const trainingDays = Math.min(
    MIGRATION.training.maxDays,
    MIGRATION.training.baseDays + totalUsers / MIGRATION.training.usersPerDay,
  );

  const technicalRaw: { label: L; roleKey: MigrationRole; days: number }[] = [
    {
      label: { es: "Descubrimiento y arquitectura", en: "Discovery and architecture" },
      roleKey: "architect",
      days: MIGRATION.discoveryDays,
    },
    {
      label: { es: `Integrar ${input.sources} fuentes`, en: `Integrate ${input.sources} sources` },
      roleKey: "engineer",
      days: round(sourceDays),
    },
    {
      label: { es: "Backfill histórico y conciliación", en: "History backfill and reconciliation" },
      roleKey: "engineer",
      days: round(volumeDays),
    },
    {
      label: { es: "Reconstruir reportes y capa semántica", en: "Rebuild reports and semantic layer" },
      roleKey: "analyst",
      days: round(reportDays),
    },
  ];

  const processRaw: { label: L; roleKey: MigrationRole; days: number }[] = [
    {
      label: { es: "Gobernanza y seguridad", en: "Governance and security" },
      roleKey: "architect",
      days: round(governanceDays),
    },
    {
      label: { es: "Gestión del cambio y capacitación", en: "Change management and training" },
      roleKey: "analyst",
      days: round(trainingDays),
    },
  ];

  // PM/coordination is priced last, as a share of every other line's days —
  // it scales with the size of the whole engagement, not with any one task.
  const preOverheadDays = [...technicalRaw, ...processRaw].reduce((a, l) => a + l.days, 0);
  processRaw.push({
    label: { es: "Gestión de proyecto y coordinación", en: "Project management and coordination" },
    roleKey: "architect",
    days: round(preOverheadDays * MIGRATION.pmOverheadPct),
  });

  const cost = (line: { roleKey: MigrationRole; days: number }) =>
    round(line.days * rates[line.roleKey]);

  const technical: MigrationLine[] = technicalRaw.map((line) => ({
    ...line,
    category: "technical" as const,
    role: ROLE_LABEL[line.roleKey],
    rate: rates[line.roleKey],
    cost: cost(line),
  }));
  const process: MigrationLine[] = processRaw.map((line) => ({
    ...line,
    category: "process" as const,
    role: ROLE_LABEL[line.roleKey],
    rate: rates[line.roleKey],
    cost: cost(line),
  }));

  const lines = [...technical, ...process];
  const days = round(lines.reduce((a, l) => a + l.days, 0));
  const totalCost = round(lines.reduce((a, l) => a + l.cost, 0));
  return {
    days,
    cost: totalCost,
    low: Math.round(totalCost * 0.8),
    high: Math.round(totalCost * 1.4),
    lines,
    technical,
    process,
  };
}

/* ------------------------------------------ combined engine matrix */

/**
 * All three engines on all three host clouds, for a side-by-side comparative
 * rather than one host at a time behind a toggle.
 */
export function estimateEngineMatrix(
  input: CostInputs,
  dataGb: number,
): { host: HostCloud; label: string; engines: EngineCost[] }[] {
  return (["gcp", "aws", "azure"] as const).map((host) => ({
    host,
    label: HOST_LABEL[host],
    engines: estimateEngines(input, dataGb, host),
  }));
}
