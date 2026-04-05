import "server-only";
import { CosmosClient, type Container } from "@azure/cosmos";
import { getAuthSettings } from "@/lib/auth";
import { TrackerState } from "@/lib/types";

type TrackerStateDocument = TrackerState & {
  id: string;
  userId: string;
  type: "trackerState";
  updatedAt: string;
  _etag?: string;
};

export type TrackerStateRecord = {
  state: TrackerState;
  etag: string;
};

type CosmosSettings = {
  connectionString: string;
  databaseName: string;
  containerName: string;
};

const trackerDocumentId = "tracker-state";
let cachedContainerPromise: Promise<Container> | null = null;

function getCosmosSettings(): CosmosSettings {
  return {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING ?? "",
    databaseName: process.env.COSMOS_DB_DATABASE_NAME ?? "past-paper-tracker",
    containerName: process.env.COSMOS_DB_CONTAINER_NAME ?? "tracker-state",
  };
}

export function isCosmosConfigured() {
  const settings = getCosmosSettings();
  return Boolean(settings.connectionString && settings.databaseName && settings.containerName);
}

export function getCosmosDebugSettings() {
  const settings = getCosmosSettings();

  return {
    configured: isCosmosConfigured(),
    databaseName: settings.databaseName,
    containerName: settings.containerName,
    connectionStringPreview: settings.connectionString
      ? `${settings.connectionString.slice(0, 30)}...`
      : "",
  };
}

async function createContainer() {
  const settings = getCosmosSettings();

  if (!isCosmosConfigured()) {
    throw new Error("Cosmos DB is not configured.");
  }

  const client = new CosmosClient(settings.connectionString);
  const { database } = await client.databases.createIfNotExists({
    id: settings.databaseName,
  });
  const { container } = await database.containers.createIfNotExists({
    id: settings.containerName,
    partitionKey: {
      paths: ["/userId"],
    },
  });

  return container;
}

async function getContainer() {
  if (!cachedContainerPromise) {
    cachedContainerPromise = createContainer().catch((error) => {
      cachedContainerPromise = null;
      throw error;
    });
  }

  return cachedContainerPromise;
}

function getTrackerUserId() {
  const { username } = getAuthSettings();
  return username || "default-user";
}

function buildDocument(state: TrackerState): TrackerStateDocument {
  return {
    id: trackerDocumentId,
    userId: getTrackerUserId(),
    type: "trackerState",
    updatedAt: new Date().toISOString(),
    progressByPaperId: state.progressByPaperId,
    removedPaperIds: state.removedPaperIds,
    customPapers: state.customPapers,
    studySessions: state.studySessions,
  };
}

function normaliseTrackerState(
  state: Partial<TrackerState> | null | undefined,
): TrackerState {
  return {
    progressByPaperId: state?.progressByPaperId ?? {},
    removedPaperIds: state?.removedPaperIds ?? [],
    customPapers: state?.customPapers ?? [],
    studySessions: state?.studySessions ?? [],
  };
}

function getErrorStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if ("code" in error && typeof error.code === "number") {
    return error.code;
  }

  return null;
}

export function isCosmosConcurrencyError(error: unknown) {
  const statusCode = getErrorStatusCode(error);
  return statusCode === 409 || statusCode === 412;
}

export async function readTrackerStateRecordFromCosmos(): Promise<TrackerStateRecord | null> {
  const container = await getContainer();
  const userId = getTrackerUserId();

  try {
    const response = await container
      .item(trackerDocumentId, userId)
      .read<TrackerStateDocument>();

    if (!response.resource) {
      return null;
    }

    return {
      state: normaliseTrackerState(response.resource),
      etag: response.resource._etag,
    };
  } catch (error) {
    if (getErrorStatusCode(error) === 404) {
      return null;
    }

    throw error;
  }
}

export async function readTrackerStateFromCosmos() {
  const record = await readTrackerStateRecordFromCosmos();
  return record?.state ?? null;
}

export async function createTrackerStateInCosmos(state: TrackerState) {
  const container = await getContainer();
  await container.items.create(buildDocument(state));
}

export async function replaceTrackerStateInCosmos(
  state: TrackerState,
  etag: string,
) {
  const container = await getContainer();
  const userId = getTrackerUserId();

  await container.item(trackerDocumentId, userId).replace(buildDocument(state), {
    accessCondition: {
      type: "IfMatch",
      condition: etag,
    },
  });
}

export async function writeTrackerStateToCosmos(state: TrackerState) {
  const container = await getContainer();
  await container.items.upsert(buildDocument(state));
}

export async function testCosmosConnection() {
  const container = await getContainer();
  const { resource } = await container.database.read();

  return {
    ok: true,
    databaseId: resource?.id,
    containerId: container.id,
  };
}
