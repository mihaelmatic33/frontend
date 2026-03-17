const POKEMON_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/hero-products.png`;
const TCG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/tcg-cover.webp`;

const isLowQualityMedia = (media) => {
  const width = Number(media?.media_details?.width || 0);
  const height = Number(media?.media_details?.height || 0);
  if (!width || !height) return false;

  const ratio = width / height;
  return width < 500 || height < 300 || Math.abs(ratio - 1) < 0.08;
};

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

const FeaturedImg = ({ post, size = "full", fallback }) => {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const selectedImgBase =
    media?.media_details?.sizes?.[size]?.source_url ||
    media?.source_url ||
    getPostFallback(post, fallback);

  const selectedImg = isLowQualityMedia(media)
    ? getPostFallback(post, fallback)
    : selectedImgBase;

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
