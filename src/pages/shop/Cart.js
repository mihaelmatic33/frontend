import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import {
  getCartItemImage,
  getProductTitle,
  parsePrice,
  resolveCartItemImageUrl,
} from "../../utils/cartItem";
import { useCart } from "../../CartContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems: cart, removeFromCart, updateQuantity } = useCart();
  const [toast, setToast] = useState(null); // poruka za toast
  const [resolvedImages, setResolvedImages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadMissingImages = async () => {
      const missingItems = cart.filter(
        (item) => !getCartItemImage(item) && !resolvedImages[item.id],
      );

      if (missingItems.length === 0) return;

      const resolved = await Promise.all(
        missingItems.map(async (item) => ({
          id: item.id,
          url: await resolveCartItemImageUrl(item),
        })),
      );

      if (cancelled) return;

      const nextEntries = resolved.filter((entry) => entry.url);
      if (nextEntries.length === 0) return;

      setResolvedImages((prev) => {
        const next = { ...prev };
        nextEntries.forEach((entry) => {
          next[entry.id] = entry.url;
        });
        return next;
      });
    };

    loadMissingImages();

    return () => {
      cancelled = true;
    };
  }, [cart, resolvedImages]);

  const changeQuantity = (id, amount) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    const nextQuantity = Math.max(1, (item.quantity || 1) + amount);
    updateQuantity(id, nextQuantity);
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const totalPrice = cart.reduce((total, item) => {
    return total + parsePrice(item.price) * item.quantity;
  }, 0);

  const finishOrder = () => {
    navigate("/checkout");
  };
  if (cart.length === 0) {
    return (
      <div className="cart-page cart-page--empty container mt-5">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <h2 className="cart-page__title">Cart is empty</h2>
        <p className="cart-page__subtitle">
          Dodaj proizvod iz Shop Categories i vrati se ovdje.
        </p>
        <button
          className="cart-btn cart-btn--primary mt-3"
          onClick={() => navigate("/shop")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page container mt-5">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="cart-page__header">
        <h2 className="cart-page__title">Moja košarica</h2>
        <span className="cart-page__count">{cart.length} artikala</span>
      </div>

      {cart.map((item) => (
        <div className="cart-item card mb-3" key={item.id}>
          <div className="row g-0 align-items-center p-3">
            <div className="col-md-3">
              {getCartItemImage(item) || resolvedImages[item.id] ? (
                <img
                  src={getCartItemImage(item) || resolvedImages[item.id]}
                  alt="Product"
                  className="img-fluid cart-item__image"
                />
              ) : (
                <div className="cart-item__image-fallback d-flex align-items-center justify-content-center text-muted border rounded">
                  No image
                </div>
              )}
            </div>

            <div className="col-md-4 cart-item__details">
              <h5 className="cart-item__title">{getProductTitle(item)}</h5>
              <p className="cart-item__price">
                {parsePrice(item.price).toFixed(2)} EUR
              </p>
            </div>

            <div className="col-md-3">
              <div className="d-flex align-items-center cart-qty">
                <button
                  className="cart-qty__btn"
                  onClick={() => changeQuantity(item.id, -1)}
                >
                  -
                </button>
                <span className="cart-qty__value">{item.quantity}</span>
                <button
                  className="cart-qty__btn"
                  onClick={() => changeQuantity(item.id, 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-md-2 text-end">
              <button
                className="cart-btn cart-btn--danger cart-btn--sm"
                onClick={() => removeItem(item.id)}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="cart-summary text-end mt-4">
        <h4>Ukupno: {totalPrice.toFixed(2)} EUR</h4>
      </div>

      <div className="cart-actions d-flex justify-content-between mt-4">
        <button
          className="cart-btn cart-btn--ghost"
          onClick={() => navigate("/shop")}
        >
          Nastavi kupovinu
        </button>

        <button className="cart-btn cart-btn--primary" onClick={finishOrder}>
          Zaključi narudžbu
        </button>
      </div>
    </div>
  );
};

export default Cart;
