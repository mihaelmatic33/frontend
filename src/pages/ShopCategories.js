import React, { useState, useCallback } from "react";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import ShopProduct from "../components/ShopProduct";
import { getProductTitle, normalizeProductForCart } from "../utils/cartItem";

const API_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";

const CATEGORIES = [
  {
    id: 100,
    label: "Mystery",
    subcategories: [
      { id: 138, label: "Graded" },
      { id: 137, label: "Singles" },
      { id: 139, label: "Booster Packs" },
      { id: 140, label: "Mystery Box" },
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
    subcategories: [],
  },
  {
    id: 98,
    label: "Toys",
    subcategories: [{ id: 106, label: "Figures" }],
  },
  {
    id: 248,
    label: "Video games",
    subcategories: [],
  },
];

const ShopCategories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProducts = useCallback(async (categoryId) => {
    setLoading(true);
    try {
      const url = `${API_URL}?prod-category=${categoryId}&_embed&per_page=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP greška: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Greška pri dohvatu proizvoda:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveSubcategory(null);
    fetchProducts(category.id);
  };

  const handleSubcategoryClick = (subcategory) => {
    setActiveSubcategory(subcategory);
    fetchProducts(subcategory.id);
  };

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
        {CATEGORIES.map((cat) => (
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
