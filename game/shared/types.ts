export type PlayerId = string;

// player interface used for room setup
export interface Player {
    id: PlayerId;
    name: string;
}

// player interface used for game logic
export interface InGamePlayer {
    id: PlayerId;
    name: string;
    flaw: Flaw;
    position: Position;
    health: number;
    actionPoints: number;
    hasSubmitted: boolean;
    roundsOnWinSpace: number;
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

export type GamePhase = "end" | "actionPhase" | "resolvePhase" | "preAction";

export interface GameState {
    phase: GamePhase;
    players: InGamePlayer[]
    order: PlayerId[];
    activeTurn: PlayerId | null;
    round: number;
    winner: PlayerId | null
    currentAction: Action | null,
    winSpaceOccupied: "no" | "oneP" | "twoP"
}

export interface RoomData {
    code: string,
    players: Player[],
    hostId: PlayerId
}

export type Action =
    | { type: "move" }
    | { type: "attack" }
    | { type: "moveattack" }
    | { type: "movedefend" }
    | { type: "fortify" }
    | { type: "defend" };

// only multi-actions make use of "target"
export type ActionTarget =
    | {coords: Position, target: Position | null}


export interface PendingAction {
    playerId: PlayerId;
    action: Action;
}

export type CreateRoomResult =
    | {ok: true, code: string}
    | {ok: false, error: string}

export type JoinRoomResult =
    | {ok: true}
    | {ok: false, error: string}

export type LeaveRoomResult =
    | {ok: true, code: string}
    | {ok: false, error: string}

export type StartGameResult =
    | {ok: true}
    | {ok: false, error: string}

export type InitGameResult =
    | { ok: true; state: GameState }
    | { ok: false; error: string };

export type SubmitActionResult =
    | { ok: true; state: GameState }
    | { ok: false; error: string };

export type ResolveNextResult =
    | { ok: true; state: GameState }
    | { ok: false; error: string };

export type PreActionResult =
    | { added: true, state: GameState }
    | { added: false, state: GameState }
