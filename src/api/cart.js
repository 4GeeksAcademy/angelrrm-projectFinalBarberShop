export const getCart = async (token) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("No se pudo cargar el carrito");
    return await res.json();
};