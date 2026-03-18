import { Link } from "react-router-dom";

const BLOG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/post-sample-image.jpg`;
const POKEMON_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/hero-products.png`;
const TCG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/tcg-cover.webp`;

const getPostFallback = (post) => {
  const haystack =
    `${post?.title?.rendered || ""} ${post?.content?.rendered || ""}`.toLowerCase();
  if (haystack.includes("tcg")) {
    return TCG_FALLBACK_IMAGE;
  }

  if (haystack.includes("pokemon")) {
    return POKEMON_FALLBACK_IMAGE;
  }

  return BLOG_FALLBACK_IMAGE;
};

const withVersion = (url, version) => {
  if (!url || !version || url.startsWith("/img/")) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

const getFeaturedImage = (media, post) => {
  const sizes = media?.media_details?.sizes || {};
  const baseUrl =
    sizes?.large?.source_url ||
    sizes?.medium_large?.source_url ||
    sizes?.full?.source_url ||
    sizes?.medium?.source_url ||
    media?.source_url ||
    getPostFallback(post);

  return withVersion(baseUrl, media?.id || post?.modified_gmt || post?.date);
};

const getPrimaryCategory = (post) => {
  const terms = post?._embedded?.["wp:term"]?.flat() || [];
  const categories = terms.filter((term) => term?.taxonomy === "category");
  return categories[0]?.name || "Pokemon Trendovi";
};

const BlogPost = ({ post }) => {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const image = getFeaturedImage(media, post);
  const primaryCategory = getPrimaryCategory(post);

  return (
    <div key={post.id} className="col-md-4 mb-4 blog-post">
      <article className="blog-post-card h-100">
        <Link to={"/blog/" + post.slug} className="blog-post-image-link">
          <img
            src={image}
            className="mb-3"
            alt={post.title.rendered}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="blog-post-body">
          <span className="blog-post-badge">{primaryCategory}</span>
          <Link to={"/blog/" + post.slug}>
            <h2>{post.title.rendered}</h2>
          </Link>
          <div
            className="blog-post-excerpt"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
        </div>
      </article>
    </div>
  );
};
export default BlogPost;
