import React, { useEffect, useState, useContext } from "react";
import { getCart } from "../../api/cart";
import { CartContext } from "../components/Navbar";

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
                })
                .catch(() => {
                    setCartItems([]);
                    setLoading(false);
                });
        } else {
            setCartItems([]);
            setLoading(false);
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
            if (updateCartCount) updateCartCount();
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
            if (updateCartCount) updateCartCount();
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
                if (updateCartCount) updateCartCount();
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
        <div className="container py-5">
            <h2 className="mb-4">Mi Carrito</h2>
            {loading ? (
                <p>Cargando...</p>
            ) : cartItems.length === 0 ? (
                <div className="alert alert-warning text-center">
                    Tu carrito está vacío.
                </div>
            ) : (
                <>
                    <ul className="list-group mb-4">
                        {cartItems.map(item => (
                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    {item.product?.image_url && (
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            style={{ width: "60px", height: "60px", objectFit: "cover", marginRight: "15px", borderRadius: "8px" }}
                                        />
                                    )}
                                    <div>
                                        <strong>{item.product?.name || "Producto"}</strong>
                                        <br />

                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        style={{ marginRight: "5px" }}
                                    >-</button>
                                    <span style={{ minWidth: "30px", textAlign: "center" }}>{item.quantity}</span>
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ marginLeft: "5px" }}
                                    >+</button>
                                    <button
                                        className="btn btn-danger btn-sm ms-3"
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
                            <h4 className="text-end">Total: €{total.toFixed(2)}</h4>
                            <div className="text-end">
                                <button
                                    className="btn btn-success btn-lg"
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