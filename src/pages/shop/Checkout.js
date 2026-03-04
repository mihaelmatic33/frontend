import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser"; // <-- dodano

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // flag za preskakanje prvog zapisa u localStorage
  const isFirstRender = useRef(true);

  // delivery / payment form state
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

  // novi state za Terms & Conditions
  const [termsAccepted, setTermsAccepted] = useState(false);

  // EmailJS form ref i state
  const form = useRef();
  const [isSent, setIsSent] = useState(false);

  // --- košarica ---

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = storedCart.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));
    setCart(updatedCart);
  }, []);

  // Spremanje u localStorage kad se cart promijeni
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Promjena količine
  const changeQuantity = (id, amount) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    );
    setCart(updatedCart);
  };

  // Brisanje proizvoda
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  // Ukupna cijena
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // --- delivery form handlers ---

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

  // --- EmailJS slanje ---

  const sendEmail = () => {
    // **VAŽNO**: ovdje koristiš svoj Service ID, Template ID, i Public Key
    // Ti si u pitanju dao:
    // service_dwhzjcu, template_882p0bt, St2MIqCGGqaIGQ1ND
    // Provjeri da su to stvarno tvoji ID-evi u EmailJS dashboardu.
    emailjs
      .sendForm(
        "service_dwhzjcu",
        "template_882p0bt",
        form.current,
        {
          publicKey: "St2MIqCGGqaIGQ1ND",
        }
      )
      .then(
        () => {
          console.log("SUCCESS!");
          setIsSent(true);
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  };

  // --- final order ---

  const handleOrder = () => {
    // Provjera terms - button bi ionako bio disabled ako nije prihvaćeno,
    // ali ovdje osiguravamo da se kôd dalje ne pokrene ako nije
    if (!termsAccepted) return;

    const confirmed = window.confirm("Želim naručiti");
    if (confirmed) {
      // 1) Pošalji email
      sendEmail();

      // 2) Ukloni košaricu i resetiraj
      localStorage.removeItem("cart");
      setCart([]);

      // 3) Možeš navesti navigaciju tek nakon što je e-mail poslan
      //    ili odmah; ovdje radimo odmah:
      alert("Narudžba uspješno završena!");
      navigate("/"); // ili "/shop"
    } else {
      navigate("/cart");
    }
  };

  // --- empty cart fallback ---
  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <h2>Košarica je prazna</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/shop")}>
          Nastavi kupovinu
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Checkout</h2>
      <div className="row">
        {/* Lijeva strana: proizvodi */}
        <div className="col-lg-7">
          <h4 className="mb-3">Proizvodi</h4>
          {cart.map((item) => (
            <div className="card mb-3" key={item.id}>
              <div className="row g-0 align-items-center p-3">
                <div className="col-md-3">
                  <img
                    src={item.images?.[0]}
                    alt={item.title}
                    className="img-fluid"
                    style={{ maxHeight: "100px", objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-4">
                  <h6>{item.title}</h6>
                  <p className="mb-1">{item.price} EUR</p>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
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
          <div className="text-end mt-2">
            <h5>Ukupno: {totalPrice.toFixed(2)} EUR</h5>
          </div>
        </div>

        {/* Desna strana: forma za dostavu i plaćanje */}
        <div className="col-lg-5">
          <h4 className="mb-3">Podaci za dostavu</h4>
          {/* Formu refamo radi EmailJS */}
          <form ref={form}>
            {/* Podaci za dostavu */}
            <div className="mb-2">
              <label className="form-label" htmlFor="fullName">
                Ime i prezime
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName" // ime služi u sendForm/template
                className="form-control"
                value={deliveryInfo.fullName}
                onChange={handleDeliveryChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="address">
                Adresa
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-control"
                value={deliveryInfo.address}
                onChange={handleDeliveryChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="form-label" htmlFor="city">
                  Grad
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-control"
                  value={deliveryInfo.city}
                  onChange={handleDeliveryChange}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="form-label" htmlFor="postalCode">
                  Poštanski broj
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  className="form-control"
                  value={deliveryInfo.postalCode}
                  onChange={handleDeliveryChange}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="phone">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={deliveryInfo.phone}
                onChange={handleDeliveryChange}
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
              />
            </div>

            <h5 className="mt-4 mb-2">Način plaćanja</h5>
            <div className="mb-3">
              <select
                className="form-select"
                value={paymentMethod}
                onChange={handlePaymentChange}
                name="paymentMethod" // može ići u formu ako želiš
              >
                <option value="cash">Gotovina / pouzećem</option>
                <option value="card">Kartično plaćanje</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {/* Ako je kartica odabrana, pokaži dodatna polja */}
            {paymentMethod === "card" && (
              <div className="border rounded p-3 mb-3">
                <h6 className="mb-2">Podaci kartice</h6>

                <div className="mb-2">
                  <label className="form-label" htmlFor="cardNumber">
                    Broj kartice
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
                    Ime na kartici
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
                      Istek
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

            {/* Možeš staviti dodatne skrivene polja s podacima o košarici */}
            {/* Npr. pošalji JSON ili tekst koji si pripremio */}
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

            {/* checkbox za Terms & Conditions */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                checked={termsAccepted}
                onChange={handleTermsChange}
              />
              <label className="form-check-label" htmlFor="termsCheck">
                Prihvaćam{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  uvjete i odredbe
                </a>
              </label>
            </div>

            {/* tipke */}
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/shop")}
              >
                Nastavi kupovinu
              </button>

              <button
                type="button"
                className="btn btn-success"
                onClick={handleOrder}
                disabled={!termsAccepted}
              >
                Naruči
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;