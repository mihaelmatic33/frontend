import React, { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import Toast from "../../components/Toast";
import ShopProduct from "../../components/ShopProduct";
import { getProductTitle } from "../../utils/cartItem";
import { useCart } from "../../CartContext";
import "../ShopCategories.css";

const API_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";
const PER_PAGE = 6;

const Shop = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchParam = searchQuery
          ? `&search=${encodeURIComponent(searchQuery)}`
          : "";
        const res = await fetch(
          `${API_URL}?_embed&per_page=${PER_PAGE}&page=${currentPage}${searchParam}`,
        );
        if (!res.ok) throw new Error(`HTTP greška: ${res.status}`);

        const pageProducts = await res.json();
        setProducts(Array.isArray(pageProducts) ? pageProducts : []);

        setTotalPages(Number(res.headers.get("X-WP-TotalPages") || 1));
        setTotalProducts(Number(res.headers.get("X-WP-Total") || 0));
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery]);

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product, options = {}) => {
    const added = addToCart(product, options);
    if (!added) {
      setToast("Unable to add this product to cart.");
      return;
    }

    const chosenPrice = Number(options?.customPrice);
    const label =
      Number.isFinite(chosenPrice) && chosenPrice > 0
        ? `${getProductTitle(product)} (${chosenPrice.toFixed(2)} EUR)`
        : getProductTitle(product);

    setToast(`Dodano u košaricu: ${label}`);
  };

  return (
    <div className="shop-categories-page">
      <SEO title="Shop" description="Browse all products in our shop" />

      <div className="shop-categories__header">
        <div className="container">
          <h1>Shop</h1>
          <p>Pregledaj sve dostupne proizvode</p>
        </div>
      </div>

      <div className="container">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <div className="d-flex justify-content-end mb-3">
          <div className="shop-search-wrap">
            <i className="fas fa-search shop-search-icon"></i>
            <input
              type="text"
              placeholder="Pretraži po nazivu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <hr className="shop-divider" />

        {!loading && (
          <p className="shop-results-info">
            {totalProducts} {totalProducts === 1 ? "proizvod" : "proizvoda"}
            {searchQuery && ` za "${searchQuery}"`}
          </p>
        )}

        {loading ? (
          <div className="shop-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shop-skeleton-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="shop-empty-state">
            <span className="shop-empty-state__icon">🔍</span>
            <p>
              {searchQuery
                ? `Nema proizvoda za "${searchQuery}".`
                : "Nema dostupnih proizvoda."}
            </p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {products.map((product) => (
                <ShopProduct
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="shop-pagination">
                <button
                  className="shop-pagination__btn"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Prethodna
                </button>
                <span className="shop-pagination__info">
                  Stranica {currentPage} / {totalPages}
                </span>
                <button
                  className="shop-pagination__btn"
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sljedeća →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
