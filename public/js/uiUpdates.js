import { initializeDragAndDrop, toggleDragAndDrop } from './dragAndDrop.js';
import { unirseASala } from './game.js';

const idUsuario = document.getElementById('usuario-id');
const contLogo = document.getElementById('cont-logo');
const contBienvenido = document.getElementById('bienvenido');
const contGuardarnombre = document.getElementById('cont-guardarnombre');
const contHeader = document.getElementById('header');
const contTablero = document.getElementById('cont-tablero');
const contTemporizador = document.getElementById('cont-temporizador');
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
const contFinJuegoDq = document.getElementById('cont-finjuego-dq');
const fjNombre1 = document.getElementById('fj-nombre1');
const fjPuntos1 = document.getElementById('fj-puntos1');
const fjNombre2 = document.getElementById('fj-nombre2');
const fjPuntos2 = document.getElementById('fj-puntos2');
const estadoMensaje = document.getElementById('estado-mensaje');

let pj1Puntos = 0;
let pj2Puntos = 0;

const MENSAJES = {
  VACIO: '',
  TOEL: 'Tu oponente esta listo!',
}

export const ESTATUS_JUEGO = {
  INICIO: 'INICIO',
  CREAR_SALA: 'CREAR_SALA',
  SALA_LISTA: 'SALA_LISTA',
  MOSTRAR_PUNTOS: 'MOSTRAR_PUNTOS', 
  TEMP_GLOBAL_FIN: 'TEMP_FIN',
  TEMP_GLOBAL_INICIO: 'TEMP_INICIO',
  DESCONECTADO: 'DESCONECTADO',
}

export const ESTATUS_JUGADOR = {
  MANO_LISTA: 'MANO_LISTA',
  OP_MANO_LISTA: 'OP_MANO_LISTA',
}

export const ESTATUS_TABLERO = {
  LIMPIAR: 'LIMPIAR',
  OPO_LISTO: 'OPO_LISTO',
  OPO_LISTO_AUTO: 'OPO_LISTO_AUTO',
  NUEVA_RONDA: 'NUEVA_RONDA',
  NUEVA_RONDA_SIN_BTN: 'NUEVA_RONDA_SIN_BTN',
}

function uiActualizarNombre() {
  const tagname = localStorage.getItem('flip43_tagname') || null;
  if (tagname) {
    if (contBienvenido) {

      // Eliminar cualquier elemento hijo antes de agregar uno nuevo
      while (contBienvenido.firstChild) {
        contBienvenido.removeChild(contBienvenido.firstChild);
      }

      const p = document.createElement('p');
      p.textContent = `Hola, ${tagname}`;
      contBienvenido.appendChild(p);
    }
  }
}

function _actualizarEstadoMensaje(mensaje="") {
  estadoMensaje.innerHTML = `<p>${mensaje}</p>`;
}

export function actualizarEstadoPartida(estatus, idJugador = null, resultado = null) {

  switch(estatus){
    case ESTATUS_JUEGO.INICIO:
      uiActualizarNombre();
    break;
    case ESTATUS_JUEGO.CREAR_SALA:
      _MostrarOcultarDiv(contBienvenido, 'add');
      _MostrarOcultarDiv(contGuardarnombre, 'add');
    break;
    case ESTATUS_JUEGO.SALA_LISTA:
      _MostrarOcultarDiv(salaJuego, 'add');
      _actualizarEstadoMensaje();
    break;
    case ESTATUS_JUEGO.TEMP_GLOBAL_FIN:
      _MostrarOcultarDiv(movimientosContainer,  'remove');
      _MostrarOcultarDiv(contbBtnListo, 'remove');
      _MostrarOcultarDiv(contTemporizador, 'add');
      _MostrarOcultarDiv(contLogo, 'add');
      _MostrarOcultarDiv(contNombres, 'remove');
      _MostrarOcultarDiv(contPuntaje, 'remove');
      _MostrarOcultarDiv(contTablero,  'remove');
      _MostrarOcultarDiv(contHeader, 'remove');
    break;
    case ESTATUS_JUEGO.MOSTRAR_PUNTOS:
      _renderPuntuacionesRonda(idJugador, resultado);
    break;
    case ESTATUS_JUEGO.DESCONECTADO: 
      bloquearBtnListo(true);
      toggleDragAndDrop(true);
      uiLimpiarTablero('tablero-mio');
      uiLimpiarTablero('tablero-opo');
      _MostrarOcultarDiv(contFinJuegoDq, 'remove');
      _MostrarOcultarDiv(contJuego, 'add');
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
      bloquearBtnListo(true);
      toggleDragAndDrop(true);
    break;
  }
}

