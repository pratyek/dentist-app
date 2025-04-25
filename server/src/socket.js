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
      // Emit to the specific dentist
      io.to(`dentist:${data.dentistId}`).emit('checkup_request_received', {
        patientId: socket.user.id,
        patientName: data.patientName,
        requestId: data.requestId,
        reason: data.reason
      });
    });

    // Handle checkup result submission
    socket.on('checkup_result_submitted', (data) => {
      // Emit to the specific patient
      io.to(`patient:${data.patientId}`).emit('checkup_result_received', {
        dentistId: socket.user.id,
        dentistName: data.dentistName,
        requestId: data.requestId,
        diagnosis: data.diagnosis
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.user.id);
    });
  });
};

module.exports = setupSocket; 