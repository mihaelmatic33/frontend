import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import ShopProduct from "../components/ShopProduct";
import { getProductTitle } from "../utils/cartItem";
import { useCart } from "../CartContext";
import "./ShopCategories.css";

const API_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";
const CATEGORY_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/prod-category";
const TOP_LEVEL_CATEGORY_ORDER = [100, 95, 96, 98, 248];
const LABEL_OVERRIDES = {
  95: "Trading Card Game",
  96: "Accessories",
  98: "Toys",
  107: "Plushies",
  247: "Add-ons",
};

const FALLBACK_CATEGORIES = [
  {
    id: 100,
    label: "Mystery",
    subcategories: [
      { id: 140, label: "Mystery box" },
      { id: 137, label: "Mystery card" },
      { id: 138, label: "Mystery slab (graded card)" },
      { id: 139, label: "Mystery sealed (product)" },
    ],
  },
  {
    id: 95,
    label: "Trading Card Game",
    subcategories: [
      { id: 112, label: "Graded" },
      { id: 110, label: "Sealed" },
      { id: 109, label: "Singles" },
    ],
  },
  {
    id: 96,
    label: "Accessories",
    subcategories: [
      { id: 126, label: "Wearables" },
      { id: 247, label: "Add-ons" },
    ],
  },
  {
    id: 98,
    label: "Toys",
    subcategories: [
      { id: 106, label: "Figures" },
      { id: 107, label: "Plushies" },
      { id: 127, label: "Fan Art" },
    ],
  },
  {
    id: 248,
    label: "Video Games",
    subcategories: [],
  },
];

const ShopCategories = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        const response = await fetch(`${CATEGORY_API_URL}?per_page=100`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const terms = await response.json();
        if (!Array.isArray(terms)) return;

        const mapped = TOP_LEVEL_CATEGORY_ORDER.map((parentId) => {
          const parent = terms.find((term) => term.id === parentId);
          if (!parent) return null;

          const subcategories = terms
            .filter((term) => term.parent === parentId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((term) => ({
              id: term.id,
              label: LABEL_OVERRIDES[term.id] || term.name,
            }));

          return {
            id: parent.id,
            label: LABEL_OVERRIDES[parent.id] || parent.name,
            subcategories,
          };
        }).filter(Boolean);

        if (mapped.length > 0) {
          setCategories(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategoryTree();
  }, []);

  const fetchProducts = useCallback(async (categoryIds) => {
    const ids = Array.from(new Set(categoryIds.filter(Boolean)));
    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const responses = await Promise.all(
        ids.map(async (id) => {
          const url = `${API_URL}?prod-category=${id}&_embed&per_page=100`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          return res.json();
        }),
      );

      const seen = new Set();
      const merged = responses
        .flatMap((data) => (Array.isArray(data) ? data : []))
        .filter((product) => {
          const id = product?.id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });

      setProducts(merged);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryClick = (category) => {
    setSearchParams({ category: String(category.id) });
  };

  const handleSubcategoryClick = (subcategory) => {
    if (!activeCategory) return;

    setSearchParams({
      category: String(activeCategory.id),
      subcategory: String(subcategory.id),
    });
  };

  useEffect(() => {
    const categoryParam = Number(searchParams.get("category"));
    const subcategoryParam = Number(searchParams.get("subcategory"));

    if (!categoryParam) {
      setActiveCategory(null);
      setActiveSubcategory(null);
      setProducts([]);
      return;
    }

    const selectedCategory = categories.find((cat) => cat.id === categoryParam);
    if (!selectedCategory) {
      setActiveCategory(null);
      setActiveSubcategory(null);
      setProducts([]);
      return;
    }

    setActiveCategory(selectedCategory);

    if (subcategoryParam) {
      const selectedSubcategory = selectedCategory.subcategories.find(
        (sub) => sub.id === subcategoryParam,
      );

      if (selectedSubcategory) {
        setActiveSubcategory(selectedSubcategory);
        fetchProducts([selectedSubcategory.id]);
        return;
      }
    }

    setActiveSubcategory(null);
    setCurrentPage(1);
    fetchProducts([
      selectedCategory.id,
      ...selectedCategory.subcategories.map((sub) => sub.id),
    ]);
  }, [searchParams, fetchProducts, categories]);

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const title = product?.title?.rendered || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    const added = addToCart(product);

    if (!added) {
      setToast("Unable to add this product to cart.");
      return;
    }

    setToast(`Added to cart: ${getProductTitle(product)}`);
  };

  return (
    <div className="shop-categories-page">
      <SEO
        title="Shop Categories"
        description="Browse our products by category"
      />

      <div className="shop-categories__header">
        <div className="container">
          <h1>Shop</h1>
          <p>Find your perfect Pokemon product</p>
        </div>
      </div>

      <div className="container">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
          <div className="shop-filter-bar">
            <span className="shop-filter-bar__label">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`shop-cat-btn${activeCategory?.id === cat.id ? " active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="shop-search-wrap">
            <i className="fas fa-search shop-search-icon"></i>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="shop-filter-bar mb-2">
            <span className="shop-filter-bar__label">Subcategory:</span>
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                className={`shop-subcat-btn${activeSubcategory?.id === sub.id ? " active" : ""}`}
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        <hr className="shop-divider" />

        {!loading && activeCategory && filteredProducts.length > 0 && (
          <p className="shop-results-info">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {loading ? (
          <div className="shop-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shop-skeleton-card" />
            ))}
          </div>
        ) : !activeCategory ? (
          <div className="shop-empty-state">
            <span className="shop-empty-state__icon">🛍️</span>
            <p>Select a category to view products.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="shop-empty-state">
            <span className="shop-empty-state__icon">🔍</span>
            <p>
              No products available
              {searchQuery ? ` for "${searchQuery}"` : " in this category"}.
            </p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {paginatedProducts.map((product) => (
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
                  ← Previous
                </button>
                <span className="shop-pagination__info">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className="shop-pagination__btn"
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopCategories;
