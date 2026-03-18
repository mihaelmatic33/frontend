import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import {
  getCartItemImage,
  getProductTitle,
  parsePrice,
} from "../../utils/cartItem";
import { useCart } from "../../CartContext";
import "./Checkout.css";

const EMAILJS_SERVICE_ID =
  process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_dwhzjcu";
const EMAILJS_TEMPLATE_ID =
  process.env.REACT_APP_EMAILJS_ORDER_TEMPLATE_ID || "template_br5bzbl";
const EMAILJS_PUBLIC_KEY =
  process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "St2MIqCGGqaIGQ1ND";
const COMPANY_ORDER_EMAIL =
  process.env.REACT_APP_ORDER_RECEIVER_EMAIL || "orders@pokestuff.com";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);

const getPaymentMethodLabel = (paymentMethod) => {
  if (paymentMethod === "card") return "Card payment";
  if (paymentMethod === "paypal") return "PayPal";
  return "Cash on delivery";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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

  const validateDeliveryInfo = () => {
    const requiredFields = [
      "fullName",
      "address",
      "city",
      "postalCode",
      "phone",
      "email",
    ];

    const hasMissingField = requiredFields.some(
      (field) => !String(deliveryInfo[field] || "").trim(),
    );

    if (hasMissingField) {
      alert("Please fill in all delivery information fields.");
      return false;
    }

    return true;
  };

  const buildOrderItems = () =>
    cart.map((item) => {
      const title = getProductTitle(item);
      const quantity = Number(item.quantity) || 1;
      const unitPrice = parsePrice(item.price);
      return {
        title,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      };
    });

  const buildOrderItemsHtml = (items) => {
    const rows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:10px;border:1px solid #e2e8f0;color:#1f2937;">${escapeHtml(item.title)}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#1f2937;">${item.quantity}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;color:#1f2937;">${formatCurrency(item.unitPrice)}</td>
          </tr>`,
      )
      .join("");

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;background:#ffffff;border-radius:10px;overflow:hidden;">
      <thead>
        <tr>
          <th style="padding:12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:left;color:#0f172a;">Product</th>
          <th style="padding:12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:center;color:#0f172a;">Qty</th>
          <th style="padding:12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:right;color:#0f172a;">Unit price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  };

  const sendOrderEmails = async ({ orderId, orderDate, items }) => {
    const itemsText = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.title} x${item.quantity} - ${formatCurrency(item.unitPrice)}`,
      )
      .join("\n");
    const itemsHtml = buildOrderItemsHtml(items);

    const baseParams = {
      order_id: orderId,
      order_date: orderDate,
      order_items_text: itemsText,
      order_items_html: itemsHtml,
      total_price: formatCurrency(totalPrice),
      payment_method: getPaymentMethodLabel(paymentMethod),
      full_name: deliveryInfo.fullName,
      address: deliveryInfo.address,
      city: deliveryInfo.city,
      postal_code: deliveryInfo.postalCode,
      phone: deliveryInfo.phone,
      customer_email: deliveryInfo.email,
      company_name: "Pokestuff",
      thank_you_note:
        "Thank you for shopping with Pokestuff. We truly appreciate your order and trust.",
    };

    const customerEmailParams = {
      ...baseParams,
      to_email: deliveryInfo.email,
      to_name: deliveryInfo.fullName,
      subject: `Your Pokestuff order confirmation - #${orderId}`,
      greeting: `Hello ${deliveryInfo.fullName},`,
    };

    const adminEmailParams = {
      ...baseParams,
      to_email: COMPANY_ORDER_EMAIL,
      to_name: "Pokestuff team",
      subject: `New Pokestuff order received - #${orderId}`,
      greeting: "Hello Pokestuff team,",
    };

    await Promise.all([
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        customerEmailParams,
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        },
      ),
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, adminEmailParams, {
        publicKey: EMAILJS_PUBLIC_KEY,
      }),
    ]);
  };

  const handleOrder = async () => {
    if (!termsAccepted || isSubmittingOrder) return;
    if (!validateDeliveryInfo()) return;

    const confirmed = window.confirm("Do you want to place this order?");
    if (!confirmed) {
      navigate("/cart");
      return;
    }

    setIsSubmittingOrder(true);

    const orderItems = buildOrderItems();
    const orderId = `${Date.now()}`;
    const orderDate = new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      await sendOrderEmails({
        orderId,
        orderDate,
        items: orderItems,
      });

      const order = {
        id: Number(orderId),
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

      clearCart();
      localStorage.removeItem("cartItems");
      alert(
        "Order placed successfully! Confirmation emails were sent to you and Pokestuff.",
      );
      navigate("/");
    } catch (error) {
      console.error("Order email failed:", error);
      alert(
        "Your order could not be completed because confirmation email sending failed. Please try again.",
      );
    } finally {
      setIsSubmittingOrder(false);
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

            <form className="checkout-form">
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
                  disabled={!termsAccepted || isSubmittingOrder}
                >
                  {isSubmittingOrder ? "Sending..." : "Place order"}
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
