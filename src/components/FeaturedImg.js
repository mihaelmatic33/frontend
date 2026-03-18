const POKEMON_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/hero-products.png`;
const TCG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/tcg-cover.webp`;

const getPostFallback = (post, fallback) => {
  const haystack =
    `${post?.title?.rendered || ""} ${post?.content?.rendered || ""}`.toLowerCase();
  if (haystack.includes("tcg")) {
    return TCG_FALLBACK_IMAGE;
  }

  if (haystack.includes("pokemon")) {
    return POKEMON_FALLBACK_IMAGE;
  }

  return fallback;
};

const withVersion = (url, version) => {
  if (!url || !version || url.startsWith("/img/")) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

const FeaturedImg = ({ post, size = "full", fallback }) => {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const selectedImgBase =
    media?.media_details?.sizes?.[size]?.source_url ||
    media?.media_details?.sizes?.large?.source_url ||
    media?.media_details?.sizes?.medium_large?.source_url ||
    media?.source_url ||
    getPostFallback(post, fallback);

  const selectedImg = withVersion(
    selectedImgBase,
    media?.id || post?.modified_gmt || post?.date,
  );

  if (!selectedImg) {
    return null;
  }

  return (
    <img
      src={selectedImg}
      className="hero_img"
      alt={post?.title?.rendered || "Post image"}
    />
  );
};

export default FeaturedImg;
