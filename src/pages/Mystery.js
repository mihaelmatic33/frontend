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
import "./Mystery.css";

const SHOP_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";
const CATEGORY_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/prod-category";
const MYSTERY_CATEGORY_ID = 100;

const MYSTERY_PRODUCT_ORDER = {
  "mystery single card": 1,
  "mystery graded card": 2,
  "mystery pack": 3,
  "mystery box bronze tier": 4,
  "mystery box silver tier": 5,
  "mystery box gold tier": 6,
  "custom mystery box": 7,
};

const Mystery = () => {
  const { addToCart } = useCart();
  const [mysteryProducts, setMysteryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMysteryProducts = async () => {
      setLoading(true);

      try {
        const categoriesResponse = await fetch(
          `${CATEGORY_API_URL}?per_page=100`,
        );
        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error: ${categoriesResponse.status}`);
        }

        const terms = await categoriesResponse.json();
        const subcategoryIds = Array.isArray(terms)
          ? terms
              .filter((term) => Number(term.parent) === MYSTERY_CATEGORY_ID)
              .map((term) => term.id)
          : [];

        const idsToQuery = [MYSTERY_CATEGORY_ID, ...subcategoryIds];
        const responses = await Promise.all(
          idsToQuery.map(async (id) => {
            const response = await fetch(
              `${SHOP_API_URL}?prod-category=${id}&_embed&per_page=100`,
            );

            if (!response.ok) {
              throw new Error(`HTTP error: ${response.status}`);
            }

            return response.json();
          }),
        );

        const seen = new Set();
        const merged = responses
          .flatMap((items) => (Array.isArray(items) ? items : []))
          .filter((item) => {
            const id = item?.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });

        const withResolvedImages = await Promise.all(
          merged.map(async (product) => {
            const currentImage = getProductImage(product);
            if (currentImage) return product;

            const resolvedImage = await resolveProductImageUrl(product);
            return resolvedImage
              ? { ...product, _resolvedImageUrl: resolvedImage }
              : product;
          }),
        );

        const sorted = withResolvedImages.sort((left, right) => {
          const leftTitle = getProductTitle(left).trim().toLowerCase();
          const rightTitle = getProductTitle(right).trim().toLowerCase();
          const leftOrder = MYSTERY_PRODUCT_ORDER[leftTitle] || 999;
          const rightOrder = MYSTERY_PRODUCT_ORDER[rightTitle] || 999;

          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }

          return leftTitle.localeCompare(rightTitle);
        });

        setMysteryProducts(sorted);
      } catch (error) {
        console.error("Failed to fetch mystery products:", error);
        setMysteryProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMysteryProducts();
  }, []);

  const customBoxProduct = useMemo(
    () =>
      mysteryProducts.find(
        (product) =>
          getProductTitle(product).trim().toLowerCase() ===
          "custom mystery box",
      ) || null,
    [mysteryProducts],
  );

  const handleAddToCart = (product) => {
    const added = addToCart(product);
    if (!added) {
      setToast("Unable to add this product to cart.");
      return;
    }

    setToast(`Added to cart: ${getProductTitle(product)}`);
  };

  return (
    <div className="mystery-page">
      <SEO
        title="Mysterious Pokestuff"
        description="Discover our full Mystery collection with surprise cards, packs and premium mystery boxes."
      />

      <header className="mystery-hero">
        <div
          className="container mystery-hero__inner"
          style={{
            "--mystery-hero-image": `url(${process.env.PUBLIC_URL}/img/hover-mystery.png)`,
          }}
        >
          <p className="mystery-hero__eyebrow">Mysterious Pokestuff</p>
          <h1>Unbox the Unexpected</h1>
          <p>
            One place for all Mystery products: cards, graded surprises, sealed
            packs, and tiered boxes. If you want the full custom experience,
            build your own Custom Mystery Box with tailored preferences.
          </p>
          <div className="mystery-hero__actions">
            <a
              href="#mystery-products"
              className="mystery-btn mystery-btn--light"
            >
              Explore products
            </a>
            <Link to="/shop-categories?category=100" className="mystery-btn">
              Open Mystery category
            </Link>
          </div>
        </div>
      </header>

      <div className="container mystery-intro-stack">
        <section className="mystery-story">
          <div className="mystery-story__card">
            <h2>Why Mystery?</h2>
            <p>
              Mystery products turn collecting into a moment of excitement.
              Every order is curated to balance value, variety and surprise.
              Whether you collect singles, graded slabs or sealed packs, each
              unboxing is built to feel special.
            </p>
          </div>
          <div className="mystery-story__card">
            <h2>How it works</h2>
            <ul>
              <li>Pick your Mystery product or box tier.</li>
              <li>Choose your budget and preferences (Custom Box).</li>
              <li>We curate the mix and prepare your mystery unboxing.</li>
            </ul>
          </div>
        </section>

        {customBoxProduct && (
          <section className="mystery-custom-highlight">
            <div className="mystery-custom-highlight__content">
              <p className="mystery-custom-highlight__label">
                Featured experience
              </p>
              <h2>Custom Mystery Box</h2>
              <p>
                Choose your budget range, set product preferences and craft your
                own mystery profile. This is the best choice if you want deeper
                personalization before checkout.
              </p>
              <Link to="/mystery/custom-box" className="mystery-btn">
                Customize your box
              </Link>
            </div>
            {getProductImage(customBoxProduct) && (
              <img
                src={getProductImage(customBoxProduct)}
                alt="Custom Mystery Box"
                loading="lazy"
                decoding="async"
              />
            )}
          </section>
        )}
      </div>

      <section className="container mystery-products" id="mystery-products">
        <div className="mystery-products__head">
          <h2>Mystery Collection</h2>
          <p>{mysteryProducts.length} products available</p>
        </div>

        {loading ? (
          <div className="mystery-products__loading">
            Loading mystery products...
          </div>
        ) : mysteryProducts.length === 0 ? (
          <div className="mystery-products__empty">
            No Mystery products found right now.
          </div>
        ) : (
          <div className="mystery-grid">
            {mysteryProducts.map((product) => {
              const title = getProductTitle(product);
              const isCustomBox =
                title.trim().toLowerCase() === "custom mystery box";
              const description = product?.acf?.product_description || "";

              return (
                <article className="mystery-item" key={product.id}>
                  <div className="mystery-item__image-wrap">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="mystery-item__fallback">No image</div>
                    )}
                  </div>
                  <div className="mystery-item__body">
                    <h3>{title}</h3>
                    <p>
                      {description ||
                        "Mystery product from our curated collection."}
                    </p>
                    <div className="mystery-item__footer">
                      <strong>
                        {parsePrice(product?.acf?.price).toFixed(2)} EUR
                      </strong>
                      {isCustomBox ? (
                        <Link
                          to="/mystery/custom-box"
                          className="mystery-item__btn"
                        >
                          Customize
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="mystery-item__btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to cart
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Mystery;
