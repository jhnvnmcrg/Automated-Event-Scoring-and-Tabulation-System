import { useEffect, useRef } from 'react';
import { useDispatch }       from 'react-redux';
import { io }                from 'socket.io-client';
import { updateResults }     from '../store/slices/scoreSlice';

let socket = null;

const useSocket = (eventId) => {
  const dispatch  = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    // Connect once
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
    });

    socketRef.current = socket;

    // Join event room
    socket.emit('join_event', eventId);

    // Listen for score updates
    socket.on('scores_updated', ({ categoryId, results }) => {
      dispatch(updateResults({ categoryId, results }));
    });

    return () => {
      socket.emit('leave_event', eventId);
      socket.disconnect();
    };
  }, [eventId, dispatch]);

  return socketRef.current;
};

export default useSocket;