/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];
const HTTP_HEADERS = {
  "User-Agent": "PokemonThumbnailBackfill/1.0",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const CATEGORY_NAMES = ["Pokemon Official", "Pokemon TCG Official"];

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
      `Missing environment variables: ${missing.join(", ")}. Add them to .env before running backfill.`,
    );
  }
}

function toWpApiPath(pathname) {
  const base = process.env.WP_BASE_URL.replace(/\/$/, "");
  return `${base}/wp-json/wp/v2${pathname}`;
}

function getAuthHeader() {
  const token = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`,
  ).toString("base64");

  return `Basic ${token}`;
}

async function wpFetch(pathname, options = {}) {
  const response = await fetch(toWpApiPath(pathname), {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
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

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

function isLikelyNewsTitle(titleRaw) {
  const title = String(titleRaw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!title) return false;

  const blocked = [
    "log in",
    "login",
    "the official pokemon website",
    "pokemon home",
    "pokemon champions",
    "pokemon trading card game",
    "pokopia",
  ];

  return !blocked.some((entry) => title.includes(entry));
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=['\"]${escaped}['\"][^>]+content=['\"]([^'\"]+)['\"][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=['\"]([^'\"]+)['\"][^>]+(?:property|name)=['\"]${escaped}['\"][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1]);
    }
  }

  return "";
}

function absolutizeUrl(value, baseUrl) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBestArticleImage(html, baseUrl, titleRaw) {
  const imgRegex = /<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
  const title = normalizeText(titleRaw);
  const titleWords = title.split(" ").filter((word) => word.length > 3);
  const candidates = [];

  for (const match of html.matchAll(imgRegex)) {
    const tag = match[0] || "";
    const srcRaw = match[1] || "";
    const src = absolutizeUrl(srcRaw, baseUrl);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const alt = normalizeText(altMatch?.[1] || "");

    if (!src || src.endsWith(".svg")) {
      continue;
    }

    const srcNormalized = normalizeText(src);
    let score = 0;

    if (src.includes("pokemon.com/static-assets/content-assets")) {
      score += 4;
    }

    if (srcNormalized.includes("169") || srcNormalized.includes("hero")) {
      score += 5;
    }

    if (alt && title && (alt.includes(title) || title.includes(alt))) {
      score += 10;
    }

    const matchingWords = titleWords.filter((word) => alt.includes(word));
    score += matchingWords.length * 2;

    if (
      srcNormalized.includes("logo") ||
      srcNormalized.includes("icon") ||
      srcNormalized.includes("avatar") ||
      srcNormalized.includes("social") ||
      srcNormalized.includes("cookie")
    ) {
      score -= 8;
    }

    candidates.push({ src, score });
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0]?.score > 0 ? candidates[0].src : "";
}

function getImageExtension(url, contentType) {
  const byMime = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  const mime = String(contentType || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (byMime[mime]) {
    return byMime[mime];
  }

  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  } catch {
    return "jpg";
  }

  return "jpg";
}

async function uploadFeaturedImage(imageUrl, title) {
  if (!imageUrl) {
    return null;
  }

  try {
    const imgResponse = await fetch(imageUrl, {
      headers: { ...HTTP_HEADERS, Accept: "image/*,*/*;q=0.8" },
      redirect: "follow",
    });

    if (!imgResponse.ok) {
      return null;
    }

    const contentType = imgResponse.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return null;
    }

    const bytes = Buffer.from(await imgResponse.arrayBuffer());
    if (!bytes.length) {
      return null;
    }

    const extension = getImageExtension(imageUrl, contentType);
    const filename = `${toSlug(title) || "pokemon-news"}-${Date.now()}.${extension}`;

    const mediaResponse = await fetch(toWpApiPath("/media"), {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      body: bytes,
    });

    if (!mediaResponse.ok) {
      return null;
    }

    const media = await mediaResponse.json();
    return media?.id || null;
  } catch {
    return null;
  }
}

async function setPostFeaturedMedia(postId, mediaId) {
  if (!postId || !mediaId) {
    return;
  }

  await wpFetch(`/posts/${postId}`, {
    method: "POST",
    body: JSON.stringify({ featured_media: mediaId }),
  });
}

function extractFirstLinkFromContent(contentRaw) {
  const html = String(contentRaw || "");
  const match = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || "";
}

async function getArticleMeta(urlRaw, titleRaw = "") {
  if (!urlRaw) {
    return { articleUrl: "", imageUrl: "" };
  }

  try {
    const response = await fetch(urlRaw, {
      headers: HTTP_HEADERS,
      redirect: "follow",
    });

    if (!response.ok) {
      return { articleUrl: urlRaw, imageUrl: "" };
    }

    const html = await response.text();
    const ogImage = extractMetaContent(html, "og:image");
    const twitterImage = extractMetaContent(html, "twitter:image");
    const canonical =
      extractMetaContent(html, "og:url") || response.url || urlRaw;

    const articleImage = extractBestArticleImage(html, canonical, titleRaw);
    const imageUrl =
      articleImage || absolutizeUrl(ogImage || twitterImage, canonical);
    return { articleUrl: canonical, imageUrl };
  } catch {
    return { articleUrl: urlRaw, imageUrl: "" };
  }
}

async function getCategoryIdByName(name) {
  const rows = await wpFetch(
    `/categories?search=${encodeURIComponent(name)}&per_page=50`,
  );
  const exact = (rows || []).find(
    (item) => String(item?.name || "").toLowerCase() === name.toLowerCase(),
  );
  return exact?.id || null;
}

async function fetchPostsByCategory(categoryId) {
  const all = [];
  let page = 1;

  while (true) {
    const rows = await wpFetch(
      `/posts?categories=${categoryId}&_embed&per_page=100&page=${page}&orderby=date&order=desc`,
      { method: "GET" },
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      break;
    }

    all.push(...rows);
    if (rows.length < 100) {
      break;
    }

    page += 1;
  }

  return all;
}

async function updatePostThumbnail(post) {
  const title = decodeHtml(post?.title?.rendered || "Pokemon news");
  if (!isLikelyNewsTitle(title)) {
    return false;
  }

  const articleLink = extractFirstLinkFromContent(
    post?.content?.rendered || "",
  );
  const meta = await getArticleMeta(articleLink, title);

  const imageCandidates = [meta.imageUrl].filter(Boolean);

  for (const imageUrl of imageCandidates) {
    const mediaId = await uploadFeaturedImage(imageUrl, title);
    if (mediaId) {
      await setPostFeaturedMedia(post.id, mediaId);
      return true;
    }
  }

  return false;
}

async function run() {
  loadEnvFile();
  validateEnv();
  const forceReplace = process.argv.includes("--force");

  console.log(
    `Backfilling featured images for official Pokemon posts${forceReplace ? " (force mode)" : ""}...`,
  );

  const categoryIds = [];
  for (const categoryName of CATEGORY_NAMES) {
    const categoryId = await getCategoryIdByName(categoryName);
    if (categoryId) {
      categoryIds.push(categoryId);
    }
  }

  if (categoryIds.length === 0) {
    console.log("No official Pokemon categories found.");
    return;
  }

  let totalChecked = 0;
  let totalUpdated = 0;

  for (const categoryId of categoryIds) {
    const posts = await fetchPostsByCategory(categoryId);

    for (const post of posts) {
      totalChecked += 1;
      if (!forceReplace && post.featured_media) {
        continue;
      }

      try {
        const updated = await updatePostThumbnail(post);
        if (updated) {
          totalUpdated += 1;
          console.log(
            `Updated thumbnail: ${decodeHtml(post?.title?.rendered || "")}`,
          );
        } else {
          console.log(
            `No image found: ${decodeHtml(post?.title?.rendered || "")}`,
          );
        }
      } catch (error) {
        console.log(
          `Failed thumbnail update: ${decodeHtml(post?.title?.rendered || "")}`,
        );
        console.log(error.message || error);
      }
    }
  }

  console.log(`Done. Checked: ${totalChecked}. Updated: ${totalUpdated}.`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
