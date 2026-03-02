import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import RoomManager from "./RoomManager";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }
});


const manager = new RoomManager();

io.on("connection", (socket) => {
  
  const handleLeave = () => {
      const code = manager.getRoomOf(socket.id);
      if (code) {
          manager.leaveRoom(socket.id);
          socket.emit("clientLeft");
          socket.leave(code);
          const room = manager.getRoom(code);
          io.to(code).emit("playerLeft", { players: room?.players ?? [] });
          console.log('player left');
      }
  };

  console.log("Client connected:", socket.id);

  socket.on("createRoom", (playerName: string) => {
    console.log(`${playerName} wants to create a room`);

    const createReq = manager.createRoom(socket.id, playerName);
    if (createReq.ok == true) {
      socket.join(createReq.code);
      socket.emit("roomCreated", `room created with code ${createReq.code}`);
      const room = manager.getRoom(createReq.code);
      socket.emit("roomData", { code: createReq.code, players: room?.players, isHost: true});
    } else {
      socket.emit("error", `room creation failed for ${playerName}`);
    }
  });

  socket.on("joinRoom", (code: string, playerName: string) => {
    console.log(`${playerName} attempting to join room ${code}`);

    const joinReq = manager.joinRoom(code, socket.id, playerName);
    if (joinReq.ok == true) {
      socket.join(code);
      io.to(code).emit("roomJoined", `${playerName} joined room ${code}`);
      const room = manager.getRoom(code);
      io.to(code).emit("playerJoined", { players: room?.players })
      socket.emit("roomData", { code: code, players: room?.players, isHost: false});
    } else {
      socket.emit("error", `join room failed: ${joinReq.error}`);
    }
  });

  socket.on("startGame", () => {
    console.log("startgame recieved");
    const startReq = manager.startGame(socket.id);
    const code = manager.getRoomOf(socket.id);
    if (startReq.ok == true) {
      console.log("sending gamestart");
      console.log(code);
      // (async () => {
      //   const sockets = await io.in(code!).fetchSockets();
      //   console.log("sockets in room:", sockets.map(s => s.id));
      //   io.emit("gameStarted", "Game started by host");
      // })();
      io.to(code!).emit("gameStarted", "Game started by host");
    } else {
      socket.emit("error", `Game failed to start: ${startReq.error}`);
    }
  });

  socket.on("leaveRoom", handleLeave);

  socket.on("disconnect", handleLeave);
});

httpServer.listen(3001, () => console.log("Server running on :3001"));