
import type { GameState, InGamePlayer, PlayerId } from "../../../shared/types";


type PlayerInfoProps = {
    gameState: GameState;
    myPlayer: InGamePlayer
}

type playerProps = {
    name: string;
    health: number;
    ap: number;
    color: string;
    me: boolean
}

export default function PlayerInfo({ gameState, myPlayer }: PlayerInfoProps) {

    // may be slow to do this here, be weary
    let playerData: InGamePlayer[] = new Array();
    gameState.order.forEach((id: PlayerId) => {
        for (const player of gameState.players) {
            if (player.id == id) {
                playerData.push(player);
                break;
            }
        }
    });

    

    return (<div>
        <ul>
            {playerData.map((player: InGamePlayer) => {
                let me;
                if (player.id == myPlayer.id) {
                    me = true;
                } else {
                    me = false;
                }

                return <Player me={me} key={player.id} name={player.name} health={player.health} ap={player.actionPoints} color={player.color}/>
            })}
        </ul>
    </div>)

}

function Player({ name, health, ap, color, me }: playerProps) {

    if (me) {
        return (<div className="h-fit w-fit outline-4 outline-emerald-400">
        <div style={{ backgroundColor: color }} className="w-4 h-4 rounded-full" />
        <p>
            {name} <br></br>
            Health: {health} <br></br>
            AP: {ap}
        </p>
    </div>)
    }

    return (<div className="h-fit w-fit outline-1">
        <div style={{ backgroundColor: color }} className="w-4 h-4 rounded-full" />
        <p>
            {name} <br></br>
            Health: {health} <br></br>
            AP: {ap}
        </p>
    </div>)
}