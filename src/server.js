const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const salas = {}; // { codigoSala: { jugadores: [socketId1, socketId2], puntos: { socketId1: 0, socketId2: 0 } } }
const timers = {};
const movimientosPorSala = {};

// Función para emitir el estado de las salas a todos los clientes
function actualizarSalas() {
  const estadoSalas = Object.entries(salas).map(([codigo, data]) => ({
    codigo,
    usuarios: data.jugadores.length,
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

      const { jugadores } = salas[codigoSala];
      const [jugador1Id, jugador2Id] = jugadores;

      const movimientosJugador1 = generarMovimientosAleatorios();
      const movimientosJugador2 = generarMovimientosAleatorios();

      // Emitir los movimientos a cada jugador
      io.to(jugador1Id).emit('recibirMovimientos', movimientosJugador1);
      io.to(jugador2Id).emit('recibirMovimientos', movimientosJugador2);
    }
  }, 1000); // Cada 1 segundo
}

function generarMovimientosAleatorios() {
  const opciones = ["Piedra", "Papel", "Tijera"];
  return Array.from({ length: 5 }, () => opciones[Math.floor(Math.random() * 3)]);
}

function analizarMovimientos(movimientos, jugadores, puntos) {
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
      puntos[jugadores[0]] += 1;
      puntos[jugadores[1]] += 1;
    } else if (reglas[mov1] === mov2) {
      // Jugador 1 gana
      puntos[jugadores[0]] += 2;
    } else {
      // Jugador 2 gana
      puntos[jugadores[1]] += 2;
    }
  }

  // Crear un array con los resultados
  return jugadores.map(jugadorId => ({
    idJugador: jugadorId,
    puntos: puntos[jugadorId],
  }));
}

function finDelJuego(codigoSala, resultadoPuntos) {
  io.to(codigoSala).emit('se_finDelJuego', resultadoPuntos);
}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Enviar la lista actual de salas al cliente si lo solicita
  socket.on('obtenerSalas', () => {
    socket.emit('actualizarSalas', Object.entries(salas).map(([codigo, data]) => ({
      codigo,
      usuarios: data.jugadores.length,
    })));
  });

  // Crear Sala
  socket.on('crearSala', (callback) => {
    const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
    salas[codigo] = {
      jugadores: [socket.id],
      puntos: { [socket.id]: 0 },
    };
    socket.join(codigo);
    console.log(`Sala creada: ${codigo}, Usuario: ${socket.id}`);
    callback(codigo);
    actualizarSalas();
  });

  // Unirse a Sala
  socket.on('unirseSala', (codigo, callback) => {
    if (salas[codigo]) {
      if (salas[codigo].jugadores.length < 2) {
        salas[codigo].jugadores.push(socket.id);
        salas[codigo].puntos[socket.id] = 0;
        socket.join(codigo);

        if (salas[codigo].jugadores.length === 2) {
          io.to(codigo).emit('salaLista', {
            codigo,
            jugadores: salas[codigo].jugadores,
          });
          iniciarTemporizadorSala(codigo);
        }

        const oponente = salas[codigo].jugadores.find(id => id !== socket.id);
        callback({
          success: true,
          codigo,
          oponenteId: oponente || null,
          jugadores: salas[codigo].jugadores,
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
    const { jugadores, puntos } = salas[codigoSala];
    if (
      movimientosPorSala[codigoSala][jugadores[0]] &&
      movimientosPorSala[codigoSala][jugadores[1]]
    ) {
      const resultado = analizarMovimientos(movimientosPorSala[codigoSala], jugadores, puntos);

      // Emitir el resultado de la ronda
      io.to(codigoSala).emit('resultadoRonda', resultado);

      // Verificar si el juego ha terminado
      if (puntos[jugadores[0]] >= 10 || puntos[jugadores[1]] >= 10) {
        finDelJuego(codigoSala, resultado);
      }

      delete movimientosPorSala[codigoSala]; // Limpiar después de analizar
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    for (const codigo in salas) {
      salas[codigo].jugadores = salas[codigo].jugadores.filter(id => id !== socket.id);
      if (salas[codigo].jugadores.length === 0) {
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
