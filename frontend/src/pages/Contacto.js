import React, { useEffect } from 'react';
import emailjs from 'emailjs-com';
import './Contacto.css';

function Contacto() {
  useEffect(() => {
    emailjs.init('Idw8E79raVsv7No_V');

    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const telefonoInput = document.getElementById('telefono');
    const mensajeInput = document.getElementById('mensaje');

    if (nombreInput && correoInput && telefonoInput && mensajeInput) {
      nombreInput.value = localStorage.getItem('nombre') || '';
      correoInput.value = localStorage.getItem('correo') || '';
      telefonoInput.value = localStorage.getItem('telefono') || '';
      mensajeInput.value = localStorage.getItem('mensaje') || '';

      nombreInput.addEventListener('input', () => localStorage.setItem('nombre', nombreInput.value));
      correoInput.addEventListener('input', () => localStorage.setItem('correo', correoInput.value));
      telefonoInput.addEventListener('input', () => localStorage.setItem('telefono', telefonoInput.value));
      mensajeInput.addEventListener('input', () => localStorage.setItem('mensaje', mensajeInput.value));

      document.getElementById('formulario').style.opacity = 1;
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_emj4bpq', 'template_rdu7hnt', e.target)
      .then(() => {
        alert('Mensaje enviado con éxito.');
      })
      .catch((error) => {
        alert('Error al enviar: ' + JSON.stringify(error));
        console.error('EmailJS error:', error);
      });
  };

  return (
    <div className="container-fluid form-section">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center mb-4">
            <h3 id="titulo" className="font-weight-bold text-primary">
              ¿Quieres comunicarte con nosotros?
            </h3>
          </div>

          <div id="formulario" className="col-12 col-md-10 col-lg-6 mx-auto p-4 rounded text-white" style={{ backgroundColor: '#00338d', transition: 'opacity 1s' }}>
            <form id="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <p>👤 Nombre Completo*</p>
                <input type="text" className="form-control" id="nombre" name="name" placeholder="Escribe tu nombre" autoComplete="name" required />
              </div>
              <div className="form-group">
                <p>✉️ Correo*</p>
                <input type="email" className="form-control" id="correo" name="mail" placeholder="correo@ejemplo.com" autoComplete="email" required />
              </div>
              <div className="form-group">
                <p>📱 Número de Teléfono*</p>
                <input type="tel" className="form-control" id="telefono" name="phone" placeholder="Ej: 3001234567" pattern="[0-9]{10}" title="Ingresa un número de 10 dígitos" autoComplete="tel" required />
              </div>
              <div className="form-group">
                <p>📝 Describe por qué te comunicas con nosotros:</p>
                <textarea className="form-control" id="mensaje" name="message" rows="4" placeholder="Tu mensaje..."></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-light">Enviar</button>
              </div>
            </form>
            <p className="mt-3 small text-center">
              Recuerda que para evitar este proceso del registro de datos puedes optar por
              <a href="/login" className="font-weight-bold text-white" style={{ textDecoration: 'underline' }}> Iniciar Sesión</a>
            </p>
            <p id="mensajeEnviado" style={{ display: 'none', color: '#00ff00', fontWeight: 'bold', marginTop: '10px' }}>
              ¡Mensaje enviado con éxito!
            </p>
          </div>

          <a href="https://wa.me/573156417689?text=Hola,%20tengo%20una%20consulta" target="_blank" rel="noopener noreferrer"
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/220/220236.png" alt="WhatsApp" style={{ width: '50px', height: '50px' }} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contacto;
