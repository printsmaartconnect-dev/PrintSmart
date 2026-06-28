const socketIo = require("socket.io");

let io = null;

/**
 * Initialize Socket.IO server.
 * @param {import("http").Server} server 
 */
const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Connection established: ${socket.id}`);

    // Join room event
    socket.on("join", (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
    });

    // Leave room event
    socket.on("leave", (room) => {
      socket.leave(room);
      console.log(`[Socket.IO] Socket ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Connection disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance.
 */
const getIo = () => {
  return io;
};

/**
 * Emit an event to a specific room.
 * @param {string} room 
 * @param {string} event 
 * @param {any} data 
 */
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`[Socket.IO] Emitted event "${event}" to room "${room}"`);
  }
};

/**
 * Emit an event to all connected clients.
 * @param {string} event 
 * @param {any} data 
 */
const emitGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`[Socket.IO] Emitted global event "${event}"`);
  }
};

module.exports = {
  init,
  getIo,
  emitToRoom,
  emitGlobal
};
