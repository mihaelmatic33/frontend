/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];
const HTTP_HEADERS = {
  "User-Agent": "PokemonNewsImporter/1.1",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const FEED_SOURCES = [
  {
    key: "pokemon-official",
    categoryName: "Pokemon Official",
    searchTag: "pokemon.com official news",
    feeds: [
      "https://www.pokemon.com/us/pokemon-news/rss",
      "https://www.pokemon.com/uk/pokemon-news/rss",
      "https://www.pokemon.com/us/rss",
      "https://news.google.com/rss/search?q=site:pokemon.com%20pokemon%20news&hl=en-US&gl=US&ceid=US:en",
    ],
  },
  {
    key: "pokemon-tcg-official",
    categoryName: "Pokemon TCG Official",
    searchTag: "pokemon tcg official",
    feeds: [
      "https://tcg.pokemon.com/en-us/rss",
      "https://tcg.pokemon.com/en-us/news/rss",
      "https://www.pokemon.com/us/pokemon-tcg/rss",
      "https://news.google.com/rss/search?q=site:tcg.pokemon.com%20pokemon%20tcg&hl=en-US&gl=US&ceid=US:en",
    ],
  },
];

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

function stripTags(value) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getXmlTag(xml, tagName) {
  const match = xml.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );
  return match ? decodeHtml(match[1]) : "";
}

function parseRssItems(xmlRaw) {
  const xml = String(xmlRaw || "");
  const items = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRegex) || [];

  for (const block of blocks) {
    const title = stripTags(getXmlTag(block, "title"));
    const link = stripTags(getXmlTag(block, "link"));
    const description = getXmlTag(block, "description");
    const pubDate = stripTags(getXmlTag(block, "pubDate"));
    const guid = stripTags(getXmlTag(block, "guid"));

    if (!title || !link) {
      continue;
    }

    items.push({
      title,
      link,
      description: stripTags(description),
      pubDate,
      guid,
    });
  }

  return items;
}

async function fetchFirstWorkingFeed(feedUrls) {
  for (const url of feedUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          ...HTTP_HEADERS,
          Accept:
            "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });

      if (!response.ok) {
        continue;
      }

      const body = await response.text();
      const parsed = parseRssItems(body);
      if (parsed.length > 0) {
        return { url, items: parsed };
      }
    } catch {
      continue;
    }
  }

  return { url: null, items: [] };
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

function getGoogleNewsTarget(urlRaw) {
  try {
    const url = new URL(urlRaw);
    if (!url.hostname.includes("news.google.com")) {
      return urlRaw;
    }

    const direct = url.searchParams.get("url");
    if (direct) {
      return direct;
    }

    return urlRaw;
  } catch {
    return urlRaw;
  }
}

