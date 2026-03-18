import { useState, useEffect } from "react";
import "./Blog.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { getProductImage, resolveProductImageUrl } from "../utils/cartItem";
import { getArticleFields, getGroupedAcfFields } from "../utils/shopAcf";
import { useCart } from "../CartContext";

const BASE_URL = process.env.REACT_APP_API_URL;

const ShopsSingle = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [post, setPost] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [toast, setToast] = useState(null);

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

  const sourceState = location.state || {};
  const goBackToCategory = () => {
    const categoryId = Number(sourceState?.categoryId);
    const subcategoryId = Number(sourceState?.subcategoryId);

    if (Number.isFinite(categoryId) && categoryId > 0) {
      const params = new URLSearchParams({
        category: String(categoryId),
      });

      if (Number.isFinite(subcategoryId) && subcategoryId > 0) {
        params.set("subcategory", String(subcategoryId));
      }

      navigate(`/shop-categories?${params.toString()}`);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/shop-categories");
  };

  const handleAddToCart = () => {
    const added = addToCart(post);
    if (!added) {
      setToast("Unable to add this product to cart.");
      return;
    }

    setToast("Added to cart.");
  };

  const acf = post?.acf || {};
  const articleFields = getArticleFields(acf, { includePrice: true });
  const groupedFields = getGroupedAcfFields(post);

  return (
    <>
      <div className="blog-single shop-single">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
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
                  <h1>{post.title?.rendered || "Product"}</h1>
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
                    <h4>Specifications</h4>
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

                <div className="shop-product-card__actions mt-4">
                  <button
                    type="button"
                    className="shop-product-card__btn shop-product-card__btn--cart"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    className="shop-product-card__btn shop-product-card__btn--details"
                    onClick={goBackToCategory}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default ShopsSingle;
