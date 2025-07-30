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
							<a className="nav-link" href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo">Reserva tu Cita <span className="sr-only">(current)</span></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="/products">Productos</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="/#contacto">Contacto</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="/sobre-nosotros">Sobre Nosotros</a>
						</li>
					</ul>
				</div>


				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarGodfather" aria-controls="navbarGodfather" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>


				<div className="ml-auto">
					<ul className="navbar-nav">
						<li className="nav-item">
							<button type="button" class="btn btn-none login" data-bs-toggle="modal" data-bs-target="#loginModal">
								Login
							</button>
						</li>

					</ul>
				</div>
			</div>
		</nav>
	);
};