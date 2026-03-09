import type { PlayerId } from "../../../shared/types";
import { useGameContext } from "../context/GameContext"
import { socket } from "../socket";

export default function GameOver() {
    const {gameState} = useGameContext();

    function getPlayerName(playerId: PlayerId) {
        for (const player of gameState!.players) {
            if (player.id == playerId) {
                return player.name;
            }
        }
    }

    return (
        <div className="justify-center flex-col items-center flex h-screen">
            <h1 className="text-7xl">Game Over</h1>
            <p className='text-2xl'>Winner: {getPlayerName(gameState!.winner!)}</p>
            <button className='my-20 outline-1' onClick={() => socket.emit("leaveRoom")}>Back to Home</button>
        </div>
    )
}