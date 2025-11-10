import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
const StudentIdContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Always connect socket, even without login (needed for scan-rfid page)
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
    // Disconnect existing socket if studentId changes
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      query: studentId ? { studentId } : {},
      transports: ["websocket", "polling"], // Add polling as fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true, // Force new connection when studentId changes
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id, "Student ID:", studentId);
      // Update query if studentId changes after connection
      if (studentId) {
        newSocket.io.opts.query = { studentId };
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [studentId]); // Reconnect when studentId changes

  return (
    <SocketContext.Provider value={socket}>
      <StudentIdContext.Provider value={{ setStudentId }}>
        {children}
      </StudentIdContext.Provider>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export const useSetStudentId = () => {
  const context = useContext(StudentIdContext);
  return context?.setStudentId;
};
