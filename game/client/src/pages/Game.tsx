import { useGameContext } from "../context/GameContext";
import Board from '../components/Board';
import { socket } from "../socket";
import type { GameState, InGamePlayer } from "../../../shared/types";

export default function Game() {
    const { gameState } = useGameContext();

    if (!gameState) return <div>Loading...</div>;


    return <div><Board gameState={gameState} isMyTurn={isMyTurn(gameState)} myPlayer={getMyPlayer(gameState)!} selectedAction={gameState.currentAction} onSelectTarget={console.log} /></div>

    // if (gameState.phase === "actionPhase") return <div>Action Phase</div>;
    // if (gameState.phase === "resolvePhase") return <div>Resolve Phase</div>;
    // if (gameState.phase === "preAction") return <div>Syncing...</div>;
    // if (gameState.phase === "end") return <div>Game Over</div>;

    return null;
}

function isMyTurn(gameState: GameState) : boolean {
    if (gameState.activeTurn == socket.id) {
        return true;
    }
    return false;
}

function getMyPlayer(gameState: GameState) : InGamePlayer | undefined{
    for (const player of gameState.players) {
        if (player.id === socket.id) {
            return player;
        }
    }
}
