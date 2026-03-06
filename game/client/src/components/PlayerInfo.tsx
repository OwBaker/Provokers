import { useRef, useState } from "react";
import type { GameState } from "../../../shared/types";

type PlayerInfoProps = {
    gameState: GameState;
}

type playerProps = {
    name: string;
    health: number;
    ap: number;
}

export default function PlayerInfo({ gameState }: PlayerInfoProps) {
    

    return (<div>
        <ul>
            <li><Player
                    name={gameState.players[0].name}
                    health={gameState.players[0].health}
                    ap={gameState.players[0].actionPoints}/>
            </li>
        </ul>
    </div>)

}

function Player({ name, health, ap }: playerProps) {

    return (<div className="h-fit w-fit outline-1">
        <p>
            Player: {name} <br></br>
            Health: {health} <br></br>
            AP: {ap}
        </p>
    </div>)
}