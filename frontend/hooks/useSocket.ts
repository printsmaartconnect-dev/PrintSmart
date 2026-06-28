import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketProvider";

/**
 * Custom hook to subscribe to socket events.
 * Handles cleanup automatically on unmount to prevent duplicate listeners.
 * 
 * @param event The event name to listen to.
 * @param callback Callback function when the event is received.
 */
export const useSocket = (event: string, callback: (...args: any[]) => void) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Attach listener
    socket.on(event, callback);

    // Detach listener on cleanup
    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);

  return socket;
};