async function resolveArticleUrl(urlRaw) {
  const candidate = getGoogleNewsTarget(urlRaw);
  try {
    const response = await fetch(candidate, {
      headers: HTTP_HEADERS,
      redirect: "follow",
    });

    return response.url || candidate;
  } catch {
    return candidate;
  }
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=['"]${escaped}['"][^>]+content=['"]([^'"]+)['"][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=['"]([^'"]+)['"][^>]+(?:property|name)=['"]${escaped}['"][^>]*>`,
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

  function isAllowedOfficialDomain(urlRaw) {
    try {
      const host = new URL(urlRaw).hostname.toLowerCase();
      return host.includes("pokemon.com") || host.includes("tcg.pokemon.com");
    } catch {
      return false;
    }
  }

  function isLikelyArticlePath(urlRaw) {
    try {
      const pathname = (new URL(urlRaw).pathname || "").toLowerCase();
      if (!pathname || pathname === "/") return false;

      const blockedFragments = [
        "/login",
        "/log-in",
        "/account",
        "/home",
        "/trainer",
        "/support",
        "/privacy",
        "/terms",
      ];

      if (blockedFragments.some((fragment) => pathname.includes(fragment))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  function isLikelyNewsTitle(titleRaw) {
    const title = String(titleRaw || "").toLowerCase();
    if (!title) return false;

    const blocked = [
      "log in",
      "login",
      "the official pokemon website",
      "pokemon home",
      "pokemon champions",
      "pokemon trading card game",
    ];

    return !blocked.some((entry) => title.includes(entry));
  }

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

async function getArticleMeta(urlRaw) {
  const finalUrl = await resolveArticleUrl(urlRaw);

  try {
    const response = await fetch(finalUrl, {
      headers: HTTP_HEADERS,
      redirect: "follow",
    });

    if (!response.ok) {
      return { articleUrl: finalUrl, imageUrl: "" };
    }

    const html = await response.text();
    const ogImage = extractMetaContent(html, "og:image");
    const twitterImage = extractMetaContent(html, "twitter:image");
    const canonical = extractMetaContent(html, "og:url") || finalUrl;

    const imageUrl = absolutizeUrl(ogImage || twitterImage, canonical);
    return { articleUrl: canonical, imageUrl };
  } catch {
    return { articleUrl: finalUrl, imageUrl: "" };
  }
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

async function ensureCategory(categoryName) {
  const existing = await wpFetch(
    `/categories?search=${encodeURIComponent(categoryName)}&per_page=50`,
    { method: "GET" },
  );

  const exact = (existing || []).find(
    (category) =>
      String(category.name || "").toLowerCase() === categoryName.toLowerCase(),
  );

  if (exact) {
    return exact.id;
  }

  const created = await wpFetch("/categories", {
    method: "POST",
    body: JSON.stringify({ name: categoryName }),
  });

  return created.id;
}

async function findPostBySlug(slug) {
  const rows = await wpFetch(
    `/posts?slug=${encodeURIComponent(slug)}&per_page=1`,
    {
      method: "GET",
    },
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0];
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

async function createOrUpdateNewsPost(item, source, categoryId) {
  const sourceSuffix = source.key === "pokemon-official" ? "pkmn" : "tcg";
  const slug = `${toSlug(item.title)}-${sourceSuffix}`;

  const meta = await getArticleMeta(item.link);
  const articleUrl = meta.articleUrl || item.link;

  if (!isAllowedOfficialDomain(articleUrl)) {
    return {
      created: false,
      updatedThumb: false,
      skipped: true,
      reason: "domain",
    };
  }

  if (!isLikelyArticlePath(articleUrl)) {
    return {
      created: false,
      updatedThumb: false,
      skipped: true,
      reason: "path",
    };
  }

  if (!isLikelyNewsTitle(item.title)) {
    return {
      created: false,
      updatedThumb: false,
      skipped: true,
      reason: "title",
    };
  }

  const existing = await findPostBySlug(slug);
  if (existing) {
    if (!existing.featured_media && meta.imageUrl) {
      const mediaId = await uploadFeaturedImage(meta.imageUrl, item.title);
      if (mediaId) {
        await setPostFeaturedMedia(existing.id, mediaId);
        return { created: false, updatedThumb: true, slug };
      }
    }

    return { created: false, updatedThumb: false, slug };
  }

  const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
  const validDate = publishedAt && !Number.isNaN(publishedAt.getTime());

  const excerpt = item.description || "Official Pokemon news update.";
  const content = [
    `<p>${excerpt}</p>`,
    `<p><strong>Source:</strong> ${source.categoryName}</p>`,
    `<p><strong>Original article:</strong> <a href="${articleUrl}" target="_blank" rel="noopener noreferrer">Read on official site</a></p>`,
    `<p style="display:none">${source.searchTag}</p>`,
  ].join("\n");

  const mediaId = await uploadFeaturedImage(meta.imageUrl, item.title);

  await wpFetch("/posts", {
    method: "POST",
    body: JSON.stringify({
      title: item.title,
      slug,
      status: "publish",
      content,
      excerpt,
      categories: [categoryId],
      ...(mediaId ? { featured_media: mediaId } : {}),
      ...(validDate ? { date: publishedAt.toISOString() } : {}),
    }),
  });

  return { created: true, updatedThumb: Boolean(mediaId), slug };
}

async function run() {
  loadEnvFile();
  validateEnv();

  const limitPerSource = Number(process.argv[2] || 8);
  console.log(
    `Importing official Pokemon news. Limit per source: ${limitPerSource}`,
  );

  let createdTotal = 0;
  let thumbUpdatedTotal = 0;

  for (const source of FEED_SOURCES) {
    const categoryId = await ensureCategory(source.categoryName);
    const { url, items } = await fetchFirstWorkingFeed(source.feeds);

    if (!url || items.length === 0) {
      console.log(`[${source.key}] No working feed found.`);
      continue;
    }

    console.log(`[${source.key}] Feed: ${url}`);
    const selectedItems = items.slice(0, limitPerSource);

    let createdForSource = 0;
    let thumbsUpdatedForSource = 0;

    for (const item of selectedItems) {
      try {
        const result = await createOrUpdateNewsPost(item, source, categoryId);
        if (result.skipped) {
          console.log(`[${source.key}] Skipped non-article: ${item.title}`);
        } else if (result.created) {
          createdForSource += 1;
          createdTotal += 1;
          console.log(`[${source.key}] Created: ${item.title}`);
        } else if (result.updatedThumb) {
          thumbsUpdatedForSource += 1;
          thumbUpdatedTotal += 1;
          console.log(`[${source.key}] Updated thumbnail: ${item.title}`);
        } else {
          console.log(`[${source.key}] Skipped existing: ${item.title}`);
        }
      } catch (error) {
        console.log(`[${source.key}] Failed: ${item.title}`);
        console.log(error.message);
      }
    }

    console.log(
      `[${source.key}] Done. Created ${createdForSource}/${selectedItems.length}, thumbnails updated ${thumbsUpdatedForSource}`,
    );
  }

  console.log(
    `All done. Total newly created posts: ${createdTotal}, thumbnails updated: ${thumbUpdatedTotal}`,
  );
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
