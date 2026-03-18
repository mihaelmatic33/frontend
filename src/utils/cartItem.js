export const getProductTitle = (product) => {
  if (!product) return "Proizvod";
  if (typeof product.customDisplayTitle === "string") {
    const customTitle = product.customDisplayTitle.trim();
    if (customTitle) return customTitle;
  }
  if (typeof product.title === "string") return product.title;
  if (product.title?.rendered) return product.title.rendered;
  return "Proizvod";
};

export const getProductImage = (product) => {
  const getBestWpMediaUrl = (media) => {
    if (!media || typeof media !== "object") return "";

    const sizes = media?.media_details?.sizes || {};
    const candidates = [
      sizes?.full?.source_url,
      sizes?.full?.url,
      sizes?.scaled?.source_url,
      sizes?.scaled?.url,
      sizes?.medium_large?.source_url,
      sizes?.medium_large?.url,
      sizes?.large?.source_url,
      sizes?.large?.url,
      media?.source_url,
      sizes?.medium?.source_url,
      sizes?.medium?.url,
      sizes?.thumbnail?.source_url,
      sizes?.thumbnail?.url,
    ];

    return (
      candidates.find(
        (value) => typeof value === "string" && value.startsWith("http"),
      ) || ""
    );
  };

  const acfImage = product?.acf?.product_image;
  const acfSizes = acfImage?.sizes || {};
  const acfImageUrl =
    (typeof acfImage === "string" && acfImage.startsWith("http")
      ? acfImage
      : "") ||
    acfImage?.sizes?.full?.url ||
    acfImage?.sizes?.full?.source_url ||
    acfImage?.sizes?.scaled?.url ||
    acfImage?.sizes?.scaled?.source_url ||
    acfImage?.sizes?.medium_large?.url ||
    acfImage?.sizes?.medium_large?.source_url ||
    acfImage?.sizes?.large?.url ||
    acfImage?.sizes?.large?.source_url ||
    acfImage?.source_url ||
    acfImage?.url ||
    (typeof acfSizes?.medium_large === "string" && acfSizes.medium_large) ||
    (typeof acfSizes?.large === "string" && acfSizes.large) ||
    (typeof acfSizes?.medium === "string" && acfSizes.medium) ||
    (typeof acfSizes?.thumbnail === "string" && acfSizes.thumbnail) ||
    "";

  const embeddedMedia = product?._embedded?.["wp:featuredmedia"]?.[0];
  const embeddedMediaUrl = getBestWpMediaUrl(embeddedMedia);

  return (
    product?._resolvedImageUrl ||
    embeddedMediaUrl ||
    acfImageUrl ||
    product?.images?.[0] ||
    product?.image ||
    ""
  );
};

export const getProductImageId = (product) => {
  const acfImage = product?.acf?.product_image;

  if (typeof acfImage === "number") return acfImage;

  if (typeof acfImage === "string" && /^\d+$/.test(acfImage.trim())) {
    return Number.parseInt(acfImage.trim(), 10);
  }

  if (typeof acfImage?.id === "number") return acfImage.id;
  if (typeof acfImage?.ID === "number") return acfImage.ID;

  if (typeof acfImage?.id === "string" && /^\d+$/.test(acfImage.id.trim())) {
    return Number.parseInt(acfImage.id.trim(), 10);
  }

  if (typeof acfImage?.ID === "string" && /^\d+$/.test(acfImage.ID.trim())) {
    return Number.parseInt(acfImage.ID.trim(), 10);
  }

  if (typeof product?.imageId === "number") return product.imageId;

  if (
    typeof product?.imageId === "string" &&
    /^\d+$/.test(product.imageId.trim())
  ) {
    return Number.parseInt(product.imageId.trim(), 10);
  }

  return null;
};

const isLikelyUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

export const getCartItemImage = (item) => {
  if (!item || typeof item !== "object") return "";

  if (isLikelyUrl(item.image)) return item.image.trim();

  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];

    if (isLikelyUrl(first)) return first.trim();
    if (isLikelyUrl(first?.src)) return first.src.trim();
    if (isLikelyUrl(first?.source_url)) return first.source_url.trim();
    if (isLikelyUrl(first?.url)) return first.url.trim();
  }

  return "";
};

const MEDIA_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/media";
const SHOP_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";
const mediaCache = new Map();

