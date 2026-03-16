/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];
const LAST_RUN_PATH = path.resolve(
  process.cwd(),
  "scripts",
  "import-shop-acf.last-run.json",
);

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envRaw = fs.readFileSync(envPath, "utf8");
  const lines = envRaw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIdx = trimmed.indexOf("=");
    if (separatorIdx < 1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIdx).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmed.slice(separatorIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Add them to .env before running rollback.`,
    );
  }
}

function makeAuthHeader() {
  const raw = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function deleteByEndpoint(endpoint, id, authHeader) {
  const response = await fetch(`${endpoint}/${id}?force=true`, {
    method: "DELETE",
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed for ${endpoint}/${id}: ${errorText}`);
  }
}

async function main() {
  loadEnvFile();
  validateEnv();

  if (!fs.existsSync(LAST_RUN_PATH)) {
    throw new Error(
      `Rollback file not found: ${LAST_RUN_PATH}. Run import first to generate rollback data.`,
    );
  }

  const runData = JSON.parse(fs.readFileSync(LAST_RUN_PATH, "utf8"));
  const postIds = Array.isArray(runData.createdPostIds)
    ? runData.createdPostIds
    : [];
  const mediaIds = Array.isArray(runData.createdMediaIds)
    ? runData.createdMediaIds
    : [];

  if (!postIds.length && !mediaIds.length) {
    console.log("Nothing to rollback.");
    return;
  }

  const wpBaseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  const authHeader = makeAuthHeader();

  console.log(
    `Starting rollback. Posts: ${postIds.length}, Media: ${mediaIds.length}`,
  );

  let deletedPosts = 0;
  for (let i = 0; i < postIds.length; i += 1) {
    const postId = postIds[i];
    try {
      await deleteByEndpoint(
        `${wpBaseUrl}/wp-json/wp/v2/shop`,
        postId,
        authHeader,
      );
      deletedPosts += 1;
      console.log(
        `[Post ${i + 1}/${postIds.length}] Deleted shop ID ${postId}`,
      );
    } catch (error) {
      console.error(
        `[Post ${i + 1}/${postIds.length}] Failed shop ID ${postId}`,
      );
      console.error(error.message);
    }
  }

  let deletedMedia = 0;
  for (let i = 0; i < mediaIds.length; i += 1) {
    const mediaId = mediaIds[i];
    try {
      await deleteByEndpoint(
        `${wpBaseUrl}/wp-json/wp/v2/media`,
        mediaId,
        authHeader,
      );
      deletedMedia += 1;
      console.log(
        `[Media ${i + 1}/${mediaIds.length}] Deleted media ID ${mediaId}`,
      );
    } catch (error) {
      console.error(
        `[Media ${i + 1}/${mediaIds.length}] Failed media ID ${mediaId}`,
      );
      console.error(error.message);
    }
  }

  console.log(
    `Rollback finished. Deleted posts: ${deletedPosts}/${postIds.length}`,
  );
  console.log(
    `Rollback finished. Deleted media: ${deletedMedia}/${mediaIds.length}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
