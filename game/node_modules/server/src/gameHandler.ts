import { Server, Socket } from "socket.io";
import GameManager from "./GameManager";
import { Action, ActionTarget, GameState } from "../../shared/types";

export function registerGameHandlers(io: Server, socket: Socket, gameManager: GameManager) {


    function resolveLoop(roomCode: string, actionTarget: ActionTarget | null) {
        const resolveReq = gameManager.resolveNext(roomCode, actionTarget);
        if (resolveReq.ok == true) {
            if (resolveReq.state.phase == "resolvePhase") {
                if (!resolveReq.state.zeroTarget) {
                    return resolveReq.state;
                }
                console.log("zero target required, skipping");
                return resolveLoop(roomCode, actionTarget);
            }
            return resolveReq.state;
        }
    }
    
    socket.on("submitAction", (roomCode: string, action: Action) => {
        const submitReq = gameManager.submitAction(roomCode, socket.id, action);

        if (submitReq.ok === true) {
            io.to(roomCode).emit("gameState", submitReq.state);
            if (submitReq.state.phase === "resolvePhase") {
                //const resolveReq = gameManager.resolveNext(roomCode, null);
                const resolveReq = resolveLoop(roomCode, null);
                if (resolveReq!.phase === "preAction") {
                    console.log("all targetless, requesting verify");
                    io.to(roomCode).emit("requestVerify");
                } else {
                    io.to(roomCode).emit("gameState", resolveReq);
                }
            }
        } else {
            socket.emit("submitFailed", submitReq.error);
        }
    });

    socket.on("submitTarget", (roomCode: string, actionTarget: ActionTarget) => {
        console.log("target submitted: ", actionTarget);
        // const resolveReq = gameManager.resolveNext(roomCode, actionTarget);
        const resolveReq = resolveLoop(roomCode, actionTarget);
        io.to(roomCode).emit("gameState", resolveReq);

        // if still in resolvePhase, prompt next player
            if (resolveReq!.phase === "resolvePhase") {
                console.log("still in resolve");
                const next = resolveLoop(roomCode, null);
                io.to(roomCode).emit("gameState", next);
                if (next?.phase === "preAction") {
                    io.to(roomCode).emit("requestVerify");
                } else if (next?.phase == "end") {
                    io.to(roomCode).emit("gameOver");
                }
            } else if (resolveReq!.phase === "preAction") {
                io.to(roomCode).emit("requestVerify");
            } else if (resolveReq!.phase === "end") {
                io.to(roomCode).emit("gameOver", resolveReq);
            }
        
    });

    socket.on("verify", (roomCode: string, state: GameState) => {
        console.log("verifying...");
        const verifyReq = gameManager.preAction(roomCode, socket.id, state);

        if (verifyReq.added === true) {
            console.log("emitting true state...")
            io.to(roomCode).emit("gameState", verifyReq.state)
        } else {
            socket.emit("verifyState", verifyReq.state);
        }
    });
}


// structure at the moment:

// client sees current game state, renders UI to submit actions
// client sends submitAction to server
// once all players submit, server advances to resolvePhase and calls resolvenext
// server emits gameState resulting from resolveNext
// if client sees it's their turn, client renders UI to submit necessary targets
// client selects one target at a time, then emits submitTarget
// upon seeing submitTarget, the server calls resolveNext, and emits the new game state
// if no targets are needed however, resolveNext is only called once, since clients do not respond when targetless actions
// occupy the current turn.

// solution: set currentAction to fortify, and have clients emit a signal once they see that which calls the subsequent resolveNext