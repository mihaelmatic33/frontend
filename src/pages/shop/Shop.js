import { useState, useEffect } from "react";

const Shop = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch("https://dummyjson.com/products");
        if (!response.ok) {
          throw new Error("Ne mogu povući podatke");
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchPage();
  }, []);

  const addToCart = (product) => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert('Dodano u košaricu:' + product.title);
  }
  if (!products) return <p>Učitavanje...</p>;
  return (
    <div className="container">
      <h1> shop</h1>
      <div className="row">
        {products.map((product) => (
          <div className="col-md-4" key={product.id}>
            <img src={product.images[0]} alt={product.title} />
            <h3 key={product.id}>{product.title}</h3>

            <button className="btn btn-success" onClick={() => addToCart(product)}>{product.price} EUR</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