export function actualizarEstatusTablero(estatus, movimientos = null){
  switch(estatus){
    case ESTATUS_TABLERO.LIMPIAR:
      uiLimpiarTablero('tablero-mio');
      uiLimpiarTablero('tablero-opo');
    break;
    case ESTATUS_TABLERO.OPO_LISTO:
      uiLimpiarTablero('tablero-opo');
      uiActualizarMovimientosOponente(movimientos);
    break;
    case ESTATUS_TABLERO.OPO_LISTO_AUTO:
      uiLimpiarTablero('tablero-opo');
      uiActualizarMovimientosOponente(movimientos);
      actionAutoPaseTurno();
    break;
    case ESTATUS_TABLERO.NUEVA_RONDA:
      toggleDragAndDrop(false);
      bloquearBtnListo(false);
      uiLimpiarTablero('tablero-mio');
      uiLimpiarTablero('tablero-opo');
    break;
    case ESTATUS_TABLERO.NUEVA_RONDA_SIN_BTN:
      uiLimpiarTablero('tablero-mio');
      uiLimpiarTablero('tablero-opo');
    break;
  }
}

function uiActualizarMovimientosOponente(movimientos) {

  uiLimpiarTablero('tablero-opo');

  const tabOponente = document.getElementById('tablero-opo');

  // Iterar sobre los movimientos y agregar cada uno al tablero
  movimientos.forEach((movimiento) => {
    const div = document.createElement('div');
    div.classList.add('movimiento-opo'); // Agregar la clase CSS
    div.textContent = movimiento; // Asignar el valor numérico

    tabOponente.appendChild(div); // Agregar el div al tablero
  });
}

function uiLimpiarTablero(idElemento){
  const tablero = document.getElementById(idElemento);

  // Limpiar el tablero antes de agregar nuevos movimientos
  while (tablero.firstChild) {
    tablero.removeChild(tablero.firstChild);
  }
}

function actionAutoPaseTurno() {
  setTimeout(() => {
    const btnListo = document.getElementById("btnListo");
    if (btnListo) {
      btnListo.disabled = false; // Habilita el botón
      btnListo.click(); // Simula un clic en el botón
      console.log("Turno pasado automáticamente.");
    } else {
      console.warn("El botón btnListo no se encontró.");
    }
  }, 2000); // 3 segundos
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
      infoSala.textContent = `SALA: ${codigo}`;
    }
    else {
      salaJuego.classList.add('hidden'); 
    }

    // Mostrar los IDs de los jugadores
    // Pendiente
    // mostrarJugadores(jugadores, oponenteId);
    _actualizarEstadoMensaje(mensaje);
};

export function actualizarTempo(){
  contTemporizador.classList.remove('hidden');
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
  
  console.log(salas);
  if (salas.length === 0) {
    contenedorSalas.innerHTML = '<p id="titulo-listado">Ninguna</p>';
  } else {
    contenedorSalas.innerHTML = '';
    salas.forEach(({ codigo, usuarios }) => {
      const salaItems = document.createElement('div');
      
      const salaItem = document.createElement('p');
      const btnUnirse = document.createElement('button');
      if(usuarios < 2){
        
        btnUnirse.textContent = 'unirse';
        btnUnirse.classList.add('btn-unirse');
        salaItems.classList.add('contenedor-sala-items');
        btnUnirse.addEventListener('click', () => unirseASala(codigo)); // Correcto
        salaItem.textContent = `Sala: ${codigo}`;

        salaItems.appendChild(salaItem);
        salaItems.appendChild(btnUnirse);
        contenedorSalas.appendChild(salaItems);
      }
      else {
        contenedorSalas.innerHTML = '<p id="titulo-listado">En partida</p>';
      }
      
    });
  }
}
  
export function actualizarMovimientos(movimientos) {
  const contenedorMovimientos = document.getElementById('movimientos');
  if (contenedorMovimientos) {
    // Meter los movimientos en su imagen correspondiente.
    contenedorMovimientos.innerHTML = movimientos
      .map((movimiento) => `<div class="movimiento">${movimiento}</div>`)
      .join('');
      
    initializeDragAndDrop();
  } else {
    console.error('Elemento movimientos no encontrado.');
  }
}

function _renderPuntuacionesRonda(idJugador, resultado){
  // idJugador = al jugador actual del soclet 
 
  const nombre1 = document.getElementById('nombre1');
  const nombre2 = document.getElementById('nombre2');
  const resultado1 = document.getElementById('resultadoj1');
  const resultado2 = document.getElementById('resultadoj2');

  nombre1.textContent = localStorage.getItem('flip43_tagname') || 'Tú';
  nombre2.textContent = 'Oponente';

  // console.log(idJugador, resultado);
  
  for(let res of resultado){
    if(idJugador === res.idJugador){
      pj1Puntos = res.puntos;
      resultado1.textContent = pj1Puntos;
    }
    else {
      pj2Puntos = res.puntos;
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
      fjNombre1.textContent = localStorage.getItem('flip43_tagname') || "Tú";
      fjPuntos1.textContent = res.puntos;
    }
    else {
      fjNombre2.textContent = "Oponente";
      fjPuntos2.textContent = res.puntos;
    }
  }

  // console.log(idJugador, resultadoPuntos);
}

export const ocultarPantalla = (idElemento) => {
  let elemento = document.getElementById(idElemento);
  elemento.classList.add('_cont-iniciales');
}

// Actualizar tablero del usuario
export const actualizarTablero = () => {
  const tablero = document.getElementById('tablero-mio');
  const elementos = tablero.getElementsByClassName('movimiento');

}