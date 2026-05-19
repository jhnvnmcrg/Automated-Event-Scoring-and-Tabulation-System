const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Authenticated users and public viewers both join event rooms
    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`📡 Socket ${socket.id} joined event_${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;