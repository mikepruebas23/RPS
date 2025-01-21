import { setupSocketHandlers } from './socketHandlers.js';
import { actualizarEstadoPartida, entrarEnSala, bloquearBtnListo, ocultarPantalla } from './uiUpdates.js';

const socket = io();

// codigos
// entrar sala , 1 en crear, 2 en unirseSala

let globalCodigoSala;
// Función para crear una sala
function crearSala() {
  socket.emit('crearSala', (codigo) => {
    // console.log(`Sala creada: ${codigo}`);
    globalCodigoSala = codigo;
    ocultarPantalla('controles-iniciales');
    entrarEnSala(codigo, "Esperando jugador...", 1);
  });
}

// Función para unirse a una sala
export function unirseASala(codigoSala) {
  socket.emit('unirseSala', codigoSala, (respuesta) => {
    if (respuesta.success) {
      entrarEnSala(codigoSala, "Esperando jugador2...", 2);
      globalCodigoSala = respuesta.codigo;;
    } else {
      console.error(respuesta.message);
      // Aquí puedes agregar una función para mostrar el error en la interfaz
      // mostrarErrorEnUI(respuesta.message); // Ejemplo de integración con uiUpdates.js
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Configurar los manejadores de socket
  setupSocketHandlers(socket);

  // Obtener referencias a los botones y elementos de la interfaz
  const botonCrear = document.getElementById('crear');
  const botonUnirse = document.getElementById('unirse');
  const codigoSalaSeleccionada = document.getElementById('codigo'); // Input para el código de sala

  // Configurar botón para crear sala
  if (botonCrear) {
    botonCrear.addEventListener('click', crearSala);
  }

  // !Configurar botón para unirse a sala
  if (botonUnirse) {
    botonUnirse.addEventListener('click', () => {
      const codigoSala = codigoSalaSeleccionada.value.trim(); // Eliminar espacios en blanco
      if (codigoSala.length > 0) {
        unirseASala(codigoSala);
      } else {
        console.log('El código de la sala no puede estar vacío.');
        // Puedes agregar un mensaje en la interfaz para informar al usuario
        // mostrarErrorEnUI('El código de la sala no puede estar vacío.');
      }
    });
  }

  // Evento para bloquear el botón cuando el jugador está listo
  document.getElementById("btnListo").addEventListener("click", () => {
    const movimientosContainer = document.getElementById('movimientos');
    const nuevoOrden = Array.from(movimientosContainer.children).map((item) => item.textContent.trim());
    console.log("Los movimientos a mandar, son: ", nuevoOrden);
    socket.emit('jugadorListo', {
      codigoSala: globalCodigoSala,
      movimientos: nuevoOrden,  // El orden de los movimientos del jugador
  });
    bloquearBtnListo(true);
  });
});
