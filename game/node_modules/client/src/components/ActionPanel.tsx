
import type { Action, GameState, InGamePlayer } from "../../../shared/types";
import { socket } from "../socket";

type PanelProps = {
    gameState: GameState;
    myPlayer: InGamePlayer | undefined;
    roomCode: string;
    isMyTurn: boolean;
    selectedAction: Action | null;
    onSelectedAction: (action: Action) => void;
}

// if its action phase and i havent submitted: show actions to choose
// if its action phase and i have submitted: show message that you're waiting for other players
// if its resolve phase and its not my turn: display relevant message
// if its resolve phase and it is my turn: show necessary actions

export default function ActionPanel({ gameState, myPlayer, roomCode, isMyTurn, selectedAction, onSelectedAction}: PanelProps) {

    function fortify(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "fortify"});
    }

    function move(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "move"});
        onSelectedAction({ type: "move" });
    }

    function attack(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "attack"});
        onSelectedAction({ type: "attack" });
    }

    function defend(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "defend"});
    }

    function movedefend(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "movedefend" });
        onSelectedAction({ type: "move" });
    }

    function moveattack(roomCode: string) {
        socket.emit("submitAction", roomCode, { type: "moveattack" });
        onSelectedAction({ type: "moveattack" });
    }

    if (gameState.phase == "preAction") {
        return (<div>Syncing with server...</div>)
    }
    
    if (gameState.phase == "actionPhase" && myPlayer!.hasSubmitted) {
        return (<div>Waiting for players...</div>)
    } else if (gameState.phase == "actionPhase" && !myPlayer!.hasSubmitted) {
        return (<div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {move(roomCode)}}>
                Move
                </button>
            </div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {attack(roomCode)}}>
                Attack
                </button>
            </div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {defend(roomCode)}}>
                Defend
                </button>
            </div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {fortify(roomCode)}}>
                Fortify
                </button>
            </div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {moveattack(roomCode)}}>
                Move + Attack
                </button>
            </div>
            <div>
                <button className="outline-1 my-1.5 text-3xl"
                        onClick={() => {movedefend(roomCode)}}>
                Move + Defend
                </button>
            </div>
        </div>)
    }

    if (gameState.phase == "resolvePhase" && !isMyTurn) {
        const activeName = gameState.players.find(p => p.id === gameState.activeTurn)?.name;
        return <div>Waiting for {activeName}...</div>
    }

    if (gameState.phase == "resolvePhase" && isMyTurn && selectedAction?.type == "attack") {
        return (<div>
            Select where to attack
        </div>)
    }

    if (gameState.phase == "resolvePhase" && isMyTurn && selectedAction?.type == "moveattack") {
        return (<div>
            Select action
            <div>
                <button className='outline-1 my-1.5 text-3xl'
                        onClick={() => onSelectedAction({ type: "move" })}>
                    Move
                </button>
            </div>
            <div>
                <button className='outline-1 my-1.5 text-3xl'
                        onClick={() => onSelectedAction({ type: "attack" })}>
                    Attack
                </button>
            </div>
        </div>)
    }

    if (gameState.phase == "resolvePhase" && isMyTurn
        && (selectedAction?.type == "move")) {

            return (<div>
                Select where to move
            </div>)
    }

    return (<div>
        
    </div>)
}