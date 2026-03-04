import { Server, Socket } from "socket.io";
import RoomManager from "./RoomManager";
import { EventEmitter } from "stream";

export function registerRoomHandlers(io: Server, socket: Socket, manager: RoomManager, serverEvents: EventEmitter) {

    const handleLeave = () => {
        const code = manager.getRoomOf(socket.id);
        if (code) {
            manager.leaveRoom(socket.id);
            socket.emit("clientLeft");
            socket.leave(code);
            const room = manager.getRoom(code);
            io.to(code).emit("playerLeft", { players: room?.players ?? [] });
            console.log("player left");
        }
    };

    socket.on("createRoom", (playerName: string) => {
        console.log(`${playerName} wants to create a room`);
        const result = manager.createRoom(socket.id, playerName);
        if (result.ok) {
            socket.join(result.code);
            socket.emit("roomCreated", `room created with code ${result.code}`);
            const room = manager.getRoom(result.code);
            socket.emit("roomData", { code: result.code, players: room?.players, isHost: true });
        } else {
            socket.emit("error", `room creation failed for ${playerName}`);
        }
    });

    socket.on("joinRoom", (code: string, playerName: string) => {
        console.log(`${playerName} attempting to join room ${code}`);
        const result = manager.joinRoom(code, socket.id, playerName);
        if (result.ok) {
            socket.join(code);
            io.to(code).emit("roomJoined", `${playerName} joined room ${code}`);
            const room = manager.getRoom(code);
            io.to(code).emit("playerJoined", { players: room?.players });
            socket.emit("roomData", { code, players: room?.players, isHost: false });
        } else {
            socket.emit("error", `join room failed: ${result.error}`);
        }
    });

    socket.on("startGame", () => {
        console.log("startGame received");
        const result = manager.startGame(socket.id);
        const code = manager.getRoomOf(socket.id);
        if (result.ok) {
            const roomData = manager.getRoom(code!)!;
            console.log("sending gameStarted to room", code);
            serverEvents.emit("gameReady", code, roomData.players);
            io.to(code!).emit("gameStarted", "Game started by host");
        } else {
            socket.emit("error", `Game failed to start: ${result.error}`);
        }
    });

    socket.on("leaveRoom", handleLeave);
    socket.on("disconnect", handleLeave);
}