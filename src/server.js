const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const salas = {}; // { codigoSala: [socketId1, socketId2] }
const timers = {};
const jugadoresListos = {};
const movimientosPorSala = {};
let pj1 = 0;
let pj2 = 0;

// Función para emitir el estado de las salas a todos los clientes
function actualizarSalas() {
  const estadoSalas = Object.entries(salas).map(([codigo, usuarios]) => ({
    codigo,
    usuarios: usuarios.length,
  }));
  io.emit('actualizarSalas', estadoSalas);
}

function iniciarTemporizadorSala(codigoSala) {
  let tiempoRestante = 5; // Tiempo en segundos

  // Verificar si ya hay un temporizador para esta sala
  if (timers[codigoSala]) return;

  // Crear el temporizador
  timers[codigoSala] = setInterval(() => {
    tiempoRestante--;

    // Emitir el tiempo restante a los jugadores en la sala
    io.to(codigoSala).emit('actualizarTemporizador', tiempoRestante);

    // Si el tiempo llega a 0, detener el temporizador
    if (tiempoRestante <= 0) {
      clearInterval(timers[codigoSala]);
      delete timers[codigoSala];
      io.to(codigoSala).emit('temporizadorFinalizado');

      const jugador1Id = salas[codigoSala][0];
      const jugador2Id = salas[codigoSala][1];

      const movimientosJugador1 = generarMovimientosAleatorios();
      const movimientosJugador2 = generarMovimientosAleatorios();

      // Emitir los movimientos a cada jugador
      io.to(jugador1Id).emit('recibirMovimientos', movimientosJugador1);
      io.to(jugador2Id).emit('recibirMovimientos', movimientosJugador2);

      // Enviar el turno a cada jugador.
      io.to(jugador1Id).emit('asignarTurnos', { turno1: jugador1Id, turno2: jugador2Id });
      io.to(jugador2Id).emit('asignarTurnos', { turno1: jugador1Id, turno2: jugador2Id });
    }
  }, 1000); // Cada 1 segundo
}

function generarMovimientosAleatorios() {
  const opciones = ["Piedra", "Papel", "Tijera"];
  return Array.from({ length: 5 }, () => opciones[Math.floor(Math.random() * 3)]);
}

function obtenerCodigoSala(jugadorId) {
  for (const [codigoSala, jugadores] of Object.entries(salas)) {
    if (jugadores.includes(jugadorId)) {
      return codigoSala;
    }
  }
  return null; // Si no se encuentra la sala
}

function analizarMovimientos(movimientos, jugadores) {
  const resultados = {
    [jugadores[0]]: 0, // Puntos jugador 1
    [jugadores[1]]: 0, // Puntos jugador 2
  };

  const reglas = {
    Piedra: 'Tijera',
    Tijera: 'Papel',
    Papel: 'Piedra',
  };

  for (let i = 0; i < 5; i++) {
    const mov1 = movimientos[jugadores[0]][i];
    const mov2 = movimientos[jugadores[1]][i];

    if (mov1 === mov2) {
      // Empate
      resultados[jugadores[0]] += 1;
      resultados[jugadores[1]] += 1;
    } else if (reglas[mov1] === mov2) {
      // Jugador 1 gana
      resultados[jugadores[0]] += 2;
    } else {
      // Jugador 2 gana
      resultados[jugadores[1]] += 2;
    }
  }

  // Convertir el objeto de resultados a un array de objetos con idJugador y puntos
  const resultadoFinal = [
    { idJugador: jugadores[0], puntos: resultados[jugadores[0]] },
    { idJugador: jugadores[1], puntos: resultados[jugadores[1]] }
  ];

  pj1 += resultados[jugadores[0]];
  pj2 += resultados[jugadores[1]];

  
  if(pj1 > 9 || pj2 > 9){
    console.log(pj1, pj2);
    finDelJuego(jugadores[0]);
  }

  return resultadoFinal;
}

function finDelJuego(idJugador){
  const codigoSala = obtenerCodigoSala(idJugador);
  if(codigoSala){
    // Emitir el mensaje de juego finazilado
    io.to(codigoSala).emit('se_finDelJuego');
  }
}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

   // Enviar la lista actual de salas al cliente si lo solicita
  socket.on('obtenerSalas', () => {
    socket.emit('actualizarSalas', Object.entries(salas).map(([codigo, usuarios]) => ({
      codigo,
      usuarios: usuarios.length,
    })));
  });

  // Crear Sala
  socket.on('crearSala', (callback) => {
    const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
    salas[codigo] = [socket.id];
    socket.join(codigo);
    console.log(`Sala creada: ${codigo}, Usuario: ${socket.id}`);
    callback(codigo);
    actualizarSalas();
  });

  // Unirse a Sala
  socket.on('unirseSala', (codigo, callback) => {
    if (salas[codigo]) {
      if (salas[codigo].length < 2) {
        salas[codigo].push(socket.id);
        socket.join(codigo);
        // console.log(`Usuario ${socket.id} se unió a la sala ${codigo}`);

        if (salas[codigo].length === 2) {
          io.to(codigo).emit('salaLista', {
            codigo,
            jugadores: salas[codigo],
          });
          // Iniciar el temporizador para la sala
          iniciarTemporizadorSala(codigo);
        }
        // Obtener el ID del oponente si existe
        const oponente = salas[codigo].find(id => id !== socket.id);
        callback({
          success: true,
          codigo,
          oponenteId: oponente || null,
          jugadores: salas[codigo], // Lista de los jugadores
        });

        actualizarSalas();
      } else {
        callback({ success: false, message: 'Sala llena' });
      }
    } else {
      callback({ success: false, message: 'Sala no encontrada' });
    }
  });

  socket.on('jugadorListo', ({ codigoSala, movimientos }) => {
    if (!movimientosPorSala[codigoSala]) {
       movimientosPorSala[codigoSala] = {};
    }

    // Almacenar los movimientos del jugador
    movimientosPorSala[codigoSala][socket.id] = movimientos;

    // Verificar si ambos jugadores han enviado sus movimientos
    const jugadores = salas[codigoSala];
    if (
        movimientosPorSala[codigoSala][jugadores[0]] &&
        movimientosPorSala[codigoSala][jugadores[1]]
    ) {
        // Ambos jugadores están listos, pasar a la fase de análisis
        const resultado = analizarMovimientos(movimientosPorSala[codigoSala], jugadores);

      // Emitir el resultado a ambos jugadores
      io.to(codigoSala).emit('resultadoRonda', resultado);

        // Limpiar los movimientos después de procesarlos
        delete movimientosPorSala[codigoSala];
    }
  });


  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    for (const codigo in salas) {
      salas[codigo] = salas[codigo].filter((id) => id !== socket.id);
      if (salas[codigo].length === 0) {
        delete salas[codigo];
      }
    }
    actualizarSalas();
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});