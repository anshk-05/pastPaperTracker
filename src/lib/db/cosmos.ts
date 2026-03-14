import "server-only";
import { CosmosClient, type Container } from "@azure/cosmos";
import { getAuthSettings } from "@/lib/auth";
import { TrackerState } from "@/lib/types";

type TrackerStateDocument = TrackerState & {
  id: string;
  userId: string;
  type: "trackerState";
  updatedAt: string;
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

export async function readTrackerStateFromCosmos() {
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
      progressByPaperId: response.resource.progressByPaperId ?? {},
      removedPaperIds: response.resource.removedPaperIds ?? [],
      customPapers: response.resource.customPapers ?? [],
      studySessions: response.resource.studySessions ?? [],
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404
    ) {
      return null;
    }

    throw error;
  }
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
