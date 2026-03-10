import { useGameContext } from "../context/GameContext";
import Board from '../components/Board';
import { socket } from "../socket";
import type { Action, GameState, InGamePlayer, Position } from "../../../shared/types";
import ActionPanel from "../components/ActionPanel";
import { useRef, useState } from "react";
import PlayerInfo from "../components/PlayerInfo";

export default function Game() {
    const { gameState } = useGameContext();
    console.log("Game's state:", gameState);
    const { roomData } = useGameContext();
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const moveTargetRef = useRef<Position | null>(null);
    const attackTargetRef = useRef<Position | null>(null);
    const localPosRef = useRef<Position | null>(null);

    if (!gameState) return <div>Loading...</div>;

    function onSelectedAction(action: Action) {
        setSelectedAction(action);
    }

    function onSelectedTarget(pos: Position) {
        if (gameState!.currentAction?.type == "moveattack"){
            if (!moveTargetRef.current && selectedAction?.type == "move" ) {
                moveTargetRef.current = pos;
                localPosRef.current = pos;
                setSelectedAction({ type: "attack"});
            } else if (!attackTargetRef.current && selectedAction?.type == "attack") {
                attackTargetRef.current = pos;
                setSelectedAction({ type: "move"});
            }

            console.log('right here!');
            if ((moveTargetRef.current != null) && (attackTargetRef.current != null)){
                console.log("submitting moveattack..");
                socket.emit("submitTarget", roomData!.code, { coords: moveTargetRef.current, target: attackTargetRef.current });
                moveTargetRef.current = null;
                attackTargetRef.current = null;
                localPosRef.current = null;
            }
        } else {
            console.log("not moveattack");
            socket.emit("submitTarget", roomData!.code, { coords: pos, target: null});
            setSelectedAction(null);
        }
    }

    if (getMyPlayer(gameState)!.health > 0) {
        return (<span>
            <div className="justify-center items-center flex my-2.5">
                <h1 className='font-bold text-6xl'>Round #{gameState.round}</h1>
            </div>
            <div className="justify-center items-center flex h-full w-screen">
            <Board
                gameState={gameState}
                isMyTurn={isMyTurn(gameState)}
                myPlayer={getMyPlayer(gameState)!}
                selectedAction={selectedAction}
                moveTargetRef={localPosRef}
                onSelectTarget={onSelectedTarget} />
                <ActionPanel
                    gameState={gameState}
                    myPlayer={getMyPlayer(gameState)}
                    roomCode={roomData!.code}
                    isMyTurn={isMyTurn(gameState)}
                    selectedAction={selectedAction}
                    onSelectedAction={onSelectedAction}
                />
            <PlayerInfo myPlayer={getMyPlayer(gameState)!} gameState={gameState}/>
            </div></span>)
        }
    
    return (<span>
            <div className="justify-center items-center flex my-2.5">
                <h1 className='font-bold text-6xl'>Round #{gameState.round}</h1>
            </div>
            <div className="justify-center items-center flex h-full w-screen">
            <Board
                gameState={gameState}
                isMyTurn={isMyTurn(gameState)}
                myPlayer={getMyPlayer(gameState)!}
                selectedAction={selectedAction}
                moveTargetRef={localPosRef}
                onSelectTarget={onSelectedTarget} />
                <p className="my-2.5">You're dead...</p>
            <PlayerInfo myPlayer={getMyPlayer(gameState)!} gameState={gameState}/>
            </div></span>)
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
    return;
}
