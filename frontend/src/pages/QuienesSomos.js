import React from 'react';
import './QuienesSomos.css';

const QuienesSomos = () => {
  return (
    <>
      {/* Título Principal */}
      <div className="container text-center py-5 mt-5">
        <h1 className="titulo-principal">
          Eléctricos & Soluciones
        </h1>
        <p className="subtitulo">
          Dando soluciones a los Tolimenses desde hace 5 años.
        </p>
      </div>

      {/* Sección Misión */}
      <section className="seccion seccion-mision">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-5 text-center mb-4 mb-md-0">
              <img
                src="https://img.freepik.com/foto-gratis/objetivos-exito-estrategia-negocio_1421-33.jpg"
                alt="Imagen Misión"
                className="img-fluid rounded-circle floating"
              />
            </div>
            <div className="col-md-7 text-white">
              <h2 className="titulo-seccion">Nuestra Misión</h2>
              <p className="texto">
                La empresa <strong>Eléctricos y Soluciones (E&S)</strong> tiene como misión exclusivamente velar por el bienestar de sus clientes, dándoles a conocer la mejor variedad y soluciones eléctricas para sus proyectos.
              </p>
              <span className="btn btn-yellow mt-3">Soluciones que iluminan tu camino</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Visión */}
      <section className="seccion">
        <div className="container">
          <div className="row align-items-center justify-content-center flex-md-row-reverse">
            <div className="col-md-5 text-center mb-4 mb-md-0">
              <img
                src="https://www.grupoalava.com/wp-content/uploads/sites/12/2022/02/VisionArtificialAF-1024x502.png"
                alt="Imagen Visión"
                className="img-fluid rounded-circle floating"
              />
            </div>
            <div className="col-md-7">
              <h2 className="titulo-seccion">Nuestra Visión</h2>
              <p className="texto">
                La visión de <strong>Eléctricos y Soluciones (E&S)</strong> es ser una empresa sostenible con el tiempo, para prestar suministros de energía eléctrica con eficiencia, confiabilidad y responsabilidad, ofreciendo excelentes servicios y orientación para dar soluciones a nuestros clientes.
              </p>
              <span className="btn btn-darkblue mt-3">Energía con visión de futuro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Gerente */}
      <section className="seccion seccion-mision">
        <div className="container">
          <div className="row justify-content-center align-items-center text-center text-white">
            <div className="col-md-4 mb-4 mb-md-0">
              <img
                src="https://www.infobae.com/resizer/v2/L2SPIWTA7VDCFMIQMAWC3RKJTQ.jpg?auth=5e66902428bafad71b856cd49d021c0dbe13989d5b9b7cab814093c1a1dbbc14&smart=true&width=400&height=400&quality=85"
                alt="Gerente"
                className="img-fluid rounded-circle floating"
              />
            </div>
            <div className="col-md-6">
              <h2 className="titulo-seccion">Edinson Gaitán Penagos</h2>
              <p className="texto">Gerente Principal</p>
              <p className="texto">Técnico Electricista</p>
              <span className="btn btn-yellow mt-3">Liderar con pasión, transformar con energía</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default QuienesSomos;
