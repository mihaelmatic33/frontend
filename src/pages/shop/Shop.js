import React, { useState, useEffect } from "react";
import Toast from "../../components/Toast";
import ShopProduct from "../../components/ShopProduct";
import { getProductTitle } from "../../utils/cartItem";
import { useCart } from "../../CartContext";

const API_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";

const Shop = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let page = 1;
        let totalPages = 1;
        const allProducts = [];

        do {
          const res = await fetch(
            `${API_URL}?_embed&per_page=100&page=${page}`,
          );
          if (!res.ok) throw new Error(`HTTP greška: ${res.status}`);

          const pageProducts = await res.json();
          allProducts.push(
            ...(Array.isArray(pageProducts) ? pageProducts : []),
          );

          const totalPagesHeader = res.headers.get("X-WP-TotalPages");
          totalPages = Number(totalPagesHeader || 1);
          page += 1;
        } while (page <= totalPages);

        setProducts(allProducts);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const added = addToCart(product);

    if (!added) {
      setToast("Unable to add this product to cart.");
      return;
    }

    setToast(`Dodano u košaricu: ${getProductTitle(product)}`);
  };

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div className="container mt-4">
      <h1>Shop</h1>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {products.length === 0 ? (
        <p>Nema dostupnih proizvoda.</p>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ShopProduct
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
