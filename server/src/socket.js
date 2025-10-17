// server/src/socket.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dental-checkup-secret-key';

const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.user.id);

    // Join room based on user role and ID
    if (socket.user.role === 'dentist') {
      socket.join(`dentist:${socket.user.id}`);
    } else if (socket.user.role === 'patient') {
      socket.join(`patient:${socket.user.id}`);
    }

    // Handle new checkup request
    socket.on('new_checkup_request', (data) => {
      console.log('New checkup request received, emitting to dentist:', data.dentistId);
      
      // IMPORTANT: Change the event name to match what client is listening for
      io.to(`dentist:${data.dentistId}`).emit('new_checkup_request', {
        patientId: data.patientId,
        patientName: data.patientName,
        requestId: data.requestId,
        reason: data.reason
      });
    });

    // Handle checkup result submission
    socket.on('checkup_result_submitted', (data) => {
      console.log('Checkup result submitted, emitting to patient:', data.patientId);
      
      // IMPORTANT: Change the event name to match what client is listening for
      io.to(`patient:${data.patientId}`).emit('checkup_result_submitted', {
        dentistId: data.dentistId,
        dentistName: data.dentistName,
        requestId: data.requestId,
        results: data.results
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.user.id);
    });
  });
};

module.exports = setupSocket;