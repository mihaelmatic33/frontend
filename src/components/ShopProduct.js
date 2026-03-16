import React, { useEffect, useState } from "react";
import {
  getProductImage,
  getProductTitle,
  parsePrice,
  resolveProductImageUrl,
} from "../utils/cartItem";
import { getArticleFields, getGroupedAcfFields } from "../utils/shopAcf";

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
  const groupedFields = getGroupedAcfFields(product);

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title ? `Slika proizvoda: ${title}` : "Slika proizvoda"}
            className="card-img-top"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        )}
        <div className="card-body d-flex flex-column">
          {hasRenderedTitle ? (
            <h5
              className="card-title"
              dangerouslySetInnerHTML={{ __html: product.title.rendered }}
            />
          ) : (
            <h5 className="card-title">{title}</h5>
          )}
          <p className="card-text fw-bold">{price.toFixed(2)} EUR</p>

          {articleFields.length > 0 && (
            <div className="small text-muted mb-3">
              {articleFields.map((field) => (
                <p key={field.key} className="mb-1">
                  <strong>{field.label}:</strong> {field.value}
                </p>
              ))}
            </div>
          )}

          {groupedFields.length > 0 && (
            <div className="small text-muted mb-3">
              {groupedFields.map((group) => (
                <div key={group.title} className="mb-2">
                  <p className="mb-1 fw-semibold">{group.title}</p>
                  {group.fields.map((field) => (
                    <p key={field.key} className="mb-1">
                      <strong>{field.label}:</strong> {field.value}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-success mt-auto"
            onClick={() => onAddToCart(product)}
          >
            Dodaj u košaricu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;
