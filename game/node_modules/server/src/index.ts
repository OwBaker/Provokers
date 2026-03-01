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
  console.log("Client connected:", socket.id);

  socket.on("createRoom", (playerName: string) => {
    console.log(`${playerName} wants to create a room`);

    const createReq = manager.createRoom(socket.id, playerName);
    if (createReq.ok == true) {
      socket.join(createReq.code);
      socket.emit("roomCreated", `room created with code ${createReq.code}`);
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
    } else {
      socket.emit("error", `join room failed: ${joinReq.error}`);
    }
  });

  socket.on("startGame", () => {
    ;
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => console.log("Server running on :3001"));