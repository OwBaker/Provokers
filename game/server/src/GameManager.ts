import { ActionTarget, GameState, InGamePlayer, Player, PlayerId, Flaw, InitGameResult, SubmitActionResult, ResolveNextResult, Action, PendingAction, GamePhase, Position, RoomData, PreActionResult} from "../../shared/types";


class GameManager {
    private static flaws: Flaw[] = Array.of("farsighted", "bloodlust", "offensive-minded", "weakling");
    private static winCoords: Position[] = Array.of({x: 4, y: 5}, {x: 4, y:4}, {x: 5, y: 4}, {x: 5, y: 5})

    private gameDataMap: Map<string, GameState> = new Map();
    private pendingActions: Map<string, PendingAction[]> = new Map();
    private defenders: Map<string, Array<PlayerId>> = new Map();
    private verified: Map<string, Array<PlayerId>> = new Map();


    // initializes gameState for the given game, creates InGamePlayers for each player
    public initGame(roomCode: string, players: Player[]) : InitGameResult {
        try {
            let gamePlayers: InGamePlayer[] = this.distributeFlaws(players);

            
            const startingPositions = [{x:4,y:4},{x:4,y:7},{x:8,y:0},{x:8,y:8}];
            gamePlayers.forEach((p, i) => p.position = startingPositions[i]);

            const gameState: GameState = {
                phase: "actionPhase",
                players: gamePlayers,
                order: gamePlayers.map((p) => {return p.id}),
                activeTurn: null,
                round: 1,
                winner: null,
                currentAction: null,
                winSpaceOccupied: "no",
                zeroTarget: false
            }

            this.gameDataMap.set(roomCode, gameState);
            this.defenders.set(roomCode, new Array());
            this.pendingActions.set(roomCode, new Array());
            this.verified.set(roomCode, new Array());

            return {ok: true, state: gameState};
        } catch (e) {
            if (e instanceof Error) return { ok: false, error: e.message };
            return { ok: false, error: "unknown error" };
        }
    }

    // submit's action to given game, checks for all 4 submissions
    public submitAction(roomCode: string, playerId: PlayerId, action: Action) : SubmitActionResult {
        if (this.gameDataMap.get(roomCode) === undefined) {
            return { ok: false, error: "Game not found" };
        }

        try {
            let resultPhase: GamePhase;
            const pending: PendingAction = { playerId: playerId, action: action};
            this.pendingActions.get(roomCode)?.push(pending);
            this.updateSubmitted(playerId, roomCode);
            if (this.checkSubmissions(roomCode)) {
                resultPhase = "resolvePhase";
                this.resetSubmissions(roomCode);
            } else {
                resultPhase = "actionPhase";
            }

            const prevState = this.gameDataMap.get(roomCode)!;
            const resultState: GameState = {
                ...prevState,
                phase: resultPhase,
                activeTurn: resultPhase === "resolvePhase" ? prevState.order[0] : null
            };

            this.gameDataMap.set(roomCode, resultState);

            return { ok: true, state: resultState};
        } catch (e) {
            if (e instanceof Error) return {ok: false, error: e.message};
            return {ok: false, error: "unknown error"};
        }
    }

