import io from 'socket.io-client';

const socket = io(import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 10
});

export default socket;
