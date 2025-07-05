import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Header */}
        <div className="footer-header">
          <h2>E&S</h2>
          <p>Amplio catálogo en productos eléctricos y distribuidores desde hace más de 5 años.</p>
        </div>

        {/* Footer Content */}
        <div className="footer-content">
          {/* Contactanos */}
          <div className="footer-section">
            <h3>Contáctanos</h3>
            <div className="contact-info">
              <p><strong>Teléfono:</strong></p>
              <p>+57 315 651 76 89</p>
              <p><strong>Email:</strong></p>
              <p>edingaitan@hotmail.com</p>
            </div>
          </div>

          {/* Enlaces Rapidos */}
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul className="footer-links">
              <li><a href="/catalogo">Catálogo</a></li>
              <li><a href="/quienes-somos">Quiénes Somos</a></li>
              <li><a href="/novedades">Novedades</a></li>
              <li><a href="/contacto">Contacto</a></li>
              <li><a href="/carrito">Productos</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li><a href="/terminos">Términos y Condiciones</a></li>
              <li><a href="/privacidad">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© 2025 E&S. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;