import React from "react";
import {
  getProductImage,
  getProductTitle,
  parsePrice,
} from "../utils/cartItem";

const ShopProduct = ({ product, onAddToCart }) => {
  const imageUrl = getProductImage(product);
  const title = getProductTitle(product);
  const price = parsePrice(product?.acf?.price ?? product?.price);
  const hasRenderedTitle = Boolean(product?.title?.rendered);

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
