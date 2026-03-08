import { useEffect, useRef, useState } from "react";
import type { Action, GameState, InGamePlayer, Position } from "../../../shared/types";
import { BOARD } from "../../../shared/board";

const CELL_SIZE = 64;
const PLAYER_COLORS = ["red", "orange", "blue", "purple"]

type BoardProps = {
    gameState: GameState;
    isMyTurn: boolean;
    selectedAction: Action | null;
    myPlayer: InGamePlayer;
    moveTargetRef: React.RefObject<Position | null>;
    onSelectTarget: (pos: Position) => void;
};

export default function Board({ gameState, isMyTurn, onSelectTarget, myPlayer, selectedAction, moveTargetRef }: BoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
    const availableCells = useRef<Position[] | undefined>(undefined);

    function handleMouseClick(e: React.MouseEvent<HTMLCanvasElement>) {
        const pos = getCellFromMouse(e, canvasRef.current!);
        if (availableCells.current && availableCells.current.some(posi => posi.x == pos.x && posi.y == pos.y)) {
            if (gameState.phase == "resolvePhase" && isMyTurn == true){
            console.log("target selected");
            onSelectTarget(pos);
        }
        }
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const pos = getCellFromMouse(e, canvasRef.current!);
        setHoveredCell(pos);
    }

    function getAvailableCells(gameState: GameState, action: Action | null, myPlayer: InGamePlayer) : Position[] | undefined {
        let localPosition: Position;
        if (moveTargetRef.current) {
            localPosition = moveTargetRef.current;
        } else {
            localPosition = myPlayer.position;
        }

        let reservedPoints = 0;
        if (gameState.currentAction?.type == "moveattack" || gameState.currentAction?.type == "movedefend") {
            reservedPoints = 1;
        }

        let cells;
        if (!action) {
            return undefined;
        }
        switch (action.type) {
            case "attack":
                cells = getAttackCells(localPosition);
                break
            case "move":
                cells = getMoveCells(gameState, localPosition, myPlayer, reservedPoints);
                break
            case "defend":
            case "fortify":
                cells = new Array<Position>();
        }
        return cells;
    }

    function highlightCells(ctx: CanvasRenderingContext2D, player: InGamePlayer, gameState: GameState, action: Action | null, isMyTurn: boolean,
        hoveredCell: Position | null) {
        const cells = getAvailableCells(gameState, action, player);
        if (cells && isMyTurn) {
            for (const pos of cells) {
                ctx.lineWidth = 1;
                ctx.fillStyle = "rgba(74, 222, 128, 0.4)";
                ctx.fillRect(pos.x * CELL_SIZE, pos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = "#a8a29e";
                ctx.strokeRect(pos.x * CELL_SIZE, pos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                if (hoveredCell && hoveredCell.x === pos.x && hoveredCell.y === pos.y) {
                    ctx.strokeStyle = "#16a34a";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(pos.x * CELL_SIZE, pos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        availableCells.current = cells;
    }

    function drawPlayers(ctx: CanvasRenderingContext2D, players: InGamePlayer[]) {
    players.forEach((player, i) => {
        const pos = (player.id === myPlayer.id && moveTargetRef.current)
            ? moveTargetRef.current
            : player.position;


        const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLORS[i];
        ctx.fill();
    });
}

    useEffect(() => {
        const ctx = canvasRef.current!.getContext("2d")!;
        drawGrid(ctx);
        highlightCells(ctx, myPlayer, gameState, selectedAction, isMyTurn, hoveredCell);
        drawPlayers(ctx, gameState.players);
    }, [gameState, selectedAction, hoveredCell]);

    return <canvas ref={canvasRef} width={640} height={640} onMouseMove={handleMouseMove} onMouseDown={handleMouseClick}/>;
}


function drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    for (let y = 0; y < BOARD.length; y++) {
        for (let x = 0; x < BOARD[y].length; x++) {
            ctx.fillStyle = BOARD[y][x] === "x" ? "grey" : "#d6d3d1";
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = "#a8a29e";
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
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

function getMoveCells(gameState: GameState, pos: Position, player: InGamePlayer, reservedPoints: number) : Position[] {
    let cells: Position[] = new Array();

    for (let i = 0; i <= player.actionPoints - reservedPoints; i++) {
        for (let p = 1; p <= player.actionPoints - reservedPoints; p++){
            let offset = (p - i);
            let left_x = pos.x - offset;
            let right_x = pos.x + offset;
            if (left_x > pos.x) {
                left_x = pos.x;
                right_x = pos.x;
            } else {
                left_x = pos.x - offset;
                right_x = pos.x + offset;
            }

            let top_right = { x: right_x, y: pos.y - i};
            let top_left = {x: left_x, y: pos.y - i};
            let bottom_left = { x: left_x, y: pos.y + i};
            let bottom_right = {x: right_x, y: pos.y + i};
            
            cells.push(top_left, top_right, bottom_left, bottom_right);
        }
    }

    cells = cells.filter(p => p.x >= 0 && p.x < BOARD.length && p.y >= 0 && p.y < BOARD.length);
    cells = cells.filter(p => {
        for (const player of gameState.players) {
            if (p.x == player.position.x && p.y == player.position.y) {
                return false;
            }
        }
        return true;
    });
    const seen = new Set<string>();
    cells = cells.filter(p => {
        const key = `${p.x},${p.y}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    
    return cells;
}

function getCellFromMouse(e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Position {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    return { x, y };
}