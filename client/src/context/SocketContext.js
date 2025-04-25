// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import { SOCKET_URL } from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [checkupUpdates, setCheckupUpdates] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      // Handle checkup request received (for dentists)
      newSocket.on('new_checkup_request', (data) => {
        console.log('New checkup request received:', data);
        if (user.role === 'dentist') {
          toast.info(`New checkup request from ${data.patientName}`);
        }
      });

      // Handle checkup result received (for patients)
      newSocket.on('checkup_result_submitted', (data) => {
        console.log('Checkup result received:', data);
        if (user.role === 'patient') {
          toast.info(`Checkup results received from Dr. ${data.dentistName}`);
          setCheckupUpdates(prev => ({
            ...prev,
            [data.requestId]: {
              status: 'completed',
              updatedAt: new Date().toISOString(),
              results: data.results,
              dentistName: data.dentistName
            }
          }));
        }
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    }
  }, [user]);

  const value = {
    socket,
    checkupUpdates,
    clearCheckupUpdate: (requestId) => {
      setCheckupUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[requestId];
        return newUpdates;
      });
    },
    emitEvent: (eventName, data) => {
      if (socket && socket.connected) {
        console.log('Emitting event:', eventName, data);
        socket.emit(eventName, data);
      } else {
        console.error('Socket is not connected');
        toast.error('Connection error. Please try again.');
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 