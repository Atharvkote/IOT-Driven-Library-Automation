import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useLibrary } from "./libaray-session";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { student, isLoggedIn } = useLibrary();

  useEffect(() => {
    if (!isLoggedIn || !student?._id) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      query: { studentId: student._id },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [isLoggedIn, student?._id]); // <- important dependencies

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
