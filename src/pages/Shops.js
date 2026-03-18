import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { getProductImage, resolveProductImageUrl } from "../utils/cartItem";
import "./Blog.css";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://front2.edukacija.online/backend/wp-json/wp/";

const Shops = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}v2/prod-category`)
      .then((response) => response.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);

    const url = new URL(`${BASE_URL}v2/shop`);
    url.searchParams.set("_embed", "1");

    if (selectedCategory) {
      url.searchParams.set("prod-category", selectedCategory);
    }

    fetch(url.toString())
      .then((response) => response.json())
      .then(async (data) => {
        const safeData = Array.isArray(data) ? data : [];
        const withResolvedImages = await Promise.all(
          safeData.map(async (item) => {
            const resolvedImage = await resolveProductImageUrl(item);
            return {
              ...item,
              _resolvedImageUrl: resolvedImage,
            };
          }),
        );

        setProducts(withResolvedImages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <>
      {loading && <Loader />}
      <div className="blog-page">
        <div className="container">
          <div className="row">
            <div className="col-6">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            {products.map((product) => {
              const image = getProductImage(product);
              return (
                <div key={product.id} className="col-md-4 mb-4 blog-post">
                  {image && (
                    <img
                      src={image}
                      className="mb-3"
                      alt={product.title?.rendered || "Product image"}
                    />
                  )}
                  <Link to={`/shops/${product.slug}`}>
                    <h2>{product.title?.rendered || "Untitled product"}</h2>
                  </Link>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.excerpt?.rendered || "",
                    }}
                  />
                  <p>
                    {product._embedded?.author?.[0]?.name || "Pokestuff"} |{" "}
                    {new Date(product.date).toLocaleDateString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shops;
