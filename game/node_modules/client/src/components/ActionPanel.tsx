
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

    function getDefendCost() {
        if (myPlayer!.flaw != "offensive-minded") {
            return 1;
        }
        return 2;
    }

    const actionButtons = [
        {action: "Move", onclick: () => move(roomCode), minPoints: 1, maxPoints: 4},
        {action: "Attack", onclick: () => attack(roomCode), minPoints: 1, maxPoints: null},
        {action: "Defend", onclick: () => defend(roomCode), minPoints: getDefendCost(), maxPoints: null},
        {action: "Fortify", onclick: () => fortify(roomCode), minPoints: 0, maxPoints: null},
        {action: "Move + Defend", onclick: () => movedefend(roomCode), minPoints: 2, maxPoints: 4},
        {action: "Move + Attack", onclick: () => moveattack(roomCode), minPoints: 2, maxPoints: 4}]

    if (gameState.phase == "preAction") {
        return (<div>Syncing with server...</div>)
    }
    
    if (gameState.phase == "actionPhase" && myPlayer!.hasSubmitted) {
        return (<div>Waiting for players...</div>)
    } else if (gameState.phase == "actionPhase" && !myPlayer!.hasSubmitted) {
        return (<div>
            <ul>
                {actionButtons.map((button) => {
                    if (myPlayer!.actionPoints >= button.minPoints) {
                        if (button.maxPoints) {
                            return <li><button key={button.action} className="outline-1 my-1.5 text-3xl mx-1" onClick={button.onclick}>{button.action} <p>{button.minPoints}-{button.maxPoints} AP</p></button></li>
                        }
                        return <li><button key={button.action} className="outline-1  my-1.5 text-3xl mx-1" onClick={button.onclick}>{button.action}<p>{button.minPoints} AP</p></button></li>
                    }
                })}
            </ul>
            {/* <div>
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
            </div> */}
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