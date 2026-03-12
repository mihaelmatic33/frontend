import React, { useState, useEffect } from "react";
import Toast from "../../components/Toast";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://dummyjson.com/products");
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setToast(`Dodano u košaricu: ${product.title}`);
  };

  if (!products || products.length === 0) return <p>Učitavanje...</p>;

  return (
    <div className="container mt-4">
      <h1>Shop</h1>

      {}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={product.images[0]}
                alt={product.title}
                style={{ maxHeight: "150px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5>{product.title}</h5>
                <p>{product.price} EUR</p>
                <button
                  className="btn btn-success"
                  onClick={() => addToCart(product)}
                >
                  Dodaj u košaricu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;