import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Les brindamos <span>variedad</span> y <span>soluciones eléctricas</span><br />
          a todos sus proyectos
        </h1>
      </div>
      <div className="torres-container">
        <img src="/torre.svg" alt="torre" className="torre" />
        <img src="/torre.svg" alt="torre" className="torre" />
        <img src="/torre.svg" alt="torre" className="torre" />
        <img src="/torre.svg" alt="torre" className="torre" />
      </div>
    </section>
  );
}

export default Hero;
