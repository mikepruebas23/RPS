
export let movimientosGlobales = [];


export function initializeDragAndDrop(options = {}) {
  const movimientosContainer = document.getElementById('movimientos');

  // Inicializar SortableJS
  if (movimientosContainer) {
    Sortable.create(movimientosContainer, {
      animation: 150, // Animación al mover elementos
      onEnd: (event) => {
        actualizarOrdenMovimientos();
      },
      ...options, // Permite sobrescribir o añadir configuraciones
    });
  }
}

function actualizarOrdenMovimientos() {
  const movimientosContainer = document.getElementById('movimientos');
  
  const nuevoOrden = Array.from(movimientosContainer.children).map((item) => {
    const imagen = item.querySelector('img');
    if (imagen) {
      let imagenSrc = imagen.src;

      // Eliminar la ruta del proyecto y la extensión .svg
      imagenSrc = imagenSrc.split('/images/')[1].replace('.svg', '');

      // Cambiar los valores de las imágenes
      if (imagenSrc === 'smash') {
        return 'Piedra';
      } else if (imagenSrc === 'sword') {
        return 'Tijera';
      } else if (imagenSrc === 'shield') {
        return 'Papel';
      }

      return imagenSrc; // Si no es uno de los tres, devolver el nombre tal cual
    }
    return ''; // Si no hay imagen, devolver vacío
  });

  movimientosGlobales = nuevoOrden;
}

