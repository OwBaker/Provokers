
import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { useGameContext } from '../context/GameContext';

export default function Home() {
    
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const { error } = useGameContext();
    const { roomData } = useGameContext();

    useEffect(() => {
        if (roomData && roomData.code) {
            socket.emit("leaveRoom");
        }
    }, []);
    

    return (
        <div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Enter name'
                />
            </div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder='Enter room code'
                />
            </div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                <button className= "outline-1" onClick={() => {if (name && code) socket.emit("joinRoom", code, name)}}>
                    Join Room
                </button>
            </div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                <button className= "outline-1" onClick={() => {if (name) socket.emit("createRoom", name)}}>
                    Create Room
                </button>
            </div>
            <div className='flex items-center justify-center w-screen my-2.5'>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    )
}