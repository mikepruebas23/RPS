import { initializeDragAndDrop } from './dragAndDrop.js';
import { unirseASala } from './game.js';

const idUsuario = document.getElementById('usuario-id');
const contLogo = document.getElementById('cont-logo');
const contTablero = document.getElementById('cont-tablero');
const controlesIniciales = document.getElementById('controles-iniciales');
const movimientosContainer = document.getElementById('movimientos-container');
const contMensaje = document.getElementById('cont-mensaje');
const pMensaje = document.getElementById('mensaje');
const contNombres = document.getElementById('cont-nombres');
const contPuntaje = document.getElementById('cont-puntaje');
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
const estadoPartida = document.getElementById('estado-partida');

let pj1Puntos = 0;
let pj2Puntos = 0;

const MENSAJES = {
  VACIO: '',
  TOEL: 'Tu oponente esta listo!',
}

export const ESTATUS_JUEGO = {
  SALA_LISTA: 'sala_lista',
  TEMP_GLOBAL_FIN: 'TEMP_FIN',
  TEMP_GLOBAL_INICIO: 'TEMP_INICIO'
}

export const ESTATUS_JUGADOR = {
  MANO_LISTA: 'MANO_LISTA',
  OP_MANO_LISTA: 'OP_MANO_LISTA',
}

export function actualizarEstadoJugador(mensaje) {
  if (estadoPartida) {
    estadoPartida.innerHTML = `<p>${mensaje}</p>`;
  }
}

export function actualizarEstadoPartida(estatus) {
  let mensaje = '';
  if (estatus === 'sala_lista') {
    salaJuego.classList.add('hidden');
    mensaje = '';
  }
  estadoPartida.innerHTML = `<p>${mensaje}</p>`;

  switch(estatus){
    case ESTATUS_JUEGO.TEMP_GLOBAL_FIN:
      _MostrarOcultarDiv(movimientosContainer,  'remove');
      _MostrarOcultarDiv(contbBtnListo, 'remove');
      _MostrarOcultarDiv(contTablero, 'add');
      _MostrarOcultarDiv(contLogo, 'add');
      _MostrarOcultarDiv(contNombres, 'remove');
      _MostrarOcultarDiv(contPuntaje, 'remove');
    break;
  }
}

export function actualizarEstatusJugador(estatus){
  switch(estatus){
    case ESTATUS_JUGADOR.OP_MANO_LISTA:
      _MostrarMensaje(pMensaje, MENSAJES.TOEL);
      _MostrarOcultarDiv(contMensaje,  'remove');
    break;
    case ESTATUS_JUGADOR.MANO_LISTA:
      _MostrarMensaje(pMensaje, MENSAJES.VACIO);
      _MostrarOcultarDiv(contMensaje,  'add');
    break;
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
      // infoSala.textContent = `Estás en la sala: ${codigo}`;
    }
    else {
      salaJuego.classList.add('hidden'); 
    }

    // Mostrar los IDs de los jugadores
    // Pendiente
    // mostrarJugadores(jugadores, oponenteId);
    actualizarEstadoJugador(mensaje);
};

export function actualizarTempo(){

  contTablero.classList.remove('hidden');
}

function _MostrarOcultarDiv(elemento, accion) {
  elemento.classList[accion]('hidden');
}

function _MostrarMensaje(elemento, mensaje){
  elemento.textContent = mensaje;
};

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
    // Meter los movimientos en su imagen correspondiente.
    contenedorMovimientos.innerHTML = movimientos
      .map((movimiento) => `<div class="movimiento">${obtenerImagenMovimiento(movimiento)}</div>`)
      .join('');
      
    initializeDragAndDrop();
  } else {
    console.error('Elemento movimientos no encontrado.');
  }
}

function obtenerImagenMovimiento(mov){
  let img = '';
  if(mov === "Piedra"){
    img = 'smash';
  }
  else if(mov === 'Tijera'){
    img = 'sword';
  } 
  else {
    img = 'shield';
  }

  return `<img src="./images/${img}.svg" class="icono-movimiento" alt="icono smash" />`;
}

export function renderPuntuacionesRonda(idJugador, resultado){
  // idJugador = al jugador actual del soclet 
 
  const nombre1 = document.getElementById('nombre1');
  const nombre2 = document.getElementById('nombre2');
  const resultado1 = document.getElementById('resultadoj1');
  const resultado2 = document.getElementById('resultadoj2');

  nombre1.textContent = 'Tú';
  nombre2.textContent = 'Oponente';

  console.log(idJugador, resultado);
  
  for(let res of resultado){
    if(idJugador === res.idJugador){
      pj1Puntos += res.puntos;
      resultado1.textContent = pj1Puntos
    }
    else {
      pj2Puntos += res.puntos;
      resultado2.textContent = pj2Puntos;
    }
  }
}

export function bloquearBtnListo(bOpcion){

  // true bloquear, false desbloquear
  btnListo.disabled = bOpcion; 

  if(bOpcion){ 
    btnListo.classList.add('btn-disabled-circle');
    btnListo.classList.remove('btn-listo');
  } 
  else {
    btnListo.classList.remove('btn-disabled-circle');
    btnListo.classList.add('btn-listo');
  }
}

export function uiJuegoFinalizado(idJugador, resultadoPuntos){

  contJuego.classList.add('hidden');
  contFinJuego.classList.remove('hidden');

  for(let res of resultadoPuntos){
    if(idJugador === res.idJugador){
      fjNombre1.textContent = "Tú";
      fjPuntos1.textContent = res.puntos;
    }
    else {
      fjNombre2.textContent = "Oponente";
      fjPuntos2.textContent = res.puntos;
    }
  }

  console.log(idJugador, resultadoPuntos);
}

export const ocultarPantalla = (idElemento) => {
  let elemento = document.getElementById(idElemento);
  elemento.classList.add('_cont-iniciales');
}