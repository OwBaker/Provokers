import type { PlayerId, Player, CreateRoomResult, JoinRoomResult, LeaveRoomResult, StartGameResult } from "../../shared/types";

interface roomData {
    code: string,
    players: Player[],
    hostId: PlayerId
}

class RoomManager {

    private roomCodes: Set<string> = new Set();
    private playerRooms: Map<PlayerId, string> = new Map();
    private roomDB: Map<string, roomData> = new Map();

    public createRoom(playerId: PlayerId, playerName: string): CreateRoomResult {
        try {
            const roomCode = this.genRoomCode();
            const player = this.initPlayer(playerId, playerName);
            let data = { code: roomCode, players: Array.of(player), hostId: playerId};

            this.playerRooms.set(playerId, roomCode);
            this.roomDB.set(roomCode, data);

            return { ok: true, code: roomCode };
        } catch (e) {
            if (e instanceof Error) {
                return { ok: false, error: e.message };
            }
            return { ok: false, error: "unknown error" };
        }
    }

    public joinRoom(code: string, playerId: PlayerId, playerName: string): JoinRoomResult {
        let roomData = this.roomDB.get(code);

        if (!(roomData === undefined)) {
            if (roomData.players.length < 4) {
                const player = this.initPlayer(playerId, playerName);
                roomData.players.push(player);
                this.playerRooms.set(playerId, code);
                return { ok: true }
            }
            return { ok: false, error: `Room ${code} is full`};
        }
        return { ok: false, error: `Room ${code} does not exist`};
    }

    public leaveRoom(playerId: PlayerId): LeaveRoomResult {
        const roomId = this.playerRooms.get(playerId);

        if (roomId === undefined) {
            return { ok: false, error: "Player not in room" };
        } else {
            try {
                this.removePlayer(playerId, roomId);
                return { ok: true, code: roomId};
            } catch (e) {
                if (e instanceof Error) {
                    return { ok: false, error: e.message };
                }
                return { ok:false, error: "unknown error" };
            }
        }
    }

    public startGame(playerId: PlayerId): StartGameResult {
        const playerRoom = this.playerRooms.get(playerId);
        if (playerRoom === undefined) {
            return { ok: false, error: "Player not in room"};
        }

        const roomData = this.roomDB.get(playerRoom);
        if (roomData === undefined) {
            return { ok: false, error: "Invalid room code"}; // should never happen
        }

        if (playerId != roomData.hostId) {
            return { ok: false, error: "player is not host"};
        }

        if (roomData.players.length < 2) {
            return { ok: false, error: "not enough players to start"};
        }

        return { ok: true};
    }

    public getRoomOf(playerId: PlayerId): string | null {
        const room = this.playerRooms.get(playerId);
        if (room === undefined) {
            return null;
        }
        return room;
    }

    public getRoom(code: string): roomData | null {
        return this.roomDB.get(code) ?? null;
    }

    private removePlayer(playerId: PlayerId, roomCode: string) : void {
        let roomData = this.roomDB.get(roomCode);

        if (roomData === undefined) {
            throw new Error("undefined room code");
        }

        this.playerRooms.delete(playerId);

        roomData.players = roomData.players.filter(p => p.id !== playerId);

        if (roomData.players.length === 0) {
            this.roomDB.delete(roomCode);
            this.roomCodes.delete(roomCode);
        } else {
            if (roomData.hostId === playerId) {
                roomData.hostId = roomData.players[0].id;
            }
        }
    }

    private initPlayer(playerId: PlayerId, playerName: string): Player {
        return { id: playerId, name: playerName };
    }

    private genRoomCode(): string {
        const maxAttempts = 100;
    
        for (let i = 0; i < maxAttempts; i++) {
            const letA = String.fromCharCode(65 + Math.floor((Math.random() * 26)));
            const letB = String.fromCharCode(65 + Math.floor((Math.random() * 26)));
            const numA = Math.floor((Math.random() * 10)).toString();
            const numB = Math.floor((Math.random() * 10)).toString();

            const roomCode = numA + letA + letB + numB;
            if (!this.roomCodes.has(roomCode)) {
                this.roomCodes.add(roomCode);
                return roomCode;
            }
        }
        

        throw new Error("Could not generate a unique room code");
    }
}

export default RoomManager;