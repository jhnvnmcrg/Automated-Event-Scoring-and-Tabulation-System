import { useEffect, useRef } from 'react';
import { io }                from 'socket.io-client';

const usePublicSocket = (eventId, onScoresUpdated) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    // Connect without auth token for public viewers
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_event', eventId);
    });

    socket.on('scores_updated', ({ categoryId, results }) => {
      if (onScoresUpdated) onScoresUpdated(categoryId, results);
    });

    socket.on('connect_error', (err) => {
      console.warn('Public socket error:', err.message);
    });

    return () => {
      socket.emit('leave_event', eventId);
      socket.disconnect();
    };
  }, [eventId]);

  return socketRef.current;
};

export default usePublicSocket;