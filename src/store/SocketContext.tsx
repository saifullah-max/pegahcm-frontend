import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '.';
import socket from '../lib/socket';
import { showInfo } from '../lib/toastUtils';

type NotificationType = {
  id: string;
  title?: string;
  message?: string;
  description?: string;
  showPopup?: boolean;
  [key: string]: any;
};

interface SocketContextProps {
  notification: NotificationType | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  subscribeToNotifications: (callback: (notif: NotificationType) => void) => void;
}

const SocketContext = createContext<SocketContextProps>({
  notification: null,
  unreadCount: 0,
  setUnreadCount: () => { },
  subscribeToNotifications: () => { },
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const subscribers = useRef<((notif: NotificationType) => void)[]>([]);
  const isInitialized = useRef(false);

  const subscribeToNotifications = (callback: (notif: NotificationType) => void) => {
    subscribers.current.push(callback);
  };

  useEffect(() => {
    console.log("[SOCKET INIT] User:", user?.id);

    if (!user?.id || isInitialized.current) {
      console.log("[SOCKET INIT] Skipped (user or already init)");
      return;
    }
    isInitialized.current = true;

    if (!socket.connected) {
      console.log("[SOCKET] Connecting...");
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('[SOCKET CONNECTED] ID:', socket.id);
      socket.emit('join', user.id);
    });

    socket.on('connect_error', (err) => {
      console.error('[SOCKET CONNECT ERROR]:', err);
    });

    const handleNotification = (notif: NotificationType) => {
      console.log('[SOCKET EVENT] New Notification:', notif);
      if (notif.showPopup) {
        showInfo(`${notif.description || notif.message}`);
        const audio = new Audio('/sounds/notification_sound.mp3');
        audio.volume = 0.8;
        audio.play().catch(console.error);
      }
      setNotification(notif);
      setUnreadCount((prev) => prev + 1);
      subscribers.current.forEach((cb) => cb(notif));
    };

    socket.off('new_notification', handleNotification);
    socket.on('new_notification', handleNotification);

    return () => {
      console.log("[SOCKET CLEANUP] Disconnecting...");
      socket.off('connect');
      socket.off('new_notification', handleNotification);
      socket.disconnect();
      isInitialized.current = false;
    };
  }, [user?.id]);


  return (
    <SocketContext.Provider value={{ notification, unreadCount, setUnreadCount, subscribeToNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
