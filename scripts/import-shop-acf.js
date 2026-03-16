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
      `Missing environment variables: ${missing.join(", ")}. Add them to .env before running import.`,
    );
  }
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });

    return row;
  });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCategory(value) {
  const raw = (value || "").trim();

  const map = {
    Cards: "Trading Card Game(TCG)",
    "Trading Card Game": "Trading Card Game(TCG)",
    TCG: "Trading Card Game(TCG)",
    Mystery: "Mystery",
    Toys: "Toys",
    Accessories: "Accessories",
    "Video Games": "Video Games",
  };

  return map[raw] || raw;
}

function normalizeGradingCompany(value) {
  const raw = (value || "").trim();

  const map = {
    PSA: "PSA",
    TAG: "TAG",
    CGC: "CGC",
    Beckett: "BECKKET",
    BECKETT: "BECKKET",
    BECKKET: "BECKKET",
  };

  return map[raw] || raw;
}

function normalizeRarity(value) {
  const raw = (value || "").trim();

  const map = {
    Rare: "Rare",
    "Very rare": "Very rare",
    "Super rare": "Super rare",
    "Ultra Rare": "Ultra rare",
    "Ultra rare": "Ultra rare",
    "Hyper rare": "Hyper rare",
    "Illustration Rare": "Ilustration rare",
    "Ilustration rare": "Ilustration rare",
    "Secret rare": "Secret rare",
    "Secret Illustration Rare": "Secret Ilustration rare",
    "Secret Ilustration rare": "Secret Ilustration rare",
    Promo: "Super rare",
  };

  return map[raw] || "Rare";
}

function makeAuthHeader() {
  const raw = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function uploadImageToMedia(imageUrl, authHeader, wpBaseUrl) {
  if (!imageUrl) return null;

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    console.warn(`Image download failed: ${imageUrl}`);
    return null;
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const imageUrlObj = new URL(imageUrl);
  const fileNameFromPath =
    path.basename(imageUrlObj.pathname) || "product-image.png";
  const safeFileName = fileNameFromPath.includes(".")
    ? fileNameFromPath
    : `${fileNameFromPath}.png`;

  const mediaResponse = await fetch(`${wpBaseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
      "Content-Type": imageResponse.headers.get("content-type") || "image/png",
    },
    body: buffer,
  });

  if (!mediaResponse.ok) {
    const errorText = await mediaResponse.text();
    console.warn(`Media upload failed for ${imageUrl}: ${errorText}`);
    return null;
  }

  const mediaJson = await mediaResponse.json();
  return mediaJson?.id ?? null;
}

async function createShopPost(row, authHeader, wpBaseUrl) {
  const name = row["Name"] || "Untitled product";
  const imageUrl = row["Images"] || "";

  const imageId = await uploadImageToMedia(imageUrl, authHeader, wpBaseUrl);

  const payload = {
    title: name,
    status: "publish",
    acf: {
      article_name: name,
      price: toNumber(row["Regular price"]),
      categories: normalizeCategory(row["categories"]),
      product_description: row["Description"] || "",
      product_image: imageId,
      grading_company: normalizeGradingCompany(row["Meta:grading_company"]),
      grade: toNumber(row["Meta:grade"]),
      rarity: normalizeRarity(row["Meta:rarity"]),
    },
  };

  const response = await fetch(`${wpBaseUrl}/wp-json/wp/v2/shop`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Create shop failed for "${name}": ${errorText}`);
  }

  const json = await response.json();
  return {
    post: json,
    imageId,
  };
}

function writeRunLog(data) {
  fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function main() {
  loadEnvFile();
  validateEnv();

  const csvPathArg = process.argv[2];
  const limitArg = process.argv[3];

  if (!csvPathArg) {
    throw new Error(
      "Usage: node scripts/import-shop-acf.js <path-to-csv> [limit]",
    );
  }

  const absoluteCsvPath = path.resolve(process.cwd(), csvPathArg);
  if (!fs.existsSync(absoluteCsvPath)) {
    throw new Error(`CSV file not found: ${absoluteCsvPath}`);
  }

  const rawCsv = fs.readFileSync(absoluteCsvPath, "utf8");
  const allRows = parseCsv(rawCsv);
  const requestedLimit = Number.isFinite(Number(limitArg))
    ? Number(limitArg)
    : 40;
  const rows = allRows.slice(0, requestedLimit);

  if (!rows.length) {
    console.log("No rows found in CSV.");
    return;
  }

  const wpBaseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  const authHeader = makeAuthHeader();

  console.log(`Starting import for ${rows.length} items...`);

  let successCount = 0;
  const createdPostIds = [];
  const createdMediaIds = [];

  writeRunLog({
    startedAt: new Date().toISOString(),
    csvPath: absoluteCsvPath,
    requestedLimit,
    createdPostIds,
    createdMediaIds,
  });

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const label = row["Name"] || `row-${i + 1}`;

    try {
      const created = await createShopPost(row, authHeader, wpBaseUrl);
      successCount += 1;

      if (created.post?.id) {
        createdPostIds.push(created.post.id);
      }

      if (created.imageId) {
        createdMediaIds.push(created.imageId);
      }

      writeRunLog({
        startedAt: new Date().toISOString(),
        csvPath: absoluteCsvPath,
        requestedLimit,
        createdPostIds,
        createdMediaIds,
      });

      console.log(
        `[${i + 1}/${rows.length}] Imported: ${label} (ID: ${created.post.id})`,
      );
    } catch (error) {
      console.error(`[${i + 1}/${rows.length}] Failed: ${label}`);
      console.error(error.message);
    }
  }

  writeRunLog({
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    csvPath: absoluteCsvPath,
    requestedLimit,
    createdPostIds,
    createdMediaIds,
  });

  console.log(`Import finished. Successful: ${successCount}/${rows.length}`);
  console.log(`Rollback file saved to: ${LAST_RUN_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