    // resolves actions ig
    public resolveNext(roomCode: string, actionTarget: ActionTarget | null) : ResolveNextResult {
        if (this.gameDataMap.get(roomCode) === undefined) {
            return {ok: false, error: "No game with given code exists"}
        }

        let targetless = false;
        let currentState = this.gameDataMap.get(roomCode)!;
        const roomPending = this.pendingActions.get(roomCode)!;
        const pending = roomPending.find(p => p.playerId === currentState.activeTurn)!;
        const action: Action = pending.action;
        const actor: PlayerId = pending.playerId;

        let resultState: GameState;
        
        if (this.requiresTarget(action) && actionTarget == null) {
            return {ok: true, state: {...currentState, currentAction: action}};
        }

        if (this.requiresTarget(action) && actionTarget) {
            switch (action.type) {
                case "attack":
                    this.attack(roomCode, actor, actionTarget.coords);
                    break
                case "move":
                    this.move(roomCode, actor, actionTarget.coords);
                    break
                case "moveattack":
                    this.move(roomCode, actor, actionTarget.coords);
                    this.attack(roomCode, actor, actionTarget.target!);
                    break
                case "movedefend":
                    this.move(roomCode, actor, actionTarget.coords);
                    this.defend(roomCode, actor);
                    break
            }
            
        } else {
            targetless = true;
            switch (action.type) {
                case "defend" :
                    this.defend(roomCode, actor);
                    break
                case "fortify":
                    this.fortify(roomCode, actor);
                    break
            }
        }

        this.pendingActions.set(
            roomCode,
            this.pendingActions.get(roomCode)!.filter(p => p.playerId !== actor)
        );
        this.updateWinSpaces(roomCode);
        this.gameDataMap.get(roomCode)!.currentAction = null;

        const next = this.getNextPlayer(roomCode, actor);
        if (next) {
            this.gameDataMap.get(roomCode)!.activeTurn = next;
        } else {
            if (this.checkWinConditions(roomCode)) {
                this.gameDataMap.get(roomCode)!.phase = "end";
            } else {
                this.gameDataMap.get(roomCode)!.phase = "preAction";
                this.pendingActions.set(roomCode, []);
                this.defenders.set(roomCode, []);
            }
        }

        resultState = this.gameDataMap.get(roomCode)!;
        return { ok: true, state: {...resultState, zeroTarget: targetless}};
    }

    public preAction(roomCode: string, playerId: PlayerId, state: GameState) : PreActionResult {
        let verified = this.verified.get(roomCode)!;

        if (state.round == this.gameDataMap.get(roomCode!)?.round) {
            verified.push(playerId);
        } else {
            return { added: false, state: this.gameDataMap.get(roomCode)!};
        }

        let allVerified = false;
        if (this.checkStateVerified(roomCode)) {
            allVerified = true;
        }

        if (allVerified) {
            this.verified.set(roomCode, []);
            const order = this.gameDataMap.get(roomCode)!.order;
            order.push(order.shift()!);
            this.gameDataMap.get(roomCode)!.round += 1;
            this.gameDataMap.get(roomCode)!.phase = "actionPhase";
        }
        console.log("all are verified :D");
        return { added: true, state: this.gameDataMap.get(roomCode)! };
    }

    private checkStateVerified(roomCode: string) : boolean {
        const verified = this.verified.get(roomCode)!;
        if (verified.length == this.gameDataMap.get(roomCode)!.players.length) {
            return true;
        }
        return false;
    }

    private checkWinConditions(roomCode: string) : boolean {
        let data = this.gameDataMap.get(roomCode)!;
        
        // win space check
        for (const player of data.players) {
            if (player.roundsOnWinSpace >= 3) {
                data.winner = player.id;
                return true;
            }
        }

        // living players check
        let alive = new Array();
        for (const player of data.players) {
            if (player.health > 0) {
                alive.push(player.id);
            }
        }

        if (alive.length === 1) {
            data.winner = alive[0];
            return true;
        }

        return false;

    }

    private updateWinSpaces(roomCode: string) {
        let data = this.gameDataMap.get(roomCode)!;
        for (const player of data.players) {
            if (this.isWinCoord(player.position)) {
                if (data.winSpaceOccupied === "oneP") {
                    player.roundsOnWinSpace += 1;
                } else if (data.winSpaceOccupied === "twoP") {
                    player.roundsOnWinSpace = 0;
                }
            }
        }
    }

    private getNextPlayer(roomCode: string, currentPlayer: PlayerId) : PlayerId | false {
        const order = this.gameDataMap.get(roomCode)!.order;
        for (let i = 0; i < order.length; i++) {
            if (order[i] === currentPlayer && i < order.length - 1) {
                return order[i + 1];
            }
        }
        return false;
    }

    private defend(roomCode: string, playerId: PlayerId) {
        this.defenders.get(roomCode)!.push(playerId);
    }

