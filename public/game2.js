
import { initializeDragAndDrop } from './dragAndDrop.js';


const socket = io();

/**
 * Actualiza el estado de la partida mostrando un mensaje específico.
 * @param {string} mensaje - El mensaje que describe el estado de la partida.
 */

// Mostrar el ID del usuario al conectarse
socket.on('connect', () => {
    const usuarioId = document.getElementById('usuario-id');
    usuarioId.textContent = `Tu ID de usuario: ${socket.id}`;
});

// Solicitar salas al cargar la página
window.addEventListener('load', () => {
    socket.emit('obtenerSalas'); // Solicitar las salas al servidor
});

let codigoSalaSeleccionada = null;
// Obtener referencias a los contenedores
const idUsuario = document.getElementById('usuario-id');
const controlesIniciales = document.getElementById('controles-iniciales');
const salaJuego = document.getElementById('sala-juego');
const infoSala = document.getElementById('info-sala');
const listaSalas = document.getElementById('lista-salas');
const tituloSalas = document.getElementById('titulo-listado');

// Crear sala
document.getElementById('crear').addEventListener('click', () => {
  socket.emit('crearSala', (codigo) => {
    console.log(`Sala creada: ${codigo}`);
    entrarEnSala(codigo); // Llama a la función para manejar la transición
  });
});

// Unirse a sala
// Unirse a la sala cuando el usuario haga clic en "Unirse"
document.getElementById('unirse').addEventListener('click', () => {
  if (codigoSalaSeleccionada) {
    socket.emit('unirseSala', codigoSalaSeleccionada, (respuesta) => {
      if (respuesta.success) {
        console.log(respuesta);
        entrarEnSala(respuesta.codigo, respuesta.jugadores, respuesta.oponenteId, "Segundo mensaje."); // Pasa el ID del oponente
      } else {
        console.error(respuesta.message);
      }
    });
  } else {
    console.log("No se ha seleccionado una sala.");
  }
});

// Función para manejar la transición a la sala de juego
function entrarEnSala(codigo, jugadores, oponenteId, mensaje="Esperando a que otro jugador se una a la sala...") {
    // Oculta los controles iniciales
    controlesIniciales.classList.add('hidden');
    listaSalas.classList.add('hidden');
    idUsuario.classList.add('hidden');
  
    // Muestra la interfaz de la sala de juego
    salaJuego.classList.remove('hidden');
    infoSala.textContent = `Estás en la sala: ${codigo}`;

    // Mostrar los IDs de los jugadores
    mostrarJugadores(jugadores, oponenteId);
    actualizarEstadoPartida(mensaje);
}

// Función para mostrar los IDs de los jugadores
function mostrarJugadores(jugadores, oponenteId) {
    // console.log("Se ejecutó")
    const textoOponente = document.getElementById('info-sala');
    textoOponente.innerHTML = `
      <p><strong>Oponente:</strong> ${oponenteId ? oponenteId : 'Esperando oponente...'}</p>
      <p style="color: blue;"><strong>Tu:</strong> ${socket.id}</p>
    `;
  }

socket.on('actualizarSalas', (salas) => {
    if (salas.length === 0) {
      tituloSalas.innerHTML = '<p>No hay salas disponibles</p>';
    } else {
        // console.log("info de salas: " + salas);
        // console.log(JSON.stringify(salas, null, 2));
      tituloSalas.innerHTML = '';
      salas.forEach(({ codigo, usuarios }) => {

        const salaItem = document.createElement('p');
        salaItem.textContent = `Sala: ${codigo} | Jugadores: ${usuarios}`;
        salaItem.addEventListener('click', () => {
          // Al hacer clic en una sala, se guarda su código en la variable
          codigoSalaSeleccionada = codigo;
          console.log(`Sala seleccionada: ${codigoSalaSeleccionada}`);
          // Aquí podrías mostrar alguna interfaz de información de la sala seleccionada
        });
        listaSalas.appendChild(salaItem);
      });
    }
});

socket.on('salaLista', (data) => {
  const { codigo, jugadores } = data;
  console.log(`La sala ${codigo} está lista para jugar. Los jugadores son: ${jugadores.join(', ')}`);
  // Puedes actualizar la interfaz para notificar a los jugadores que la sala está lista
});

socket.on('actualizarTemporizador', (tiempoRestante) => {
  const contador = document.getElementById('contador-inicial');
  contador.textContent = `${tiempoRestante}s`;
});

socket.on('temporizadorFinalizado', () => {
  console.log('El temporizador ha terminado.');
  // Aquí puedes manejar la lógica posterior al temporizador
});

socket.on('recibirMovimientos', (movimientos) => {
  const contenedorMovimientos = document.getElementById('movimientos');

  if (contenedorMovimientos) {
    contenedorMovimientos.innerHTML = movimientos
      .map((movimiento) => `<div class="movimiento">${movimiento}</div>`)
      .join('');

    // Inicializar drag-and-drop
    initializeDragAndDrop();
  }

  console.log('Tus movimientos:', movimientos);
});


function actualizarEstadoPartida(mensaje) {
  const estadoPartida = document.getElementById('estado-partida');
  if (estadoPartida) {
    estadoPartida.innerHTML = `<p>${mensaje}</p>`;
  }
}
  

