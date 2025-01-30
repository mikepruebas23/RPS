
export let movimientosGlobales = [];
export let sortableInstances = [];

export function initializeDragAndDrop(options = {}) {
  const movimientosContainer = document.getElementById('movimientos');
  const tableroMio = document.getElementById('tablero-mio');

  // Inicializar SortableJS en los contenedores
  if (movimientosContainer) {
    const movimientosSortable = Sortable.create(movimientosContainer, {
      group: 'compartido',
      animation: 150,
      ...options, // Permite sobrescribir o añadir configuraciones
    });

    const tableroMioSortable = Sortable.create(tableroMio, {
      group: 'compartido',
      animation: 150,
      onAdd: (event) => {
        if (tableroMio.children.length > 2) {
          event.from.appendChild(event.item);
        }
      },
      onRemove: (event) => {
        if (tableroMio.children.length < 2) {
          return;
        }
      },
    });

    // Almacenar las instancias para poder controlarlas desde otro archivo
    sortableInstances = [movimientosSortable, tableroMioSortable];
  }
}

export function toggleDragAndDrop(enable) {
  if (sortableInstances.length > 0) {
    sortableInstances.forEach((sortable) => {
      if (enable) {
        sortable.option('disabled', true); // Habilitar
      } else {
        sortable.option('disabled', false); // Deshabilitar
      }
    });
  }
}

export function initializeDragAndDropAnterior(options = {}) {
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

export function asignarMovimientos(movimientos){
  movimientosGlobales = movimientos;
}

