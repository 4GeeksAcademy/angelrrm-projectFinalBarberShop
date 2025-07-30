import React from "react";

const ServiceCard = ({ title, description, image }) => {
  return (
    <div className="service-card">
      <div className="service-card-img-container">
        <img src={image} alt={title} className="service-card-img" />
      </div>
      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-description">{description}</p>
      <a
        href="https://booksy.com/es-es/40504_barberia-godfather_barberia_53009_madrid#ba_s=seo"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-none submit mt-2 text-decoration-none text-reset"
      >
        Reservar este servicio
      </a>
    </div>
  );
};

export default ServiceCard;