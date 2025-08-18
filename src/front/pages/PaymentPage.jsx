import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "../components/CheckoutForm.jsx";

const stripePromise = loadStripe("pk_test_51Rvw871sOpqwknuqPbZjzYgvsjxwVtH4tDaS3LkCBb73FoF80ownm3TIpPC5tTC9OymjEOViQDPBSEhs9QPVzAnO00QI9XaOOa");

export const PaymentPage = () => {
    const { totalAmount, currency } = useParams();
    console.log(totalAmount);

    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!totalAmount || !currency) return;

        setLoading(true);

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Math.round(parseFloat(totalAmount) * 100), currency: currency }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.client_secret) {
                    setClientSecret(data.client_secret);
                } else {
                    console.error("Error: clientSecret no recibido", data);
                }
            })
            .catch(error => console.error("Error en la petición:", error))
            .finally(() => setLoading(false));
    }, [totalAmount, currency]);

    if (loading) return <p>Generando pago...</p>;
    if (!clientSecret) return <p>Error: No se pudo obtener el clientSecret</p>; // 🔥 Manejo de error

    const appearance = {
        theme: 'night', // Selecciona un tema
        labels: 'floating'
    };

    return (
        <Elements  
        key={clientSecret} 
        stripe={stripePromise} 
        options={{ clientSecret, appearance }}>
            <CheckoutForm />
        </Elements>
    );
};