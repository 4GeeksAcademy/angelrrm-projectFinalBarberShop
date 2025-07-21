import React from "react";
import onlylogo from '../assets/img/onlylogo.png';



const AboutUs = () => (
  <div className="container aboutus-section py-5">
    <div className="row align-items-center mb-5">
      <div className="col-md-4 text-center mb-4 mb-md-0">
        <img
          src={onlylogo}
          alt="Barbería Godfather Logo"
          className="aboutus-logo"
          style={{ maxWidth: "180px", filter: "drop-shadow(0 6px 16px #0009)" }}
        />
      </div>
      <div className="col-md-8">
        <h1 className="aboutus-title mb-3">Sobre Nosotros</h1>
        <p className="aboutus-desc fs-5">
          <b>Barbería Godfather</b> es una empresa fundada y dirigida por venezolanos, con más de <b>10 años de experiencia en España</b> en el arte de la barbería.
          <br /><br />
          Nuestro equipo combina pasión, dedicación y técnica, trayendo lo mejor de las tradiciones venezolanas y el estilo contemporáneo europeo. Cada cliente que cruza nuestra puerta es recibido como familia, disfrutando de un ambiente exclusivo y profesional, donde la calidad, la higiene y la excelencia son nuestra promesa.
        </p>
      </div>
    </div>

    <div className="row">
      <div className="col-md-6 mb-4 mb-md-0">
        <h3 className="aboutus-subtitle mb-2">Nuestra Misión</h3>
        <p>
          Ofrecer a cada cliente una experiencia premium y personalizada, en un ambiente de respeto, confianza y profesionalismo. Nos esforzamos cada día en transformar tu imagen, superando expectativas y construyendo relaciones duraderas.
        </p>
      </div>
      <div className="col-md-6">
        <h3 className="aboutus-subtitle mb-2">Nuestros Valores</h3>
        <ul>
          <li><b>Excelencia:</b> Sólo lo mejor para tu estilo y tu cuidado.</li>
          <li><b>Calidez:</b> Tratamos a cada cliente con respeto, cercanía y honestidad.</li>
          <li><b>Pasión:</b> Amamos nuestro trabajo y se nota en cada detalle.</li>
          <li><b>Tradición e innovación:</b> Combinamos técnicas clásicas y modernas para resultados únicos.</li>
          <li><b>Orgullo venezolano:</b> Nuestra herencia cultural nos inspira y nos distingue.</li>
        </ul>
      </div>
    </div>
  </div>
);

export default AboutUs;
