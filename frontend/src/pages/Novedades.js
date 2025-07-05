import React from 'react';
import './Novedades.css';

const noticias = [
  {
    titulo: 'Petro dice que se reducirán tarifas de energía y anuncia instalación paneles solares en estratos 1 y 2',
    descripcion: 'El presidente Gustavo Petro aseguró este 31 de diciembre que en Colombia se van a reducir las tarifas de energía...',
    imagen: 'https://imagenes.eltiempo.com/files/image_1200_535/uploads/2024/12/31/67740f1b9075c.jpeg',
    enlace: 'https://www.eltiempo.com/politica/gobierno/presidente-gustavo-petro-asegura-que-se-van-a-reducir-tarifas-de-energia-electrica-en-colombia-3413778'
  },
  {
    titulo: 'Un nuevo plan para llevar luz a 300 millones de personas en África',
    descripcion: 'Líderes de más de la mitad de las naciones de África se reunieron para comprometerse a realizar el mayor aumento de gasto...',
    imagen: 'https://cdn.pixabay.com/photo/2016/11/23/18/13/light-bulbs-1854161_1280.jpg',
    enlace: 'https://www.eltiempo.com/mundo/new-york-times-international-weekly/un-nuevo-plan-para-llevar-luz-a-300-millones-en-africa-3426451'
  },
  {
    titulo: 'Elon Musk señala que la próxima gran sequía será de electricidad, no de agua',
    descripcion: 'Durante el cierre de la conferencia Bosch Connected World, Elon Musk hizo una declaración que dejó a todos pensando.',
    imagen: 'https://cdn.pixabay.com/photo/2021/05/02/02/05/elon-musk-6222396_1280.jpg',
    enlace: 'https://www.eltiempo.com/cultura/gente/elon-musk-senala-que-la-proxima-gran-sequia-sera-de-electricidad-no-de-agua-3415148'
  },
  {
    titulo: 'Colombia reconectada: mercado de vehículos híbridos y eléctricos',
    descripcion: 'En 2024, Colombia marcó un hito en ventas de vehículos eléctricos, alcanzando el 25 % del mercado.',
    imagen: 'https://media.istockphoto.com/id/944500712/photo/green-electric-car-energy-in-transportation-electric-concept.jpg?s=1024x1024&w=is&k=20&c=3qlcl977rwiYexRLcBjOD3PJtUO5-LUMnQ4hS-03Ux0=',
    enlace: 'https://www.eltiempo.com/economia/sectores/colombia-reconectada-3416572'
  },
  {
    titulo: '¿Qué es el "cero absoluto"? El fenómeno que dejó sin electricidad a Europa',
    descripcion: 'Pasado el mediodía, la electricidad desapareció repentinamente en España y Portugal.',
    imagen: 'https://cdn.pixabay.com/photo/2020/03/01/10/24/power-4892237_1280.jpg',
    enlace: 'https://www.eltiempo.com/mundo/europa/que-es-el-cero-absoluto-el-fenomeno-que-dejo-sin-electricidad-a-espana-y-paises-de-europa-3448713'
  }
];

function Novedades() {
  return (
    <section className="container my-5 novedades-section">
      <h2 className="text-center mb-5 titulo-noticias">Últimas Noticias</h2>
      <div className="row">
        {noticias.map((noticia, index) => (
          <div key={index} className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100">
              <img src={noticia.imagen} className="card-img-top" alt={noticia.titulo} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">{noticia.titulo}</h5>
                <p className="card-text">{noticia.descripcion}</p>
                <a
                  href={noticia.enlace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ver-mas mt-auto"
                >
                  Ver más
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Novedades;
