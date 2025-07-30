import logo from '../assets/img/logo.png';

export const Footer = () => (
	<footer className="bg-dark text-white pt-4 pb-2 mt-5">
		<div className="container text-center">
			{/* LOGO Y NOMBRE */}
			<div className="mb-3">
				<img src={logo} alt="Logo Godfather Barbería" style={{ height: "60px" }} />
				<h5 className="mt-2 mb-1" style={{ fontWeight: "bold", letterSpacing: "1px" }}>
					Godfather <span style={{ color: "#FFD700", fontWeight: "bold" }}>Barbería Moncloa</span>
				</h5>
				<small style={{ color: "#bdbdbd" }}>
					Donde la tradición y el estilo se unen
				</small>
			</div>
			{/* INFORMACIÓN */}
			<div className="row justify-content-center mb-3">
				{/* LINKS RÁPIDOS */}
				{/* REDES SOCIALES (opcional) */}
				<div className="col-12 col-md-4 mb-2">
					<a href="https://instagram.com/barberiagodfather" target="_blank" rel="noopener noreferrer" className="mx-2 text-warning">
						<i className="bi bi-instagram" style={{ fontSize: "2rem" }}></i>
					</a>
					<a href="https://wa.me/34688455701" target="_blank" rel="noopener noreferrer"className="mx-2 text-warning">
						<i className="bi bi-whatsapp" style={{ fontSize: "2rem" }}></i>
					</a>
				</div>
			</div>
			{/* COPYRIGHT */}
			<div className="mt-2 pt-2" style={{ borderTop: "1px solid #444" }}>
				<small style={{ color: "#FFD700" }}>
					© {new Date().getFullYear()} barberiagodfather - All rights reserved
				</small>
			</div>
		</div>
	</footer>
);
