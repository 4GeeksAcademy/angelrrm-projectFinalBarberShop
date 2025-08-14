import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../components/Navbar";
import "../products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  // Usar el contexto del carrito
  const { updateCartCount } = useContext(CartContext) || {};

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        if (!response.ok) throw new Error("Error al cargar productos");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error:", error);
        // Si no hay productos en la API, usar los datos estáticos como fallback

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Función para añadir al carrito
  const handleAddToCart = async (productId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para añadir productos al carrito");
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });

      if (!response.ok) throw new Error("Error al añadir al carrito");

      // Actualizar contador del carrito
      if (updateCartCount) {
        updateCartCount();
      }

      // Mostrar notificación de éxito
      alert("¡Producto añadido al carrito!");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al añadir el producto al carrito");
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const uniqueBrands = [...new Set(products.map(p => p.brand))];
  const filteredProducts = selectedBrand === "Todos"
    ? products
    : products.filter(p => p.brand === selectedBrand);

  if (loading) {
    return (
      <div className="products-page">
        <div className="container text-center py-5">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <h1>Productos Premium</h1>
        <p>Descubre nuestra selección de productos premium para el cuidado y estilo.</p>
      </header>

      <div className="brands-filter" style={{ display: "flex", justifyContent: "center", gap: "18px", marginBottom: "30px" }}>
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
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            brand={product.brand}
            type={product.type}
            image={product.image_url}
            description={product.description}
            price={product.price}
            onAddToCart={() => handleAddToCart(product.id)}
            adding={addingToCart[product.id]}
          />
        ))}
      </section>
    </div>
  );
};

export default Products;