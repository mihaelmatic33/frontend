import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import ShopProduct from "../components/ShopProduct";
import {
  getProductImage,
  getProductTitle,
  parsePrice,
  resolveProductImageUrl,
} from "../utils/cartItem";
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

const MYSTERY_BOX_ORDER = {
  "mystery box bronze tier": 1,
  "mystery box silver tier": 2,
  "mystery box gold tier": 3,
  "custom mystery box": 4,
};

const SHOWCASE_ROWS = [
  { categoryId: 100, label: "Mystery", direction: "left", duration: 46 },
  {
    categoryId: 95,
    label: "Trading Card Game",
    direction: "right",
    duration: 40,
  },
  { categoryId: 96, label: "Accessories", direction: "left", duration: 42 },
  { categoryId: 98, label: "Toys", direction: "right", duration: 38 },
  { categoryId: 248, label: "Video Games", direction: "left", duration: 44 },
];

const HEADER_BG_BY_CATEGORY = {
  100: "hover-mystery.png",
  95: "tcg-cover.webp",
  96: "accessories-cover.png",
  98: "plush-cover.webp",
  248: "video-cover.png",
};

const getHeaderBackgroundImage = (categoryId) => {
  const fileName = HEADER_BG_BY_CATEGORY[categoryId];
  if (!fileName) {
    return "none";
  }

  return `url(${process.env.PUBLIC_URL}/img/${fileName})`;
};