    private move(roomCode: string, playerId: PlayerId, position: Position) {
        let data = this.gameDataMap.get(roomCode)!
        for (const player of data.players) {
            if (player.id == playerId) {
                // if player is leaving win space
                if (this.isWinCoord(player.position)
                    && !this.isWinCoord(position)) {
                    switch (data.winSpaceOccupied) {
                    case "oneP":
                        data.winSpaceOccupied = "no";
                        break
                    case "twoP":
                        data.winSpaceOccupied = "oneP";
                        break
                    case "no":
                        break
                    }
                }
                
                // if player is entering win space
                if (this.isWinCoord(position)) {
                    switch (data.winSpaceOccupied) {
                    case "no":
                        data.winSpaceOccupied = "oneP";
                        break
                    case "oneP":
                        data.winSpaceOccupied = "twoP";
                        break
                    case "twoP":
                        break
                    }
                }
                
                const xdiff = Math.abs(position.x - player.position.x);
                const ydiff = Math.abs(position.y - player.position.y);
                const pointsSpent = xdiff + ydiff;

                this.reduceActionPoints(roomCode, playerId, pointsSpent);
                player.position = position;
                return;
            }
        }
    }

    private isWinCoord(pos: Position): boolean {
        return GameManager.winCoords.some(w => w.x === pos.x && w.y === pos.y);
    }

    private reduceActionPoints(roomCode: string, playerId: PlayerId, amount: number) {
        let players = this.gameDataMap.get(roomCode)!.players;
        for (const player of players) {
            if (player.id == playerId) {
                player.actionPoints -= amount;
                if (player.actionPoints <= 0) {
                    player.actionPoints = 1;
                }
            }
        }
    }

    private attack(roomCode: string, playerId: PlayerId, coords: Position) {
        const attack = this.isPlayerAt(roomCode, coords);
        this.reduceActionPoints(roomCode, playerId, 1);
        if (attack.bool) {
            for (const player of this.gameDataMap.get(roomCode)!.players) {
                if (player.id === attack.playerId && !this.isDefending(roomCode, player.id)) {
                    player.health -= 1;
                    return;
                }
            }
        }
    }

    private fortify(roomCode: string, playerId: PlayerId) {
        for (const player of this.gameDataMap.get(roomCode)!.players) {
            if (player.id === playerId) {
                player.actionPoints += 1;
            }
        }
    }

    private isDefending(roomCode: string, playerId: PlayerId) {
        if (this.defenders.get(roomCode)!.includes(playerId)) {
            return true;
        }

        
        const roomPending = this.pendingActions.get(roomCode)!;
        const pending = roomPending.find(p => p.playerId === playerId)!;
        if (pending != null
                && (pending!.action.type == "defend"
                || pending?.action.type == "movedefend")) {
            return true;
        }
        return false;
    }

    private isPlayerAt(roomCode: string, position: Position) : { bool: boolean, playerId: PlayerId | null} {
        const players = this.gameDataMap.get(roomCode)!.players
        for (const player of players) {
            if (player.position.x === position.x && player.position.y === position.y) {
                return { bool: true, playerId: player.id }
            }
        }
        return { bool: false, playerId: null };
    }

    private requiresTarget(action: Action) : boolean {
        return (action.type != "defend" && action.type != "fortify");
    }

    private resetSubmissions(roomCode: string) {
        for (const player of this.gameDataMap.get(roomCode)!.players) {
            player.hasSubmitted = false;
        }
    }

    private updateSubmitted(playerId: PlayerId, roomCode: string) {
        for (const player of this.gameDataMap.get(roomCode)!.players) {
            if (player.id === playerId) {
                player.hasSubmitted = true;
            }
        }
    }

    private checkSubmissions(roomCode: string) : boolean {
        let submissions = 0;
    
        for (const player of this.gameDataMap.get(roomCode)!.players) {
            if (player.hasSubmitted === true) {
                submissions += 1;
            }
        }

        return submissions >= this.gameDataMap.get(roomCode)!.players.length;
    }


    // private helper for initGame that creates InGamePlayers via distributing flaws
    private distributeFlaws(players: Player[]) {
        let flaws: Flaw[] = GameManager.flaws.slice();
        let newPlayers: InGamePlayer[] = new Array<InGamePlayer>();

        for (const player of players) {
            let rand = Math.floor(Math.random() * flaws.length);
            let flaw = flaws[rand];
            newPlayers.push({ id: player.id, name: player.name, flaw: flaw, position: {x: 0, y: 0}, health: 3, actionPoints: 4, hasSubmitted: false, roundsOnWinSpace: 0});
            flaws.splice(rand, 1);
        }
        return newPlayers;
    }
}

export default GameManager