import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import ShopProduct from "../components/ShopProduct";
import { getProductTitle, normalizeProductForCart } from "../utils/cartItem";

const API_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";
const CATEGORY_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/prod-category";
const TOP_LEVEL_CATEGORY_ORDER = [100, 95, 96, 98, 248];
const LABEL_OVERRIDES = {
  95: "Trading Cards game",
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
    label: "Trading Cards game",
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
    label: "Video games",
    subcategories: [],
  },
];

const ShopCategories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        const response = await fetch(`${CATEGORY_API_URL}?per_page=100`);
        if (!response.ok) throw new Error(`HTTP greška: ${response.status}`);
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
        console.error("Greška pri dohvatu kategorija:", error);
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
          if (!res.ok) throw new Error(`HTTP greška: ${res.status}`);
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
      console.error("Greška pri dohvatu proizvoda:", err);
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
    fetchProducts([
      selectedCategory.id,
      ...selectedCategory.subcategories.map((sub) => sub.id),
    ]);
  }, [searchParams, fetchProducts, categories]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const normalizedItem = normalizeProductForCart(product);
    const existingItem = cart.find((item) => item.id === normalizedItem.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push(normalizedItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setToast(`Dodano u košaricu: ${getProductTitle(product)}`);
  };

  return (
    <div className="container mt-4">
      <SEO
        title="Shop Kategorije"
        description="Pregledajte naše proizvode po kategorijama"
      />

      <h1 className="mb-4">Shop categories</h1>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${activeCategory?.id === cat.id ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {activeCategory.subcategories.map((sub) => (
            <button
              key={sub.id}
              className={`btn btn-sm ${activeSubcategory?.id === sub.id ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => handleSubcategoryClick(sub)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Učitavanje proizvoda...</p>
      ) : !activeCategory ? (
        <p>Odaberite kategoriju za prikaz proizvoda.</p>
      ) : products.length === 0 ? (
        <p>Nema dostupnih proizvoda u ovoj kategoriji.</p>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ShopProduct
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopCategories;
