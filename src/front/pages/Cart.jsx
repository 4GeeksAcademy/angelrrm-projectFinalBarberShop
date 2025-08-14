import React, { useEffect, useState, useContext } from "react";
import { getCart } from "../../api/cart";
import { CartContext } from "../components/Navbar";
import "../cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    const { updateCartCount } = useContext(CartContext) || {};

    const fetchCart = () => {
        const token = sessionStorage.getItem("token");
        if (token) {
            getCart(token)
                .then(items => {
                    setCartItems(items);
                    setLoading(false);

                    // actualizar contador
                    const totalQty = Array.isArray(items)
                        ? items.reduce((acc, it) => acc + (it.quantity || 0), 0)
                        : 0;
                    if (updateCartCount) updateCartCount(totalQty);
                })
                .catch(() => {
                    setCartItems([]);
                    setLoading(false);
                    if (updateCartCount) updateCartCount(0);
                });
        } else {
            setCartItems([]);
            setLoading(false);
            if (updateCartCount) updateCartCount(0);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (itemId) => {
        const token = sessionStorage.getItem("token");
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${itemId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchCart();
        } catch (e) {
            alert("Error al eliminar el producto del carrito");
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        const token = sessionStorage.getItem("token");
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            fetchCart();
        } catch (e) {
            alert("Error al actualizar la cantidad");
        }
    };

    const handleCheckout = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión para realizar la compra");
            return;
        }

        setCheckingOut(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/checkout`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡Compra realizada con éxito! Total: €${data.total.toFixed(2)}`);
                setCartItems([]);
                if (updateCartCount) updateCartCount(0);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("Error al procesar la compra");
        } finally {
            setCheckingOut(false);
        }
    };

    const total = cartItems.reduce((acc, item) =>
        acc + (item.product?.price || 0) * item.quantity, 0
    );

    return (
        <div className="container py-5 gf-cart">
            <h2 className="mb-4 page-title">Mi Carrito</h2>

            {loading ? (
                <p className="loading">Cargando...</p>
            ) : cartItems.length === 0 ? (
                <div className="alert alert-warning text-center">
                    Tu carrito está vacío.
                </div>
            ) : (
                <>
                    <ul className="list-group mb-4">
                        {cartItems.map(item => (
                            <li
                                key={item.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div className="d-flex align-items-center">
                                    {item.product?.image_url && (
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="item-thumb"
                                        />
                                    )}
                                    <div>
                                        <strong className="item-name">
                                            {item.product?.name || "Producto"}
                                        </strong>
                                        <br />
                                        {typeof item.product?.price === "number" && (
                                            <span className="item-price">
                                                €{item.product.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex align-items-center">
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1, )}
                                        disabled={item.quantity <= 1}
                                    >
                                        –
                                    </button>
                                    <span className="qty-value mx-2">
                                        {item.quantity}
                                    </span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                    <button
                                        className="btn btn-remove btn-sm ms-3"
                                        onClick={() => handleRemove(item.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="card">
                        <div className="card-body">
                            <h4 className="text-end">
                                <span className="total-label me-2">Total:</span>
                                <span className="total-value">€{total.toFixed(2)}</span>
                            </h4>
                            <div className="text-end">
                                <button
                                    className="btn btn-checkout btn-lg"
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                >
                                    {checkingOut ? "Procesando..." : "Finalizar Compra"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
