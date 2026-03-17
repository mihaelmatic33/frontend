import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProductImage,
  getProductTitle,
  parsePrice,
  resolveProductImageUrl,
} from "../utils/cartItem";
import { getArticleFields } from "../utils/shopAcf";

const ShopProduct = ({ product, onAddToCart }) => {
  const [imageUrl, setImageUrl] = useState(() => getProductImage(product));
  const title = getProductTitle(product);
  const price = parsePrice(product?.acf?.price ?? product?.price);
  const hasRenderedTitle = Boolean(product?.title?.rendered);
  const acf = product?.acf || {};
  const isCustomMysteryBox =
    title.trim().toLowerCase() === "custom mystery box";
  const minPrice = 100;
  const maxPrice = 2000;
  const sliderStep = 10;
  const [customPrice, setCustomPrice] = useState(() =>
    Math.min(Math.max(price || minPrice, minPrice), maxPrice),
  );
  const availablePreferences = useMemo(
    () =>
      Array.isArray(acf?.custom_preferences_options)
        ? acf.custom_preferences_options
        : [
            "Booster packs",
            "Tins",
            "Plushies",
            "Singles",
            "Accessories",
            "A bit of everything",
          ],
    [acf?.custom_preferences_options],
  );
  const [selectedPreferences, setSelectedPreferences] = useState(() =>
    availablePreferences.length > 0
      ? [availablePreferences[availablePreferences.length - 1]]
      : [],
  );

  useEffect(() => {
    let active = true;

    const loadImage = async () => {
      const resolved = await resolveProductImageUrl(product);
      if (active && resolved) {
        setImageUrl(resolved);
      }
    };

    setImageUrl(getProductImage(product));
    loadImage();

    return () => {
      active = false;
    };
  }, [product]);

  useEffect(() => {
    if (!isCustomMysteryBox) return;

    const initialPrice = Math.min(
      Math.max(price || minPrice, minPrice),
      maxPrice,
    );
    setCustomPrice(initialPrice);

    setSelectedPreferences(
      availablePreferences.length > 0
        ? [availablePreferences[availablePreferences.length - 1]]
        : [],
    );
  }, [isCustomMysteryBox, price, availablePreferences]);

  const articleFields = getArticleFields(acf, { includePrice: false });

  const acfGradingCompany = acf?.grading_company;
  const acfGrade = acf?.grade;
  const acfRarity = acf?.rarity;
  const handleAddClick = () => {
    if (typeof onAddToCart !== "function") return;

    if (!isCustomMysteryBox) {
      onAddToCart(product);
      return;
    }

    onAddToCart(product, {
      customPrice: Number(customPrice.toFixed(2)),
      customPreferences:
        selectedPreferences.length > 0
          ? selectedPreferences
          : ["A bit of everything"],
    });
  };

  const togglePreference = (value) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(value)) {
        return prev.filter((entry) => entry !== value);
      }

      return [...prev, value];
    });
  };

  return (
    <div className={isCustomMysteryBox ? "col-12" : "col-6 col-lg-4"}>
      <div
        className={`shop-product-card${isCustomMysteryBox ? " shop-product-card--custom" : ""}`}
      >
        <div className="shop-product-card__img-wrap">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title ? `Slika proizvoda: ${title}` : "Slika proizvoda"}
            />
          )}
        </div>
        <div
          className={`shop-product-card__body${isCustomMysteryBox ? " shop-product-card__body--custom" : ""}`}
        >
          {hasRenderedTitle ? (
            <h5
              className="shop-product-card__title"
              dangerouslySetInnerHTML={{ __html: product.title.rendered }}
            />
          ) : (
            <h5 className="shop-product-card__title">{title}</h5>
          )}

          <p className="shop-product-card__price">
            {(isCustomMysteryBox ? customPrice : price).toFixed(2)} EUR
          </p>

          {(acfGradingCompany || acfGrade || acfRarity) && (
            <div className="shop-product-card__badge-row">
              {acfGradingCompany && (
                <span className="shop-product-card__badge">
                  {acfGradingCompany}
                </span>
              )}
              {acfGrade && (
                <span className="shop-product-card__badge shop-product-card__badge--grade">
                  Grade {acfGrade}
                </span>
              )}
              {acfRarity && (
                <span className="shop-product-card__badge">{acfRarity}</span>
              )}
            </div>
          )}

          {articleFields.length > 0 && (
            <div className="shop-product-card__meta">
              {articleFields.map((field) => (
                <p key={field.key} className="mb-1">
                  <strong>{field.label}:</strong> {field.value}
                </p>
              ))}
            </div>
          )}

          {isCustomMysteryBox && (
            <div className="shop-product-card__custom-config">
              <label
                className="shop-product-card__slider-label"
                htmlFor={`custom-price-${product.id}`}
              >
                Price range: {customPrice.toFixed(2)} EUR
              </label>
              <input
                id={`custom-price-${product.id}`}
                className="shop-product-card__slider"
                type="range"
                min={minPrice}
                max={maxPrice}
                step={sliderStep}
                value={customPrice}
                onChange={(event) => setCustomPrice(Number(event.target.value))}
              />
              <div className="shop-product-card__slider-scale">
                <span>{minPrice} EUR</span>
                <span>{maxPrice} EUR</span>
              </div>

              <p className="shop-product-card__prefs-title mb-2">
                Preferences:
              </p>
              <div className="shop-product-card__prefs-list">
                {availablePreferences.map((pref) => {
                  const isActive = selectedPreferences.includes(pref);

                  return (
                    <button
                      key={pref}
                      type="button"
                      className={`shop-product-card__pref-chip${isActive ? " active" : ""}`}
                      onClick={() => togglePreference(pref)}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="shop-product-card__actions">
            <button
              type="button"
              className="shop-product-card__btn shop-product-card__btn--cart"
              onClick={handleAddClick}
            >
              Add to cart
            </button>
            <Link
              to={`/shops/${product.slug || ""}`}
              className="shop-product-card__btn shop-product-card__btn--details"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;
