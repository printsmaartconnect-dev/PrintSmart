"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "../services/socket";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    setSocketInstance(socket);

    const onConnect = () => {
      setIsConnected(true);
      console.log("[Socket] Socket connected successfully.");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("[Socket] Socket disconnected.");
    };

    const onConnectError = (error: Error) => {
      console.error("[Socket] Socket connection error:", error);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Initial connect
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);

  const joinRoom = (room: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("join", room);
      console.log(`[Socket] Requested to join room: ${room}`);
    }
  };

  const leaveRoom = (room: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("leave", room);
      console.log(`[Socket] Requested to leave room: ${room}`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
