import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "../store/socket-context";

const StudentSessionContext = createContext();

export const StudentSessionProvider = ({ children }) => {
  const socket = useSocket();
  const [activeStudents, setActiveStudents] = useState([]); // full student objects

  useEffect(() => {
    if (!socket) return;

    // Listen for new scans (entry / exit)
    socket.on("new-scan", ({ student }) => {

      setActiveStudents((prev) => {
        const exists = prev.find((s) => s._id === student._id);

        // console.log("student", student);
        if (student.isActive) {
          // Add or update student in active list
          if (!exists) return [...prev, student];
          return prev.map((s) => (s._id === student._id ? student : s));
        } else {
          // Remove student if exited
          
          return prev.filter((s) => s._id !== student._id);
        }
    });
    console.log("student", activeStudents);
    console.log("socket", isStudentActive);
});

    // Fetch currently active students on mount
    socket.emit("getActiveStudents");
    socket.on("activeStudents", (data) => {
      // data should be array of full student objects with isActive = true
      setActiveStudents(data);
    });

    return () => {
      socket.off("new-scan");
      socket.off("activeStudents");
    };
  }, [socket]);

  // You can also add helper functions here
  const isStudentActive = (studentId) =>
    activeStudents.some((s) => s._id === studentId);

  return (
    <StudentSessionContext.Provider
      value={{ activeStudents, setActiveStudents, isStudentActive }}
    >
      {children}
    </StudentSessionContext.Provider>
  );
};

export const useStudentSession = () => useContext(StudentSessionContext);
