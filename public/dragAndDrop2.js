// Importar la librería SortableJS
// Asegúrate de que el script de SortableJS esté cargado antes de este archivo

/**
 * Inicializa el contenedor de movimientos con funcionalidad de drag-and-drop.
 */
export function initializeDragAndDrop() {
    const movimientosContainer = document.getElementById('movimientos');
  
    // Inicializar SortableJS
    if (movimientosContainer) {
      Sortable.create(movimientosContainer, {
        animation: 150, // Animación al mover elementos
        onEnd: (event) => {
          console.log(`Movimiento ${event.item.textContent} cambiado de posición.`);
          actualizarOrdenMovimientos();
        },
      });
    }
  }
  
  /**
   * Obtiene el orden actual de los movimientos después de rearrastrar.
   */
  function actualizarOrdenMovimientos() {
    const movimientosContainer = document.getElementById('movimientos');
    const nuevoOrden = Array.from(movimientosContainer.children).map((item) => item.textContent);
    console.log('Nuevo orden de movimientos:', nuevoOrden);
  
    // Aquí puedes emitir este orden al servidor o actualizar el estado del juego
    // socket.emit('actualizarOrdenMovimientos', nuevoOrden);
  }
  