import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import onlylogo from '../assets/img/onlylogo.png';

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

	return (
		<div className="container-fluid p-0 m-0">
			<header className="hero-banner">
				<div className="hero-overlay">
					<h1 className="display-4">Bienvenido a Godfather Barbería</h1>
					<p className="lead">Look premium, actitud Godfather.</p>
					<img src={onlylogo} alt="Godfather Barbería Logo"
						className="hero-logo"
						style={{ width: "60%", height: "auto" }} />
					<button type="button" className="btn btn-primary hero-btn">
						¡Reserva tu cita!
					</button>
				</div>
			</header>

			<div className="alert alert-info">
				{store.message ? (
					<span>{store.message}</span>
				) : (
					<span className="text-danger">
						Loading message from the backend (make sure your python 🐍 backend is running)...
					</span>
				)}
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
								<div className="mb-3">
									<label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
									<input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
									<div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
								</div>
								<div className="mb-3">
									<label htmlFor="exampleInputPassword1" className="form-label">Password</label>
									<input type="password" className="form-control" id="exampleInputPassword1" />
								</div>
								<div className="mb-3 form-check">
									<input type="checkbox" className="form-check-input" id="exampleCheck1" />
									<label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
								</div>
								<button type="submit" className="btn btn-primary">Submit</button>
							</form>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
							<button type="button" className="btn btn-primary">Guardar cambios</button>
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
									<label htmlFor="birthday" className="form-label">Cumpleaños</label>
									<input
										type="date"
										className="form-control"
										id="birthday"
										required
									/>
								</div>
								<div className="col-12">
									<button className="btn btn-primary w-100" type="submit">Registrarse</button>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
						</div>
					</div>
				</div>
			</div>


		</div>
	);
}; 