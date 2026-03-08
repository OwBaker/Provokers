
import type { GameState, InGamePlayer } from "../../../shared/types";

const PLAYER_COLORS = ["red", "orange", "blue", "purple"]

type PlayerInfoProps = {
    gameState: GameState;
}

type playerProps = {
    name: string;
    health: number;
    ap: number;
    color: string;
}

export default function PlayerInfo({ gameState }: PlayerInfoProps) {
    

    return (<div>
        <ul>
            {gameState.players.map((player: InGamePlayer, i: number) => {
                return <Player key={player.id} name={player.name} health={player.health} ap={player.actionPoints} color={PLAYER_COLORS[i]}/>
            })}
        </ul>
    </div>)

}

function Player({ name, health, ap, color }: playerProps) {

    return (<div className="h-fit w-fit outline-1">
        <div style={{ backgroundColor: color }} className="w-4 h-4 rounded-full" />
        <p>
            {name} <br></br>
            Health: {health} <br></br>
            AP: {ap}
        </p>
    </div>)
}