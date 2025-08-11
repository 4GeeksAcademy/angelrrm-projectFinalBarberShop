import React, { useState, useEffect, useContext, createContext } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/img/logo.png';
import { FaShoppingCart } from "react-icons/fa";
import { getCart } from  "../../api/cart";

// Cart context for global state
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count on mount and when needed
    const updateCartCount = () => {
        const token = sessionStorage.getItem("token");
        if (token) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}api/cart`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(items => {
                const total = items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(total);
            })
            .catch(() => setCartCount(0));
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        // Optionally, listen to storage or custom events for updates
        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    // ✅ Previene el error si el provider no está presente
    const cartContext = useContext(CartContext) || {};
    const cartCount = cartContext.cartCount || 0;

    const handleToggle = () => setMenuOpen(prev => !prev);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img
                        src={logo}
                        alt="Logo Godfather Barbería"
                        style={{
                            width: "200px",
                            height: "auto",
                            margin: 0,
                            padding: 0,
                            display: "block"
                        }}
                    />
                </Link>

                {/* Botón hamburguesa */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={handleToggle}
                    aria-controls="navbarGodfather"
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Menú de navegación */}
                <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`} id="navbarGodfather">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{ gap: "15px" }}>
                        <li className="nav-item">
                            <a className="nav-link" href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo" target="_blank" rel="noopener noreferrer">
                                Reserva tu Cita
                            </a>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Productos</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/#contacto">Contacto</a>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/sobre-nosotros">Sobre Nosotros</Link>
                        </li>
                    </ul>

                    {/* Login & Cart */}
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item position-relative">
                            <Link className="nav-link" to="/cart" title="Ver carrito">
                                <FaShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span
                                        className="badge bg-danger position-absolute top-0 start-100 translate-middle"
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className="btn btn-outline-light login"
                                data-bs-toggle="modal"
                                data-bs-target="#loginModal"
                            >
                                Login
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};