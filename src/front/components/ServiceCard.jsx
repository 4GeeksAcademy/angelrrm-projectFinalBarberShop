import React from "react";

const ServiceCard = ({ title, description, image }) => {
  return (
    <div className="service-card">
      <div className="service-card-img-container">
        <img src={image} alt={title} className="service-card-img" />
      </div>
      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-description">{description}</p>
    </div>
  );
};

export default ServiceCard;