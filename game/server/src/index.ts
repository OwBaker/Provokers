import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import RoomManager from "./RoomManager";
import { registerRoomHandlers } from "./roomHandler";
import GameManager from "./GameManager";
import { registerGameHandlers } from './gameHandler';
import { EventEmitter } from "events";
import { Player } from "../../shared/types";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }
});

const roomManager = new RoomManager();
const gameManager = new GameManager();
const serverEvents = new EventEmitter();

serverEvents.on("gameReady", (code: string, players: Player[]) => {
    const result = gameManager.initGame(code, players);
    if (result.ok) io.to(code).emit("gameState", result.state);
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    registerRoomHandlers(io, socket, roomManager, serverEvents);
    registerGameHandlers(io, socket, gameManager);
});

httpServer.listen(3001, () => console.log("Server running on :3001"));