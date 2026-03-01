import { useEffect } from "react";
import { socket } from "./socket";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server!", socket.id);
    });

    socket.on("roomCreated", (response) => {
      console.log("Server responded:", response);
    });

    socket.on("roomJoined", (response) => {
      console.log(`Server responded: ${response}`);
    });

    return () => {
      socket.off("connect");
      socket.off("roomCreated");
    };
  }, []);

  return <div>Hello</div>;
}

export default App;