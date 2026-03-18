/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];

const ARTICLES = [
  {
    title: "Pokemon TCG in 2026: Why Mega Evolution Sets Are Driving the Hype",
    slug: "pokemon-tcg-2026-zasto-mega-evolution-setovi-dizu-hype",
    excerpt:
      "The Mega Evolution era is injecting fresh energy into Pokemon TCG. Find out why collectors and players are once again focused on chase cards, promo releases and sealed products.",
    categoryNames: ["Pokemon TCG", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/mega-evolution-hype.png",
    content: `
<p>The new Mega Evolution phase has brought back that big-event feeling to Pokemon TCG. Collectors are chasing alt arts and full arts, players are analysing which EX and support combinations pack the best tempo, and sealed products are once again commanding premium prices straight at launch.</p>

<h2>Why is the hype stronger now?</h2>
<p>The market has been looking for sets with a clear identity for the past two years. Mega Evolution delivers exactly that: recognisable Pokemon, striking visuals and a solid balance between collector and player appeal. That combination almost always drives interest the moment the first previews drop.</p>

<h2>What are collectors looking for right now?</h2>
<ul>
  <li>alt art and full art chase cards with the strongest artwork</li>
  <li>promo cards tied to launch campaigns</li>
  <li>Elite Trainer Box and booster box products from the first wave</li>
</ul>

<h2>What does this mean for shops and buyers?</h2>
<p>Buyers are no longer just hunting the rarest card. They are evaluating the full product: artwork, sealed potential, playable value and the long-term sentiment of the community. That is why Mega Evolution sets attract a wider audience than the average release.</p>

<p>If you are just entering this wave, the smartest approach is to combine one sealed product for the collection and one to open. That way you stay in the game without overpaying during the first hype cycle.</p>
    `.trim(),
  },
  {
    title:
      "Shiny & Special Illustration Cards: What Collectors Are Chasing in 2026",
    slug: "shiny-i-special-illustration-karte-sto-se-najvise-trazi",
    excerpt:
      "In 2026, collectors are most drawn to cards that combine strong artwork with an iconic Pokemon. Here is why shiny and special illustration rarities continue to lead the market.",
    categoryNames: ["Pokemon Collecting", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/special-illustration-trend.png",
    content: `
<p>The most desirable modern Pokemon cards no longer sell on rarity symbol alone. Value increasingly comes from presentation. When a card features a recognisable Pokemon, a cinematic composition and strong print quality, it stays in demand long after any initial hype has faded.</p>

<h2>Why do shiny and illustration variants dominate?</h2>
<p>They create the feeling that a card is not just a game piece but a mini art print. That is exactly why both players and people who never play TCG buy them — to build themed binders around favourite artists or beloved Pokemon.</p>

<h2>Which Pokemon themes perform best?</h2>
<ul>
  <li>Eevee evolutions and popular Kanto favourites</li>
  <li>Charizard, Gengar, Pikachu and Mew lines</li>
  <li>cards that look great both in a graded slab and a binder page</li>
</ul>

<h2>How to buy smarter?</h2>
<p>The best results come from buying cards that make sense to you without any thought of resale. If you buy a card purely because it is trending right now, you easily end up with a piece nobody wants once the hype drops. If you buy for the Pokemon, the artwork and the print quality, you will rarely make a mistake.</p>
    `.trim(),
  },
  {
    title:
      "Pokemon GO Events Are Driving Interest in the Franchise and TCG Again",
    slug: "pokemon-go-eventi-opet-dizu-interes-za-franchise-i-tcg",
    excerpt:
      "Live events, Community Day weekends and major collabs are pushing Pokemon back into everyone's feed. That wave quickly spills over into interest in cards and merchandise.",
    categoryNames: ["Pokemon GO", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/pokemon-go-events.png",
    content: `
<p>Pokemon GO is no longer just a mobile game that resurfaces once a year during summer. When a strong Community Day, a quality raid lineup and solid event bonuses align, the entire brand gains momentum. Players return to the app, browse the latest news and often end up looking at TCG products too.</p>

<h2>Why does GO influence collecting?</h2>
<p>Pokemon GO is an entry point for audiences who do not regularly follow TCG. Once a player gets back into the habit of tracking events, they often start looking at cards featuring the same Pokemon, gift products or boxed sets that feel familiar from the mobile game.</p>

<h2>Which products connect best with GO hype?</h2>
<ul>
  <li>products featuring Pikachu, Eevee and legendary Pokemon</li>
  <li>gift boxes and impulse-friendly products</li>
  <li>items that look great on a shelf and in short-form videos</li>
</ul>

<p>For shops, this is an important signal: GO hype is not separate from the rest of the brand. When GO grows, so does the chance that a new customer tries opening a booster, buys a binder or starts following TCG news for the first time.</p>
    `.trim(),
  },
  {
    title: "Is Pokemon Card Grading Worth It in 2026?",
    slug: "isplati-li-se-grading-pokemon-karata-u-2026",
    excerpt:
      "Grading still makes sense — but not for every card. Here is how to realistically assess whether a card is worth sending to PSA or whether selling it raw is the smarter move.",
    categoryNames: ["Pokemon Collecting", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/grading-2026.png",
    content: `
<p>Grading remains an important part of the Pokemon market, but the era of sending almost every decent card off for evaluation is behind us. In 2026, it pays to be selective: focus on cards with strong demand, clean centering and a clear price gap between raw and graded.</p>

<h2>When does grading make sense?</h2>
<ul>
  <li>when the card already has solid demand as a raw copy</li>
  <li>when there is a significant price difference between PSA 9 and PSA 10</li>
  <li>when the card is visually strong enough to hold interest a year or two down the line</li>
</ul>

<h2>When does it not make sense?</h2>
<p>If the card is widely available, if a PSA 9 barely covers shipping costs, or if the condition is questionable, grading becomes more of an emotional decision than a sound one. In those cases, selling raw or keeping it in a personal collection is often the better option.</p>

<h2>The most common collector mistake</h2>
<p>The most frequent mistake is sending a card just because it is new and popular. A solid grading plan always starts with one question: who will want to buy this card once the initial hype is over?</p>
    `.trim(),
  },
  {
    title: "Budget Decks Worth Playing in Pokemon TCG Season 2026",
    slug: "budget-deckovi-koje-vrijedi-pratiti-u-pokemon-tcg-sezoni-2026",
    excerpt:
      "Not every good deck is expensive. Here are several directions worth exploring if you want to play competitively without stretching your budget.",
    categoryNames: ["Pokemon TCG", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/budget-decks-2026.png",
    content: `
<p>A large portion of the Pokemon TCG community wants to play seriously without spending as though they are building a premium collection binder. Budget decks play a huge role here. A good budget deck does not need to be the top deck in the format, but it must have a clear game plan, a consistent engine and enough favourable matchups against popular lists.</p>

<h2>What to look for in a budget deck?</h2>
<ul>
  <li>an affordable core that can be upgraded over time</li>
  <li>a stable opening hand and a straightforward game plan</li>
  <li>few expensive staple cards that account for half the deck's cost</li>
</ul>

<h2>Why do budget lists matter again?</h2>
<p>New players usually enter through casual games, local events and beginner tournaments. If the first step is too expensive, they quit quickly. When there is a realistic path to putting together a decent deck without significant cost, the whole scene grows more easily.</p>

<p>The smartest approach is to start with a list that already has a competitive core, then refine it through a few targeted purchases according to your play style. That way you learn the format without spending blindly.</p>
    `.trim(),
  },
  {
    title:
      "Which Pokemon Products Are the Best Entry Point for New Collectors?",
    slug: "koji-pokemon-proizvodi-su-najbolji-ulaz-za-nove-kolekcionare",
    excerpt:
      "If someone is entering the Pokemon hobby for the first time, the starting point matters. These are the products that make the most sense today for beginners and as gifts.",
    categoryNames: ["Pokemon Collecting", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/starter-products-guide.png",
    content: `
<p>Beginners often make the mistake of immediately looking at the most expensive boxes or individual chase cards. A much better entry point is products that offer a clear balance of value, fun and transparency. That means the buyer immediately understands what they got and what they can build from there.</p>

<h2>What makes the most sense as a first step?</h2>
<ul>
  <li>Elite Trainer Box for a set overview and a basic accessories bundle</li>
  <li>collection box for a stronger gift presentation</li>
  <li>starter or battle deck for players who want to try a game right away</li>
</ul>

<h2>Why do sealed beginner products work better than random purchases?</h2>
<p>Because they provide a clear entry point. The beginner receives the feeling of a complete product — not just a single card or two boosters without context. This is especially true when the purchase is a gift from a parent, partner or friend who does not closely follow the TCG.</p>

<p>A good first product does not need to be the most expensive one. It just needs to be transparent enough and exciting enough to draw the person further into the hobby.</p>
    `.trim(),
  },
  {
    title: "Why Eeveelution Cards Always Hold Their Value and Demand",
    slug: "zasto-eeveelution-karte-stalno-drze-cijenu-i-interes",
    excerpt:
      "Eevee and its evolutions have remained among the most desirable cards for years. Here is why that corner of the Pokemon market never truly cools down.",
    categoryNames: ["Pokemon Collecting", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/eeveelution-demand.png",
    content: `
<p>Some Pokemon lines maintain steady demand regardless of the set, format or generation. Eeveelution cards are the best example of this. They combine visual appeal, nostalgia and a broad audience, because almost everyone has at least one favourite evolution.</p>

<h2>Why are they always relevant?</h2>
<ul>
  <li>they have a large fan base outside of competitive TCG</li>
  <li>they look stunning in premium rarity versions</li>
  <li>they appeal equally to younger buyers and veteran collectors</li>
</ul>

<h2>Which cards draw the most attention?</h2>
<p>The biggest interest consistently goes to full art, alt art and holiday set variants. Cards that feel like a small poster rather than a standard gameplay print perform especially well. That is why Eeveelution chases often survive a broader hype decline better than many other lines.</p>
    `.trim(),
  },
  {
    title:
      "How TikTok, YouTube and Streamers Are Changing Pokemon Product Value",
    slug: "kako-tiktok-youtube-i-streameri-mijenjaju-vrijednost-pokemon-proizvoda",
    excerpt:
      "Short-form video and live openings can push demand for an entire set within just a few days. The market reacts faster than ever before.",
    categoryNames: ["Pokemon Trends", "Pokemon Media"],
    imagePath: "public/img/blog-topics/content-creators-market.png",
    content: `
<p>The Pokemon market no longer follows only the release calendar and tournament results. A single viral video, a strong live break or a run of short-form clips can generate interest in a specific product long before traditional reviews even go live.</p>

<h2>What happens when creator hype hits at the right moment?</h2>
<p>If a video lands on a chase card, an engaging box opening format and a recognisable product, people react almost immediately. That is why sealed products that sat quietly for months can suddenly become sought-after within a single week.</p>

<h2>How to read this intelligently?</h2>
<ul>
  <li>do not buy blindly just because a video went viral</li>
  <li>check whether the product also has long-term identity, not just a short hype window</li>
  <li>track the behaviour of multiple creators, not just one large channel</li>
</ul>

<p>Creator influence is real, but the best buyers and shops do not chase every trend. They distinguish passing noise from genuine demand.</p>
    `.trim(),
  },
  {
    title:
      "Sealed Products vs Single Cards: Where Should You Spend Your Budget?",
    slug: "sealed-proizvodi-ili-single-karte-gdje-je-pametnije-trositi-budzet",
    excerpt:
      "The most common buyer dilemma is not which set to pick, but whether to open products at all or go straight for single cards. The answer depends on your goal.",
    categoryNames: ["Pokemon TCG", "Pokemon Trends"],
    imagePath: "public/img/blog-topics/sealed-vs-singles.png",
    content: `
<p>Sealed products and single cards solve two entirely different goals. Buying sealed gives you the opening experience, the potential of landing a chase hit and a stronger gift moment. Single cards are the more rational choice when you know exactly what you want in your collection or deck.</p>

<h2>When does sealed make more sense?</h2>
<ul>
  <li>when you are buying a gift or want the opening experience</li>
  <li>when you believe in the set's long-term identity</li>
  <li>when you want to combine entertainment with collecting potential</li>
</ul>

<h2>When are single cards the better choice?</h2>
<p>When you are hunting a specific chase card or building a deck, singles are almost always the more rational option. Less variance, less impulse spending and you know exactly what you are paying for. That is why serious collectors often combine both approaches, but with a clear budget boundary for each.</p>
    `.trim(),
  },
  {
    title: "Pokemon Gift Guide 2026: What to Buy for Someone New to the Hobby",
    slug: "pokemon-gift-guide-2026-sto-kupiti-nekome-tko-tek-ulazi-u-hobby",
    excerpt:
      "A Pokemon gift does not have to be a gamble. Here are a few safe directions that deliver real wow factor and make sense for a beginner.",
    categoryNames: ["Pokemon Trends", "Pokemon Gifts"],
    imagePath: "public/img/blog-topics/gift-guide-pokemon.png",
    content: `
<p>The best Pokemon gift is not necessarily the most expensive one. The key is matching the product to the recipient's experience level. A beginner needs something transparent and fun, while a more experienced fan will appreciate a product that fits into their collection or deck plans.</p>

<h2>Three safe options</h2>
<ul>
  <li>collection box with strong artwork and a promo card</li>
  <li>Elite Trainer Box as the most well-rounded first-step product</li>
  <li>a single card of the recipient's favourite Pokemon if you know exactly what they like</li>
</ul>

<h2>What to avoid?</h2>
<p>The most common gift misses come from people who buy a completely random lot without a clear reason. These products often look cheaper than they are and do not carry the feeling that the gift was chosen with intention. A smaller but more meaningful Pokemon product is always the better call.</p>
    `.trim(),
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

function authHeader() {
  const creds = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const byExt = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return byExt[ext] || "application/octet-stream";
}

async function wpFetch(pathname, options = {}) {
  const baseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/wp-json/wp/v2${pathname}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
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

async function findPostBySlug(slug) {
  const rows = await wpFetch(
    `/posts?slug=${encodeURIComponent(slug)}&per_page=1&status=publish,draft`,
    { method: "GET" },
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function ensureCategory(name) {
  const rows = await wpFetch(
    `/categories?search=${encodeURIComponent(name)}&per_page=50`,
    { method: "GET" },
  );

  const existing = (rows || []).find(
    (row) => String(row?.name || "").toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    return existing.id;
  }

  const created = await wpFetch("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  return created.id;
}

async function uploadLocalImage(imagePath, title) {
  const absolutePath = path.resolve(process.cwd(), imagePath);
  const bytes = fs.readFileSync(absolutePath);
  const mimeType = getMimeType(absolutePath);
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}${path.extname(absolutePath).toLowerCase()}`;

  const baseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: bytes,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Media upload failed (${response.status}): ${body}`);
  }

  const media = await response.json();
  return media?.id || 0;
}

async function createPost(article, categoryIds, mediaId) {
  return wpFetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      status: "publish",
      categories: categoryIds,
      ...(mediaId ? { featured_media: mediaId } : {}),
    }),
  });
}

async function updatePost(postId, article, categoryIds, mediaId) {
  return wpFetch(`/posts/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      status: "publish",
      categories: categoryIds,
      ...(mediaId ? { featured_media: mediaId } : {}),
    }),
  });
}

async function main() {
  loadEnvFile();
  validateEnv();

  let created = 0;
  let updated = 0;

  for (const article of ARTICLES) {
    process.stdout.write(`Processing: \"${article.title}\"... `);

    const existingPost = await findPostBySlug(article.slug);

    const categoryIds = [];
    for (const categoryName of article.categoryNames) {
      categoryIds.push(await ensureCategory(categoryName));
    }

    const mediaId = await uploadLocalImage(article.imagePath, article.slug);

    if (existingPost) {
      const post = await updatePost(
        existingPost.id,
        article,
        categoryIds,
        mediaId,
      );
      console.log(`UPDATED (id: ${post.id})`);
      updated += 1;
      continue;
    }

    const post = await createPost(article, categoryIds, mediaId);
    console.log(`CREATED (id: ${post.id})`);
    created += 1;
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
