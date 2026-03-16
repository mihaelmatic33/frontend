import { useState, useEffect } from "react";
import "./Blog.css";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { getProductImage, resolveProductImageUrl } from "../utils/cartItem";
import { getArticleFields, getGroupedAcfFields } from "../utils/shopAcf";

const BASE_URL = process.env.REACT_APP_API_URL;

const ShopsSingle = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}v2/shop?slug=${slug}&_embed`)
      .then((response) => response.json())
      .then((data) => setPost(data[0] || null));
  }, [slug]);

  useEffect(() => {
    if (!post) return;

    let active = true;

    const loadImage = async () => {
      const resolved = await resolveProductImageUrl(post);
      if (active) {
        setImageUrl(resolved || "");
      }
    };

    setImageUrl(getProductImage(post));
    loadImage();

    return () => {
      active = false;
    };
  }, [post]);

  if (!post) return <Loader />;

  const acf = post?.acf || {};
  const articleFields = getArticleFields(acf, { includePrice: true });
  const groupedFields = getGroupedAcfFields(post);

  return (
    <>
      <div className="blog-single">
        <div
          className="masthead"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          }}
        >
          <div className="container position-relative px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                <div className="post-heading">
                  <h1>{post.title?.rendered || "Artikl"}</h1>
                  <span className="meta">
                    {new Date(post.date).toLocaleDateString("hr-HR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <article className="mb-4">
          <div className="container px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                {articleFields.length > 0 && (
                  <div className="mb-4">
                    <h4>Article</h4>
                    {articleFields.map((field) => (
                      <p key={field.key} className="mb-1">
                        <strong>{field.label}:</strong> {field.value}
                      </p>
                    ))}
                  </div>
                )}

                {groupedFields.length > 0 && (
                  <div className="mb-4">
                    <h4>Specifikacije</h4>
                    {groupedFields.map((group) => (
                      <div key={group.title} className="mb-3">
                        <h5 className="mb-2">{group.title}</h5>
                        {group.fields.map((field) => (
                          <p key={field.key} className="mb-1">
                            <strong>{field.label}:</strong> {field.value}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  dangerouslySetInnerHTML={{
                    __html: post.content?.rendered || "",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default ShopsSingle;
