import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { getProductTitle, parsePrice } from "../../utils/cartItem";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null); // poruka za toast
  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    const updatedCart = storedCart.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));

    setCart(updatedCart);
  }, []);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  const changeQuantity = (id, amount) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item,
    );
    setCart(updatedCart);
  };
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };
  const totalPrice = cart.reduce((total, item) => {
    return total + parsePrice(item.price) * item.quantity;
  }, 0);
  const finishOrder = () => {
    navigate("/checkout");
  };
  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <h2>Cart is empty</h2>
        <button
          className="btn signin-btn mt-3"
          onClick={() => navigate("/shop")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <h2 className="mb-4">Moja košarica</h2>

      {cart.map((item) => (
        <div className="card mb-3" key={item.id}>
          <div className="row g-0 align-items-center p-3">
            <div className="col-md-3">
              <img
                src={item.images?.[0] || item.image || ""}
                alt={getProductTitle(item)}
                className="img-fluid"
                style={{ maxHeight: "120px", objectFit: "cover" }}
              />
            </div>

            <div className="col-md-4">
              <h5>{getProductTitle(item)}</h5>
              <p>{parsePrice(item.price).toFixed(2)} EUR</p>
            </div>

            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => changeQuantity(item.id, -1)}
                >
                  -
                </button>
                <span className="mx-3">{item.quantity}</span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => changeQuantity(item.id, 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-md-2 text-end">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeItem(item.id)}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="text-end mt-4">
        <h4>Ukupno: {totalPrice.toFixed(2)} EUR</h4>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/shop")}>
          Nastavi kupovinu
        </button>

        <button className="btn btn-success" onClick={finishOrder}>
          Zaključi narudžbu
        </button>
      </div>
    </div>
  );
};

export default Cart;
