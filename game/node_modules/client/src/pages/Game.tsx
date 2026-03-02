
import { socket } from "../socket";
import { useGameContext } from "../context/GameContext";

export default function Game() {

    const { roomData } = useGameContext();

    return (
        <div>
            <div className="flex justify-center items-center">
                <h1 className='text-3xl'>Room Code: {roomData?.code}</h1>
            </div>
            <div className="flex justify-center items-center">
                <button className='outline-1 my-1.5' onClick={() => {console.log("click"); socket.emit("leaveRoom")}}>
                    Leave Room
                </button>
            </div>
        </div>
    )
}