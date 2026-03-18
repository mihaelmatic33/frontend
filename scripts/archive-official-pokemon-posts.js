/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];
const OFFICIAL_CATEGORY_NAMES = ["Pokemon Official", "Pokemon TCG Official"];

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
      `Missing environment variables: ${missing.join(", ")}. Add them to .env before running archive.`,
    );
  }
}

function authHeader() {
  const creds = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

async function wpFetch(pathname, options = {}) {
  const baseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/wp-json/wp/v2${pathname}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `WP request failed (${response.status}) ${pathname}: ${body}`,
    );
  }

  return response.json();
}

async function getCategoryIdByName(name) {
  const rows = await wpFetch(
    `/categories?search=${encodeURIComponent(name)}&per_page=50`,
    { method: "GET" },
  );

  return (rows || []).find(
    (row) => String(row?.name || "").toLowerCase() === name.toLowerCase(),
  )?.id;
}

async function fetchPostsByCategory(categoryId) {
  const collected = [];
  let page = 1;

  while (true) {
    const rows = await wpFetch(
      `/posts?categories=${categoryId}&per_page=100&page=${page}&status=publish`,
      { method: "GET" },
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      break;
    }

    collected.push(...rows);
    if (rows.length < 100) {
      break;
    }

    page += 1;
  }

  return collected;
}

async function archivePost(postId) {
  return wpFetch(`/posts/${postId}`, {
    method: "POST",
    body: JSON.stringify({ status: "draft" }),
  });
}

async function main() {
  loadEnvFile();
  validateEnv();

  let archived = 0;

  for (const categoryName of OFFICIAL_CATEGORY_NAMES) {
    const categoryId = await getCategoryIdByName(categoryName);
    if (!categoryId) {
      console.log(`Category not found: ${categoryName}`);
      continue;
    }

    const posts = await fetchPostsByCategory(categoryId);
    for (const post of posts) {
      await archivePost(post.id);
      archived += 1;
      console.log(`Archived: ${post.title.rendered}`);
    }
  }

  console.log(`Done. Archived ${archived} official Pokemon posts.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
