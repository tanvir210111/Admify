import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

// Determine appropriate socket server URL
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5001';

  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    return import.meta.env.VITE_API_URL.trim();
  }

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.');

  if (isLocal) {
    return 'http://localhost:5001';
  }

  return 'https://api.admify.world';
};

/**
 * Initialize or reuse authenticated Socket.io instance
 */
export const initSocket = (token) => {
  if (!token) {
    disconnectSocket();
    return null;
  }

  // Reuse existing connected socket if token hasn't changed
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  // Disconnect previous socket if token changed
  if (socket) {
    socket.disconnect();
  }

  currentToken = token;
  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    // Socket connected
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket Connection Error]', err.message);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect and destroy current socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
};

/**
 * Join an authorized conversation room
 */
export const joinConversationRoom = (conversationId, callback) => {
  if (!socket || !conversationId) return;
  socket.emit('join_conversation', { conversationId }, (res) => {
    if (callback) callback(res);
  });
};

/**
 * Leave a conversation room
 */
export const leaveConversationRoom = (conversationId) => {
  if (!socket || !conversationId) return;
  socket.emit('leave_conversation', { conversationId });
};

/**
 * Send typing start indicator
 */
export const emitTypingStart = (conversationId) => {
  if (!socket || !conversationId) return;
  socket.emit('typing_start', { conversationId });
};

/**
 * Send typing stop indicator
 */
export const emitTypingStop = (conversationId) => {
  if (!socket || !conversationId) return;
  socket.emit('typing_stop', { conversationId });
};

/**
 * Query presence for a list of user IDs
 */
export const fetchPresence = (userIds, callback) => {
  if (!socket || !Array.isArray(userIds)) return;
  socket.emit('get_presence', { userIds }, (res) => {
    if (callback) callback(res?.presence || {});
  });
};

/**
 * Initialize or reuse visitor Socket.io instance for live agent support
 */
let visitorSocket = null;
let currentVisitorToken = null;

export const initVisitorSocket = (visitorToken) => {
  if (!visitorToken) return null;
  if (visitorSocket && currentVisitorToken === visitorToken && visitorSocket.connected) {
    return visitorSocket;
  }
  if (visitorSocket) {
    visitorSocket.disconnect();
  }
  currentVisitorToken = visitorToken;
  const socketUrl = getSocketUrl();
  visitorSocket = io(socketUrl, {
    auth: { visitorToken },
    query: { visitorToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
  return visitorSocket;
};

export const getVisitorSocket = () => visitorSocket;

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  initVisitorSocket,
  getVisitorSocket,
  joinConversationRoom,
  leaveConversationRoom,
  emitTypingStart,
  emitTypingStop,
  fetchPresence,
};
