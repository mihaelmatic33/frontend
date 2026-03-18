import { useState, useEffect } from "react";
import "./Blog.css";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";

const BASE_URL = process.env.REACT_APP_API_URL;
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
    sizes?.full?.source_url ||
    sizes?.large?.source_url ||
    sizes?.medium_large?.source_url ||
    sizes?.medium?.source_url ||
    media?.source_url ||
    getPostFallback(post);

  return withVersion(baseUrl, media?.id || post?.modified_gmt || post?.date);
};

const BlogSingle = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}v2/posts?slug=${slug}&_embed`)
      .then((response) => response.json())
      .then((data) => setPost(data[0]));
  }, [slug]);

  if (!post) return <Loader />;

  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const heroImage = getFeaturedImage(media, post);

  return (
    <>
      <div className="blog-single">
        <div
          className="blog-single-hero"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="blog-single-hero-overlay" />
          <div className="container position-relative px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                <div className="post-heading blog-single-heading">
                  <h1 className="blog-single-title">{post.title.rendered}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <article className="mb-4 blog-single-article">
          <div className="container px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                <div
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                ></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogSingle;
