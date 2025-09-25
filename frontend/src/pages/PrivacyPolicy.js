import React from 'react';
import { Shield, Mail, Phone, Calendar, Users, Lock, FileText, CheckCircle } from 'lucide-react';
import './PrivacyPolicy.css'; // Importar los estilos

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      {/* Header */}
      <div className="privacy-header">
        <div className="privacy-header-title">
          <Shield className="icon-lg icon-blue" />
          <h1>Política de Privacidad</h1>
        </div>
        <div className="privacy-header-date">
          <Calendar className="icon" />
          <p>Última actualización: 25/09/2025</p>
        </div>
      </div>

      {/* Introduction */}
      <div className="privacy-intro">
        <p>
          En <strong>Eléctricos & Soluciones</strong> valoramos y respetamos la privacidad de nuestros usuarios. 
          Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos los datos personales que nos proporcionas 
          cuando usas nuestro sitio web y/o servicios.
        </p>
      </div>

      {/* Section 1 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>1</span>
          </div>
          <h2 className="section-title">Datos que recopilamos</h2>
        </div>
        <p className="section-description">
          Podemos recopilar la siguiente información cuando interactúas con nuestro sitio o servicios:
        </p>
        <div className="privacy-list">
          {[
            'Nombre completo',
            'Dirección de correo electrónico',
            'Número de teléfono',
            'Información de facturación y envío (en caso de compras)',
            'Dirección IP, navegador y datos de uso (cookies y analítica)'
          ].map((item, index) => (
            <div key={index} className="list-item">
              <CheckCircle className="icon icon-green" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>2</span>
          </div>
          <h2 className="section-title">Finalidad del tratamiento de datos</h2>
        </div>
        <p className="section-description">Usamos la información recopilada para:</p>
        <div className="privacy-list">
          {[
            'Proveer y mejorar nuestros productos y servicios',
            'Procesar compras y gestionar pedidos',
            'Enviar comunicaciones relacionadas con tu cuenta, transacciones o soporte',
            'Informar sobre actualizaciones, promociones y novedades (cuando lo hayas autorizado)',
            'Cumplir obligaciones legales o contractuales'
          ].map((item, index) => (
            <div key={index} className="list-item">
              <CheckCircle className="icon icon-green" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>3</span>
          </div>
          <h2 className="section-title">Uso de cookies</h2>
        </div>
        <div className="info-box info-box-yellow">
          <p>
            Nuestro sitio puede utilizar <strong>cookies</strong> y tecnologías similares para mejorar la experiencia del usuario, 
            analizar estadísticas y mostrar contenido personalizado. Puedes configurar tu navegador para bloquearlas, 
            pero esto podría limitar algunas funciones del sitio.
          </p>
        </div>
      </div>

      {/* Section 4 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>4</span>
          </div>
          <h2 className="section-title">Compartición de datos con terceros</h2>
        </div>
        <p className="section-description">
          No vendemos ni alquilamos tus datos personales. Sin embargo, podemos compartir tu información con:
        </p>
        <div className="privacy-list">
          {[
            'Proveedores de servicios tecnológicos (hosting, pasarelas de pago, sistemas de mensajería)',
            'Autoridades competentes, cuando la ley lo requiera'
          ].map((item, index) => (
            <div key={index} className="list-item">
              <Users className="icon icon-orange" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>5</span>
          </div>
          <h2 className="section-title">Seguridad de la información</h2>
        </div>
        <div className="security-box">
          <Lock className="icon icon-green" />
          <p>
            Implementamos medidas técnicas, administrativas y físicas para proteger tu información personal 
            contra accesos no autorizados, pérdida o uso indebido.
          </p>
        </div>
      </div>

      {/* Section 6 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>6</span>
          </div>
          <h2 className="section-title">Derechos de los titulares de datos</h2>
        </div>
        <p className="section-description">Como titular de los datos personales, tienes derecho a:</p>
        <div className="privacy-list">
          {[
            'Conocer, actualizar y rectificar tus datos',
            'Solicitar la eliminación de tu información cuando lo consideres',
            'Revocar la autorización para el tratamiento de tus datos',
            'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) en caso de incumplimiento'
          ].map((item, index) => (
            <div key={index} className="list-item list-item-blue">
              <FileText className="icon icon-blue" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
      </div>

      {/* Section 7 */}
      <div className="privacy-section">
        <div className="section-header">
          <div className="section-number">
            <span>7</span>
          </div>
          <h2 className="section-title">Vigencia</h2>
        </div>
        <div className="info-box">
          <p>
            Esta Política de Privacidad estará vigente desde la fecha de su publicación y podrá actualizarse en cualquier momento. 
            Te recomendamos revisarla periódicamente.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="privacy-footer">
        <p>© 2025 Eléctricos & Soluciones - Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;