import { Link } from "react-router-dom";
import Author from "./Author";

const BLOG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/post-sample-image.jpg`;
const POKEMON_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/hero-products.png`;
const TCG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/tcg-cover.webp`;

const isLowQualityMedia = (media) => {
  const width = Number(media?.media_details?.width || 0);
  const height = Number(media?.media_details?.height || 0);
  if (!width || !height) return false;

  const ratio = width / height;
  return width < 500 || height < 300 || Math.abs(ratio - 1) < 0.08;
};

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

const BlogPost = ({ post }) => {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const baseImage =
    media?.media_details?.sizes?.full?.source_url ||
    media?.source_url ||
    getPostFallback(post);

  const image = isLowQualityMedia(media) ? getPostFallback(post) : baseImage;

  return (
    <div key={post.id} className="col-md-4 mb-4 blog-post">
      <Link to={"/blog/" + post.slug}>
        <img src={image} className="mb-3" alt={post.title.rendered} />
      </Link>
      <Link to={"/blog/" + post.slug}>
        <h2>{post.title.rendered}</h2>
      </Link>
      <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
      <Author post={post} author={false} />
    </div>
  );
};
export default BlogPost;
