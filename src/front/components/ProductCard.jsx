import React from "react";

const ProductCard = ({ brand, type, image, description }) => {
  return (
    <div className="product-card">
      {image && <img src={image} alt={brand} className="product-img" />}
      <h3 className="product-brand">{brand}</h3>
      <p className="product-type">{type}</p>
      {description && <p className="product-description">{description}</p>}
    </div>
  );
};

export default ProductCard;