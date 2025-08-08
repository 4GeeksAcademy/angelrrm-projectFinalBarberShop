import React, { useEffect, useState } from "react";
import { getCart } from "../../api/cart"; // Import the getCart function from the API module

const updateCartItem = async (itemId, newQuantity, token) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
    });
    if (!res.ok) throw new Error("No se pudo actualizar la cantidad");
    return await res.json();
};
const removeFromCart = async (itemId, token) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${itemId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("No se pudo eliminar el producto");
    return await res.json();
};

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para cargar el carrito
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

    // Función para eliminar producto
    const handleRemove = async (itemId) => {
        const token = sessionStorage.getItem("token");
        try {
            await removeFromCart(itemId, token);
            // Recargar el carrito después de eliminar
            fetchCart();
        } catch (e) {
            alert("Error al eliminar el producto del carrito");
        }
    };

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
                <ul className="list-group">
                    {cartItems.map(item => (
                        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{item.product?.name || "Producto"}</strong>
                                <span className="ms-3">Precio unitario: €{item.product?.price ? item.product.price.toFixed(2) : ""}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                {/* Botón menos */}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={async () => {
                                        const token = sessionStorage.getItem("token");
                                        if (item.quantity > 1) {
                                            await updateCartItem(item.id, item.quantity - 1, token);
                                            fetchCart();
                                        }
                                    }}
                                    disabled={item.quantity <= 1}
                                    style={{ marginRight: "5px" }}
                                >-</button>
                                <span style={{ minWidth: "30px", textAlign: "center" }}>{item.quantity}</span>
                                {/* Botón más */}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={async () => {
                                        const token = sessionStorage.getItem("token");
                                        await updateCartItem(item.id, item.quantity + 1, token);
                                        fetchCart();
                                    }}
                                    style={{ marginLeft: "5px" }}
                                >+</button>
                                {/* Eliminar */}
                                <button
                                    className="btn btn-danger btn-sm ms-3"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </li>
                    ))}
                    {cartItems.length > 0 && (
                        <div className="mt-4 text-end">
                            <h4>
                                Total: €{cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0).toFixed(2)}
                            </h4>
                        </div>
                    )}
                </ul>

            )}
        </div>
    );
};

export default Cart;