import React from "react";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import "../products.css"; 

const products = [
  {
    brand: "Noberu",
    type: "Pomada",
    image: "https://i.pinimg.com/1200x/eb/d7/ff/ebd7ff4a2cec0713dc6a33603505afed.jpg",
    description: "Pomada profesional para acabado natural."
  },

  {
    brand: "Reuzel",
    type: "Cera",
    image: "https://i.pinimg.com/736x/ee/b5/ad/eeb5ad8b6a1a3942331a663a3c877b0b.jpg",
    description: "Cera de alta fijación y brillo medio."
  },

  {
    brand: "L3vel3",
    type: "Pomada",
    image: "https://i.pinimg.com/736x/ca/69/e9/ca69e9de8c4fd7241c99f28a8e8e3019.jpg",
    description: "Pomada para peinado flexible y fijación media."
  },

  {
    brand: "Red One",
    type: "Cera",
    image: "https://i.pinimg.com/736x/45/19/62/451962402a42f668a7082ef8b7b123f0.jpg",
    description: "Cera de alta fijación con aroma frutal."
  },

  {
    brand: "Slick gorila",
    type: "Polvo voluminizador",
    image: "https://i.pinimg.com/736x/30/1b/32/301b32d3d3d4b6e6af2eaf2e024ec920.jpg",
    description: "Polvo para volumen y textura instantánea."
  },

];

const uniqueBrands = [...new Set(products.map(p => p.brand))];

const Products = () => {
  const [selectedBrand, setSelectedBrand] = useState("Todos");

  const filteredProducts = selectedBrand === "Todos"
    ? products
    : products.filter(p => p.brand === selectedBrand);

  return (
    <div className="products-page">
      <header className="products-header">
        <h1>Productos Premium</h1>
        <p>Descubre nuestra selección de productos premium, diseñados para ofrecerte el mejor cuidado y estilo. Desde pomadas hasta ceras, cada producto ha sido elegido por su calidad y efectividad.</p>
      </header>

        
      <div className="brands-filter" style={{display: "flex", justifyContent: "center", gap: "18px", marginBottom: "30px"}}>
        <button
          className={`brand-filter-btn${selectedBrand === "Todos" ? " selected" : ""}`}
          onClick={() => setSelectedBrand("Todos")}
        >
          Todas las marcas
        </button>
        {uniqueBrands.map(brand => (
          <button
            key={brand}
            className={`brand-filter-btn${selectedBrand === brand ? " selected" : ""}`}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </div>

      <section className="products-grid">
        {filteredProducts.map((product, idx) => (
          <ProductCard key={idx} {...product} />
        ))}
      </section>
    </div>
  );
};



export default Products;