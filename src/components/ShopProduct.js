import React, { useEffect, useState } from "react";
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

  const articleFields = getArticleFields(acf, { includePrice: false });

  const acfGradingCompany = acf?.grading_company;
  const acfGrade = acf?.grade;
  const acfRarity = acf?.rarity;

  return (
    <div className="col-6 col-lg-4">
      <div className="shop-product-card">
        <div className="shop-product-card__img-wrap">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title ? `Slika proizvoda: ${title}` : "Slika proizvoda"}
            />
          )}
        </div>
        <div className="shop-product-card__body">
          {hasRenderedTitle ? (
            <h5
              className="shop-product-card__title"
              dangerouslySetInnerHTML={{ __html: product.title.rendered }}
            />
          ) : (
            <h5 className="shop-product-card__title">{title}</h5>
          )}

          <p className="shop-product-card__price">{price.toFixed(2)} EUR</p>

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

          <button
            type="button"
            className="shop-product-card__btn"
            onClick={() => {
              if (typeof onAddToCart === "function") {
                onAddToCart(product);
              }
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;
