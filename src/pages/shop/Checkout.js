import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import {
  getCartItemImage,
  getProductTitle,
  parsePrice,
} from "../../utils/cartItem";
import { useCart } from "../../CartContext";
import "./Checkout.css";

const Checkout = () => {
  const {
    cartItems: cart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash"); // default
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const form = useRef();

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

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const sendEmail = () => {
    emailjs
      .sendForm("service_dwhzjcu", "template_882p0bt", form.current, {
        publicKey: "St2MIqCGGqaIGQ1ND",
      })
      .then(
        () => {
          console.log("SUCCESS!");
        },
        (error) => {
          console.log("FAILED...", error.text);
        },
      );
  };

  const handleOrder = () => {
    if (!termsAccepted) return;

    const confirmed = window.confirm("Do you want to place this order?");
    if (confirmed) {
      // Save order to history before clearing cart
      const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cart.map((item) => ({
          title: getProductTitle(item),
          price: parsePrice(item.price),
          quantity: item.quantity,
          image: getCartItemImage(item),
        })),
        total: totalPrice,
        delivery: deliveryInfo,
      };
      const existing = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      existing.unshift(order);
      localStorage.setItem("orderHistory", JSON.stringify(existing));

      sendEmail();
      clearCart();
      localStorage.removeItem("cartItems");
      alert("Order placed successfully!");
      navigate("/");
    } else {
      navigate("/cart");
    }
  };
  if (cart.length === 0) {
    return (
      <div className="checkout-page checkout-page--empty container mt-5">
        <h2>Your cart is empty</h2>
        <p>Add products from Shop Categories and come back to checkout.</p>
        <button
          className="checkout-btn checkout-btn--primary mt-3"
          onClick={() => navigate("/shop-categories")}
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container mt-4">
      <div className="checkout-page__header">
        <h2>Checkout</h2>
        <p>Review your order and complete delivery details.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="checkout-panel">
            <div className="checkout-panel__head">
              <h4>Products</h4>
            </div>

            {cart.map((item) => (
              <div className="checkout-item mb-3" key={item.id}>
                <div className="row g-0 align-items-center p-3">
                  <div className="col-md-3">
                    {getCartItemImage(item) ? (
                      <img
                        src={getCartItemImage(item)}
                        alt="Product"
                        className="img-fluid checkout-item__image"
                      />
                    ) : (
                      <div className="checkout-item__image-fallback d-flex align-items-center justify-content-center">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <h6 className="checkout-item__title">
                      {getProductTitle(item)}
                    </h6>
                    <p className="checkout-item__price mb-1">
                      {parsePrice(item.price).toFixed(2)} EUR
                    </p>
                    {Array.isArray(item.customPreferences) &&
                      item.customPreferences.length > 0 && (
                        <p className="checkout-item__meta mb-1">
                          Preference: {item.customPreferences.join(", ")}
                        </p>
                      )}
                  </div>
                  <div className="col-md-3">
                    <div className="checkout-qty d-flex align-items-center">
                      <button
                        className="checkout-qty__btn"
                        onClick={() => changeQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="checkout-qty__value mx-2">
                        {item.quantity}
                      </span>
                      <button
                        className="checkout-qty__btn"
                        onClick={() => changeQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <button
                      className="checkout-btn checkout-btn--danger checkout-btn--sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="checkout-total text-end mt-2">
              <h5>Total: {totalPrice.toFixed(2)} EUR</h5>
            </div>
          </section>
        </div>

        <div className="col-lg-5">
          <section className="checkout-panel">
            <div className="checkout-panel__head">
              <h4>Delivery information</h4>
            </div>

            <form ref={form} className="checkout-form">
              <div className="mb-2">
                <label className="form-label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  value={deliveryInfo.fullName}
                  onChange={handleDeliveryChange}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  value={deliveryInfo.address}
                  onChange={handleDeliveryChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label" htmlFor="city">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-control"
                    value={deliveryInfo.city}
                    onChange={handleDeliveryChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label" htmlFor="postalCode">
                    Postal code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className="form-control"
                    value={deliveryInfo.postalCode}
                    onChange={handleDeliveryChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={deliveryInfo.phone}
                  onChange={handleDeliveryChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={deliveryInfo.email}
                  onChange={handleDeliveryChange}
                  required
                />
              </div>

              <h5 className="mt-4 mb-2">Payment method</h5>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={handlePaymentChange}
                  name="paymentMethod"
                >
                  <option value="cash">Cash on delivery</option>
                  <option value="card">Card payment</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentMethod === "card" && (
                <div className="checkout-card-box border rounded p-3 mb-3">
                  <h6 className="mb-2">Card information</h6>

                  <div className="mb-2">
                    <label className="form-label" htmlFor="cardNumber">
                      Card number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className="form-control"
                      value={cardInfo.cardNumber}
                      onChange={handleCardChange}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label" htmlFor="cardName">
                      Name on card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      className="form-control"
                      value={cardInfo.cardName}
                      onChange={handleCardChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label" htmlFor="expiry">
                        Expiry
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        name="expiry"
                        className="form-control"
                        placeholder="MM/YY"
                        value={cardInfo.expiry}
                        onChange={handleCardChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label" htmlFor="cvv">
                        CVV
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        name="cvv"
                        className="form-control"
                        value={cardInfo.cvv}
                        onChange={handleCardChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <input
                type="hidden"
                name="cart_items"
                value={JSON.stringify(cart)}
              />
              <input
                type="hidden"
                name="total_price"
                value={totalPrice.toFixed(2)}
              />

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="termsCheck"
                  checked={termsAccepted}
                  onChange={handleTermsChange}
                />
                <label className="form-check-label" htmlFor="termsCheck">
                  I accept{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    terms and conditions
                  </a>
                </label>
              </div>

              <div className="checkout-actions d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="checkout-btn checkout-btn--ghost"
                  onClick={() => navigate("/shop-categories")}
                >
                  Continue shopping
                </button>

                <button
                  type="button"
                  className="checkout-btn checkout-btn--primary"
                  onClick={handleOrder}
                  disabled={!termsAccepted}
                >
                  Place order
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
