// src/hooks/useNotificationSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// 🔧 Helper to get clean server URL (no /api)
const getServerUrl = () => {
  const apiUrl = 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

// 🧠 Socket initializer with advanced config
const getSocket = () => {
  const token = localStorage.getItem('token');
  const serverUrl = getServerUrl();

  console.log('🔌 Creating socket connection to:', serverUrl);
  console.log('🔑 Token available:', !!token);

  return io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    upgrade: true,
    rememberUpgrade: true,
    secure: false, // Set to true if using HTTPS
  });
};

// 📡 Main Hook
const useNotificationSocket = (userId, onNotification) => {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping socket connection');
      return;
    }

    console.log('🚀 Initializing socket connection for user:', userId);

    const socket = getSocket();
    socketRef.current = socket;

    // ✅ On Connect
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      console.log('🆔 Socket ID:', socket.id);
      console.log('🔗 Connected to server:', socket.io.uri);

      reconnectAttempts.current = 0;

      // ✅ Register user
      console.log('📝 Registering user for notifications:', userId);
      socket.emit('register', { userId }); // ✅ FIXED LINE
    });

    // ❌ On Connect Error
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.log('🔗 Attempted connection URL:', socket.io.uri);
      console.log('🔗 Transport:', socket.io.engine.transport.name);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`🔄 Reconnecting... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        setTimeout(() => {
          socket.connect();
        }, 2000 * reconnectAttempts.current);
      } else {
        console.error('🚫 Max reconnection attempts reached');
      }
    });

    // 🔌 On Disconnect
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('🔄 Server disconnected, trying to reconnect...');
        socket.connect();
      }
    });

    // 🔁 On Reconnect
    socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
      socket.emit('register', { userId }); // ✅ FIXED LINE
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🚫 Reconnection failed after max attempts');
    });

    // 📩 On Notification
    socket.on('newNotification', (data) => {
      console.log('📩 [useNotificationSocket] newNotification received:', data);
      if (typeof onNotification === 'function') {
        onNotification(data);
      } else {
        console.warn('⚠️ onNotification is not a function');
      }
    });

    socket.on('notificationError', (error) => {
      console.error('❌ Notification error:', error);
    });

    // ✅ Confirmation
    socket.on('registered', (data) => {
      console.log('✅ User registered for notifications:', data);
    });

    // 🔍 Debug all events
    socket.onAny((eventName, ...args) => {
      console.log(`🔍 Socket event received: ${eventName}`, args);
    });

    // 🧹 Cleanup
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, onNotification]);

  return socketRef.current;
};

export default useNotificationSocket;
