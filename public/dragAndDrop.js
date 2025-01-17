
/**
 * Inicializa el contenedor de movimientos con funcionalidad de drag-and-drop.
 * @param {Object} options - Opciones adicionales para configurar SortableJS.
 */
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
  const nuevoOrden = Array.from(movimientosContainer.children).map((item) => item.textContent.trim());

  // console.log('Nuevo orden de movimientos:', nuevoOrden);

  // Emite un evento personalizado con el nuevo orden
  // const eventoOrdenActualizado = new CustomEvent('ordenMovimientosActualizado', {
  //   detail: { orden: nuevoOrden },
  // });
  // document.dispatchEvent(eventoOrdenActualizado);

  // Descomentar para enviar al servidor si es necesario
  // socket.emit('actualizarOrdenMovimientos', nuevoOrden);
}
