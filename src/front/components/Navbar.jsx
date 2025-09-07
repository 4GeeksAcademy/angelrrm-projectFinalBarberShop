import React, { useState, useEffect, useContext, createContext } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/img/logo.png';
import { FaShoppingCart } from "react-icons/fa";
import "../navbar.css"
import "../modal.css";
import { getCart } from "../../api/cart";

// Cart context for global state
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count on mount and when needed
    const updateCartCount = () => {
        const token = sessionStorage.getItem("token");
        if (token) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
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
    const [userName, setUserName] = useState(null);

    // ✅ Previene el error si el provider no está presente
    const cartContext = useContext(CartContext) || {};
    const cartCount = cartContext.cartCount || 0;

    // Al montar, cargar nombre (si existe) y escuchar cambios (login/logout en otras pestañas)
    useEffect(() => {
        const storedName = sessionStorage.getItem("name");
        if (storedName) setUserName(storedName);

        const onStorage = () => setUserName(sessionStorage.getItem("name"));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });
        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("name", data.name);      // 👈 guardar nombre
            setUserName(data.name);                         // 👈 actualizar estado
            alert("Bienvenido " + data.name);
            setLoginData({ email: "", password: "" });
            document.querySelector("#loginModal .btn-close").click();

            // Opcional útil: notificar para que otros componentes se actualicen (carrito, etc.)
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("cartUpdated"));
        } else {
            alert("Error al iniciar sesión: " + (data.error || data.msg));
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("name");
        setUserName(null);
        // Notificar a quienes dependan del auth/cart
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdated"));
    };

return (
  <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <img
            src={logo}
            alt="Logo Godfather Barbería"
            style={{
              width: "200px",
              height: "auto",
              margin: 0,
              padding: 0,
              display: "block",
            }}
          />
        </Link>

        {/* === Carrito + Login + Hamburguesa SOLO en móvil === */}
        <div className="d-flex d-lg-none ms-auto align-items-center gap-2">
          {/* Carrito móvil */}
          <Link
            className="btn p-0 position-relative cart-icon-btn"
            to="/cart"
            title="Ver carrito"
            aria-label="Carrito"
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="cart-badge bg-danger position-absolute top-0 start-100 translate-middle">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login móvil */}
          {userName ? (
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="btn login-mobile"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
              onClick={() => setMenuOpen(false)}   // 👈 cerramos el overlay antes de abrir modal
            >
              Login
            </button>
          )}

          {/* Hamburguesa */}
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
        </div>

        {/* Menú de navegación (collapse como overlay) */}
        <div
          className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}
          id="navbarGodfather"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0" style={{ gap: "15px" }}>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Reserva tu Cita
              </a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={() => setMenuOpen(false)}>
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#contacto" onClick={() => setMenuOpen(false)}>
                Contacto
              </a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sobre-nosotros" onClick={() => setMenuOpen(false)}>
                Sobre Nosotros
              </Link>
            </li>
          </ul>

          {/* Carrito + login SOLO en desktop */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-none d-lg-flex align-items-center gap-2">
            <li className="nav-item position-relative">
              <Link className="nav-link" to="/cart" title="Ver carrito">
                <FaShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="cart-badge bg-danger position-absolute top-0 start-100 translate-middle">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {userName ? (
              <>
                <li className="nav-item d-flex align-items-center px-2 text-light">
                  Hola, <span className="fw-semibold ms-1">{userName}</span>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button
                  type="button"
                  className="btn bg-none login"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>

    {/* ⬇️⬇️ IMPORTANTE: Modales FUERA del navbar/collapse */}
    {/* LOGIN MODAL */}
    <div className="modal fade gf-modal" id="loginModal" tabIndex="-1" aria-labelledby="loginLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="loginLabel">Login</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleLogin}>
              <div className="mb-3 email">
                <label htmlFor="loginEmail" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="loginEmail"
                  aria-describedby="emailHelp"
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                />
                <div id="emailHelp" className="form-text">Nunca compartiremos tu correo electrónico con nadie más.</div>
              </div>
              <div className="mb-3 password">
                <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Recuérdame</label>
              </div>
              <button type="submit" className="btn btn-none submit">Enviar</button>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-none cancelar" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" className="btn btn-none register" data-bs-toggle="modal" data-bs-target="#registroModal">Registrarse</button>
          </div>
        </div>
      </div>
    </div>

    {/* REGISTRO MODAL */}
    <div className="modal fade gf-modal" id="registroModal" tabIndex="-1" aria-labelledby="registroLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="registroLabel">Registro</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form className="row g-3" onSubmit={handleregister}>
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
  </>
);

};