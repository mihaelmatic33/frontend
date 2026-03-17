import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Toast from "../components/Toast";
import { useCart } from "../CartContext";
import {
  getProductImage,
  getProductTitle,
  resolveProductImageUrl,
} from "../utils/cartItem";
import "./CustomMysteryBox.css";

const SHOP_API_URL =
  "https://front2.edukacija.online/backend/wp-json/wp/v2/shop";

const DEFAULT_PREFS = [
  "Booster packs",
  "Tins",
  "Plushies",
  "Singles",
  "Accessories",
  "A bit of everything",
];

const CustomMysteryBox = () => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [budgetMin, setBudgetMin] = useState(250);
  const [budgetMax, setBudgetMax] = useState(600);
  const [selectedPreferences, setSelectedPreferences] = useState([
    "A bit of everything",
  ]);
  const [avoidPreferences, setAvoidPreferences] = useState([]);
  const [surpriseLevel, setSurpriseLevel] = useState("Balanced");
  const [collectorNote, setCollectorNote] = useState("");

  useEffect(() => {
    const fetchCustomBox = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${SHOP_API_URL}?search=${encodeURIComponent("Custom Mystery Box")}&_embed&per_page=20`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const items = await response.json();
        const found = Array.isArray(items)
          ? items.find(
              (item) =>
                getProductTitle(item).trim().toLowerCase() ===
                "custom mystery box",
            ) || null
          : null;

        if (!found) {
          setProduct(null);
          return;
        }

        const image = getProductImage(found);
        if (!image) {
          const resolved = await resolveProductImageUrl(found);
          setProduct(
            resolved ? { ...found, _resolvedImageUrl: resolved } : found,
          );
        } else {
          setProduct(found);
        }
      } catch (error) {
        console.error("Failed to fetch custom mystery box:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomBox();
  }, []);

  const acf = product?.acf || {};
  const minAllowed = Number(acf?.custom_price_min) || 100;
  const maxAllowed = Number(acf?.custom_price_max) || 2000;

  useEffect(() => {
    setBudgetMin(Math.max(minAllowed, Math.min(250, maxAllowed - 10)));
    setBudgetMax(Math.max(minAllowed + 10, Math.min(600, maxAllowed)));
  }, [minAllowed, maxAllowed]);

  const preferences = useMemo(() => {
    if (
      Array.isArray(acf?.custom_preferences_options) &&
      acf.custom_preferences_options.length > 0
    ) {
      return acf.custom_preferences_options;
    }

    return DEFAULT_PREFS;
  }, [acf?.custom_preferences_options]);

  const estimatedPrice = useMemo(
    () => Math.round((budgetMin + budgetMax) / 2),
    [budgetMin, budgetMax],
  );

  const togglePreference = (value) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(value)) {
        const next = prev.filter((entry) => entry !== value);
        return next.length > 0 ? next : [value];
      }

      return [...prev, value];
    });

    setAvoidPreferences((prev) => prev.filter((entry) => entry !== value));
  };

  const toggleAvoidPreference = (value) => {
    setAvoidPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((entry) => entry !== value)
        : [...prev, value],
    );

    setSelectedPreferences((prev) => prev.filter((entry) => entry !== value));
  };

  const handleBudgetMinChange = (value) => {
    const nextMin = Math.max(
      minAllowed,
      Math.min(Number(value), budgetMax - 10),
    );
    setBudgetMin(nextMin);
  };

  const handleBudgetMaxChange = (value) => {
    const nextMax = Math.min(
      maxAllowed,
      Math.max(Number(value), budgetMin + 10),
    );
    setBudgetMax(nextMax);
  };

  const handleAddConfiguredBox = () => {
    if (!product) return;

    const customPreferences = [
      ...selectedPreferences,
      `Budget range: ${budgetMin}-${budgetMax} EUR`,
      `Surprise level: ${surpriseLevel}`,
      ...(avoidPreferences.length > 0
        ? [`Avoid: ${avoidPreferences.join(", ")}`]
        : []),
      ...(collectorNote.trim() ? [`Note: ${collectorNote.trim()}`] : []),
    ];

    const added = addToCart(product, {
      customPrice: estimatedPrice,
      customPreferences,
    });

    if (!added) {
      setToast("Unable to add configured box to cart.");
      return;
    }

    setToast(`Configured Custom Mystery Box added (${estimatedPrice} EUR)`);
  };

  return (
    <div className="custom-mystery-page">
      <SEO
        title="Custom Mystery Box"
        description="Configure your Custom Mystery Box with budget range, preferences and collector notes."
      />

      <header className="custom-mystery-hero">
        <div className="container">
          <p>Custom Experience</p>
          <h1>Build Your Custom Mystery Box</h1>
          <span>
            Define your budget, tell us what you love, and let us curate a box
            made for your collecting style.
          </span>
        </div>
      </header>

      <div className="container custom-mystery-layout">
        {loading ? (
          <div className="custom-mystery-loading">Loading configuration...</div>
        ) : !product ? (
          <div className="custom-mystery-loading">
            Custom Mystery Box is currently unavailable.
            <div>
              <Link to="/mystery">Back to Mystery page</Link>
            </div>
          </div>
        ) : (
          <>
            <section className="custom-mystery-config">
              <h2>Configuration</h2>

              <div className="custom-mystery-section">
                <label>Budget range</label>
                <div className="custom-mystery-range-row">
                  <div>
                    <small>Min budget</small>
                    <input
                      type="range"
                      min={minAllowed}
                      max={maxAllowed - 10}
                      step={10}
                      value={budgetMin}
                      onChange={(event) =>
                        handleBudgetMinChange(event.target.value)
                      }
                    />
                    <strong>{budgetMin} EUR</strong>
                  </div>
                  <div>
                    <small>Max budget</small>
                    <input
                      type="range"
                      min={minAllowed + 10}
                      max={maxAllowed}
                      step={10}
                      value={budgetMax}
                      onChange={(event) =>
                        handleBudgetMaxChange(event.target.value)
                      }
                    />
                    <strong>{budgetMax} EUR</strong>
                  </div>
                </div>
              </div>

              <div className="custom-mystery-section">
                <label>What would you like more of?</label>
                <div className="custom-mystery-chip-list">
                  {preferences.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      className={`custom-mystery-chip${selectedPreferences.includes(pref) ? " active" : ""}`}
                      onClick={() => togglePreference(pref)}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-mystery-section">
                <label>What should we avoid?</label>
                <div className="custom-mystery-chip-list">
                  {preferences.map((pref) => (
                    <button
                      key={`avoid-${pref}`}
                      type="button"
                      className={`custom-mystery-chip custom-mystery-chip--avoid${avoidPreferences.includes(pref) ? " active" : ""}`}
                      onClick={() => toggleAvoidPreference(pref)}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-mystery-section">
                <label htmlFor="surprise-level">Surprise level</label>
                <select
                  id="surprise-level"
                  value={surpriseLevel}
                  onChange={(event) => setSurpriseLevel(event.target.value)}
                >
                  <option value="Balanced">Balanced</option>
                  <option value="High surprise">High surprise</option>
                  <option value="Collector focused">Collector focused</option>
                </select>
              </div>

              <div className="custom-mystery-section">
                <label htmlFor="collector-note">
                  Collector note (optional)
                </label>
                <textarea
                  id="collector-note"
                  rows={4}
                  placeholder="Example: I collect vintage artwork style cards and prefer sealed products from recent sets."
                  value={collectorNote}
                  onChange={(event) => setCollectorNote(event.target.value)}
                />
              </div>
            </section>

            <aside className="custom-mystery-summary">
              {getProductImage(product) && (
                <img
                  src={getProductImage(product)}
                  alt={getProductTitle(product)}
                />
              )}
              <h3>{getProductTitle(product)}</h3>
              <p>
                {acf?.product_description ||
                  "Your custom configuration lets us curate a mystery box around your preferences and budget range."}
              </p>
              <ul>
                <li>
                  Budget range: {budgetMin} - {budgetMax} EUR
                </li>
                <li>Estimated checkout: {estimatedPrice} EUR</li>
                <li>Primary preferences: {selectedPreferences.join(", ")}</li>
                <li>
                  Avoid list:{" "}
                  {avoidPreferences.length > 0
                    ? avoidPreferences.join(", ")
                    : "None"}
                </li>
                <li>Surprise level: {surpriseLevel}</li>
              </ul>
              <button type="button" onClick={handleAddConfiguredBox}>
                Add configured box to cart
              </button>
              <Link to="/mystery">Back to Mysterious Pokestuff</Link>
            </aside>
          </>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CustomMysteryBox;
