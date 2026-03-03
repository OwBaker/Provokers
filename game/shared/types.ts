export type PlayerId = string;

// interface used for room setup
export interface Player {
    id: PlayerId;
    name: string;
}

// interface used for game logic
export interface InGamePlayer {
    id: PlayerId;
    name: string;
    flaw: Flaw;
    position: Position;
    health: number;
    actionPoints: number;
}

export type Flaw = "farsighted" | "bloodlust" | "offensive-minded" | "weakling";

export interface Position {
    x: number;
    y: number;
}

export interface Tile {
    position : Position;
    passable: boolean;
}

export type GamePhase = "pickingRoles" | "otherplaceholder";

export interface GameState {
    phase: GamePhase;
    players: InGamePlayer[]
    order: string[];
}

export interface RoomData {
    code: string,
    players: Player[],
    hostId: PlayerId
}