import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import { useCart } from "../CartContext";
import {
  getProductImage,
  getProductTitle,
  parsePrice,
  resolveProductImageUrl,
} from "../utils/cartItem";
import "./Home.css";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://front2.edukacija.online/backend/wp-json/wp/";

const HERO_IMAGE = `${process.env.PUBLIC_URL}/img/hero-products.png`;

const Home = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(
          `${BASE_URL}v2/shop?_embed&per_page=8&orderby=date&order=desc`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const products = await response.json();
        const source = Array.isArray(products) ? products.slice(0, 8) : [];

        const withImages = await Promise.all(
          source.map(async (product) => {
            const image = getProductImage(product);
            if (image) return product;

            const resolved = await resolveProductImageUrl(product);
            return resolved
              ? { ...product, _resolvedImageUrl: resolved }
              : product;
          }),
        );

        setFeaturedProducts(withImages);
      } catch (error) {
        console.error("Unable to load products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const spotlightProduct = useMemo(() => {
    if (featuredProducts.length === 0) return null;

    return (
      featuredProducts.find((item) =>
        getProductTitle(item).toLowerCase().includes("mystery"),
      ) || featuredProducts[0]
    );
  }, [featuredProducts]);

  const heroVisualImage = spotlightProduct
    ? getProductImage(spotlightProduct) || HERO_IMAGE
    : HERO_IMAGE;

  const heroVisualAlt = spotlightProduct
    ? getProductTitle(spotlightProduct)
    : "Pokemon featured products";

  const handleQuickAdd = (product) => {
    const added = addToCart(product);
    if (!added) {
      setToast("This product could not be added to your cart.");
      return;
    }

    setToast(`Added to cart: ${getProductTitle(product)}`);
  };

  return (
    <>
      <SEO
        title="Pokestuff - Home"
        description="Premium Pokemon shopping destination: mystery drops, collector products, and a polished buying experience."
      />

      <main className="home-epic">
        <section className="home-epic__hero">
          <div className="home-epic__gradient-orb home-epic__gradient-orb--one" />
          <div className="home-epic__gradient-orb home-epic__gradient-orb--two" />
          <div className="container home-epic__hero-grid">
            <div className="home-epic__hero-copy">
              <p className="home-epic__eyebrow">Pokemon Collector Universe</p>
              <h1>The Ultimate Pokemon Storefront Experience</h1>
              <p>
                From curated mystery drops to premium collector picks, this home
                page is built as a fast, modern, conversion-focused shopping
                surface powered directly by your WordPress backend.
              </p>
              <p className="home-epic__hero-subcopy">
                Discover high-demand products, move quickly through categories,
                and jump straight into custom mystery configurations without
                unnecessary clicks.
              </p>
              <div className="home-epic__hero-actions">
                <Link
                  to="/shop-categories"
                  className="home-epic__btn home-epic__btn--solid"
                >
                  Start Shopping
                </Link>
                <Link
                  to="/mystery"
                  className="home-epic__btn home-epic__btn--ghost"
                >
                  Open Mystery Zone
                </Link>
              </div>
              <div className="home-epic__hero-stats">
                <span>
                  <strong>{featuredProducts.length || "8+"}</strong>
                  <small>featured products</small>
                </span>
                <span>
                  <strong>24/7</strong>
                  <small>store availability</small>
                </span>
              </div>
            </div>

            <div className="home-epic__hero-visual">
              <img src={heroVisualImage} alt={heroVisualAlt} />
            </div>
          </div>
        </section>

        <section className="home-epic__spotlight container">
          <div className="home-epic__spotlight-box">
            <div>
              <p>Spotlight pick</p>
              <h2>
                {spotlightProduct
                  ? getProductTitle(spotlightProduct)
                  : "Custom Mystery Box"}
              </h2>
              <span>
                A direct path into the highest-intent section of the storefront,
                focused on premium unboxing moments and personalized collector
                preferences.
              </span>
            </div>
            <div className="home-epic__spotlight-actions">
              <Link
                to="/mystery/custom-box"
                className="home-epic__btn home-epic__btn--solid"
              >
                Configure Custom Box
              </Link>
              <Link
                to="/shop-categories?category=100"
                className="home-epic__btn home-epic__btn--ghost"
              >
                Browse Mystery Catalog
              </Link>
            </div>
          </div>
        </section>

        <section className="container home-epic__section home-epic__section--copy">
          <div className="home-epic__copy-grid">
            <article>
              <h2>Built For Pokemon Collectors</h2>
              <p>
                This homepage is intentionally structured around discovery,
                confidence, and speed. Visitors can immediately understand the
                brand direction, jump into the right category, and add products
                to cart in seconds.
              </p>
            </article>
            <article>
              <h2>Focused, Not Noisy</h2>
              <p>
                Unverified blog content has been removed from the homepage flow.
                The focus stays on quality product merchandising, clear actions,
                and a frictionless path toward checkout.
              </p>
            </article>
          </div>
        </section>

        <section className="container home-epic__section">
          <div className="home-epic__section-head">
            <h2>Featured Products</h2>
            <Link to="/shop-categories">View All</Link>
          </div>

          {loadingProducts ? (
            <div className="home-epic__empty">Loading products...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="home-epic__empty">
              No products are available right now.
            </div>
          ) : (
            <div className="home-epic__product-grid">
              {featuredProducts.slice(0, 8).map((product) => {
                const image =
                  getProductImage(product) ||
                  `${process.env.PUBLIC_URL}/img/pokestuff-blank.png`;
                const title = getProductTitle(product);
                const price = parsePrice(product?.acf?.price ?? product?.price);

                return (
                  <article key={product.id} className="home-epic__product-card">
                    <Link
                      to={`/shops/${product.slug || ""}`}
                      className="home-epic__product-image-wrap"
                    >
                      <img src={image} alt={title} />
                    </Link>
                    <div className="home-epic__product-body">
                      <h3>{title}</h3>
                      <p>
                        {price > 0
                          ? `${price.toFixed(2)} EUR`
                          : "Price on request"}
                      </p>
                      <div className="home-epic__product-actions">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                        >
                          Add to Cart
                        </button>
                        <Link to={`/shops/${product.slug || ""}`}>Details</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="container home-epic__section home-epic__section--cta">
          <div className="home-epic__cta-box">
            <h2>Explore The Full Experience</h2>
            <p>
              Continue to Shop Categories for a complete product view, or open
              Mystery to build a personalized box experience with
              collector-level control over your preferences.
            </p>
            <div className="home-epic__cta-actions">
              <Link
                to="/shop-categories"
                className="home-epic__btn home-epic__btn--solid"
              >
                Open Shop Categories
              </Link>
              <Link
                to="/mystery/custom-box"
                className="home-epic__btn home-epic__btn--ghost"
              >
                Build Custom Mystery Box
              </Link>
              <Link to="/blog" className="home-epic__btn home-epic__btn--ghost">
                Visit Blog
              </Link>
            </div>
          </div>
        </section>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default Home;
