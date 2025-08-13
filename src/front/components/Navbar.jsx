import React, { useState, useEffect, useContext, createContext } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/img/logo.png';
import { FaShoppingCart } from "react-icons/fa";
import { getCart } from "../../api/cart";

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

    const [inforegistro, setInforegistro] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleregister = async (e) => {
        e.preventDefault(); 	// Aquí puedes hacer la llamada a tu API para registrar al usuario
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(inforegistro)
        }
        );
        const data = await response.json();
        if (response.ok) {
            alert("Usuario registrado correctamente");
            setInforegistro({
                name: "",
                email: "",
                password: ""
            });
            document.querySelector("#registroModal .btn-close").click();
        } else {
            alert("Error al registrar el usuario: " + data.error);
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });
        const data = await response.json();
        if (response.ok) {
            // Guarda el token en sessionStorage/localStorage, como prefieras
            sessionStorage.setItem("token", data.token);
            alert("Bienvenido " + data.name);
            setLoginData({ email: "", password: "" });
            document.querySelector("#loginModal .btn-close").click();
            // Aquí puedes redirigir o actualizar estado global, si quieres
        } else {
            alert("Error al iniciar sesión: " + (data.error || data.msg));
        }
    };

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

                    {/* LOGIN MODAL*/}
                    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">Login</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleLogin}>
                                        <div className="mb-3 email">
                                            <label htmlFor="exampleInputEmail1" className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="exampleInputEmail1"
                                                aria-describedby="emailHelp"
                                                value={loginData.email}
                                                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                            />
                                            <div id="emailHelp" className="form-text">Nunca compartiremos tu correo electrónico con nadie más.</div>
                                        </div>
                                        <div className="mb-3 password">
                                            <label htmlFor="exampleInputPassword1" className="form-label">Contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="exampleInputPassword1"
                                                value={loginData.password}
                                                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3 form-check">
                                            <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                                            <label className="form-check-label" htmlFor="exampleCheck1">Recuerdame</label>
                                        </div>
                                        <button type="submit" className="btn btn-none submit">Submit</button>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-none cancelar" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="button" class="btn btn-none register" data-bs-toggle="modal" data-bs-target="#registroModal">Registrarse</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REGISTRE MODAL*/}
                    <div className="modal fade" id="registroModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">Registro</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form className="row g-3" onSubmit={(e) => { handleregister(e) }}>
                                        <div className="col-md-12">
                                            <label htmlFor="firstName" className="form-label">Nombre</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="firstName"
                                                name="name"
                                                required
                                                onChange={(e) => setInforegistro({ ...inforegistro, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-12">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                required
                                                onChange={(e) => setInforegistro({ ...inforegistro, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label htmlFor="password" className="form-label">Contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                required
                                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$"
                                                title="Debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número"
                                                name="password"
                                                onChange={(e) => setInforegistro({ ...inforegistro, password: e.target.value })}
                                            />
                                            <div className="form-text">
                                                Debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-none w-100 register" type="submit">Registrarse</button>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-none cancelar" data-bs-dismiss="modal">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};