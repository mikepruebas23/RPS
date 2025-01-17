import { actualizarEstadoPartida, actualizarTempo, actualizarListaDeSalas, actualizarMovimientos, renderPuntuacionesRonda, renderBtnListo,
  bloquearBtnListo
 } from './uiUpdates.js';


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
    actualizarTempo();

    // console.log(`La sala ${codigo} está lista para jugar con jugadores: ${jugadores.join(', ')}`);
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
    // console.log('El temporizador ha terminado.');
    actualizarEstadoPartida('¡El tiempo ha terminado!');
    renderBtnListo();
  });

  // Recibir movimientos
  socket.on('recibirMovimientos', (movimientos) => {
    actualizarMovimientos(movimientos);
  });

  // Escuchar el evento cuando ambos jugadores estén listos
  socket.on("resultadoRonda", (resultado) => {
    renderPuntuacionesRonda(globalUsuarioId, resultado);

    if(estatusJuego != 'finalizado'){
      bloquearBtnListo(false);
    }
    // console.log(resultado);
    // Aquí puedes activar la lógica de la fase de análisis o actualizar la UI
  });

  // Escuchar el evento cuando ambos jugadores estén listos
  socket.on("se_finDelJuego", () => {
    estatusJuego = 'finalizado';
    console.log("El juego a finalizado.");
    bloquearBtnListo(true);
    // console.log(resultado);
    // Aquí puedes activar la lógica de la fase de análisis o actualizar la UI
  });
}


