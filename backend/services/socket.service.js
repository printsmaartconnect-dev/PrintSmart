const { Server } = require("socket.io");

let io = null;

const initialize = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join rooms dynamically
    socket.on("join-room", (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`Emitted event ${event} to room ${room}`);
  } else {
    console.warn("Socket.io not initialized. Cannot emit.");
  }
};

module.exports = {
  initialize,
  emitToRoom
};
