import React from "react";

const ShopProduct = ({ product, onAddToCart }) => {
  const imageUrl =
    product._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
  const price = product.acf?.price || null;

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.title?.rendered ? `Slika proizvoda: ${product.title.rendered}` : "Slika proizvoda"}
            className="card-img-top"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        )}
        <div className="card-body d-flex flex-column">
          <h5
            className="card-title"
            dangerouslySetInnerHTML={{ __html: product.title?.rendered }}
          />
          {price && <p className="card-text fw-bold">{price} EUR</p>}
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