export const resolveProductImageUrl = async (product) => {
  const imageId = getProductImageId(product);
  const existingImage = getProductImage(product);

  if (!imageId) return existingImage || "";
  if (mediaCache.has(imageId)) return mediaCache.get(imageId);

  try {
    const response = await fetch(`${MEDIA_API_URL}/${imageId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const media = await response.json();
    const url =
      media?.source_url || media?.media_details?.sizes?.full?.source_url || "";

    mediaCache.set(imageId, url);
    return url || existingImage || "";
  } catch (error) {
    console.error("Ne mogu dohvatiti ACF sliku:", error);
    return existingImage || "";
  }
};

export const resolveCartItemImageUrl = async (item) => {
  const existing = getCartItemImage(item);
  if (existing) return existing;

  const imageId = getProductImageId(item);
  if (!imageId) {
    const itemId = typeof item?.id === "string" ? item.id.trim() : "";
    const productId =
      typeof item?.id === "number"
        ? item.id
        : typeof item?.id === "string" && /^\d+$/.test(item.id.trim())
          ? Number.parseInt(item.id.trim(), 10)
          : null;

    const slugFromId = itemId.startsWith("slug:")
      ? itemId.replace("slug:", "")
      : "";

    const titleFromId = itemId.startsWith("title:")
      ? itemId.replace("title:", "")
      : "";

    if (!productId && !slugFromId && !titleFromId) return "";

    try {
      let product = null;

      if (productId) {
        const response = await fetch(`${SHOP_API_URL}/${productId}?_embed`);
        if (response.ok) {
          product = await response.json();
        }
      }

      if (!product && slugFromId) {
        const response = await fetch(
          `${SHOP_API_URL}?slug=${encodeURIComponent(slugFromId)}&_embed`,
        );
        if (response.ok) {
          const products = await response.json();
          product = Array.isArray(products) ? products[0] : null;
        }
      }

      if (!product && titleFromId) {
        const response = await fetch(
          `${SHOP_API_URL}?search=${encodeURIComponent(titleFromId)}&_embed&per_page=1`,
        );
        if (response.ok) {
          const products = await response.json();
          product = Array.isArray(products) ? products[0] : null;
        }
      }

      if (!product) return "";

      const directUrl = getProductImage(product);
      if (directUrl) return directUrl;

      return resolveProductImageUrl(product);
    } catch (error) {
      console.error("Failed to resolve legacy cart image:", error);
      return "";
    }
  }

  if (mediaCache.has(imageId)) return mediaCache.get(imageId);

  try {
    const response = await fetch(`${MEDIA_API_URL}/${imageId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const media = await response.json();
    const url =
      media?.source_url || media?.media_details?.sizes?.full?.source_url || "";

    mediaCache.set(imageId, url);
    return url;
  } catch (error) {
    console.error("Failed to resolve cart image:", error);
    return "";
  }
};

export const parsePrice = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const getProductId = (product) => {
  const directId = product?.id;
  if (typeof directId === "number" || typeof directId === "string") {
    const normalized = String(directId).trim();
    if (normalized) return normalized;
  }

  const slug = product?.slug;
  if (typeof slug === "string" && slug.trim()) {
    return `slug:${slug.trim()}`;
  }

  const renderedTitle = product?.title?.rendered;
  if (typeof renderedTitle === "string" && renderedTitle.trim()) {
    return `title:${renderedTitle.trim().toLowerCase()}`;
  }

  return null;
};

export const normalizeProductForCart = (product, options = {}) => {
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const imageId = getProductImageId(product);
  const defaultPrice = parsePrice(product?.acf?.price ?? product?.price);
  const customPrice = parsePrice(options?.customPrice);
  const resolvedPrice = customPrice > 0 ? customPrice : defaultPrice;
  const baseId = getProductId(product);

  const customPreferences = Array.isArray(options?.customPreferences)
    ? options.customPreferences
        .map((entry) => String(entry).trim())
        .filter(Boolean)
    : [];

  const customSuffix =
    customPrice > 0 || customPreferences.length > 0
      ? `::custom:${resolvedPrice.toFixed(2)}:${customPreferences
          .join("|")
          .toLowerCase()}`
      : "";

  const id = baseId ? `${baseId}${customSuffix}` : null;

  const customDisplayTitle =
    customPrice > 0 ? `${title} (${resolvedPrice.toFixed(2)} EUR)` : title;

  return {
    id,
    baseProductId: baseId,
    title,
    customDisplayTitle,
    price: resolvedPrice,
    imageId,
    image,
    customPrice: customPrice > 0 ? resolvedPrice : null,
    customPreferences,
    images: image ? [image] : [],
    quantity: 1,
  };
};

export const getStoredCart = () => {
  try {
    const raw = localStorage.getItem("cart");
    const legacyRaw = localStorage.getItem("cartItems");

    if (!raw && !legacyRaw) return [];

    const parsed = raw ? JSON.parse(raw) : [];
    const legacyParsed = legacyRaw ? JSON.parse(legacyRaw) : [];
    const merged = [
      ...(Array.isArray(parsed) ? parsed : []),
      ...(Array.isArray(legacyParsed) ? legacyParsed : []),
    ];

    if (!Array.isArray(merged) || merged.length === 0) return [];

    const byId = new Map();
    merged.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const id = getProductId(item);
      if (!id) return;

      const quantity = Math.max(1, Number(item.quantity) || 1);
      const existing = byId.get(id);

      if (existing) {
        existing.quantity += quantity;
        return;
      }

      byId.set(id, {
        ...item,
        id,
        quantity,
      });
    });

    return Array.from(byId.values());
  } catch (error) {
    console.error("Failed to read cart from localStorage:", error);
    return [];
  }
};

export const setStoredCart = (cart) => {
  const safeCart = Array.isArray(cart) ? cart : [];

  try {
    localStorage.setItem("cart", JSON.stringify(safeCart));
    localStorage.setItem("cartItems", JSON.stringify(safeCart));

    try {
      window.dispatchEvent(new Event("cart-updated"));
    } catch (_error) {
      const fallbackEvent = document.createEvent("Event");
      fallbackEvent.initEvent("cart-updated", true, true);
      window.dispatchEvent(fallbackEvent);
    }

    return true;
  } catch (error) {
    console.error("Failed to write cart to localStorage:", error);
    return false;
  }
};
