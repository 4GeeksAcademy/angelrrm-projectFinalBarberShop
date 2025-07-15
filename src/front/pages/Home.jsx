import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import onlylogo from '../assets/img/onlylogo.png';
import ServiceCard from "../components/ServiceCard.jsx";
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
			image: "https://i.pinimg.com/1200x/87/e2/4f/87e24f4299ff167b7ec559c4428d954a.jpg"
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

	];

	const scrollLeft = (id) => {
		const el = document.getElementById(id);
		if (el) el.scrollLeft -= 300;
	};

	const scrollRight = (id) => {
		const el = document.getElementById(id);
		if (el) el.scrollLeft += 300;
	};

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


			<div className="scroll-wrapper position-relative">
				<button className="scroll-btn left" onClick={() => scrollLeft('service-scroll')}>‹</button>
				<div className="scroll-container" id="service-scroll">
					<div className="services-section">
						<h2>Nuestros Servicios</h2>
						<div className="services-grid">
							{servicios.map((servicio, idx) => (
								<ServiceCard
									key={idx}
									title={servicio.title}
									description={servicio.description}
									image={servicio.image}
								/>
							))}
						</div>
					</div>
				</div>
				<button className="scroll-btn right" onClick={() => scrollRight('service-scroll')}>›</button>
			</div >


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