export const getProductTitle = (product) => {
  if (!product) return "Proizvod";
  if (typeof product.title === "string") return product.title;
  if (product.title?.rendered) return product.title.rendered;
  return "Proizvod";
};

export const getProductImage = (product) => {
  return (
    product?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    product?.images?.[0] ||
    product?.image ||
    ""
  );
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
