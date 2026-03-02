export type PlayerId = string;

export interface Player {
    id: PlayerId;
    name: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface Tile {
    position : Position;
    passable: boolean;
}

export type GamePhase = "placeholder" | "otherplaceholder";

export interface GameState {
    phase: GamePhase;
    players: Player[]
    currentPlayerIndex: number;
    board: Tile[][]; // [y][x] = [row][column]
}

export interface RoomData {
    code: string,
    players: Player[],
    hostId: PlayerId
}