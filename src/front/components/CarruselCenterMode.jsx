import React, { useState } from "react";
import ServiceCard from "./ServiceCard"; // Usa tu card real

export default function CenterModeCarousel({ servicios }) {
    const [center, setCenter] = useState(0); // índice del central

    const total = servicios.length;

    // Helpers para obtener los índices
    const prev = (center - 1 + total) % total;
    const next = (center + 1) % total;
    const prev2 = (center - 2 + total) % total;
    const next2 = (center + 2) % total;

    // Navegar
    const goLeft = () => setCenter((center - 1 + total) % total);
    const goRight = () => setCenter((center + 1) % total);

    return (
        <div className="center-carousel-wrapper">
            <button className="carousel-arrow left" onClick={goLeft}>‹</button>
            <div className="center-carousel-track">
                <div className="carousel-card prev2">{<ServiceCard {...servicios[prev2]} />}</div>
                <div className="carousel-card prev">{<ServiceCard {...servicios[prev]} />}</div>
                <div className="carousel-card center">{<ServiceCard {...servicios[center]} />}</div>
                <div className="carousel-card next">{<ServiceCard {...servicios[next]} />}</div>
                <div className="carousel-card next2">{<ServiceCard {...servicios[next2]} />}</div>
            </div>
            <button className="carousel-arrow right" onClick={goRight}>›</button>
        </div>
    );
}