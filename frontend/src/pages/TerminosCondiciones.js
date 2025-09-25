import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Shield, CreditCard, AlertTriangle, Users, Settings } from 'lucide-react';
import './TerminosCondiciones.css';

const TermsAndConditions = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 'general',
      title: 'Generalidades',
      icon: <FileText className="w-5 h-5" />,
      content: `Electricos y Soluciones gestiona este sitio web. En todo el sitio, los términos "nosotros", "nos" y "nuestro" se refieren en lo sucesivo a Electricos y Soluciones.

Al visitar nuestro sitio y/o comprarnos algo, usted interactúa con nuestro "Servicio" y reconoce como vinculantes los siguientes términos y condiciones. Estos Términos del servicio se aplican a todos los usuarios del sitio, incluyendo usuarios que son navegadores, proveedores, clientes, comerciantes y/o que aporten contenido.

Lea estos Términos del servicio detenidamente antes de acceder o utilizar nuestra página web. Al acceder o utilizar cualquier parte del sitio, usted acepta estos Términos del servicio.`
    },
    {
      id: 'store-terms',
      title: 'Términos de la Tienda Online',
      icon: <Settings className="w-5 h-5" />,
      content: `Al aceptar los presentes Términos del servicio, usted declara que tiene la mayoría de edad en su estado o provincia de residencia.

No puede utilizar nuestros productos para ningún fin ilegal o no autorizado ni puede, al hacer uso del Servicio, infringir las leyes de su jurisdicción (incluyendo las leyes de derechos de autor).

No transmitirá ningún gusano o virus informáticos ni ningún código de naturaleza destructiva.

El incumplimiento o violación de cualquiera de los Términos dará como resultado la rescisión inmediata de sus Servicios.`
    },
    {
      id: 'general-conditions',
      title: 'Condiciones Generales',
      icon: <Shield className="w-5 h-5" />,
      content: `Nos reservamos el derecho de rechazar el servicio a cualquier persona, por cualquier motivo, en cualquier momento.

Su contenido (sin incluir la información de la tarjeta de crédito) puede transferirse sin cifrar e implicar transmisiones en varias redes y cambios para adaptarse a los requisitos técnicos. La información de la tarjeta de crédito siempre se cifra durante la transferencia.

No puede reproducir, duplicar, copiar, vender, revender ni aprovechar ninguna parte del Servicio sin nuestro permiso expreso por escrito.`
    },
    {
      id: 'information-accuracy',
      title: 'Exactitud de la Información',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `No nos responsabilizamos si la información disponible en este sitio no es precisa, completa o actualizada. El material se proporciona solo para información general y no se debe confiar en él como la única base para tomar decisiones.

Este sitio puede contener información histórica que no es actual y se proporciona únicamente como referencia. Nos reservamos el derecho de modificar el contenido en cualquier momento, pero no tenemos la obligación de actualizar información.

Es su responsabilidad controlar los cambios en nuestro sitio.`
    },
    {
      id: 'pricing',
      title: 'Modificaciones y Precios',
      icon: <CreditCard className="w-5 h-5" />,
      content: `Los precios de nuestros productos están sujetos a cambios sin previo aviso.

Nos reservamos el derecho de modificar o discontinuar el Servicio (o cualquier parte del mismo) sin previo aviso en cualquier momento.

No seremos responsables ante usted ni ante ningún tercero por ninguna modificación, cambio de precio, suspensión o interrupción del Servicio.`
    },
    {
      id: 'products',
      title: 'Productos y Servicios',
      icon: <Users className="w-5 h-5" />,
      content: `Ciertos productos o servicios pueden estar disponibles exclusivamente online a través del sitio web. Estos productos pueden tener cantidades limitadas y están sujetos a devolución o cambio solo de acuerdo con nuestra Política de devolución.

Hemos hecho todo lo viable para mostrar con precisión los colores y las imágenes de nuestros productos. No podemos garantizar que la visualización de cualquier color en su monitor sea precisa.

Nos reservamos el derecho de limitar las ventas de nuestros productos o servicios a cualquier persona, región geográfica o jurisdicción.`
    }
  ];

  const additionalSections = [
    'Exactitud de la Facturación y de la Información de la Cuenta',
    'Herramientas Opcionales',
    'Enlaces de Terceros',
    'Comentarios de los Usuarios, Opiniones y Otras Comunicaciones',
    'Información Personal',
    'Errores, Inexactitudes y Omisiones',
    'Usos Prohibidos',
    'Descargo de Responsabilidad de Garantías',
    'Indemnización',
    'Divisibilidad'
  ];

  return (
    <div className="terminos-container">
      <div className="terminos-header">
        <h1 className="terminos-title">
          Términos y Condiciones
        </h1>
        <p className="terminos-subtitle">
          Electricos y Soluciones
        </p>
        <div className="terminos-divider"></div>
      </div>

      <div className="terminos-alert">
        <p className="terminos-alert-text">
          <strong>Importante:</strong> Al utilizar nuestros servicios, usted acepta estos términos y condiciones en su totalidad. 
          Le recomendamos leer detenidamente cada sección antes de proceder.
        </p>
      </div>

      <div className="terminos-sections">
        {sections.map((section) => (
          <div key={section.id} className="terminos-section">
            <button
              onClick={() => toggleSection(section.id)}
              className="terminos-section-button"
            >
              <div className="terminos-section-header">
                <span className="terminos-section-icon">{section.icon}</span>
                <h2 className="terminos-section-title">
                  {section.title}
                </h2>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="terminos-chevron" />
              ) : (
                <ChevronDown className="terminos-chevron" />
              )}
            </button>
            
            {expandedSection === section.id && (
              <div className="terminos-section-content">
                <div className="terminos-content-text">
                  {section.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="terminos-paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="terminos-additional-sections">
        <h3 className="terminos-additional-title">
          Secciones Adicionales Incluidas
        </h3>
        <div className="terminos-additional-grid">
          {additionalSections.map((section, index) => (
            <div key={index} className="terminos-additional-item">
              <div className="terminos-bullet"></div>
              <span className="terminos-additional-text">{section}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="terminos-footer">
        <p className="terminos-footer-text">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
          <br />
          Para preguntas sobre estos términos, contáctenos a través de nuestro sitio web.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;