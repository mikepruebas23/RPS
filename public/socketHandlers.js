import { actualizarEstadoPartida, actualizarEstatusJugador, actualizarTempo, actualizarListaDeSalas, actualizarMovimientos,
  bloquearBtnListo, uiJuegoFinalizado, ESTATUS_JUEGO, ESTATUS_JUGADOR, actualizarEstatusTablero, ESTATUS_TABLERO
 } from './uiUpdates.js';

import { asignarMovimientos } from './dragAndDrop.js';


export function setupSocketHandlers(socket) {
  
  let globalUsuarioId;
  let estatusJuego = 'jugando';
  // Mostrar el ID del usuario al conectarse
  socket.on('connect', () => {
    const usuarioId = document.getElementById('usuario-id');
    if (usuarioId) {
      usuarioId.textContent = `Tu ID de usuario: ${socket.id}`;
      globalUsuarioId = socket.id;
    } else {
      console.error('Elemento usuario-id no encontrado.');
    }
  });

  // Solicitar salas al cargar la página
  window.addEventListener('load', () => {
    socket.emit('obtenerSalas');
  });

  // Actualizar lista de salas
  socket.on('actualizarSalas', (salas) => {
    actualizarListaDeSalas(salas);
  });

  // Sala lista
  socket.on('salaLista', (data) => {
    const { codigo, jugadores } = data;
    actualizarEstadoPartida(ESTATUS_JUEGO.SALA_LISTA);
    actualizarTempo();
  });

  // Actualizar temporizador
  socket.on('actualizarTemporizador', (tiempoRestante) => {
    const contador = document.getElementById('contador-inicial');
    if (contador) {
      contador.textContent = `${tiempoRestante} segundos`;
    } else {
      console.error('Elemento contador-inicial no encontrado.');
    }
  });

  socket.on('temporizadorFinalizado', () => {
    actualizarEstadoPartida(ESTATUS_JUEGO.TEMP_GLOBAL_FIN);
  });

  // Recibir movimientos
  socket.on('recibirMovimientos', (movimientos) => {
    actualizarMovimientos(movimientos);
    asignarMovimientos(movimientos);
  });

  // Escuchar el evento cuando ambos jugadores estén listos
  socket.on("resultadoRonda", (resultado) => {
    // console.log(resultado);
    // renderPuntuacionesRonda(globalUsuarioId, resultado);
    actualizarEstadoPartida(ESTATUS_JUEGO.MOSTRAR_PUNTOS, globalUsuarioId, resultado);

    if(estatusJuego != 'finalizado'){
      bloquearBtnListo(false);
    }
    // console.log(resultado);
    // Aquí puedes activar la lógica de la fase de análisis o actualizar la UI
  });

  // Escuchar el evento cuando ambos jugadores estén listos
  socket.on("se_finDelJuego", (resultado) => {
    estatusJuego = 'finalizado';
    console.log("El juego a finalizado.");
    bloquearBtnListo(true);
    uiJuegoFinalizado(globalUsuarioId, resultado);
    // console.log(resultado);
    // Aquí puedes activar la lógica de la fase de análisis o actualizar la UI
  });


  socket.on("visualOponenteListo", () => {
    actualizarEstatusJugador(ESTATUS_JUGADOR.OP_MANO_LISTA);
  });

  socket.on("serverEmit_visualOponenteListo", (movimientos) => {
    actualizarEstatusTablero(ESTATUS_TABLERO.OPO_LISTO, movimientos);
  });

  // cuando los 2 jugadores ponen sus movimientos.
  socket.on("serverEmit_RondaLista", (totalMovimientos, resultado) => {
    // Obtener todos los IDs de los jugadores en la ronda
    const jugadores = Object.keys(totalMovimientos);
  
    // Buscar el ID contrario
    const movimientoOponente = jugadores.find(id => id !== globalUsuarioId);
  
    if (movimientoOponente) {
      const movimientos = totalMovimientos[movimientoOponente]; // Movimientos del oponente

      actualizarEstatusTablero(ESTATUS_TABLERO.OPO_LISTO, movimientos);
      // renderPuntuacionesRonda(globalUsuarioId, resultado);
      actualizarEstadoPartida(ESTATUS_JUEGO.MOSTRAR_PUNTOS, globalUsuarioId, resultado);

      setTimeout(() => {
        actualizarEstatusTablero(ESTATUS_TABLERO.LIMPIAR);
        actualizarEstatusTablero(ESTATUS_TABLERO.NUEVA_RONDA);
      }, 3000);
    } else {
      console.error("No se encontró el ID contrario.");
    }
  });
  
}


