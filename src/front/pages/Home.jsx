import React, { useEffect, useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import onlylogo from '../assets/img/onlylogo.png';
import CenterModeCarousel from "../components/CarruselCenterMode.jsx";


export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	// ESTADO PARA SERVICIOS DESDE LA API
	const [servicios, setServicios] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);



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
						<a href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark">
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
		</div >
	);
}; 