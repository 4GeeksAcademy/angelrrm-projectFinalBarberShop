import React from "react";

const ServiceCard = ({ title, description, image }) => {
  return (
    <div className="service-card">
      <div className="service-card-img-container">
        <img src={image} alt={title} className="service-card-img" />
      </div>
      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-description">{description}</p>
					<button type="button" className="btn btn-none hero-btn">
						<a href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark">
							¡Reserva tu cita!
						</a>
					</button>
    </div>
  );
};

export default ServiceCard;