// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [checkupUpdates, setCheckupUpdates] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Handle checkup request received (for dentists)
      newSocket.on('new_checkup_request', (data) => {
        console.log('New checkup request received:', data);
        if (user.role === 'dentist') {
          toast.info(`New checkup request from ${data.patientName}`);
          // Add the update to the state to trigger a refresh
          setCheckupUpdates(prev => ({
            ...prev,
            [data.requestId]: {
              status: 'pending',
              updatedAt: new Date().toISOString(),
              patientName: data.patientName,
              reason: data.reason
            }
          }));
        }
      });

      // Handle checkup result submitted (for patients)
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
        newSocket.close();
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
      if (socket) {
        socket.emit(eventName, data);
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