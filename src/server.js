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
  let tiempoRestante = 3; // Tiempo en segundos

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

      // ejemplo : [7, 3, 0, 9, 1, 6, 4, 2, 8, 5]
      const movimientosJugador1 = generarMovimientosAleatorios();
      const movimientosJugador2 = generarMovimientosAleatorios();

      // Emitir los movimientos a cada jugador
      io.to(jugador1Id).emit('recibirMovimientos', movimientosJugador1);
      io.to(jugador2Id).emit('recibirMovimientos', movimientosJugador2);
    }
  }, 1000); // Cada 1 segundo
}

function generarMovimientosAleatorios() {
  // return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)); // aleatorios
  return Array.from({ length: 10 }, (_, index) => index); // en orden
}


function analizarMovimientos(movimientos, jugadores, puntos) {
  const reglas = {
    Piedra: 'Tijera',
    Tijera: 'Papel',
    Papel: 'Piedra',
  };

  for (let i = 0; i < 5; i++) {
    console.log("i vale: ", i);
    const mov1 = movimientos[jugadores[0]][i];
    const mov2 = movimientos[jugadores[1]][i];

    console.log("mov1: ", mov1);
    console.log("mov2: ", mov2);

    console.log("reglas[mov1]: ",reglas[mov1]);

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

function analizarMovimientos2(movimientos, jugadores, puntos) {
  // Ejemplo de los parámetros:
  // movimientos = { _cHUsroWaBwKOSBRAAAH: [ 1, 3 ], nrNoR1fistaHRZmJAAAF: [ 4, 2 ] }
  // jugadores = [ 'nrNoR1fistaHRZmJAAAF', '_cHUsroWaBwKOSBRAAAH' ]
  // puntos = { nrNoR1fistaHRZmJAAAF: 0, _cHUsroWaBwKOSBRAAAH: 0 }

  // Paso 1: Manipular los movimientos.
  // Concatenar los valores de cada objeto para que no sea un array sino un valor numérico de 2 cifras.
  const movimientosConcatenados = Object.keys(movimientos).reduce((acc, jugadorId) => {
    const valorConcatenado = `${movimientos[jugadorId][0]}${movimientos[jugadorId][1]}`;
    acc[jugadorId] = parseInt(valorConcatenado); // Convertir el valor concatenado a número
    return acc;
  }, {});

  // Paso 2: Comparar los valores para saber cuál es el más grande y sacar la diferencia.
  const idsJugadores = Object.keys(movimientosConcatenados);
  const jugador1 = idsJugadores[0];
  const jugador2 = idsJugadores[1];

  const valorJugador1 = movimientosConcatenados[jugador1];
  const valorJugador2 = movimientosConcatenados[jugador2];

  const diferencia = Math.abs(valorJugador1 - valorJugador2); // Diferencia entre los dos valores

  // Paso 3: El jugador con el valor mayor recibe la diferencia como puntos.
  if (valorJugador1 > valorJugador2) {
    puntos[jugador1] += diferencia; // Jugador 1 recibe la diferencia
  } else if (valorJugador2 > valorJugador1) {
    puntos[jugador2] += diferencia; // Jugador 2 recibe la diferencia
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
    // console.log(`Sala creada: ${codigo}, Usuario: ${socket.id}`);
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

  socket.on('jugadorListo', ({codigoSala, movimientos }) => {
    // socket.id === jugador actual
    if (!movimientosPorSala[codigoSala]) {
      movimientosPorSala[codigoSala] = {};
    }

    // Almacenar los movimientos del jugador
    movimientosPorSala[codigoSala][socket.id] = movimientos;

    // Verificar si ambos jugadores han enviado sus movimientos
    const { jugadores, puntos } = salas[codigoSala];

    if (movimientosPorSala[codigoSala][jugadores[0]] && movimientosPorSala[codigoSala][jugadores[1]]) {
      const resultado = analizarMovimientos(movimientosPorSala[codigoSala], jugadores, puntos);

      // Emitir el resultado de la ronda
      io.to(codigoSala).emit('resultadoRonda', resultado);

      // Verificar si el juego ha terminado
      if (puntos[jugadores[0]] >= 10 || puntos[jugadores[1]] >= 10) {
        finDelJuego(codigoSala, resultado);
      }

      delete movimientosPorSala[codigoSala]; // Limpiar después de analizar
    } else {
      //  jugadores[1]
      const oponenteId = socket.id === jugadores[0] ? jugadores[1] : jugadores[0];
      io.to(oponenteId).emit('visualOponenteListo');
    }
  });


  socket.on('gameEmit_movimientoListo', ({codigoSala, movimientos}) => {

    if (!movimientosPorSala[codigoSala]) {
      movimientosPorSala[codigoSala] = {};
    }

    // Almacenar los movimientos del jugador
    movimientosPorSala[codigoSala][socket.id] = movimientos;
    // console.log("movimientosPorSala: ", movimientosPorSala);

    // Verificar si ambos jugadores han enviado sus movimientos
    const { jugadores, puntos } = salas[codigoSala];
    // console.log(salas[codigoSala]);

    if (movimientosPorSala[codigoSala][jugadores[0]] && movimientosPorSala[codigoSala][jugadores[1]]) {
      const resultado = analizarMovimientos2(movimientosPorSala[codigoSala], jugadores, puntos);
      // console.log(resultado);

      // Emitir el resultado de la ronda
      io.to(codigoSala).emit('serverEmit_RondaLista', movimientosPorSala[codigoSala], resultado);

      // Verificar si el juego ha terminado
      // if (puntos[jugadores[0]] >= 10 || puntos[jugadores[1]] >= 10) {
      //   finDelJuego(codigoSala, resultado);
      // }

      delete movimientosPorSala[codigoSala]; // Limpiar después de analizar
    } else {
      // Emitir evento para jugador.
      const oponenteId = socket.id === jugadores[0] ? jugadores[1] : jugadores[0];
      io.to(oponenteId).emit('serverEmit_visualOponenteListo', ['?','?']);
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
