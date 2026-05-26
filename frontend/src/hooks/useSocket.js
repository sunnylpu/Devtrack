import { useEffect, useRef } from 'react';
import { getSocket, connectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

/**
 * useSocket - hook to subscribe to socket.io events
 * @param {string} event - event name to listen to
 * @param {Function} handler - callback when event fires
 * //this is comment
 */
export const useSocket = (event, handler) => {
  const { isAuthenticated } = useAuthStore();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!isAuthenticated) return;

    let socket = getSocket();
    if (!socket) {
      connectSocket();
      socket = getSocket();
    }

    if (!socket || !event) return;

    const listener = (...args) => handlerRef.current(...args);
    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event, isAuthenticated]);
};

/**
 * useRealTimeBoard - subscribes to task board updates via socket
 * @param {Function} onUpdate - called with the updated task object
 */
export const useRealTimeBoard = (onUpdate) => {
  useSocket('task:updated', onUpdate);
  useSocket('task:created', onUpdate);
  useSocket('task:deleted', onUpdate);
};

/**
 * useRealTimeNotifications - subscribes to notification events
 * @param {Function} onNotification - called with new notification object
 */
export const useRealTimeNotifications = (onNotification) => {
  useSocket('notification:new', onNotification);
};
