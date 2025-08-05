import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/img/logo.png';

export const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false);

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

                {/* Menú de navegación (colapsable) */}
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
                    {/* Login a la derecha */}
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
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