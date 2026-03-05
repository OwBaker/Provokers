import { Server, Socket } from "socket.io";
import GameManager from "./GameManager";
import { Action, ActionTarget, GameState } from "../../shared/types";

export function registerGameHandlers(io: Server, socket: Socket, gameManager: GameManager) {
    
    socket.on("submitAction", (roomCode: string, action: Action) => {
        const submitReq = gameManager.submitAction(roomCode, socket.id, action);

        if (submitReq.ok === true) {
            io.to(roomCode).emit("gameState", submitReq.state);
            if (submitReq.state.phase === "resolvePhase") {
                const resolveReq = gameManager.resolveNext(roomCode, null);
                if (resolveReq.ok === true) {
                    io.to(roomCode).emit("gameState", resolveReq.state);
                }
            }
        } else {
            socket.emit("submitFailed", submitReq.error);
        }
    });

    socket.on("submitTarget", (roomCode: string, actionTarget: ActionTarget) => {
        const resolveReq = gameManager.resolveNext(roomCode, actionTarget);
        if (resolveReq.ok) {
            io.to(roomCode).emit("gameState", resolveReq.state);

        // if still in resolvePhase, prompt next player
            if (resolveReq.state.phase === "resolvePhase") {
                const next = gameManager.resolveNext(roomCode, null);
                if (next.ok) io.to(roomCode).emit("gameState", next.state);
            } else if (resolveReq.state.phase === "preAction") {
                io.to(roomCode).emit("requestVerify");
            } else if (resolveReq.state.phase === "end") {
                io.to(roomCode).emit("gameOver", resolveReq.state);
            }
        } else {
            socket.emit("resolveFailed", resolveReq.error);
        }
    });

    socket.on("verify", (roomCode: string, state: GameState) => {
        console.log("verifying...");
        const verifyReq = gameManager.preAction(roomCode, socket.id, state);

        if (verifyReq.added === true) {
            io.to(roomCode).emit("gameState", verifyReq.state)
        } else {
            socket.emit("gameState", verifyReq.state);
            socket.emit("requestVerify");
        }
    });
}