const ShopCategories = () => {
  const ITEMS_PER_PAGE = 6;
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [isStickyElevated, setIsStickyElevated] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showcaseRows, setShowcaseRows] = useState([]);
  const [showcaseLoading, setShowcaseLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const loadMoreTimeoutRef = useRef(null);

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

  useEffect(() => {
    const fetchShowcaseRows = async () => {
      setShowcaseLoading(true);

      try {
        const rows = await Promise.all(
          SHOWCASE_ROWS.map(async (row) => {
            const response = await fetch(
              `${API_URL}?prod-category=${row.categoryId}&_embed&per_page=10`,
            );

            if (!response.ok) {
              throw new Error(`HTTP error: ${response.status}`);
            }

            const list = await response.json();
            const safeList = Array.isArray(list) ? list : [];

            const withImages = await Promise.all(
              safeList.map(async (product) => {
                const directImage = getProductImage(product);
                if (directImage) return product;

                const resolved = await resolveProductImageUrl(product);
                return resolved
                  ? { ...product, _resolvedImageUrl: resolved }
                  : product;
              }),
            );

            return {
              ...row,
              products: withImages,
            };
          }),
        );

        setShowcaseRows(rows.filter((row) => row.products.length > 0));
      } catch (error) {
        console.error("Failed to fetch showcase rows:", error);
        setShowcaseRows([]);
      } finally {
        setShowcaseLoading(false);
      }
    };

    fetchShowcaseRows();
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

  const selectedCategoryId = Number(searchParams.get("category")) || null;
  const headerCategoryId = hoveredCategoryId ?? selectedCategoryId;
  const headerBackgroundImage = getHeaderBackgroundImage(headerCategoryId);

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
      setVisibleCount(ITEMS_PER_PAGE);
      return;
    }

    const selectedCategory = categories.find((cat) => cat.id === categoryParam);
    if (!selectedCategory) {
      setActiveCategory(null);
      setActiveSubcategory(null);
      setProducts([]);
      setVisibleCount(ITEMS_PER_PAGE);
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
    setVisibleCount(ITEMS_PER_PAGE);
    fetchProducts([
      selectedCategory.id,
      ...selectedCategory.subcategories.map((sub) => sub.id),
    ]);
  }, [searchParams, fetchProducts, categories]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory?.id, activeSubcategory?.id, searchQuery]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsStickyElevated(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const filteredProducts = products
    .filter((product) => {
      if (!searchQuery.trim()) return true;
      const title = product?.title?.rendered || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((left, right) => {
      if (activeSubcategory?.id !== 140) return 0;

      const leftTitle = (left?.title?.rendered || "").toLowerCase();
      const rightTitle = (right?.title?.rendered || "").toLowerCase();
      const leftOrder = MYSTERY_BOX_ORDER[leftTitle] || 999;
      const rightOrder = MYSTERY_BOX_ORDER[rightTitle] || 999;

      if (leftOrder !== rightOrder) return leftOrder - rightOrder;

      return leftTitle.localeCompare(rightTitle);
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!activeCategory || loading || !hasMoreProducts || isLoadingMore) {
      return;
    }

    const sentinel = loadMoreRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting || isLoadingMore) {
          return;
        }

        setIsLoadingMore(true);
        if (loadMoreTimeoutRef.current) {
          clearTimeout(loadMoreTimeoutRef.current);
        }

        loadMoreTimeoutRef.current = setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length),
          );
          setIsLoadingMore(false);
        }, 240);
      },
      {
        root: null,
        rootMargin: "220px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    activeCategory,
    loading,
    hasMoreProducts,
    isLoadingMore,
    filteredProducts.length,
    ITEMS_PER_PAGE,
  ]);

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

    setToast(`Added to cart: ${label}`);
  };

  const handleShowcaseProductClick = (categoryId) => {
    setSearchParams({ category: String(categoryId) });
  };

  const handleShowcaseAddToCart = (event, product) => {
    event.stopPropagation();
    handleAddToCart(product);
  };

  return (
    <div className="shop-categories-page">
      <SEO
        title="Shop Categories"
        description="Browse our products by category"
      />

      <div
        className={`shop-categories__header${headerBackgroundImage !== "none" ? " has-cover" : ""}`}
        style={{ "--shop-header-bg-image": headerBackgroundImage }}
      >
        <div className="container">
          <h1>Shop</h1>
          <p>Find your perfect Pokemon product</p>
        </div>
      </div>

      <div className="container">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <div
          className={`shop-sticky-controls${isStickyElevated ? " is-elevated" : ""}`}
        >
          <div className="shop-sticky-controls__row">
            <div className="shop-filter-bar">
              <span className="shop-filter-bar__label">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`shop-cat-btn${activeCategory?.id === cat.id ? " active" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  onFocus={() => setHoveredCategoryId(cat.id)}
                  onBlur={() => setHoveredCategoryId(null)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="shop-sticky-controls__right">
              <div className="shop-search-wrap">
                <i className="fas fa-search shop-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              {activeCategory && activeCategory.subcategories.length > 0 && (
                <div className="shop-filter-bar shop-filter-bar--subcategories">
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
            </div>
          </div>
        </div>

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
          <div className="shop-discovery">
            <div className="shop-empty-state shop-empty-state--compact">
              <span className="shop-empty-state__icon">🛍️</span>
              <p>
                Odaberi kategoriju ili istraži proizvode kroz slider redove.
              </p>
            </div>

            {showcaseLoading ? (
              <div className="shop-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="shop-skeleton-card" />
                ))}
              </div>
            ) : (
              <div className="shop-showcase-rows">
                {showcaseRows.map((row) => (
                  <section className="shop-showcase-row" key={row.categoryId}>
                    <div className="shop-showcase-row__header">
                      <h3>{row.label}</h3>
                      <button
                        type="button"
                        className="shop-showcase-row__open-btn"
                        onClick={() =>
                          handleShowcaseProductClick(row.categoryId)
                        }
                      >
                        Otvori kategoriju
                      </button>
                    </div>

                    <div className="shop-showcase-row__viewport">
                      <div
                        className={`shop-showcase-row__track ${
                          row.direction === "right"
                            ? "shop-showcase-row__track--right"
                            : "shop-showcase-row__track--left"
                        }`}
                        style={{
                          "--marquee-duration": `${row.duration || 40}s`,
                        }}
                      >
                        {[...row.products, ...row.products].map(
                          (product, index) => (
                            <div
                              key={`${row.categoryId}-${product.id}-${index}`}
                              className="shop-showcase-item"
                              onClick={() =>
                                handleShowcaseProductClick(row.categoryId)
                              }
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  handleShowcaseProductClick(row.categoryId);
                                }
                              }}
                            >
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)}
                                  alt={getProductTitle(product)}
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="shop-showcase-item__fallback">
                                  No image
                                </div>
                              )}
                              <div className="shop-showcase-item__meta">
                                <p>{getProductTitle(product)}</p>
                                <div className="shop-showcase-item__bottom">
                                  <span>
                                    {parsePrice(product?.acf?.price).toFixed(2)}{" "}
                                    EUR
                                  </span>
                                  <button
                                    type="button"
                                    className="shop-showcase-item__cart-btn"
                                    aria-label={`Dodaj u košaricu: ${getProductTitle(product)}`}
                                    onClick={(event) =>
                                      handleShowcaseAddToCart(event, product)
                                    }
                                  >
                                    <i
                                      className="fas fa-shopping-cart"
                                      aria-hidden="true"
                                    ></i>
                                    <span className="shop-showcase-item__cart-label">
                                      Add
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}
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
              {visibleProducts.map((product) => (
                <ShopProduct
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {hasMoreProducts && (
              <>
                <div
                  ref={loadMoreRef}
                  className="shop-infinite-sentinel"
                  aria-hidden="true"
                ></div>
                {isLoadingMore && (
                  <div className="shop-infinite-loader" aria-live="polite">
                    <Loader />
                  </div>
                )}
              </>
            )}

            {!hasMoreProducts && filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="shop-results-end">
                Prikazani su svi proizvodi u ovoj kategoriji.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopCategories;
