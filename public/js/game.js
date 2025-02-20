import { alert_mensaje } from './alerts.js';
import { setupSocketHandlers } from './socketHandlers.js';
import { actualizarEstatusJugador, entrarEnSala, actualizarEstadoPartida, ocultarPantalla, ESTATUS_JUGADOR, ESTATUS_JUEGO } from './uiUpdates.js';


const socket = io();
// codigos
// entrar sala , 1 en crear, 2 en unirseSala

let globalCodigoSala;
// Función para crear una sala
function crearSala() {
  socket.emit('crearSala', (codigo) => {
    globalCodigoSala = codigo;
    ocultarPantalla('controles-iniciales');
    entrarEnSala(codigo, "Esperando jugador...", 1);
    actualizarEstadoPartida(ESTATUS_JUEGO.CREAR_SALA);
  });
}

// Función para unirse a una sala
export function unirseASala(codigoSala) {
  socket.emit('unirseSala', codigoSala, (respuesta) => {
    if (respuesta.success) {
      entrarEnSala(codigoSala, " ", 2);
      globalCodigoSala = respuesta.codigo;
      actualizarEstadoPartida(ESTATUS_JUEGO.CREAR_SALA);
    } else {
      console.error(respuesta.message);
      alert_mensaje(respuesta.message);
    }
  });
}

function obtenerMovimientosTablero() {
  const tablero = document.getElementById('tablero-mio');
  const elTablero = tablero.getElementsByClassName('movimiento'); // Obtener todos los elementos con clase 'movimiento'

  const misMovimientos = document.getElementById('movimientos');
  const elMisMovimientos = misMovimientos.getElementsByClassName('movimiento');

  // Recorrer los elementos y obtener los valores numéricos de mi tablero
  const valoresTablero = [];
  for (let i = 0; i < elTablero.length; i++) {
    const valorTab = parseInt(elTablero[i].textContent.trim()); // Usar textContent para obtener el texto y convertirlo a número
    if (!isNaN(valorTab)) {
      valoresTablero.push(valorTab);
    }
  }

  // Recorrer los elementos y obtener los valores numéricos
  const valoresMovimientos = [];
  for (let i = 0; i < elMisMovimientos.length; i++) {
    const valorMov = parseInt(elMisMovimientos[i].textContent.trim()); // Usar textContent para obtener el texto y convertirlo a número
    if (!isNaN(valorMov)) {
      valoresMovimientos.push(valorMov);
    }
  }

  return {valoresTablero, valoresMovimientos};
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

  // Evento para bloquear el botón cuando el jugador está listo
  document.getElementById("btnListo").addEventListener("click", () => {
    
    const {valoresTablero, valoresMovimientos} = obtenerMovimientosTablero();
  
    if (valoresTablero) {
      // enviar mensaje y mano para el oponente.
      socket.emit('gameEmit_movimientoListo', {
        codigoSala: globalCodigoSala,
        movimientos: valoresTablero,
        cantMovimientos: valoresMovimientos.length
      });
  
      actualizarEstatusJugador(ESTATUS_JUGADOR.MANO_LISTA);
    } else {
      console.log("El total no es un número de dos dígitos.");
    }
  });

  const nombre1 = document.getElementById('nombre1');
  nombre1.innerHTML = localStorage.getItem('flip43_tagname') || "Tú";

  actualizarEstadoPartida(ESTATUS_JUEGO.INICIO);

});
