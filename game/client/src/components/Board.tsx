import { useEffect, useRef } from "react";
import type { Action, GameState, InGamePlayer, Position } from "../../../shared/types";
import { BOARD } from "../../../shared/board";

const CELL_SIZE = 64;
const PLAYER_COLORS = ["red", "orange", "blue", "purple"]

type BoardProps = {
    gameState: GameState;
    isMyTurn: boolean;
    selectedAction: Action | null;
    myPlayer: InGamePlayer;
    onSelectTarget: (pos: Position) => void;
};

export default function Board({ gameState, isMyTurn, onSelectTarget }: BoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current!.getContext("2d")!;
        drawGrid(ctx);
        drawPlayers(ctx, gameState.players);
    }, [gameState]);

    return <canvas ref={canvasRef} width={640} height={640} />;
}


function drawGrid(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < BOARD.length; y++) {
        for (let x = 0; x < BOARD[y].length; x++) {
            ctx.fillStyle = BOARD[y][x] === "x" ? "green" : "#d6d3d1";
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = "#a8a29e";
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function drawPlayers(ctx: CanvasRenderingContext2D, players: InGamePlayer[]) {
    players.forEach((player, i) => {
        const cx = player.position.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = player.position.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLORS[i];
        ctx.fill();
    });
}

function highlightCells(ctx: CanvasRenderingContext2D, player: InGamePlayer, gameState: GameState) {

}

function getAvailableCells(gameState: GameState, action: Action, myPlayer: InGamePlayer) : Position[] {
    let cells;
    switch (action.type) {
        case "attack":
            cells = getAttackCells(gameState, myPlayer);
            break
        case "move":
            cells = getMoveCells(gameState, myPlayer);
            break
        case "defend":
        case "fortify":
            cells = new Array<Position>();
    }
    return cells;
}

function getAttackCells(pos: Position): Position[] {
    return [
        { x: pos.x - 1, y: pos.y }, // left
        { x: pos.x - 2, y: pos.y }, // left
        { x: pos.x + 1, y: pos.y }, // right
        { x: pos.x + 2, y: pos.y }, // right
        { x: pos.x, y: pos.y - 1 }, // above
        { x: pos.x, y: pos.y - 2 }, // above
        { x: pos.x, y: pos.y + 1 }, // below
        { x: pos.x, y: pos.y + 2 }, // below
    ].filter(p => p.x >= 0 && p.x < BOARD.length && p.y >= 0 && p.y < BOARD.length);
}

function getMoveCells(gameState: GameState, myPlayer: InGamePlayer) : Position[] {
    
}
