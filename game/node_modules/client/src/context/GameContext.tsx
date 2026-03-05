
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import type { RoomData, Player, GameState } from '../../../shared/types';
import { useNavigate } from 'react-router-dom';

export interface GameContextType {
    roomData: RoomData | null,
    error: string | null,
    gameState: GameState | null
    setRoomData: (data: RoomData) => void,
    setError: (error: string) => void
    setGameState: (state: GameState) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: {children: React.ReactNode }) : React.ReactElement {
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const roomDataRef = useRef<RoomData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const navigate = useNavigate();
    const gameStateRef = useRef<GameState | null>(null);

    useEffect(() => { roomDataRef.current = roomData; }, [roomData]);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    useEffect( () => {
        socket.on("roomData", (data: RoomData) => {
            console.log("roomData received");
            setRoomData(data);
            navigate("/room");
        });

        socket.on("playerLeft", (data: { players: Player[] }) => {
            setRoomData(prev => ({ ...prev!, players: data.players }));
        });

        socket.on("clientLeft", () => {
            navigate("/");
        });

        socket.on("playerJoined", (data: { players: Player[] }) => {
            setRoomData(prev => ({ ...prev!, players: data.players }));
        });

        socket.on("error", (message) => {
            setError(message);
        });

        socket.on("gameStarted", () => {
            console.log("game started");
            navigate("/game");
        });

        socket.on("gameState", (state: GameState) => {
            setGameState(state);
        });

        socket.on("requestVerify", () => {
            socket.emit("verify", roomDataRef.current!.code, gameStateRef.current);
        });

        socket.on("gameOver", (state: GameState) => {
            setGameState(state);
            navigate("/end");
        })

        return () => {
                socket.off("roomData");
                socket.off("playerLeft");
                socket.off("playerJoined");
                socket.off("error");
                socket.off("gameStarted");
                socket.off("clientLeft");
            }

    }, []);

    return (
        <GameContext.Provider value={{ roomData, setRoomData, error, setError, gameState, setGameState }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext() : GameContextType {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error("useGameContext must be used inside GameProvider");
    }
    return ctx;
}