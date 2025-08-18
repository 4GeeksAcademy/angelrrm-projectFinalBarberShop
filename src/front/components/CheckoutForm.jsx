import { useState, useContext } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../components/Navbar"; 

export const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { updateCartCount } = useContext(CartContext) || {};

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setLoading(false);

    if (result.error) {
      setPaymentStatus(result.error.message || "Error procesando el pago");
      console.error("Stripe error:", result.error);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      setPaymentStatus("Pago exitoso!");
      try {
        const token = sessionStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/checkout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("No se pudo vaciar el carrito en backend:", err);
      } finally {
        if (updateCartCount) updateCartCount(0);
        navigate("/cart", { replace: true, state: { paid: true } });
      }
    } else {
      setPaymentStatus("El pago no se pudo completar.");
    }
  };

  return (
    <form className="w-50 bg-dark mx-auto p-3" onSubmit={handleSubmit}>
      <PaymentElement />
      <button className="btn btn-secondary w-100 mt-2" type="submit" disabled={!stripe || !elements || loading}>
        {loading ? "Procesando..." : "Pagar"}
      </button>
      {paymentStatus && <p className="text-white mt-2">{paymentStatus}</p>}
    </form>
  );
};