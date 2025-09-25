import React from 'react';
import './Novedades.css';

const noticias = [
  {
    titulo: 'Crisis eléctrica en Cuba: más de la mitad de la isla quedará sin luz, el peor registro en dos años',
    descripcion: 'Cuba tendrá este miércoles apagones simultáneos en hasta el 57 % de su territorio, la mayor tasa de afectación registrada en lo que va de 2025 y en los últimos dos años.',
    imagen: 'https://imagenes2.eltiempo.com/files/image_1200_535/files/fp/uploads/2025/09/10/68c1a2d6796ad.r_d.960-613.jpeg',
    enlace: 'https://www.eltiempo.com/mundo/latinoamerica/crisis-electrica-en-cuba-mas-de-la-mitad-de-la-isla-quedara-sin-luz-el-peor-registro-en-dos-anos-3491514'
  },
  {
    titulo: '¡Ojo! Cortes de luz en barrios de Bogotá este martes 9 de septiembre de 2025; vea si afecta su casa',
    descripcion: 'Este martes 9 de septiembre de 2025, Enel Colombia adelantará trabajos de mantenimiento en las redes de energía eléctrica, lo que implicará cortes de luz programados en diferentes localidades de Bogotá y en municipios cercanos como Chía, Soacha y Tocancipá. ',
    imagen: 'https://imagenes2.eltiempo.com/files/image_1200_535/uploads/2025/09/09/68c0484686013.png',
    enlace: 'https://www.eltiempo.com/bogota/ojo-cortes-de-luz-en-barrios-de-bogota-este-martes-9-de-septiembre-de-2025-vea-si-afecta-su-casa-3489018'
  },
  {
    titulo: 'Regiotram de Occidente ya tiene garantizado el suministro eléctrico: así es la subestación en Facatativá que ya entró en operación',
    descripcion: 'Una de las dos subestaciones eléctricas que pondrán a andar los trenes del Regiotram de Occidente ya fue puesta en operación. Se trata de la subestación Tren de Occidente, ubicada junto al patio taller El Corzo, en el municipio de Facatativá.',
    imagen: 'https://imagenes2.eltiempo.com/files/image_1200_535/files/fp/uploads/2025/09/03/68b8ac1787ee0.r_d.1264-1300-4000.jpeg',
    enlace: 'https://www.eltiempo.com/bogota/regiotram-de-occidente-ya-tiene-garantizado-el-suministro-electrico-asi-es-la-subestacion-en-facatativa-que-ya-entro-en-operacion-3487523'
  },
  {
    titulo: 'El error común de dejar este aparato enchufado de noche que dispararía su factura de energía',
    descripcion: 'Puede estar apagando luces, controlando el aire acondicionado y aun así pagar más de lo esperado en su factura de energía. El motivo está en un error frecuente: dejar ciertos electrodomésticos enchufados durante la noche. ',
    imagen: 'https://imagenes2.eltiempo.com/files/image_1200_535/uploads/2025/08/22/68a8958d24b31.jpeg',
    enlace: 'https://www.eltiempo.com/mundo/eeuu-y-canada/el-error-comun-de-dejar-este-aparato-enchufado-de-noche-que-dispara-su-factura-de-energia-3483723'
  },
  {
    titulo: 'El boom de la IA no es gratis: las facturas de electricidad suben hasta un 142 % por culpa de sus centros de datos',
    descripcion: 'Los proveedores de energía están solicitando a los reguladores la aprobación de aumentos tarifarios por un total de $ 29 mil millones de dólares durante la primera mitad del año, lo que representa un incremento del 142 % en comparación con solicitudes similares en el mismo periodo del año anterior, según los reportes que indica el medio The Sun.',
    imagen: 'https://imagenes2.eltiempo.com/files/image_1200_535_app/uploads/2024/02/07/65c3edebd7cce.png',
    enlace: 'https://www.eltiempo.com/cultura/gente/el-boom-de-la-ia-no-es-gratis-las-facturas-de-electricidad-suben-hasta-un-20-por-culpa-de-sus-centros-de-datos-3476485'
  }
];

function Novedades() {
  return (
    <section className="container my-5 novedades-section">
      <h2 className="text-center mb-5 titulo-noticias">Últimas Noticias</h2>
      <div className="row">
        {noticias.map((noticia, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-12 mb-4 d-flex">
            <div className="card w-100 h-100">
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