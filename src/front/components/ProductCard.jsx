import React from "react";
import "../products.css";

const ProductCard = ({ brand, type, image, description, price, onAddToCart, adding }) => {
  return (
    <div className="product-card">
      {image && <img src={image} alt={brand} className="product-img" />}
      <h3 className="product-brand">{brand}</h3>
      <p className="product-type">{type}</p>
      {price !== undefined && (
        <p className="product-price" style={{ fontWeight: "bold", color: "#26a69a" }}>
          €{parseFloat(price).toFixed(2)}
        </p>
      )}
      {description && <p className="product-description">{description}</p>}
      {onAddToCart && (
        <button
          className="btn btn-primary mt-2"
          onClick={onAddToCart}
          disabled={adding}
        >
          {adding ? "Agregando..." : "Agregar al carrito"}
        </button>
      )}
    </div>
  );
};

export default ProductCard;