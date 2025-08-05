import React, { useEffect, useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import onlylogo from '../assets/img/onlylogo.png';
import ServiceCard from "../components/ServiceCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CenterModeCarousel from "../components/CarruselCenterMode.jsx";


export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	// ESTADO PARA SERVICIOS DESDE LA API
	const [servicios, setServicios] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	useEffect(() => {
		const fetchServicios = async () => {
			try {
				const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/services");
				if (!resp.ok) throw new Error("No se pudo obtener servicios");
				let data = await resp.json();
				// Mapeo: backend a frontend
				data = data.map(s => ({
					...s,
					title: s.name,
					image: s.image_url
				}));
				setServicios(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchServicios();
	}, []);

	return (
		<div className="container-fluid p-0 m-0">
			{/* BANNER*/}
			<header className="hero-banner">
				<div className="hero-overlay">
					<h1 className="display-4">Bienvenido a Godfather Barbería</h1>
					<p className="lead">Look premium, actitud Godfather.</p>
					<img src={onlylogo} alt="Godfather Barbería Logo"
						className="hero-logo"
						style={{ width: "60%", height: "auto" }} />
					<button type="button" className="btn btn-none hero-btn">
						<a href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo" target="_blank" rel="noopener noreferrer">
							¡Reserva tu cita!
						</a>
					</button>
				</div>
			</header>
			{/* SERVICE*/}
			<div className="container my-5 services-section">
				<h2 className="mb-4 text-center">Nuestros Servicios</h2>
				{loading && <p>Cargando servicios...</p>}
				{error && <p>Error: {error}</p>}
				{!loading && !error &&
					<CenterModeCarousel id="service" servicios={servicios} />
				}
			</div>
			{/* CONTACT*/}
			<section id="contacto">
				<div className="contacto-section-wrapper">
					<div className="container contacto-section my-5">
						<h2 className="mb-4 text-center">Contacto</h2>
						<div className="row align-items-center">
							<div className="col-md-6 mb-4 mb-md-0">
								<h5 className="mb-2">Dirección</h5>
								<p>
									c/ princesa 98, intercambiador Moncloa<br />
									planta -2 local BARBERIA, Madrid
								</p>

								<h5 className="mb-2">Teléfono</h5>
								<p>
									<a href="tel:+34688455701" className="text-decoration-none">+34 688 455 701</a>
								</p>

								<h5 className="mb-2">Horario</h5>
								<p>
									Lunes a Viernes: 10:00AM – 19:30PM<br />
									Sábado: 09:00AM – 14:00PM
								</p>

								<h5 className="mb-2">Síguenos</h5>
								<div className="d-flex gap-3">
									<a href="https://www.instagram.com/barberiagodfather" target="_blank" rel="noopener noreferrer">
										<i className="bi bi-instagram" style={{ fontSize: "2rem" }}></i>
									</a>
									<a href="https://wa.me/34688455701" target="_blank" rel="noopener noreferrer">
										<i className="bi bi-whatsapp" style={{ fontSize: "2rem" }}></i>
									</a>
								</div>
							</div>
							<div className="col-md-6">
								<iframe
									title="Ubicación Barbería GodFather"
									src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.323273312608!2d-3.7223456846074767!3d40.434487979362565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4229a63215d623%3A0xebb003bf7b7dcea9!2sBarberia%20GodFather!5e0!3m2!1ses!2ses!4v1721439308567!5m2!1ses!2ses"
									width="100%"
									height="250"
									style={{ border: 0, borderRadius: "12px" }}
									allowFullScreen=""
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
								></iframe>
							</div>
						</div>
					</div>
				</div>
			</section>
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
			{/* CART MODAL*/}
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-4">.col-md-4</div>
						<div class="col-md-4 ms-auto">.col-md-4 .ms-auto</div>
					</div>
					<div class="row">
						<div class="col-md-3 ms-auto">.col-md-3 .ms-auto</div>
						<div class="col-md-2 ms-auto">.col-md-2 .ms-auto</div>
					</div>
					<div class="row">
						<div class="col-md-6 ms-auto">.col-md-6 .ms-auto</div>
					</div>
					<div class="row">
						<div class="col-sm-9">
							Level 1: .col-sm-9
							<div class="row">
								<div class="col-8 col-sm-6">
									Level 2: .col-8 .col-sm-6
								</div>
								<div class="col-4 col-sm-6">
									Level 2: .col-4 .col-sm-6
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div >
	);
}; 