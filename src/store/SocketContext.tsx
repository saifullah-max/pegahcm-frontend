// src/context/SocketContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

const SocketContext = createContext<SocketContextProps>({
  notification: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notification, setNotification] = useState<NotificationType | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join', user.id);
    });

    socket.on('new_notification', (notif: NotificationType) => {
      console.log('🔔 New Notification:', notif);

      if (notif.showPopup) {
        // Show toast
        showInfo(`${notif.description || notif.message}`);

        // 🔊 Play notification sound
        const audio = new Audio('/sounds/notification_sound.mp3');
        audio.volume = 0.8;
        audio.play().catch(console.error);
      }

      setNotification(notif);
    });

    return () => {
      socket.off('connect');
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ notification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
