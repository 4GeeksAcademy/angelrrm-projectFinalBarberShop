import { Link } from "react-router-dom";
import logo from '../assets/img/logo.png';

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-body-tertiary">
			<div className="container">
				<Link to="/">
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

				<div className="navbar-nav" id="navbarNav">
					<ul className="navbar-nav" style={{ flexDirection: "row", gap: "15px" }}>
						<li className="nav-item active">
							<a className="nav-link" href="#">Reserva tu Cita <span className="sr-only">(current)</span></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">Productos</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">Servicios</a>
						</li>
						<li className="nav-item">
							<a className="nav-link disabled" href="#" tabIndex="-1" aria-disabled="true">Disabled</a>
						</li>
					</ul>
				</div>

				<div className="ml-auto">
					<ul className="navbar-nav">
						<li className="nav-item">
							<button type="button" class="btn btn-none" data-bs-toggle="modal" data-bs-target="#loginModal">
								Login
							</button>
						</li>
						<li className="nav-item">
							<button type="button" class="btn btn-none" data-bs-toggle="modal" data-bs-target="#registroModal">
								Registro
							</button>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};