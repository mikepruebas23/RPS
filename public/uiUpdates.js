import { initializeDragAndDrop } from './dragAndDrop.js';
import { unirseASala } from './game.js';

const idUsuario = document.getElementById('usuario-id');
const controlesIniciales = document.getElementById('controles-iniciales');
const listaSalas = document.getElementById('lista-salas');
const salaJuego = document.getElementById('sala-juego');
const infoSala = document.getElementById('info-sala');
const contbBtnListo = document.getElementById('cont-btn');
const btnListo = document.getElementById('btnListo');
const contJuego = document.getElementById('cont-juego');
const contFinJuego = document.getElementById('cont-finjuego');
const fjNombre1 = document.getElementById('fj-nombre1');
const fjPuntos1 = document.getElementById('fj-puntos1');
const fjNombre2 = document.getElementById('fj-nombre2');
const fjPuntos2 = document.getElementById('fj-puntos2');

let pj1Puntos = 0;
let pj2Puntos = 0;

export function actualizarEstadoPartida(mensaje) {
  const estadoPartida = document.getElementById('estado-partida');
  if (estadoPartida) {
    estadoPartida.innerHTML = `<p>${mensaje}</p>`;
  }
}
  
export function mostrarJugadores(jugadores, oponenteId) {
  if (infoSala) {
    infoSala.innerHTML = `
      <p><strong>Oponente:</strong> ${oponenteId || 'Esperando oponente...'}</p>
      <p style="color: blue;"><strong>Tu:</strong> ${socket.id}</p>
    `;
  }
}

export function entrarEnSala(codigo, mensaje="", iOpcion) {
    // Oculta los controles iniciales
    controlesIniciales.classList.add('hidden');
    listaSalas.classList.add('hidden');
    idUsuario.classList.add('hidden');

    if(iOpcion === 1){ 
      // Muestra la interfaz de la sala de juego
      salaJuego.classList.remove('hidden');
      infoSala.textContent = `Estás en la sala: ${codigo}`;
    }
    else {
      salaJuego.classList.add('hidden'); 
    }


    // Mostrar los IDs de los jugadores
    // Pendiente
    // mostrarJugadores(jugadores, oponenteId);
    actualizarEstadoPartida(mensaje);
};

export function actualizarTempo(){
  const contContador = document.getElementById('cont-tablero');
  const movimientos = document.getElementById('movimientos-container');

  contContador.classList.remove('hidden');
  movimientos.classList.remove('hidden');
}

export function actualizarListaDeSalas(salas) {
  const tituloSalas = document.getElementById('titulo-listado');
  const contenedorSalas = document.getElementById('contenedor-sala');

  // if (!tituloSalas || !contenedorSalas) {
  //   console.error('Elementos de la lista de salas no encontrados.');
  //   return;
  // }

  if (salas.length === 0) {
      contenedorSalas.innerHTML = '<p id="titulo-listado">No hay salas disponibles</p>';
  } else {
    contenedorSalas.innerHTML = '';
    salas.forEach(({ codigo, usuarios }) => {
      const salaItem = document.createElement('p');
      const btnUnirse = document.createElement('button');
      
      btnUnirse.textContent = 'unirse';
      btnUnirse.classList.add('btn-unirse');
      btnUnirse.addEventListener('click', () => unirseASala(codigo)); // Correcto
      salaItem.textContent = `Sala: ${codigo} | Jugadores: ${usuarios}`;
      
      contenedorSalas.appendChild(salaItem);
      contenedorSalas.appendChild(btnUnirse);
    });
    
  }
}
  
export function actualizarMovimientos(movimientos) {
  const contenedorMovimientos = document.getElementById('movimientos');
  if (contenedorMovimientos) {
    contenedorMovimientos.innerHTML = movimientos
      .map((movimiento) => `<div class="movimiento">${movimiento}</div>`)
      .join('');
    initializeDragAndDrop();
  } else {
    console.error('Elemento movimientos no encontrado.');
  }
}

export function actualizarIndicadorTurno(esMiTurno) {

  const indicadorTurno = document.getElementById('turno-actual');
  const botonTerminarTurno = document.getElementById('btn-turno');

  if (esMiTurno) {
    indicadorTurno.textContent = 'Es tu turno';
    indicadorTurno.classList.add('mi-turno');
    indicadorTurno.classList.remove('turno-enemigo');

    botonTerminarTurno.textContent = "Terminar turno";
    botonTerminarTurno.classList.add('boton-sala');
    botonTerminarTurno.classList.add('boton-turno');
    botonTerminarTurno.classList.remove('btn-disabled');
  } else {
    indicadorTurno.textContent = 'Es el turno del otro jugador';
    indicadorTurno.classList.add('turno-enemigo');
    indicadorTurno.classList.remove('mi-turno');

    botonTerminarTurno.textContent = "Esperando turno";
    botonTerminarTurno.classList.remove('boton-sala');
    botonTerminarTurno.classList.remove('boton-turno');
    botonTerminarTurno.classList.add('btn-disabled');
  }

  botonTerminarTurno.disabled = !esMiTurno;
}

export function renderPuntuacionesRonda(idJugador, resultado){
  // idJugador = al jugador actual del soclet 
  const contPuntaje = document.getElementById('cont-puntaje');
  const contNombres = document.getElementById('cont-nombres');
  const nombre1 = document.getElementById('nombre1');
  const nombre2 = document.getElementById('nombre2');
  const resultado1 = document.getElementById('resultadoj1');
  const resultado2 = document.getElementById('resultadoj2');

  contPuntaje.classList.remove('hidden');
  contNombres.classList.remove('hidden');

  console.log(idJugador, resultado);
  
  for(let res of resultado){
    if(idJugador === res.idJugador){
      pj1Puntos += res.puntos;
      resultado1.textContent = pj1Puntos
      nombre1.textContent = idJugador;
    }
    else {
      pj2Puntos += res.puntos;
      resultado2.textContent = pj2Puntos;
      nombre2.textContent = res.idJugador;
    }
  }
}

export function renderBtnListo(){
  contbBtnListo.classList.remove('hidden'); 
}

export function bloquearBtnListo(bOpcion){

  // true bloquear, false desbloquear
  btnListo.disabled = bOpcion; 

  if(bOpcion){ 
    btnListo.classList.add('btn-disabled');
    btnListo.classList.remove('btn-listo');
  } 
  else {
    btnListo.classList.remove('btn-disabled');
    btnListo.classList.add('btn-listo');
  }
}

export function uiJuegoFinalizado(idJugador, resultadoPuntos){

  contJuego.classList.add('hidden');
  contFinJuego.classList.remove('hidden');

  for(let res of resultadoPuntos){
    if(idJugador === res.idJugador){
      fjNombre1.textContent = idJugador;
      fjPuntos1.textContent = res.puntos;
    }
    else {
      fjNombre2.textContent = res.idJugador;
      fjPuntos2.textContent = res.puntos;
    }
  }

  console.log(idJugador, resultadoPuntos);
}

export const ocultarPantalla = (idElemento) => {
  let elemento = document.getElementById(idElemento);
  elemento.classList.add('_cont-iniciales');
}