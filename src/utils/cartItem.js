export const getProductTitle = (product) => {
  if (!product) return "Proizvod";
  if (typeof product.title === "string") return product.title;
  if (product.title?.rendered) return product.title.rendered;
  return "Proizvod";
};

export const getProductImage = (product) => {
  const acfImage = product?.acf?.product_image;
  const acfImageUrl =
    (typeof acfImage === "string" && acfImage.startsWith("http")
      ? acfImage
      : "") ||
    acfImage?.url ||
    acfImage?.source_url ||
    acfImage?.sizes?.full?.url ||
    acfImage?.sizes?.full?.source_url ||
    "";

  return (
    product?._resolvedImageUrl ||
    product?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    acfImageUrl ||
    product?.images?.[0] ||
    product?.image ||
    ""
  );
};

const MEDIA_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/media";
const mediaCache = new Map();

export const resolveProductImageUrl = async (product) => {
  const existingImage = getProductImage(product);
  if (existingImage) return existingImage;

  const acfImage = product?.acf?.product_image;
  const imageId =
    typeof acfImage === "number"
      ? acfImage
      : typeof acfImage === "string" && /^\d+$/.test(acfImage)
        ? Number.parseInt(acfImage, 10)
        : typeof acfImage?.id === "number"
          ? acfImage.id
          : null;

  if (!imageId) return "";
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
    console.error("Ne mogu dohvatiti ACF sliku:", error);
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

export const normalizeProductForCart = (product) => {
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const price = parsePrice(product?.acf?.price ?? product?.price);

  return {
    id: product?.id,
    title,
    price,
    image,
    images: image ? [image] : [],
    quantity: 1,
  };
};
