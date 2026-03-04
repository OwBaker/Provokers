import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import RoomManager from "./RoomManager";
import { registerRoomHandlers } from "./roomHandler";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }
});

const roomManager = new RoomManager();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    registerRoomHandlers(io, socket, roomManager);
    // registerGameHandlers(io, socket, gameManager); // coming soon
});

httpServer.listen(3001, () => console.log("Server running on :3001"));