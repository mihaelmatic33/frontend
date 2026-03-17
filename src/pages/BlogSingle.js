import { useState, useEffect } from "react";
import "./Blog.css";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Author from "../components/Author";

const BASE_URL = process.env.REACT_APP_API_URL;
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
  const heroImageBase =
    media?.media_details?.sizes?.full?.source_url ||
    media?.source_url ||
    getPostFallback(post);

  const heroImage = isLowQualityMedia(media)
    ? getPostFallback(post)
    : heroImageBase;

  return (
    <>
      <div className="blog-single">
        <div
          className="masthead"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="container position-relative px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                <div className="post-heading">
                  <h1>{post.title.rendered}</h1>
                  <h2 className="subheading"></h2>
                  <Author post={post} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <article className="mb-4">
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
