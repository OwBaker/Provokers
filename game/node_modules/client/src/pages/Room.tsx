
import { socket } from "../socket";
import { useGameContext } from "../context/GameContext";

export default function Room() {

    const { roomData } = useGameContext();
    const { error } = useGameContext();


    return (
        <div>
            <div className="flex justify-center items-center">
                <h1 className='text-3xl'>Room Code: {roomData?.code}</h1>
            </div>
            <div className="flex justify-center items-center">
                <button className='outline-1 my-1.5' onClick={() => {socket.emit("startGame")}}>
                    Start Game (host only)
                </button>
            </div>
            <div className="flex justify-center items-center">
                <button className='outline-1 my-1.5' onClick={() => socket.emit("leaveRoom")}>
                    Leave Room
                </button>
            </div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    )
}