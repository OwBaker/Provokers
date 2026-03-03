import { ActionTarget, GameState, InGamePlayer, Player, PlayerId, Flaw, InitGameResult, SubmitActionResult, ResolveNextResult, Action, PendingAction, GamePhase} from "../../shared/types";


class GameManager {
    private static flaws: Flaw[] = Array.of("farsighted", "bloodlust", "offensive-minded", "weakling");
    private gameDataMap: Map<string, GameState> = new Map();
    private pendingActions: Map<PlayerId, PendingAction> = new Map();
    private resolutionTimers: Map<string, NodeJS.Timeout> = new Map();


    // initializes gameState for the given game, creates InGamePlayers for each player
    public initGame(roomCode: string, players: Player[]) : InitGameResult {
        try {
            let gamePlayers = this.distributeFlaws(players);
            
            gamePlayers[1].position = {x: 0, y: 8}
            gamePlayers[2].position = {x: 8, y: 0}
            gamePlayers[3].position = {x: 8, y: 8}

            const gameState: GameState = {
                phase: "actionPhase",
                players: gamePlayers,
                order: Array.of(gamePlayers[0].id, gamePlayers[1].id, gamePlayers[2].id, gamePlayers[3].id),
                activeTurn: null,
                round: 1,
                winner: null
            }

            this.gameDataMap.set(roomCode, gameState);

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
            this.pendingActions.set(playerId, pending);
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

        let currentState = this.gameDataMap.get(roomCode)!;
        const pending: PendingAction = this.pendingActions.get(currentState.activeTurn!)!;
        const action: Action = pending.action;
        const actor: PlayerId = pending.playerId;

        let resultState: GameState;
        
        if (this.requiresTarget(action) && actionTarget === null) {
            return {ok: true, state: {...currentState}};
        }

        if (this.requiresTarget(action) && actionTarget) {
            switch (action.type) {
                case "attack":

            }
            
        } else {
            switch (action.type) {
                case "defend" :
                    
                case "fortify":
                    this.fortify(roomCode, actor);
            }
        }

    }

    private attack(roomCode: string, playerId: PlayerId, target: ActionTarget) {
        
    }

    private fortify(roomCode: string, playerId: PlayerId) {
        for (const player of this.gameDataMap.get(roomCode)!.players) {
            if (player.id === playerId) {
                player.actionPoints += 1;
            }
        }
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
            newPlayers.push({ id: player.id, name: player.name, flaw: flaw, position: {x: 0, y: 0}, health: 3, actionPoints: 4, hasSubmitted: false });
            flaws.splice(rand, 1);
        }
        return newPlayers;
    }
}

export default GameManager