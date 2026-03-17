/* eslint-disable no-console */
/**
 * set-blog-thumbnails.js
 *
 * Downloads the images already embedded in each blog article,
 * uploads them to the WordPress media library, and sets them
 * as featured_media on each post.
 *
 * Usage:
 *   node scripts/set-blog-thumbnails.js
 */

const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep < 1) continue;
    const key = trimmed.slice(0, sep).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(sep + 1).trim();
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
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

function authHeader() {
  const creds = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

// ─── Posts and their thumbnail image source URLs ────────────────────────────

const POSTS = [
  {
    id: 5952,
    title: "Što su Pokémoni?",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    filename: "pikachu-official-art.png",
    altText: "Pikachu – maskota Pokémon franšize",
  },
  {
    id: 5953,
    title: "Što je Pokémon TCG?",
    imageUrl: "https://images.pokemontcg.io/base1/4_hires.png",
    filename: "charizard-base-set-card.png",
    altText: "Charizard Base Set karta",
  },
  {
    id: 5954,
    title: "Najskuplja Pokémon karta",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    filename: "charizard-official-art.png",
    altText: "Charizard – najvrjednija Pokemon karta",
  },
  {
    id: 5955,
    title: "Gdje kupiti Pokémon karte",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    filename: "mewtwo-official-art.png",
    altText: "Mewtwo – legendarni Pokémon",
  },
  {
    id: 5956,
    title: "Za koje uzraste su Pokémoni?",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    filename: "eevee-official-art.png",
    altText: "Eevee – popularan za sve uzraste",
  },
  {
    id: 5957,
    title: "Pokémon turniej i kompetitivna scena 2025.",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    filename: "lucario-official-art.png",
    altText: "Lucario – ikona kompetitivne scene",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function downloadImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to download image: HTTP ${res.status} – ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToMediaLibrary(baseUrl, buffer, filename, altText) {
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "image/png",
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Media upload failed: HTTP ${res.status} – ${err.slice(0, 300)}`,
    );
  }

  const media = await res.json();

  // Set alt text
  try {
    await fetch(`${baseUrl}/wp-json/wp/v2/media/${media.id}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alt_text: altText }),
    });
  } catch (_) {
    // non-critical
  }

  return media.id;
}

async function setFeaturedMedia(baseUrl, postId, mediaId) {
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/posts/${postId}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featured_media: mediaId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Set featured_media failed: HTTP ${res.status} – ${err.slice(0, 300)}`,
    );
  }

  return res.json();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnvFile();
  validateEnv();

  const baseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  console.log(`\nTargeting WordPress at: ${baseUrl}\n`);

  for (const post of POSTS) {
    process.stdout.write(`[${post.id}] "${post.title}"\n`);

    try {
      process.stdout.write(`  ↓ Downloading image… `);
      const buffer = await downloadImageBuffer(post.imageUrl);
      console.log(`OK (${Math.round(buffer.length / 1024)} KB)`);

      process.stdout.write(`  ↑ Uploading to media library… `);
      const mediaId = await uploadToMediaLibrary(
        baseUrl,
        buffer,
        post.filename,
        post.altText,
      );
      console.log(`OK (media id: ${mediaId})`);

      process.stdout.write(`  ✎ Setting featured_media on post… `);
      await setFeaturedMedia(baseUrl, post.id, mediaId);
      console.log(`OK\n`);
    } catch (err) {
      console.error(`  ERROR: ${err.message}\n`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
