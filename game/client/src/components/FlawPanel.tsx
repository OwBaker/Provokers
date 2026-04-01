import type { InGamePlayer } from "../../../shared/types";

type FlawPanelProps = {
    myPlayer: InGamePlayer | undefined;
}

export default function FlawPanel({ myPlayer }: FlawPanelProps) {
    if (!myPlayer) {
        return <div></div>
    }

    return (
        <div>
            <h3 className="text-4xl">Flaw: {myPlayer.flaw}</h3>
        </div>
    )
}