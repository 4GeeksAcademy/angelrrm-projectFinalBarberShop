import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import onlylogo from '../assets/img/onlylogo.png';
import ServiceCard from "../components/ServiceCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CenterModeCarousel from "../components/CarruselCenterMode.jsx";


export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])
	const servicios = [
		{
			title: "Corte de Cabello",
			description: "Corte personalizado según tu estilo, realizado por barberos expertos.",
			image: "https://i.pinimg.com/736x/02/82/d0/0282d032df8a7e776f886c075da596ad.jpg"
		},
		{
			title: "Corte de Barba",
			description: "Modelado y perfilado profesional para tu barba, usando técnicas precisas y productos de alta calidad.",
			image: "https://i.pinimg.com/1200x/91/d6/03/91d6037c183ccc9644cdd59a70857524.jpg"
		},
		{
			title: "Corte para Niños",
			description: "Un ambiente divertido y relajado donde los más pequeños disfrutan de un corte diseñado especialmente para ellos.",
			image: "https://i.pinimg.com/1200x/ee/43/88/ee4388d7c977c41b02a4cacb5f8638a2.jpg"
		},
		{
			title: "Afeitado Degradado",
			description: "Logra un acabado impecable y definido con nuestro afeitado degradado, perfecto para un look sofisticado y moderno.",
			image: "https://i.pinimg.com/1200x/87/e2/4f/87e24f4299ff167b7ec559c4428d954a.jpg"
		},
		{
			title: "Decoloración",
			description: "Transforma tu cabello con una decoloración profesional que cuida tu melena mientras logra el tono deseado.",
			image: "https://i.pinimg.com/736x/05/72/6c/05726c747639c4f2c98ebe581fe4fe30.jpg"
		},
		{
			title: "Barba",
			description: "Tratamientos especializados para barbas: desde modelado hasta hidratación, para un aspecto pulido y saludable.",
			image: "https://i.pinimg.com/1200x/24/e5/e2/24e5e2310537f980e9a3dc8acfafa0c7.jpg"
		},
		{
			title: "Corte de Cabello con Diseño",
			description: "Cortes de cabello con diseños únicos y personalizados, realizados por nuestros barberos expertos.",
			image: "https://i.pinimg.com/736x/3b/9a/a6/3b9aa688d9baf5cc5121337608649b86.jpg"
		}

	];


	return (
		<div className="container-fluid p-0 m-0">
			<header className="hero-banner">
				<div className="hero-overlay">
					<h1 className="display-4">Bienvenido a Godfather Barbería</h1>
					<p className="lead">Look premium, actitud Godfather.</p>
					<img src={onlylogo} alt="Godfather Barbería Logo"
						className="hero-logo"
						style={{ width: "60%", height: "auto" }} />
					<button type="button" className="btn btn-none hero-btn">
						¡Reserva tu cita!
					</button>
				</div>
			</header>

			<div className="container my-5 services-section">
				<CenterModeCarousel servicios={servicios} />
			</div>

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

			<div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="exampleModalLabel">Login</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							<form>
								<div className="mb-3 email">
									<label htmlFor="exampleInputEmail1" className="form-label">Email</label>
									<input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
									<div id="emailHelp" className="form-text">Nunca compartiremos tu correo electrónico con nadie más.</div>
								</div>
								<div className="mb-3 password">
									<label htmlFor="exampleInputPassword1" className="form-label">Contraseña</label>
									<input type="password" className="form-control" id="exampleInputPassword1" />
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

			<div className="modal fade" id="registroModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="exampleModalLabel">Registro</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							<form className="row g-3">
								<div className="col-md-6">
									<label htmlFor="firstName" className="form-label">Nombre</label>
									<input
										type="text"
										className="form-control"
										id="firstName"
										required
									/>
								</div>
								<div className="col-md-6">
									<label htmlFor="lastName" className="form-label">Apellido</label>
									<input
										type="text"
										className="form-control"
										id="lastName"
										required
									/>
								</div>
								<div className="col-md-12">
									<label htmlFor="email" className="form-label">Email</label>
									<input
										type="email"
										className="form-control"
										id="email"
										required
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


		</div >
	);
}; 